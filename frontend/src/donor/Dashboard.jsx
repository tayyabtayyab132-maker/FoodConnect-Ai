import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Package,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock3,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import api from "../services/api";

function DonorDashboard() {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (showFullLoader = true) => {
    if (showFullLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const [donationsResponse, requestsResponse] = await Promise.all([
        api.get("/donations"),
        api.get("/requests"),
      ]);

      setDonations(donationsResponse.data?.data || []);
      setRequests(requestsResponse.data?.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.message ||
          "Unable to load your dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const activeDonations = donations.filter((donation) =>
      ["AVAILABLE", "PARTIALLY_RESERVED", "RESERVED"].includes(
        donation.status,
      ),
    );

    const completedDonations = donations.filter(
      (donation) => donation.status === "COMPLETED",
    );

    const pendingRequests = requests.filter(
      (request) => request.status === "PENDING",
    );

    const acceptedRequests = requests.filter((request) =>
      ["ACCEPTED", "COLLECTION_CONFIRMED"].includes(request.status),
    );

    return {
      totalDonations: donations.length,
      activeDonations: activeDonations.length,
      completedDonations: completedDonations.length,
      totalRequests: requests.length,
      pendingRequests: pendingRequests.length,
      acceptedRequests: acceptedRequests.length,
    };
  }, [donations, requests]);

  const recentDonations = useMemo(() => {
    return [...donations]
      .sort((a, b) => {
        const first = new Date(
          a.preparation_datetime || a.created_at || 0,
        ).getTime();

        const second = new Date(
          b.preparation_datetime || b.created_at || 0,
        ).getTime();

        return second - first;
      })
      .slice(0, 5);
  }, [donations]);

  const recentRequests = useMemo(() => {
    return [...requests]
      .sort((a, b) => {
        const first = new Date(a.created_at || 0).getTime();
        const second = new Date(b.created_at || 0).getTime();

        return second - first;
      })
      .slice(0, 5);
  }, [requests]);

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-semibold text-[var(--primary)]">
                Donor Dashboard
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                Manage your food donations
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Track surplus food, review incoming requests, and help connect
                available meals with organizations that need them.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadDashboard(false)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Primary stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Donations"
              value={stats.totalDonations}
              icon={Package}
            />

            <StatCard
              title="Active Donations"
              value={stats.activeDonations}
              icon={UtensilsCrossed}
            />

            <StatCard
              title="Completed"
              value={stats.completedDonations}
              icon={CheckCircle2}
            />

            <StatCard
              title="Requests Received"
              value={stats.totalRequests}
              icon={ClipboardList}
            />
          </div>

          {/* Request stats */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <StatCard
              title="Pending Requests"
              value={stats.pendingRequests}
              icon={Clock3}
            />

            <StatCard
              title="Accepted Requests"
              value={stats.acceptedRequests}
              icon={CheckCircle2}
            />
          </div>

          {/* Quick actions */}
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Manage your donations and incoming requests.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/donor/donations/create"
                className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
                  <Plus size={21} />
                </div>

                <h3 className="font-semibold text-[var(--text-primary)]">
                  Create Donation
                </h3>

                <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
                  Share available surplus food with community organizations.
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)]">
                  Add donation
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>

              <Link
                to="/donor/donations"
                className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                  <Package size={21} />
                </div>

                <h3 className="font-semibold text-[var(--text-primary)]">
                  My Donations
                </h3>

                <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
                  View and manage all food donations you have created.
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)]">
                  View donations
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>

              <Link
                to="/donor/requests"
                className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                  <ClipboardList size={21} />
                </div>

                <h3 className="font-semibold text-[var(--text-primary)]">
                  Incoming Requests
                </h3>

                <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
                  Review organizations requesting your available donations.
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)]">
                  View requests
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            </div>
          </section>

          {/* Recent donations */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Recent Donations
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Your latest food donation activity.
                </p>
              </div>

              <Link
                to="/donor/donations"
                className="hidden items-center gap-1 text-sm font-semibold text-[var(--primary)] sm:inline-flex"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              {recentDonations.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Package
                    size={32}
                    className="mx-auto mb-3 text-[var(--text-secondary)]"
                  />

                  <p className="font-semibold text-[var(--text-primary)]">
                    No donations yet
                  </p>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Create your first donation to start helping reduce food
                    waste.
                  </p>

                  <Link
                    to="/donor/donations/create"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <Plus size={16} />
                    Create Donation
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {recentDonations.map((donation) => (
                    <Link
                      key={donation.id}
                      to={`/donor/donations/${donation.id}`}
                      className="flex flex-col gap-4 px-5 py-4 transition hover:bg-[var(--surface-muted)] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                          <UtensilsCrossed size={19} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-[var(--text-primary)]">
                            {donation.food_name}
                          </h3>

                          <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            {donation.quantity} {donation.unit} •{" "}
                            {donation.category}
                          </p>

                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            Prepared {formatDate(donation.preparation_datetime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <StatusBadge status={donation.status} />

                        <ArrowRight
                          size={17}
                          className="shrink-0 text-[var(--text-secondary)]"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Incoming requests */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Recent Requests
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Organizations requesting your donated food.
                </p>
              </div>

              <Link
                to="/donor/requests"
                className="hidden items-center gap-1 text-sm font-semibold text-[var(--primary)] sm:inline-flex"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              {recentRequests.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <ClipboardList
                    size={32}
                    className="mx-auto mb-3 text-[var(--text-secondary)]"
                  />

                  <p className="font-semibold text-[var(--text-primary)]">
                    No requests yet
                  </p>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Requests from organizations will appear here when they
                    request your donations.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {recentRequests.map((request) => {
                    const donation = donations.find(
                      (item) => item.id === request.donation_id,
                    );

                    return (
                      <Link
                        key={request.id}
                        to={`/donor/requests/${request.id}`}
                        className="flex flex-col gap-4 px-5 py-4 transition hover:bg-[var(--surface-muted)] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                            <ClipboardList size={19} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-[var(--text-primary)]">
                              {donation?.food_name || "Donation Request"}
                            </h3>

                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                              Requested quantity:{" "}
                              <span className="font-medium text-[var(--text-primary)]">
                                {request.requested_quantity}
                              </span>
                            </p>

                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                              Received {formatDate(request.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <StatusBadge status={request.status} />

                          <ArrowRight
                            size={17}
                            className="shrink-0 text-[var(--text-secondary)]"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Mobile view-all links */}
          <div className="mt-6 grid gap-3 sm:hidden">
            <Link
              to="/donor/donations"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)]"
            >
              View All Donations
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/donor/requests"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)]"
            >
              View All Requests
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DonorDashboard;