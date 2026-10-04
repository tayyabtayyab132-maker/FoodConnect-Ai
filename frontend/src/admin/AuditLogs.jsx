import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Calendar,
  CircleAlert,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import Loading from "../components/Loading";
import api from "../services/api";

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAction(action) {
  if (!action) {
    return "Unknown action";
  }

  return action
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getActionStyle(action) {
  const normalized = String(action || "").toUpperCase();

  if (
    normalized.includes("DELETE") ||
    normalized.includes("CANCEL") ||
    normalized.includes("REJECT")
  ) {
    return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300";
  }

  if (
    normalized.includes("CREATE") ||
    normalized.includes("SIGNUP") ||
    normalized.includes("REGISTER")
  ) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300";
  }

  if (
    normalized.includes("UPDATE") ||
    normalized.includes("EDIT") ||
    normalized.includes("ACCEPT")
  ) {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300";
  }

  if (
    normalized.includes("LOGIN") ||
    normalized.includes("LOGOUT")
  ) {
    return "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300";
  }

  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function getUserName(log, users) {
  if (log.user_name) {
    return log.user_name;
  }

  if (log.name) {
    return log.name;
  }

  const userId =
    log.user_id ||
    log.actor_id ||
    log.created_by ||
    log.admin_id;

  if (!userId) {
    return "System";
  }

  const user = users.find(
    (item) =>
      item.id === userId ||
      item.user_id === userId,
  );

  return user?.name || user?.email || userId;
}

function getLogAction(log) {
  return (
    log.action ||
    log.event ||
    log.activity ||
    log.type ||
    "UNKNOWN"
  );
}

function getLogTimestamp(log) {
  return (
    log.created_at ||
    log.timestamp ||
    log.date ||
    log.time
  );
}

function getLogDescription(log) {
  return (
    log.description ||
    log.message ||
    log.details ||
    log.reason ||
    "No additional details available."
  );
}

function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const [logsResponse, usersResponse] = await Promise.all([
        api.get("/admin/audit-logs"),
        api.get("/admin/users"),
      ]);

      setLogs(
        Array.isArray(logsResponse.data)
          ? logsResponse.data
          : [],
      );

      setUsers(
        Array.isArray(usersResponse.data)
          ? usersResponse.data
          : [],
      );
    } catch (err) {
      console.error("Failed to load audit logs:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load audit logs. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const actionOptions = useMemo(() => {
    const actions = logs
      .map((log) => getLogAction(log))
      .filter(Boolean);

    return ["ALL", ...new Set(actions)];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return logs.filter((log) => {
      const action = getLogAction(log);
      const userName = getUserName(log, users);
      const description = getLogDescription(log);

      const matchesSearch =
        !normalizedSearch ||
        action.toLowerCase().includes(normalizedSearch) ||
        userName.toLowerCase().includes(normalizedSearch) ||
        description.toLowerCase().includes(normalizedSearch) ||
        String(log.user_id || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(log.resource_id || "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesAction =
        actionFilter === "ALL" ||
        action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, users, search, actionFilter]);

  const statistics = useMemo(() => {
    const uniqueUsers = new Set(
      logs
        .map(
          (log) =>
            log.user_id ||
            log.actor_id ||
            log.created_by ||
            log.admin_id,
        )
        .filter(Boolean),
    );

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const todayCount = logs.filter((log) => {
      const timestamp = getLogTimestamp(log);

      if (!timestamp) {
        return false;
      }

      const date = new Date(timestamp);

      return (
        !Number.isNaN(date.getTime()) &&
        date >= startOfToday
      );
    }).length;

    const securityActions = logs.filter((log) => {
      const action = getLogAction(log).toUpperCase();

      return (
        action.includes("LOGIN") ||
        action.includes("LOGOUT") ||
        action.includes("PASSWORD") ||
        action.includes("AUTH")
      );
    }).length;

    return {
      total: logs.length,
      today: todayCount,
      users: uniqueUsers.size,
      security: securityActions,
    };
  }, [logs]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Activity size={24} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Administration
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                  Audit Logs
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
                  Review important platform activities and administrative
                  events recorded by the system.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadData(false)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-600 dark:hover:bg-slate-500"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <CircleAlert
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Unable to load audit logs
                </p>

                <p className="mt-1 text-sm opacity-90">
                  {error}
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <Loading />
          ) : (
            <>
              {/* Statistics */}
              <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Events"
                  value={statistics.total}
                  description="All recorded activities"
                  icon={Activity}
                  iconClassName="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                />

                <StatCard
                  title="Today"
                  value={statistics.today}
                  description="Events recorded today"
                  icon={Calendar}
                  iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                />

                <StatCard
                  title="Active Users"
                  value={statistics.users}
                  description="Users represented in logs"
                  icon={UserRound}
                  iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                />

                <StatCard
                  title="Security Events"
                  value={statistics.security}
                  description="Authentication-related events"
                  icon={ShieldCheck}
                  iconClassName="bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
                />
              </div>

              {/* Logs */}
              <div className="surface overflow-hidden">
                {/* Filters */}
                <div className="border-b border-[var(--border)] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        Activity History
                      </h2>

                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {filteredLogs.length} of {logs.length} events shown
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      {/* Search */}
                      <div className="relative min-w-0 sm:w-80">
                        <Search
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        />

                        <input
                          type="text"
                          value={search}
                          onChange={(event) =>
                            setSearch(event.target.value)
                          }
                          placeholder="Search activity..."
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
                        />
                      </div>

                      {/* Action filter */}
                      <div className="relative">
                        <Filter
                          size={17}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        />

                        <select
                          value={actionFilter}
                          onChange={(event) =>
                            setActionFilter(event.target.value)
                          }
                          className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-9 text-sm text-[var(--text-primary)] outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 sm:w-56"
                        >
                          {actionOptions.map((action) => (
                            <option key={action} value={action}>
                              {action === "ALL"
                                ? "All actions"
                                : formatAction(action)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Empty state */}
                {filteredLogs.length === 0 ? (
                  <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-[var(--text-muted)]">
                      <Activity size={26} />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                      No audit logs found
                    </h3>

                    <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
                      {search || actionFilter !== "ALL"
                        ? "Try changing your search or action filter."
                        : "No activity has been recorded yet."}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto lg:block">
                      <table className="w-full min-w-[1000px]">
                        <thead>
                          <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Action
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              User
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Details
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Resource
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Time
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[var(--border)]">
                          {filteredLogs.map((log, index) => {
                            const action = getLogAction(log);

                            return (
                              <tr
                                key={log.id || `${action}-${index}`}
                                className="transition hover:bg-[var(--surface-muted)]"
                              >
                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getActionStyle(
                                      action,
                                    )}`}
                                  >
                                    {formatAction(action)}
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <p className="max-w-48 truncate text-sm font-medium text-[var(--text-primary)]">
                                    {getUserName(log, users)}
                                  </p>

                                  <p className="mt-0.5 max-w-48 truncate text-xs text-[var(--text-muted)]">
                                    {log.user_id ||
                                      log.actor_id ||
                                      "System"}
                                  </p>
                                </td>

                                <td className="px-5 py-4">
                                  <p className="max-w-md text-sm text-[var(--text-secondary)]">
                                    {getLogDescription(log)}
                                  </p>
                                </td>

                                <td className="px-5 py-4">
                                  <p className="max-w-48 truncate text-sm text-[var(--text-primary)]">
                                    {log.resource_type ||
                                      log.entity_type ||
                                      "System"}
                                  </p>

                                  {(log.resource_id ||
                                    log.entity_id) && (
                                    <p className="mt-0.5 max-w-48 truncate font-mono text-xs text-[var(--text-muted)]">
                                      {log.resource_id ||
                                        log.entity_id}
                                    </p>
                                  )}
                                </td>

                                <td className="px-5 py-4">
                                  <p className="whitespace-nowrap text-sm text-[var(--text-primary)]">
                                    {formatDateTime(
                                      getLogTimestamp(log),
                                    )}
                                  </p>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile / tablet cards */}
                    <div className="grid gap-4 p-4 lg:hidden">
                      {filteredLogs.map((log, index) => {
                        const action = getLogAction(log);

                        return (
                          <div
                            key={log.id || `${action}-${index}`}
                            className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  <Activity size={18} />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-[var(--text-primary)]">
                                    {getUserName(log, users)}
                                  </p>

                                  <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                                    {formatDateTime(
                                      getLogTimestamp(log),
                                    )}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getActionStyle(
                                  action,
                                )}`}
                              >
                                {formatAction(action)}
                              </span>
                            </div>

                            <div className="mt-4 rounded-xl bg-[var(--surface-muted)] p-3">
                              <p className="text-xs font-medium text-[var(--text-muted)]">
                                Details
                              </p>

                              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                                {getLogDescription(log)}
                              </p>
                            </div>

                            {(log.resource_id ||
                              log.entity_id ||
                              log.resource_type ||
                              log.entity_type) && (
                              <div className="mt-3 border-t border-[var(--border)] pt-3">
                                <p className="text-xs font-medium text-[var(--text-muted)]">
                                  Resource
                                </p>

                                <p className="mt-1 text-sm text-[var(--text-primary)]">
                                  {log.resource_type ||
                                    log.entity_type ||
                                    "System"}
                                </p>

                                {(log.resource_id ||
                                  log.entity_id) && (
                                  <p className="mt-1 break-all font-mono text-xs text-[var(--text-muted)]">
                                    {log.resource_id ||
                                      log.entity_id}
                                  </p>
                                )}
                              </div>
                            )}

                            {(log.user_id ||
                              log.actor_id) && (
                              <div className="mt-3 border-t border-[var(--border)] pt-3">
                                <p className="text-xs font-medium text-[var(--text-muted)]">
                                  User ID
                                </p>

                                <p className="mt-1 break-all font-mono text-xs text-[var(--text-secondary)]">
                                  {log.user_id || log.actor_id}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Information panel */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-slate-600 dark:text-slate-300"
                  />

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-200">
                      Audit information
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      Audit logs provide a historical record of important
                      system activity. They are intended for administrative
                      monitoring, troubleshooting, and accountability.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminAuditLogs;