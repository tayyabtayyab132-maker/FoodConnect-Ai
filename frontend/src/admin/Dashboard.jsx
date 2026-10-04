import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Package,
  RefreshCw,
  ShieldCheck,
  Users,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [
        usersResponse,
        donationsResponse,
        requestsResponse,
      ] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/donations"),
        api.get("/admin/requests"),
      ]);

      setUsers(extractList(usersResponse));
      setDonations(extractList(donationsResponse));
      setRequests(extractList(requestsResponse));
    } catch (requestError) {
      console.error(
        "Failed to load admin dashboard:",
        requestError,
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to load the admin dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const organizations = users.filter(
      (user) => user.role === "organization",
    ).length;

    const donors = users.filter(
      (user) => user.role === "donor",
    ).length;

    const activeDonations = donations.filter(
      (donation) =>
        donation.status === "AVAILABLE" ||
        donation.status === "PARTIALLY_RESERVED" ||
        donation.status === "RESERVED",
    ).length;

    const pendingRequests = requests.filter(
      (request) => request.status === "PENDING",
    ).length;

    const completedRequests = requests.filter(
      (request) => request.status === "COMPLETED",
    ).length;

    return {
      totalUsers: users.length,
      organizations,
      donors,
      totalDonations: donations.length,
      activeDonations,
      totalRequests: requests.length,
      pendingRequests,
      completedRequests,
    };
  }, [users, donations, requests]);

  const donationStatus = useMemo(() => {
    const statuses = [
      "AVAILABLE",
      "PARTIALLY_RESERVED",
      "RESERVED",
      "COMPLETED",
      "CANCELLED",
      "EXPIRED",
    ];

    return statuses.map((status) => ({
      status,
      count: donations.filter(
        (donation) => donation.status === status,
      ).length,
    }));
  }, [donations]);

  const requestStatus = useMemo(() => {
    const statuses = [
      "PENDING",
      "ACCEPTED",
      "COLLECTION_CONFIRMED",
      "COMPLETED",
      "REJECTED",
      "CANCELLED",
    ];

    return statuses.map((status) => ({
      status,
      count: requests.filter(
        (request) => request.status === status,
      ).length,
    }));
  }, [requests]);

  const recentDonations = useMemo(() => {
    return [...donations]
      .sort((a, b) => {
        const dateA = new Date(
          a.created_at || 0,
        ).getTime();

        const dateB = new Date(
          b.created_at || 0,
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [donations]);

  const recentRequests = useMemo(() => {
    return [...requests]
      .sort((a, b) => {
        const dateA = new Date(
          a.created_at || 0,
        ).getTime();

        const dateB = new Date(
          b.created_at || 0,
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [requests]);

  const getUserName = (userId) => {
    const foundUser = users.find(
      (item) =>
        item.id === userId ||
        item.user_id === userId,
    );

    return (
      foundUser?.name ||
      foundUser?.email ||
      "Unknown user"
    );
  };

  const getDonationName = (donation) => {
    return (
      donation?.food_name ||
      donation?.name ||
      "Food Donation"
    );
  };

  const formatDate = (value) => {
    if (!value) {
      return "No date";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "No date";
    }

    return date.toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );
  };

  const getStatusCount = (items, status) => {
    return (
      items.find(
        (item) => item.status === status,
      )?.count || 0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />

        <main className="min-h-screen lg:ml-64">
          <div className="px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
            <Loading message="Loading admin dashboard..." />
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
          <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                <ShieldCheck size={16} />
                Platform administration
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Monitor users, food donations, requests, and
                the overall activity of the FoodConnect
                platform.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </header>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <XCircle
                className="mt-0.5 shrink-0"
                size={18}
              />

              <div className="flex-1">
                <p className="font-semibold">
                  Dashboard could not be loaded
                </p>

                <p className="mt-1">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadDashboard(true)}
                className="font-semibold underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              description={`${stats.organizations} organizations · ${stats.donors} donors`}
              icon={Users}
              iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
            />

            <StatCard
              title="Total Donations"
              value={stats.totalDonations}
              description={`${stats.activeDonations} currently active`}
              icon={Package}
              iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
            />

            <StatCard
              title="Total Requests"
              value={stats.totalRequests}
              description={`${stats.pendingRequests} waiting for action`}
              icon={ClipboardList}
              iconClassName="bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
            />

            <StatCard
              title="Completed"
              value={stats.completedRequests}
              description="Successfully completed requests"
              icon={CheckCircle2}
              iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
            />
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="surface overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Donation Overview
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Current status of food donations across
                    the platform.
                  </p>
                </div>

                <Link
                  to="/admin/donations"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View donations
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {donationStatus.map(
                  ({ status, count }) => (
                    <div
                      key={status}
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <StatusBadge status={status} />

                        <span className="text-2xl font-bold text-[var(--text-primary)]">
                          {count}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="surface p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                  <Users size={21} />
                </div>

                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    User Distribution
                  </p>

                  <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">
                    {stats.totalUsers}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                    Registered platform users.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">
                      Organizations
                    </span>

                    <span className="font-semibold text-[var(--text-primary)]">
                      {stats.organizations}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width:
                          stats.totalUsers > 0
                            ? `${(stats.organizations / stats.totalUsers) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">
                      Donors
                    </span>

                    <span className="font-semibold text-[var(--text-primary)]">
                      {stats.donors}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width:
                          stats.totalUsers > 0
                            ? `${(stats.donors / stats.totalUsers) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>

              <Link
                to="/admin/users"
                className="mt-6 flex items-center justify-between rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border)]"
              >
                Manage users
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          <section className="mt-6 surface overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Request Workflow
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Monitor how donation requests are progressing.
                </p>
              </div>

              <Link
                to="/admin/requests"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View requests
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {requestStatus.map(
                ({ status, count }) => (
                  <div
                    key={status}
                    className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] p-4 transition hover:bg-[var(--surface-muted)]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                        {status === "PENDING" ? (
                          <Clock3 size={17} />
                        ) : status === "COMPLETED" ? (
                          <CheckCircle2 size={17} />
                        ) : (
                          <ClipboardList size={17} />
                        )}
                      </div>

                      <StatusBadge status={status} />
                    </div>

                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      {count}
                    </span>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="surface overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Recent Donations
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Latest food donations added to the platform.
                  </p>
                </div>

                <Link
                  to="/admin/donations"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View all
                  <ArrowRight size={16} />
                </Link>
              </div>

              {recentDonations.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                    <Package size={21} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
                    No donations yet
                  </h3>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Donations will appear here once they are
                    created.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {recentDonations.map(
                    (donation) => (
                      <div
                        key={donation.id}
                        className="flex flex-col gap-3 p-5 transition hover:bg-[var(--surface-muted)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <UtensilsCrossed size={18} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                {getDonationName(donation)}
                              </h3>

                              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                {donation.quantity || 0} units
                              </p>
                            </div>
                          </div>

                          <StatusBadge status={donation.status} />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                          <span>
                            Donor:{" "}
                            <span className="font-medium text-[var(--text-secondary)]">
                              {getUserName(donation.donor_id)}
                            </span>
                          </span>

                          <span>
                            {formatDate(donation.created_at)}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            <div className="surface overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Recent Requests
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Latest organization requests.
                  </p>
                </div>

                <Link
                  to="/admin/requests"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View all
                  <ArrowRight size={16} />
                </Link>
              </div>

              {recentRequests.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                    <ClipboardList size={21} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
                    No requests yet
                  </h3>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Requests will appear here once organizations
                    submit them.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {recentRequests.map(
                    (request) => (
                      <div
                        key={request.id}
                        className="flex flex-col gap-3 p-5 transition hover:bg-[var(--surface-muted)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
                              <ClipboardList size={18} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                {getDonationName(
                                  donations.find(
                                    (donation) =>
                                      donation.id ===
                                      request.donation_id,
                                  ),
                                )}
                              </h3>

                              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                Requested:{" "}
                                <span className="font-semibold text-[var(--text-primary)]">
                                  {request.requested_quantity || 0}
                                </span>
                              </p>
                            </div>
                          </div>

                          <StatusBadge status={request.status} />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                          <span>
                            Organization:{" "}
                            <span className="font-medium text-[var(--text-secondary)]">
                              {getUserName(
                                request.organization_id,
                              )}
                            </span>
                          </span>

                          <span>
                            {formatDate(request.created_at)}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 surface p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Activity size={21} />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Platform Activity
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  A quick operational snapshot of the platform.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[var(--border)] p-4">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <BarChart3 size={16} />
                  Active Donations
                </div>

                <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                  {stats.activeDonations}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] p-4">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Clock3 size={16} />
                  Pending Requests
                </div>

                <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                  {stats.pendingRequests}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] p-4">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <CheckCircle2 size={16} />
                  Completed Requests
                </div>

                <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                  {stats.completedRequests}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] p-4">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <BarChart3 size={16} />
                  Available Donations
                </div>

                <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                  {getStatusCount(
                    donationStatus,
                    "AVAILABLE",
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;