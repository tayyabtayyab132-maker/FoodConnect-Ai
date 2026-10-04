import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Filter,
  HandHeart,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import api from "../services/api";

function extractList(response) {
  const payload = response?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  return [];
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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

function getUserName(id, users, fallback = "Unknown user") {
  if (!id) {
    return fallback;
  }

  const user = users.find(
    (item) => item.id === id || item.user_id === id,
  );

  return user?.name || user?.email || fallback;
}

function formatQuantity(request) {
  const quantity =
    request.requested_quantity ??
    request.quantity ??
    0;

  const unit = request.unit ? ` ${request.unit}` : "";

  return `${quantity}${unit}`;
}

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [cancelRequest, setCancelRequest] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const [requestsResponse, usersResponse] =
        await Promise.all([
          api.get("/admin/requests"),
          api.get("/admin/users"),
        ]);

      const requestData = extractList(
        requestsResponse,
      );

      const userData = extractList(
        usersResponse,
      );

      setRequests(requestData);
      setUsers(userData);

      console.log(
        "Admin requests loaded:",
        requestData,
      );
    } catch (err) {
      console.error(
        "Failed to load admin requests:",
        err,
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load requests. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCancelModal = (request) => {
    setCancelRequest(request);
    setCancelReason("");
    setCancelError("");
  };

  const closeCancelModal = () => {
    if (cancelLoading) {
      return;
    }

    setCancelRequest(null);
    setCancelReason("");
    setCancelError("");
  };

  const handleCancelRequest = async () => {
    const reason = cancelReason.trim();

    if (!reason) {
      setCancelError(
        "Please enter a reason for cancelling this request.",
      );
      return;
    }

    if (!cancelRequest?.id) {
      setCancelError(
        "The selected request could not be identified.",
      );
      return;
    }

    try {
      setCancelLoading(true);
      setCancelError("");
      setError("");

      await api.patch(
        `/admin/requests/${cancelRequest.id}/cancel`,
        null,
        {
          params: {
            reason,
          },
        },
      );

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === cancelRequest.id
            ? {
                ...request,
                status: "CANCELLED",
              }
            : request,
        ),
      );

      setCancelRequest(null);
      setCancelReason("");
      setCancelError("");
    } catch (err) {
      console.error(
        "Failed to cancel request:",
        err,
      );

      setCancelError(
        err.response?.data?.detail ||
          "Unable to cancel this request. Please try again.",
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return requests.filter((request) => {
      const organizationName = getUserName(
        request.organization_id,
        users,
        "Unknown organization",
      );

      const donorName = getUserName(
        request.donor_id,
        users,
        "Unknown donor",
      );

      const matchesSearch =
        !normalizedSearch ||
        request.id
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        request.donation_id
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        request.organization_id
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        request.donor_id
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        organizationName
          .toLowerCase()
          .includes(normalizedSearch) ||
        donorName
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, users, search, statusFilter]);

  const statistics = useMemo(() => {
    const pending = requests.filter(
      (request) => request.status === "PENDING",
    ).length;

    const accepted = requests.filter(
      (request) => request.status === "ACCEPTED",
    ).length;

    const collectionConfirmed =
      requests.filter(
        (request) =>
          request.status ===
          "COLLECTION_CONFIRMED",
      ).length;

    const completed = requests.filter(
      (request) => request.status === "COMPLETED",
    ).length;

    const rejected = requests.filter(
      (request) => request.status === "REJECTED",
    ).length;

    const cancelled = requests.filter(
      (request) => request.status === "CANCELLED",
    ).length;

    return {
      total: requests.length,
      pending,
      accepted,
      collectionConfirmed,
      completed,
      rejected,
      cancelled,
    };
  }, [requests]);

  const statusOptions = [
    "ALL",
    "PENDING",
    "ACCEPTED",
    "COLLECTION_CONFIRMED",
    "COMPLETED",
    "REJECTED",
    "CANCELLED",
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                <HandHeart size={24} />
              </div>

              <div>
                <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
                  Administration
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                  Requests
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
                  Monitor organization food requests
                  and their progress through the
                  donation workflow.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)] sm:flex"
              >
                Dashboard
                <ArrowRight size={16} />
              </Link>

              <button
                type="button"
                onClick={() => loadData(false)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <CircleAlert
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Unable to load requests
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
              <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Requests"
                  value={statistics.total}
                  description="All requests recorded"
                  icon={HandHeart}
                  iconClassName="bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
                />

                <StatCard
                  title="Pending"
                  value={statistics.pending}
                  description="Waiting for a decision"
                  icon={Clock3}
                  iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                />

                <StatCard
                  title="In Progress"
                  value={
                    statistics.accepted +
                    statistics.collectionConfirmed
                  }
                  description="Accepted or collection confirmed"
                  icon={CalendarClock}
                  iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                />

                <StatCard
                  title="Completed"
                  value={statistics.completed}
                  description="Successfully completed"
                  icon={CheckCircle2}
                  iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                />
              </div>

              <div className="surface overflow-hidden">
                <div className="border-b border-[var(--border)] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        All Requests
                      </h2>

                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {filteredRequests.length} of{" "}
                        {requests.length} requests shown
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="relative min-w-0 sm:w-80">
                        <Search
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        />

                        <input
                          type="text"
                          value={search}
                          onChange={(event) =>
                            setSearch(
                              event.target.value,
                            )
                          }
                          placeholder="Search requests..."
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>

                      <div className="relative">
                        <Filter
                          size={17}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        />

                        <select
                          value={statusFilter}
                          onChange={(event) =>
                            setStatusFilter(
                              event.target.value,
                            )
                          }
                          className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-9 text-sm text-[var(--text-primary)] outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:w-56"
                        >
                          {statusOptions.map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status === "ALL"
                                  ? "All statuses"
                                  : status
                                      .toLowerCase()
                                      .replaceAll(
                                        "_",
                                        " ",
                                      )
                                      .replace(
                                        /\b\w/g,
                                        (char) =>
                                          char.toUpperCase(),
                                      )}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {filteredRequests.length === 0 ? (
                  <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-[var(--text-muted)]">
                      <HandHeart size={26} />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                      No requests found
                    </h3>

                    <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
                      {search ||
                      statusFilter !== "ALL"
                        ? "Try changing your search or status filter."
                        : "There are no food requests recorded yet."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-x-auto lg:block">
                      <table className="w-full min-w-[1250px]">
                        <thead>
                          <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Request
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Organization
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Donor
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Quantity
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Created
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Status
                            </th>

                            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[var(--border)]">
                          {filteredRequests.map(
                            (request) => {
                              const canCancel =
                                [
                                  "PENDING",
                                  "ACCEPTED",
                                  "COLLECTION_CONFIRMED",
                                ].includes(
                                  request.status,
                                );

                              return (
                                <tr
                                  key={request.id}
                                  className="transition hover:bg-[var(--surface-muted)]"
                                >
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                                        <HandHeart size={18} />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="max-w-56 truncate font-semibold text-[var(--text-primary)]">
                                          {request.id}
                                        </p>

                                        <p className="mt-0.5 max-w-56 truncate text-xs text-[var(--text-muted)]">
                                          Donation:{" "}
                                          {request.donation_id ||
                                            "Not available"}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-5 py-4">
                                    <p className="max-w-48 truncate text-sm font-medium text-[var(--text-primary)]">
                                      {getUserName(
                                        request.organization_id,
                                        users,
                                        "Unknown organization",
                                      )}
                                    </p>

                                    <p className="mt-0.5 max-w-48 truncate text-xs text-[var(--text-muted)]">
                                      {request.organization_id ||
                                        "No organization ID"}
                                    </p>
                                  </td>

                                  <td className="px-5 py-4">
                                    <p className="max-w-48 truncate text-sm font-medium text-[var(--text-primary)]">
                                      {getUserName(
                                        request.donor_id,
                                        users,
                                        "Unknown donor",
                                      )}
                                    </p>

                                    <p className="mt-0.5 max-w-48 truncate text-xs text-[var(--text-muted)]">
                                      {request.donor_id ||
                                        "No donor ID"}
                                    </p>
                                  </td>

                                  <td className="px-5 py-4">
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                                      {formatQuantity(
                                        request,
                                      )}
                                    </p>
                                  </td>

                                  <td className="px-5 py-4">
                                    <p className="text-sm text-[var(--text-primary)]">
                                      {formatDate(
                                        request.created_at,
                                      )}
                                    </p>

                                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                      {formatDateTime(
                                        request.created_at,
                                      )}
                                    </p>
                                  </td>

                                  <td className="px-5 py-4">
                                    <StatusBadge
                                      status={
                                        request.status
                                      }
                                    />
                                  </td>

                                  <td className="px-5 py-4 text-right">
                                    {canCancel ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openCancelModal(
                                            request,
                                          )
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                                      >
                                        <X size={15} />
                                        Cancel
                                      </button>
                                    ) : (
                                      <span className="text-xs text-[var(--text-muted)]">
                                        Not available
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-4 p-4 lg:hidden">
                      {filteredRequests.map(
                        (request) => {
                          const canCancel =
                            [
                              "PENDING",
                              "ACCEPTED",
                              "COLLECTION_CONFIRMED",
                            ].includes(
                              request.status,
                            );

                          return (
                            <div
                              key={request.id}
                              className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                                    <HandHeart size={18} />
                                  </div>

                                  <div className="min-w-0">
                                    <h3 className="truncate font-semibold text-[var(--text-primary)]">
                                      Request
                                    </h3>

                                    <p className="mt-0.5 truncate font-mono text-xs text-[var(--text-muted)]">
                                      {request.id}
                                    </p>
                                  </div>
                                </div>

                                <StatusBadge
                                  status={
                                    request.status
                                  }
                                />
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                                  <p className="text-xs font-medium text-[var(--text-muted)]">
                                    Organization
                                  </p>

                                  <p className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">
                                    {getUserName(
                                      request.organization_id,
                                      users,
                                      "Unknown organization",
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                                  <p className="text-xs font-medium text-[var(--text-muted)]">
                                    Donor
                                  </p>

                                  <p className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">
                                    {getUserName(
                                      request.donor_id,
                                      users,
                                      "Unknown donor",
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                                  <p className="text-xs font-medium text-[var(--text-muted)]">
                                    Quantity
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                    {formatQuantity(
                                      request,
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                                  <p className="text-xs font-medium text-[var(--text-muted)]">
                                    Created
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                    {formatDate(
                                      request.created_at,
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 border-t border-[var(--border)] pt-3">
                                <p className="text-xs text-[var(--text-muted)]">
                                  Donation ID
                                </p>

                                <p className="mt-1 break-all font-mono text-xs text-[var(--text-secondary)]">
                                  {request.donation_id ||
                                    "Not available"}
                                </p>
                              </div>

                              {request.collection_time && (
                                <div className="mt-3 border-t border-[var(--border)] pt-3">
                                  <p className="text-xs text-[var(--text-muted)]">
                                    Collection time
                                  </p>

                                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                    {formatDateTime(
                                      request.collection_time,
                                    )}
                                  </p>
                                </div>
                              )}

                              {canCancel && (
                                <div className="mt-4 border-t border-[var(--border)] pt-4">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openCancelModal(
                                        request,
                                      )
                                    }
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                                  >
                                    <X size={17} />
                                    Cancel Request
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="surface p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                      <Clock3 size={19} />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)]">
                        Pending
                      </p>

                      <p className="text-xl font-bold text-[var(--text-primary)]">
                        {statistics.pending}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="surface p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <CalendarClock size={19} />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)]">
                        Accepted
                      </p>

                      <p className="text-xl font-bold text-[var(--text-primary)]">
                        {statistics.accepted}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="surface p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                      <HandHeart size={19} />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)]">
                        Collection Confirmed
                      </p>

                      <p className="text-xl font-bold text-[var(--text-primary)]">
                        {statistics.collectionConfirmed}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="surface p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                      <XCircle size={19} />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)]">
                        Rejected / Cancelled
                      </p>

                      <p className="text-xl font-bold text-[var(--text-primary)]">
                        {statistics.rejected +
                          statistics.cancelled}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-900 dark:bg-violet-950/20">
                <div className="flex items-start gap-3">
                  <CircleAlert
                    size={19}
                    className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-400"
                  />

                  <div>
                    <h3 className="font-semibold text-violet-900 dark:text-violet-200">
                      Request workflow
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-violet-800 dark:text-violet-300">
                      Requests normally progress from
                      Pending to Accepted, then Collection
                      Confirmed, and finally Completed.
                      Rejected and Cancelled requests remain
                      visible for administrative tracking.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {cancelRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Cancel Request
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  This action will mark the request as
                  cancelled.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCancelModal}
                disabled={cancelLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close cancellation dialog"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                    <HandHeart size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--text-primary)]">
                      Request
                    </p>

                    <p className="mt-0.5 break-all font-mono text-xs text-[var(--text-secondary)]">
                      {cancelRequest.id}
                    </p>

                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Organization:{" "}
                      {getUserName(
                        cancelRequest.organization_id,
                        users,
                        "Unknown organization",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="cancel-request-reason"
                  className="text-sm font-semibold text-[var(--text-primary)]"
                >
                  Cancellation reason
                </label>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Please provide a reason. This will be
                  recorded in the administrative action.
                </p>

                <textarea
                  id="cancel-request-reason"
                  value={cancelReason}
                  onChange={(event) => {
                    setCancelReason(
                      event.target.value,
                    );

                    if (cancelError) {
                      setCancelError("");
                    }
                  }}
                  rows={4}
                  maxLength={500}
                  disabled={cancelLoading}
                  placeholder="Enter the reason for cancelling this request..."
                  className="mt-3 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-[var(--text-muted)]">
                    {cancelReason.length}/500
                  </span>
                </div>
              </div>

              {cancelError && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  <CircleAlert
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p>{cancelError}</p>
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCancelModal}
                  disabled={cancelLoading}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keep Request
                </button>

                <button
                  type="button"
                  onClick={handleCancelRequest}
                  disabled={
                    cancelLoading ||
                    !cancelReason.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelLoading ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X size={17} />
                      Cancel Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRequests;