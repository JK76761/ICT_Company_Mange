import * as memoryStore from "@/lib/store";
import * as prismaStore from "@/lib/prisma-store";
import { isDatabaseModeRequested } from "@/lib/prisma";
import type { SessionUser, UserRole } from "@/lib/types";

declare global {
  // eslint-disable-next-line no-var
  var __rims_data_fallback_warned__: boolean | undefined;
}

function warnDataFallback(error: unknown): void {
  if (process.env.NODE_ENV === "production" || globalThis.__rims_data_fallback_warned__) {
    return;
  }

  globalThis.__rims_data_fallback_warned__ = true;
  console.warn(
    "[RIMS] Data layer fallback to memory store due to database error.",
    error instanceof Error ? error.message : String(error)
  );
}

export async function listUsers() {
  try {
    return (await prismaStore.listUsersDb()) ?? memoryStore.listUsers();
  } catch (error) {
    warnDataFallback(error);
    return memoryStore.listUsers();
  }
}

export async function listLogs() {
  try {
    return (await prismaStore.listLogsDb()) ?? memoryStore.listLogs();
  } catch (error) {
    warnDataFallback(error);
    return memoryStore.listLogs();
  }
}

export async function getUserByUsername(username: string) {
  try {
    const dbUser = await prismaStore.getUserByUsernameDb(username);
    if (dbUser !== undefined) {
      return dbUser;
    }
    return memoryStore.getUserByUsername(username);
  } catch (error) {
    warnDataFallback(error);
    return memoryStore.getUserByUsername(username);
  }
}

export async function getDashboardSummary() {
  try {
    return (await prismaStore.getDashboardSummaryDb()) ?? memoryStore.getDashboardSummary();
  } catch (error) {
    warnDataFallback(error);
    return memoryStore.getDashboardSummary();
  }
}

export async function getMetrics() {
  return memoryStore.getMetrics();
}

export async function authenticateUser(username: string, password: string) {
  try {
    return (await prismaStore.authenticateUserDb(username, password)) ??
      memoryStore.authenticateUser(username, password);
  } catch (error) {
    warnDataFallback(error);
    return memoryStore.authenticateUser(username, password);
  }
}

export async function recordLogout(session: SessionUser) {
  try {
    return (await prismaStore.recordLogoutDb(session)) ?? memoryStore.recordLogout(session);
  } catch (error) {
    warnDataFallback(error);
    return memoryStore.recordLogout(session);
  }
}

export async function createUserAccount(
  input: {
    username: string;
    name: string;
    password: string;
    role: UserRole;
  },
  actor: SessionUser
) {
  try {
    return (await prismaStore.createUserAccountDb(input, actor)) ??
      memoryStore.createUserAccount(input, actor);
  } catch (error) {
    warnDataFallback(error);
    return memoryStore.createUserAccount(input, actor);
  }
}

export async function updateUserRole(id: string, role: UserRole, actor: SessionUser) {
  try {
    return (await prismaStore.updateUserRoleDb(id, role, actor)) ??
      memoryStore.updateUserRole(id, role, actor);
  } catch (error) {
    warnDataFallback(error);
    return memoryStore.updateUserRole(id, role, actor);
  }
}

export async function deleteUserAccount(id: string, actor: SessionUser) {
  try {
    return (await prismaStore.deleteUserAccountDb(id, actor)) ??
      memoryStore.deleteUserAccount(id, actor);
  } catch (error) {
    warnDataFallback(error);
    return memoryStore.deleteUserAccount(id, actor);
  }
}

export function getPersistenceModeLabel(): "postgresql" | "memory" {
  return isDatabaseModeRequested() ? "postgresql" : "memory";
}
