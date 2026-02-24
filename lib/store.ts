import type {
  ActivityAction,
  ActivityLogEntry,
  DashboardSummary,
  MetricsSnapshot,
  PublicUser,
  SessionUser,
  UserRole,
  UserStatus
} from "@/lib/types";

interface StoredUser extends PublicUser {
  password: string;
}

interface StoreState {
  users: StoredUser[];
  logs: ActivityLogEntry[];
}

declare global {
  // eslint-disable-next-line no-var
  var __rims_store__: StoreState | undefined;
}

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function seedState(): StoreState {
  const createdAt = "2026-02-20T09:00:00.000Z";

  const users: StoredUser[] = [
    {
      id: "u_admin_001",
      username: "admin",
      name: "Regional Admin",
      role: "ADMIN",
      status: "ACTIVE",
      createdAt,
      lastLoginAt: "2026-02-24T08:15:00.000Z",
      password: "admin123"
    },
    {
      id: "u_staff_001",
      username: "staff",
      name: "Support Staff",
      role: "STAFF",
      status: "ACTIVE",
      createdAt,
      lastLoginAt: "2026-02-23T14:42:00.000Z",
      password: "staff123"
    }
  ];

  const logs: ActivityLogEntry[] = [
    {
      id: "log_seed_001",
      user: "system",
      action: "CREATE_USER",
      target: "admin",
      timestamp: "2026-02-20T09:00:00.000Z",
      details: "Initial administrator account seeded for demo environment."
    },
    {
      id: "log_seed_002",
      user: "system",
      action: "CREATE_USER",
      target: "staff",
      timestamp: "2026-02-20T09:01:00.000Z",
      details: "Initial staff account seeded for demo environment."
    }
  ];

  return { users, logs };
}

function getState(): StoreState {
  if (!globalThis.__rims_store__) {
    globalThis.__rims_store__ = seedState();
  }

  return globalThis.__rims_store__;
}

function sanitizeUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
}

function appendLog(input: {
  user: string;
  action: ActivityAction;
  target?: string | null;
  details: string;
}): ActivityLogEntry {
  const state = getState();
  const entry: ActivityLogEntry = {
    id: createId("log"),
    user: input.user,
    action: input.action,
    target: input.target ?? null,
    timestamp: nowIso(),
    details: input.details
  };

  state.logs.unshift(entry);
  return entry;
}

export function listUsers(): PublicUser[] {
  return getState().users.map(sanitizeUser);
}

export function listLogs(): ActivityLogEntry[] {
  return [...getState().logs];
}

export function getUserByUsername(username: string): PublicUser | null {
  const user = getState().users.find((candidate) => candidate.username === username);
  return user ? sanitizeUser(user) : null;
}

export function getDashboardSummary(): DashboardSummary {
  const users = getState().users;
  const admins = users.filter((user) => user.role === "ADMIN").length;
  const staff = users.filter((user) => user.role === "STAFF").length;

  return {
    totalUsers: users.length,
    adminUsers: admins,
    staffUsers: staff,
    logEntries: getState().logs.length
  };
}

export function getMetrics(): MetricsSnapshot {
  const bucket = Math.floor(Date.now() / 60000);
  const wave = (base: number, variance: number, factor: number) =>
    Math.max(1, Math.min(99, base + Math.sin(bucket / factor) * variance));

  const cpu = wave(42, 18, 3.2);
  const disk = wave(63, 5, 9.5);
  const networkIn = 40 + Math.abs(Math.sin(bucket / 2.5) * 28);
  const networkOut = 25 + Math.abs(Math.cos(bucket / 2.1) * 18);
  const activeTickets = Math.max(0, Math.round(2 + Math.sin(bucket / 4.8) * 2));
  const serviceHealth = cpu > 85 || disk > 85 ? "WARNING" : "HEALTHY";

  return {
    cpu: Number(cpu.toFixed(1)),
    disk: Number(disk.toFixed(1)),
    networkInMbps: Number(networkIn.toFixed(1)),
    networkOutMbps: Number(networkOut.toFixed(1)),
    activeTickets,
    serviceHealth,
    updatedAt: nowIso()
  };
}

export function authenticateUser(
  username: string,
  password: string
): { session: SessionUser } | { error: string } {
  const state = getState();
  const user = state.users.find((candidate) => candidate.username === username);

  if (!user || user.password !== password) {
    return { error: "Invalid credentials" };
  }

  if (user.status !== "ACTIVE") {
    return { error: "Account is not active" };
  }

  user.lastLoginAt = nowIso();

  appendLog({
    user: user.username,
    action: "LOGIN_SUCCESS",
    target: user.username,
    details: `${user.role} user authenticated through mock session flow.`
  });

  return {
    session: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  };
}

export function recordLogout(session: SessionUser): void {
  appendLog({
    user: session.username,
    action: "LOGOUT",
    target: session.username,
    details: "User ended session."
  });
}

export function createUserAccount(
  input: {
    username: string;
    name: string;
    password: string;
    role: UserRole;
  },
  actor: SessionUser
): { user: PublicUser } | { error: string } {
  const state = getState();
  const username = input.username.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password.trim();

  if (!username || !name || !password) {
    return { error: "Username, name, and password are required." };
  }

  if (state.users.some((user) => user.username === username)) {
    return { error: "Username already exists." };
  }

  const newUser: StoredUser = {
    id: createId("u"),
    username,
    name,
    password,
    role: input.role,
    status: "ACTIVE" as UserStatus,
    createdAt: nowIso(),
    lastLoginAt: null
  };

  state.users.push(newUser);

  appendLog({
    user: actor.username,
    action: "CREATE_USER",
    target: newUser.username,
    details: `Created ${newUser.role} account.`
  });

  return { user: sanitizeUser(newUser) };
}

export function updateUserRole(
  id: string,
  role: UserRole,
  actor: SessionUser
): { user: PublicUser } | { error: string } {
  const state = getState();
  const user = state.users.find((candidate) => candidate.id === id);

  if (!user) {
    return { error: "User not found." };
  }

  if (user.role === role) {
    return { user: sanitizeUser(user) };
  }

  if (user.username === actor.username && role !== "ADMIN") {
    return { error: "You cannot remove your own admin access in the demo." };
  }

  if (role !== "ADMIN") {
    const adminCount = state.users.filter((candidate) => candidate.role === "ADMIN").length;
    if (user.role === "ADMIN" && adminCount <= 1) {
      return { error: "At least one administrator must remain." };
    }
  }

  user.role = role;

  appendLog({
    user: actor.username,
    action: "UPDATE_ROLE",
    target: user.username,
    details: `Role changed to ${role}.`
  });

  return { user: sanitizeUser(user) };
}

export function deleteUserAccount(
  id: string,
  actor: SessionUser
): { success: true } | { error: string } {
  const state = getState();
  const index = state.users.findIndex((candidate) => candidate.id === id);

  if (index < 0) {
    return { error: "User not found." };
  }

  const user = state.users[index];

  if (user.username === actor.username) {
    return { error: "You cannot delete your own account in the demo." };
  }

  if (user.role === "ADMIN") {
    const adminCount = state.users.filter((candidate) => candidate.role === "ADMIN").length;
    if (adminCount <= 1) {
      return { error: "At least one administrator must remain." };
    }
  }

  state.users.splice(index, 1);

  appendLog({
    user: actor.username,
    action: "DELETE_USER",
    target: user.username,
    details: `Deleted ${user.role} account.`
  });

  return { success: true };
}
