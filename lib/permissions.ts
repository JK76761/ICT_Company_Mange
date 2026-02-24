import type { UserRole } from "@/lib/types";

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

export function roleLabel(role: UserRole): string {
  return role === "ADMIN" ? "Administrator" : "Staff";
}

