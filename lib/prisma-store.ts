import type {
  ActivityLog as PrismaActivityLog,
  PrismaClient,
  User as PrismaUser
} from "@prisma/client";

import { getPrismaClient } from "@/lib/prisma";
import type {
  ActivityAction,
  ActivityLogEntry,
  DashboardSummary,
  PublicUser,
  SessionUser,
  UserRole
} from "@/lib/types";

declare global {
  // eslint-disable-next-line no-var
  var __rims_prisma_seed_promise__: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var __rims_prisma_query_warned__: boolean | undefined;
}

function toPublicUser(record: PrismaUser): PublicUser {
  return {
    id: record.id,
    username: record.username,
    name: record.name,
    role: record.role,
    status: record.status,
    createdAt: new Date(record.createdAt).toISOString(),
    lastLoginAt: record.lastLoginAt ? new Date(record.lastLoginAt).toISOString() : null
  };
}

function toLog(record: PrismaActivityLog): ActivityLogEntry {
  return {
    id: record.id,
    user: record.user,
    action: record.action,
    target: record.target,
    timestamp: new Date(record.timestamp).toISOString(),
    details: record.details
  };
}

async function getClientOrNull(): Promise<PrismaClient | null> {
  return getPrismaClient();
}

function warnPrismaQueryFallback(error: unknown): void {
  if (process.env.NODE_ENV === "production" || globalThis.__rims_prisma_query_warned__) {
    return;
  }

  globalThis.__rims_prisma_query_warned__ = true;
  console.warn(
    "[RIMS] Prisma query failed; falling back to in-memory store. Run prisma generate/db push/seed.",
    error instanceof Error ? error.message : String(error)
  );
}

async function ensureSeeded(prisma: PrismaClient): Promise<void> {
  if (!globalThis.__rims_prisma_seed_promise__) {
    globalThis.__rims_prisma_seed_promise__ = (async () => {
      const userCount = await prisma.user.count();
      if (userCount > 0) {
        return;
      }

      const createdAt = new Date("2026-02-20T09:00:00.000Z");

      await prisma.user.createMany({
        data: [
          {
            id: "u_admin_001",
            username: "admin",
            name: "Regional Admin",
            password: "admin123",
            role: "ADMIN",
            status: "ACTIVE",
            createdAt,
            lastLoginAt: new Date("2026-02-24T08:15:00.000Z")
          },
          {
            id: "u_staff_001",
            username: "staff",
            name: "Support Staff",
            password: "staff123",
            role: "STAFF",
            status: "ACTIVE",
            createdAt,
            lastLoginAt: new Date("2026-02-23T14:42:00.000Z")
          }
        ]
      });

      await prisma.activityLog.createMany({
        data: [
          {
            id: "log_seed_001",
            user: "system",
            action: "CREATE_USER",
            target: "admin",
            timestamp: new Date("2026-02-20T09:00:00.000Z"),
            details: "Initial administrator account seeded for demo environment."
          },
          {
            id: "log_seed_002",
            user: "system",
            action: "CREATE_USER",
            target: "staff",
            timestamp: new Date("2026-02-20T09:01:00.000Z"),
            details: "Initial staff account seeded for demo environment."
          }
        ]
      });
    })();
  }

  await globalThis.__rims_prisma_seed_promise__;
}

async function withPrisma<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T | null> {
  const prisma = await getClientOrNull();
  if (!prisma) {
    return null;
  }

  try {
    await ensureSeeded(prisma);
    return await fn(prisma);
  } catch (error) {
    globalThis.__rims_prisma_seed_promise__ = undefined;
    warnPrismaQueryFallback(error);
    return null;
  }
}

async function appendLog(
  prisma: PrismaClient,
  input: {
    user: string;
    action: ActivityAction;
    target?: string | null;
    details: string;
  }
): Promise<ActivityLogEntry> {
  const record = await prisma.activityLog.create({
    data: {
      user: input.user,
      action: input.action,
      target: input.target ?? null,
      details: input.details
    }
  });

  return toLog(record);
}

export async function listUsersDb(): Promise<PublicUser[] | null> {
  return withPrisma(async (prisma) => {
    const users = await prisma.user.findMany({
      orderBy: [{ createdAt: "asc" }, { username: "asc" }]
    });
    return users.map(toPublicUser);
  });
}

