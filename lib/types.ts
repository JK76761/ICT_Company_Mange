export type UserRole = "ADMIN" | "STAFF";

export type UserStatus = "ACTIVE" | "DISABLED";

export type ActivityAction =
  | "LOGIN_SUCCESS"
  | "CREATE_USER"
  | "DELETE_USER"
  | "UPDATE_ROLE"
  | "LOGOUT";

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface PublicUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface ActivityLogEntry {
  id: string;
  user: string;
  action: ActivityAction;
  target: string | null;
  timestamp: string;
  details: string;
}

export interface MetricsSnapshot {
  cpu: number;
  disk: number;
  networkInMbps: number;
  networkOutMbps: number;
  activeTickets: number;
  serviceHealth: "HEALTHY" | "WARNING";
  updatedAt: string;
}

export interface DashboardSummary {
  totalUsers: number;
  adminUsers: number;
  staffUsers: number;
  logEntries: number;
}

