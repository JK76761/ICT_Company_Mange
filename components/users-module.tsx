"use client";

import { startTransition, useState } from "react";

import { formatDateTime } from "@/lib/format";
import { isAdmin, roleLabel } from "@/lib/permissions";
import type { PublicUser, SessionUser, UserRole } from "@/lib/types";

interface UsersModuleProps {
  initialUsers: PublicUser[];
  viewer: SessionUser;
}

interface CreateUserFormState {
  username: string;
  name: string;
  password: string;
  role: UserRole;
}

const emptyCreateState: CreateUserFormState = {
  username: "",
  name: "",
  password: "",
  role: "STAFF"
};

export function UsersModule({ initialUsers, viewer }: UsersModuleProps) {
  const [users, setUsers] = useState<PublicUser[]>(initialUsers);
  const [form, setForm] = useState<CreateUserFormState>(emptyCreateState);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  const adminView = isAdmin(viewer.role);

  async function refreshUsers() {
    const response = await fetch("/api/users", { cache: "no-store" });
    const payload = (await response.json().catch(() => ({}))) as {
      users?: PublicUser[];
      error?: string;
    };

    if (!response.ok || !payload.users) {
      throw new Error(payload.error ?? "Unable to fetch users.");
    }

    setUsers(payload.users);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminView) {
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Unable to create user.");
        return;
      }

      startTransition(() => {
        void refreshUsers().catch((refreshError) => {
          setError(
            refreshError instanceof Error
              ? refreshError.message
              : "Unable to refresh users."
          );
        });
      });
      setForm(emptyCreateState);
      setMessage("User account created.");
    } catch {
      setError("Network error while creating user.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    setActiveRowId(userId);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role })
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Unable to update role.");
        return;
      }

      startTransition(() => {
        void refreshUsers().catch((refreshError) => {
          setError(
            refreshError instanceof Error
              ? refreshError.message
              : "Unable to refresh users."
          );
        });
      });
      setMessage("Role updated.");
    } catch {
      setError("Network error while updating role.");
    } finally {
      setActiveRowId(null);
    }
  }

  async function handleDelete(userId: string, username: string) {
    const confirmed = window.confirm(`Delete user "${username}"?`);
    if (!confirmed) {
      return;
    }

    setActiveRowId(userId);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE"
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Unable to delete user.");
        return;
      }

      startTransition(() => {
        void refreshUsers().catch((refreshError) => {
          setError(
            refreshError instanceof Error
              ? refreshError.message
              : "Unable to refresh users."
          );
        });
      });
      setMessage("User deleted.");
    } catch {
      setError("Network error while deleting user.");
    } finally {
      setActiveRowId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">User Account Management</h2>
            <p className="mt-1 text-sm text-ink/70">
              Create accounts, change roles, and remove users with admin-only permissions.
            </p>
          </div>
          <div className="rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-xs">
            Signed in as <span className="font-semibold">{viewer.username}</span> (
            {roleLabel(viewer.role)})
          </div>
        </div>

        {!adminView ? (
          <p className="mt-4 rounded-xl border border-moss/20 bg-moss/10 px-3 py-2 text-sm text-moss">
            Staff view: read-only access. Admin users can create/delete accounts and modify roles.
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-signal/20 bg-signal/10 px-3 py-2 text-sm text-signal">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-4 rounded-xl border border-moss/20 bg-moss/10 px-3 py-2 text-sm text-moss">
            {message}
          </p>
        ) : null}

        <form onSubmit={handleCreate} className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink/80" htmlFor="new-username">
              Username
            </label>
            <input
              id="new-username"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              disabled={!adminView || busy}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brass disabled:cursor-not-allowed disabled:bg-black/5"
              placeholder="new.staff"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink/80" htmlFor="new-name">
              Full Name
            </label>
            <input
              id="new-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              disabled={!adminView || busy}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brass disabled:cursor-not-allowed disabled:bg-black/5"
              placeholder="Field Technician"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink/80" htmlFor="new-password">
              Temporary Password
            </label>
            <input
              id="new-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              disabled={!adminView || busy}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brass disabled:cursor-not-allowed disabled:bg-black/5"
              placeholder="temp123"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink/80" htmlFor="new-role">
              Role
            </label>
            <select
              id="new-role"
              value={form.role}
              onChange={(event) =>
                setForm({ ...form, role: event.target.value as UserRole })
              }
              disabled={!adminView || busy}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brass disabled:cursor-not-allowed disabled:bg-black/5"
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!adminView || busy}
              className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-black/10 px-5 py-4">
          <h3 className="text-base font-semibold">User Directory</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/5 text-xs uppercase tracking-[0.08em] text-ink/60">
              <tr>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Last Login</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const rowBusy = activeRowId === user.id;
                return (
                  <tr key={user.id} className="border-t border-black/5 align-top">
                    <td className="px-5 py-4">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-ink/65">@{user.username}</p>
                    </td>
                    <td className="px-5 py-4">
                      {adminView ? (
                        <select
                          value={user.role}
                          onChange={(event) =>
                            void handleRoleChange(user.id, event.target.value as UserRole)
                          }
                          disabled={rowBusy}
                          className="rounded-lg border border-black/10 bg-white px-2 py-1 text-sm disabled:bg-black/5"
                        >
                          <option value="ADMIN">Administrator</option>
                          <option value="STAFF">Staff</option>
                        </select>
                      ) : (
                        <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium">
                          {roleLabel(user.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium">
                        <span className="status-dot bg-moss" aria-hidden />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-ink/70">
                      {formatDateTime(user.lastLoginAt)}
                    </td>
                    <td className="px-5 py-4 text-xs text-ink/70">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      {adminView ? (
                        <button
                          type="button"
                          onClick={() => void handleDelete(user.id, user.username)}
                          disabled={rowBusy || user.username === viewer.username}
                          className="rounded-lg border border-signal/20 bg-signal/10 px-2.5 py-1 text-xs font-semibold text-signal disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {rowBusy ? "Working..." : "Delete"}
                        </button>
                      ) : (
                        <span className="text-xs text-ink/50">No actions</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