export async function listLogsDb(): Promise<ActivityLogEntry[] | null> {
  return withPrisma(async (prisma) => {
    const logs = await prisma.activityLog.findMany({
      orderBy: [{ timestamp: "desc" }, { id: "desc" }]
    });
    return logs.map(toLog);
  });
}

export async function getUserByUsernameDb(
  username: string
): Promise<PublicUser | null | undefined> {
  const prisma = await getClientOrNull();
  if (!prisma) {
    return undefined;
  }

  try {
    await ensureSeeded(prisma);
    const user = await prisma.user.findUnique({
      where: { username }
    });
    return user ? toPublicUser(user) : null;
  } catch (error) {
    globalThis.__rims_prisma_seed_promise__ = undefined;
    warnPrismaQueryFallback(error);
    return undefined;
  }
}

export async function getDashboardSummaryDb(): Promise<DashboardSummary | null> {
  return withPrisma(async (prisma) => {
    const [totalUsers, adminUsers, staffUsers, logEntries] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "STAFF" } }),
      prisma.activityLog.count()
    ]);

    return {
      totalUsers,
      adminUsers,
      staffUsers,
      logEntries
    };
  });
}

export async function authenticateUserDb(
  username: string,
  password: string
): Promise<{ session: SessionUser } | { error: string } | null> {
  return withPrisma(async (prisma) => {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user || user.password !== password) {
      return { error: "Invalid credentials" };
    }

    if (user.status !== "ACTIVE") {
      return { error: "Account is not active" };
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: now }
      }),
      prisma.activityLog.create({
        data: {
          user: user.username,
          action: "LOGIN_SUCCESS",
          target: user.username,
          details: `${user.role} user authenticated through Prisma session flow.`,
          timestamp: now
        }
      })
    ]);

    return {
      session: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    };
  });
}

export async function recordLogoutDb(session: SessionUser): Promise<boolean | null> {
  return withPrisma(async (prisma) => {
    await appendLog(prisma, {
      user: session.username,
      action: "LOGOUT",
      target: session.username,
      details: "User ended session."
    });

    return true;
  });
}

export async function createUserAccountDb(
  input: {
    username: string;
    name: string;
    password: string;
    role: UserRole;
  },
  actor: SessionUser
): Promise<{ user: PublicUser } | { error: string } | null> {
  return withPrisma(async (prisma) => {
    const username = input.username.trim().toLowerCase();
    const name = input.name.trim();
    const password = input.password.trim();

    if (!username || !name || !password) {
      return { error: "Username, name, and password are required." };
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return { error: "Username already exists." };
    }

    const created = await prisma.user.create({
      data: {
        username,
        name,
        password,
        role: input.role,
        status: "ACTIVE"
      }
    });

    await appendLog(prisma, {
      user: actor.username,
      action: "CREATE_USER",
      target: created.username,
      details: `Created ${created.role} account.`
    });

    return { user: toPublicUser(created) };
  });
}

export async function updateUserRoleDb(
  id: string,
  role: UserRole,
  actor: SessionUser
): Promise<{ user: PublicUser } | { error: string } | null> {
  return withPrisma(async (prisma) => {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return { error: "User not found." };
    }

    if (user.role === role) {
      return { user: toPublicUser(user) };
    }

    if (user.username === actor.username && role !== "ADMIN") {
      return { error: "You cannot remove your own admin access in the demo." };
    }

    if (role !== "ADMIN" && user.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return { error: "At least one administrator must remain." };
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role }
    });

    await appendLog(prisma, {
      user: actor.username,
      action: "UPDATE_ROLE",
      target: updated.username,
      details: `Role changed to ${role}.`
    });

    return { user: toPublicUser(updated) };
  });
}

export async function deleteUserAccountDb(
  id: string,
  actor: SessionUser
): Promise<{ success: true } | { error: string } | null> {
  return withPrisma(async (prisma) => {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return { error: "User not found." };
    }

    if (user.username === actor.username) {
      return { error: "You cannot delete your own account in the demo." };
    }

    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return { error: "At least one administrator must remain." };
      }
    }

    await prisma.$transaction([
      prisma.user.delete({ where: { id } }),
      prisma.activityLog.create({
        data: {
          user: actor.username,
          action: "DELETE_USER",
          target: user.username,
          details: `Deleted ${user.role} account.`
        }
      })
    ]);

    return { success: true as const };
  });
}
