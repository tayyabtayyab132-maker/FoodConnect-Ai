import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  Building2,
  CircleAlert,
  HandHeart,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
  Users as UsersIcon,
  X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import Loading from "../components/Loading";
import api from "../services/api";

function getAccountStatus(user) {
  if (user?.account_status) {
    return String(user.account_status).toUpperCase();
  }

  if (user?.status) {
    return String(user.status).toUpperCase();
  }

  if (user?.accountStatus) {
    return String(user.accountStatus).toUpperCase();
  }

  if (user?.is_suspended === true || user?.isSuspended === true) {
    return "SUSPENDED";
  }

  if (user?.is_active === false || user?.isActive === false) {
    return "DEACTIVATED";
  }

  return "ACTIVE";
}

function formatAccountStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getAccountStatusStyle(status) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900";

    case "SUSPENDED":
      return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900";

    case "DEACTIVATED":
      return "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900";

    default:
      return "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700";
  }
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [suspendUser, setSuspendUser] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  const loadUsers = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/admin/users");

      setUsers(response.data?.data || []);
    } catch (err) {
      console.error("Failed to load admin users:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load users. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const statistics = useMemo(() => {
    const total = users.length;

    const admins = users.filter(
      (user) => String(user.role).toLowerCase() === "admin",
    ).length;

    const organizations = users.filter(
      (user) => String(user.role).toLowerCase() === "organization",
    ).length;

    const donors = users.filter(
      (user) => String(user.role).toLowerCase() === "donor",
    ).length;

    const suspended = users.filter(
      (user) => getAccountStatus(user) === "SUSPENDED",
    ).length;

    return {
      total,
      admins,
      organizations,
      donors,
      suspended,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const role = String(user.role || "").toLowerCase();

      const matchesRole =
        roleFilter === "all" || role === roleFilter;

      const searchableText = [
        user.name,
        user.email,
        user.role,
        user.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const clearActionMessages = () => {
    setActionError("");
    setSuccessMessage("");
  };

  const handleSuspend = async () => {
    const reason = suspensionReason.trim();

    if (!suspendUser) {
      return;
    }

    if (!reason) {
      setActionError("Please provide a reason for suspension.");
      return;
    }

    try {
      setActionLoading(true);
      clearActionMessages();

      /*
       * Backend route:
       * PATCH /api/admin/users/{user_id}/suspend
       *
       * Backend expects `reason` as a query parameter,
       * not as a JSON request body.
       */
      const response = await api.patch(
        `/admin/users/${suspendUser.id}/suspend`,
        null,
        {
          params: {
            reason,
          },
        },
      );

      const updatedUser = response.data?.data;

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === suspendUser.id
            ? {
                ...user,
                ...(updatedUser || {}),
                status: updatedUser?.status || "SUSPENDED",
              }
            : user,
        ),
      );

      setSuccessMessage(
        response.data?.message ||
          `${suspendUser.name || "User"} has been suspended successfully.`,
      );

      setSuspendUser(null);
      setSuspensionReason("");
    } catch (err) {
      console.error("Failed to suspend user:", err);

      setActionError(
        err.response?.data?.detail ||
          "Unable to suspend this account. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (user) => {
    try {
      setActionLoading(true);
      clearActionMessages();

      /*
       * Backend route:
       * PATCH /api/admin/users/{user_id}/restore
       *
       * Backend also requires a `reason` query parameter.
       *
       * We use a clear administrator action reason because the
       * current restore UI does not have a separate restore modal.
       */
      const response = await api.patch(
        `/admin/users/${user.id}/restore`,
        null,
        {
          params: {
            reason: "Account restored by administrator.",
          },
        },
      );

      const updatedUser = response.data?.data;

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? {
                ...currentUser,
                ...(updatedUser || {}),
                status: updatedUser?.status || "ACTIVE",
              }
            : currentUser,
        ),
      );

      setSuccessMessage(
        response.data?.message ||
          `${user.name || "User"} has been restored successfully.`,
      );
    } catch (err) {
      console.error("Failed to restore user:", err);

      setActionError(
        err.response?.data?.detail ||
          "Unable to restore this account. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const roleLabel = (role) => {
    if (!role) {
      return "Unknown";
    }

    return String(role)
      .toLowerCase()
      .replace(/^\w/, (character) => character.toUpperCase());
  };

  const roleIcon = (role) => {
    switch (String(role).toLowerCase()) {
      case "admin":
        return ShieldCheck;

      case "organization":
        return Building2;

      case "donor":
        return HandHeart;

      default:
        return UserRound;
    }
  };

  const roleBadgeStyle = (role) => {
    switch (String(role).toLowerCase()) {
      case "admin":
        return "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:ring-violet-900";

      case "organization":
        return "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900";

      case "donor":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900";

      default:
        return "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700";
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />

        <main className="min-h-screen lg:ml-64">
          <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
            <Loading />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300">
                  <UsersIcon size={22} />
                </div>

                <div>
                  <p className="text-sm font-medium text-violet-600 dark:text-violet-300">
                    Administration
                  </p>

                  <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                    Users
                  </h1>
                </div>
              </div>

              <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Manage registered platform accounts, monitor account
                status, and control organization and donor access.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadUsers(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <CircleAlert size={19} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
              <div className="flex items-start gap-3">
                <ShieldCheck size={19} className="mt-0.5 shrink-0" />
                <p>{successMessage}</p>
              </div>

              <button
                type="button"
                onClick={() => setSuccessMessage("")}
                className="shrink-0 rounded-lg p-1 transition hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {actionError && (
            <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <div className="flex items-start gap-3">
                <CircleAlert size={19} className="mt-0.5 shrink-0" />
                <p>{actionError}</p>
              </div>

              <button
                type="button"
                onClick={() => setActionError("")}
                className="shrink-0 rounded-lg p-1 transition hover:bg-red-100 dark:hover:bg-red-900/40"
              >
                <X size={17} />
              </button>
            </div>
          )}

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Total Users"
              value={statistics.total}
              description="All registered accounts"
              icon={UsersIcon}
              iconClassName="bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300"
            />

            <StatCard
              title="Administrators"
              value={statistics.admins}
              description="Protected admin accounts"
              icon={ShieldCheck}
              iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300"
            />

            <StatCard
              title="Organizations"
              value={statistics.organizations}
              description="Registered organizations"
              icon={Building2}
              iconClassName="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-300"
            />

            <StatCard
              title="Donors"
              value={statistics.donors}
              description="Registered donors"
              icon={HandHeart}
              iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300"
            />

            <StatCard
              title="Suspended"
              value={statistics.suspended}
              description="Currently restricted accounts"
              icon={Ban}
              iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300"
            />
          </div>

          <div className="surface mb-6 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, email, role, or user ID..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ["all", "All"],
                  ["admin", "Admin"],
                  ["organization", "Organization"],
                  ["donor", "Donor"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRoleFilter(value)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      roleFilter === value
                        ? "bg-violet-600 text-white shadow-sm"
                        : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="surface overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Registered Accounts
                  </h2>

                  <p className="text-sm text-[var(--text-secondary)]">
                    Showing {filteredUsers.length} of {users.length} users
                  </p>
                </div>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <UsersIcon size={25} />
                </div>

                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  No users found
                </h3>

                <p className="mt-1 max-w-md text-sm text-[var(--text-secondary)]">
                  Try changing your search text or role filter.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1050px]">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--background)]/60 text-left">
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          User
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          Role
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          Account Status
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          Registered
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user) => {
                        const RoleIcon = roleIcon(user.role);
                        const status = getAccountStatus(user);
                        const isAdmin =
                          String(user.role).toLowerCase() === "admin";
                        const isSuspended = status === "SUSPENDED";
                        const isDeactivated =
                          status === "DEACTIVATED";

                        return (
                          <tr
                            key={user.id}
                            className="border-b border-[var(--border)] last:border-b-0"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--background)] text-[var(--text-secondary)]">
                                  <UserRound size={18} />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                    {user.name || "Unnamed User"}
                                  </p>

                                  <p className="truncate text-xs text-[var(--text-secondary)]">
                                    {user.email || "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${roleBadgeStyle(
                                  user.role,
                                )}`}
                              >
                                <RoleIcon size={13} />
                                {roleLabel(user.role)}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getAccountStatusStyle(
                                  status,
                                )}`}
                              >
                                {formatAccountStatus(status)}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">
                              {formatDate(
                                user.created_at ||
                                  user.createdAt ||
                                  user.registered_at ||
                                  user.registeredAt,
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end">
                                {isAdmin ? (
                                  <span className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 dark:bg-violet-950/30 dark:text-violet-300">
                                    <ShieldCheck size={15} />
                                    Protected
                                  </span>
                                ) : isDeactivated ? (
                                  <span className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                    Deactivated
                                  </span>
                                ) : isSuspended ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRestore(user)
                                    }
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <RotateCcw size={15} />
                                    Restore
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      clearActionMessages();
                                      setSuspendUser(user);
                                      setSuspensionReason("");
                                    }}
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <Ban size={15} />
                                    Suspend
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y divide-[var(--border)] lg:hidden">
                  {filteredUsers.map((user) => {
                    const RoleIcon = roleIcon(user.role);
                    const status = getAccountStatus(user);
                    const isAdmin =
                      String(user.role).toLowerCase() === "admin";
                    const isSuspended = status === "SUSPENDED";
                    const isDeactivated =
                      status === "DEACTIVATED";

                    return (
                      <div key={user.id} className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--background)] text-[var(--text-secondary)]">
                              <UserRound size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                {user.name || "Unnamed User"}
                              </p>

                              <p className="truncate text-xs text-[var(--text-secondary)]">
                                {user.email || "No email"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getAccountStatusStyle(
                              status,
                            )}`}
                          >
                            {formatAccountStatus(status)}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${roleBadgeStyle(
                              user.role,
                            )}`}
                          >
                            <RoleIcon size={13} />
                            {roleLabel(user.role)}
                          </span>

                          <span className="text-xs text-[var(--text-muted)]">
                            Registered{" "}
                            {formatDate(
                              user.created_at ||
                                user.createdAt ||
                                user.registered_at ||
                                user.registeredAt,
                            )}
                          </span>
                        </div>

                        <div className="mt-4 flex justify-end">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 dark:bg-violet-950/30 dark:text-violet-300">
                              <ShieldCheck size={15} />
                              Protected
                            </span>
                          ) : isDeactivated ? (
                            <span className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              Deactivated
                            </span>
                          ) : isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(user)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <RotateCcw size={15} />
                              Restore Account
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                clearActionMessages();
                                setSuspendUser(user);
                                setSuspensionReason("");
                              }}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Ban size={15} />
                              Suspend Account
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="surface mt-6 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300">
                <ShieldCheck size={19} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Account Management
                </h3>

                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  Administrators can suspend organization and donor
                  accounts when necessary. Suspended accounts cannot
                  use the platform until they are restored. Administrator
                  accounts are protected from suspension.
                </p>

                <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                  Suspending an account is handled by the backend and
                  may also affect donations and related request
                  workflows associated with that account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Suspension modal */}
      {suspendUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
              <div>
                <div className="mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <Ban size={19} />
                  <span className="text-sm font-semibold">
                    Suspend Account
                  </span>
                </div>

                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Suspend {suspendUser.name || "this user"}?
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  This will restrict the account from using the
                  platform.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSuspendUser(null);
                  setSuspensionReason("");
                  setActionError("");
                }}
                disabled={actionLoading}
                className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--background)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5">
              <label className="block text-sm font-semibold text-[var(--text-primary)]">
                Reason for suspension
              </label>

              <textarea
                value={suspensionReason}
                onChange={(event) =>
                  setSuspensionReason(event.target.value)
                }
                maxLength={500}
                rows={5}
                placeholder="Enter the reason for suspending this account..."
                className="mt-2 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                disabled={actionLoading}
              />

              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-[var(--text-muted)]">
                  A reason is required for audit purposes.
                </p>

                <span className="text-xs text-[var(--text-muted)]">
                  {suspensionReason.length}/500
                </span>
              </div>

              {actionError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  <CircleAlert
                    size={17}
                    className="mt-0.5 shrink-0"
                  />
                  <p>{actionError}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setSuspendUser(null);
                  setSuspensionReason("");
                  setActionError("");
                }}
                disabled={actionLoading}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSuspend}
                disabled={
                  actionLoading ||
                  !suspensionReason.trim()
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    Suspending...
                  </>
                ) : (
                  <>
                    <Ban size={17} />
                    Suspend Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;