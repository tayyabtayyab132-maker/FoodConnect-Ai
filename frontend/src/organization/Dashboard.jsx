import {
  ArrowRight,
  ClipboardList,
  Package,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Clock3,
  CircleAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function OrganizationDashboard() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
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
      const [requestsResponse, donationsResponse] = await Promise.all([
        api.get("/requests"),
        api.get("/donations"),
      ]);

      const requestData = requestsResponse.data?.data || [];
      const donationData = donationsResponse.data?.data || [];

      setRequests(Array.isArray(requestData) ? requestData : []);
      setDonations(Array.isArray(donationData) ? donationData : []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load your dashboard. Please try again.",
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
    const pending = requests.filter(
      (request) => request.status === "PENDING",
    ).length;

    const accepted = requests.filter(
      (request) =>
        request.status === "ACCEPTED" ||
        request.status === "COLLECTION_CONFIRMED",
    ).length;

    const completed = requests.filter(
      (request) => request.status === "COMPLETED",
    ).length;

    const availableDonations = donations.filter(
      (donation) =>
        donation.status === "AVAILABLE" ||
        donation.status === "PARTIALLY_RESERVED",
    ).length;

    return {
      totalRequests: requests.length,
      pending,
      accepted,
      completed,
      availableDonations,
    };
  }, [requests, donations]);

  const recentRequests = useMemo(() => {
    return [...requests]
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [requests]);

  const getDonationName = (donationId) => {
    const donation = donations.find(
      (item) => item.id === donationId,
    );

    return donation?.food_name || "Food Donation";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar role="organization" />

        <main className="min-h-screen lg:ml-64">
          <div className="px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
            <Loading message="Loading your dashboard..." />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar role="organization" />

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                <Sparkles size={16} />
                Community impact workspace
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                Welcome back, {user?.name || "Organization"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Discover surplus food, manage your requests, and help turn
                available meals into meaningful community impact.
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
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <CircleAlert className="mt-0.5 shrink-0" size={18} />

              <div className="flex-1">
                <p className="font-semibold">Dashboard could not be loaded</p>
                <p className="mt-1">{error}</p>
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

          {/* Stats */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Requests"
              value={stats.totalRequests}
              description="All requests you've submitted"
              icon={ClipboardList}
              iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
            />

            <StatCard
              title="Pending"
              value={stats.pending}
              description="Waiting for donor response"
              icon={Clock3}
              iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
            />

            <StatCard
              title="In Progress"
              value={stats.accepted}
              description="Accepted or collection confirmed"
              icon={Package}
              iconClassName="bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
            />

            <StatCard
              title="Completed"
              value={stats.completed}
              description="Successfully received"
              icon={CheckCircle2}
              iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
            />
          </section>

          {/* Main content */}
          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
            {/* Recent requests */}
            <div className="surface overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Recent Requests
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Keep track of the latest donation requests.
                  </p>
                </div>

                <Link
                  to="/organization/requests"
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

                  <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
                    Browse available food donations and submit your first
                    request.
                  </p>

                  <Link
                    to="/organization/donations"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Browse Donations
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col gap-4 p-5 transition hover:bg-[var(--surface-muted)] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                            {getDonationName(request.donation_id)}
                          </h3>

                          <StatusBadge status={request.status} />
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                          <span>
                            Requested:{" "}
                            <strong className="font-semibold text-[var(--text-primary)]">
                              {request.requested_quantity}
                            </strong>
                          </span>

                          {request.collection_time && (
                            <span>
                              Collection: {request.collection_time}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        to={`/organization/requests/${request.id}`}
                        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Details
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Available donations */}
              <div className="surface p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Package size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                      Available Donations
                    </p>

                    <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">
                      {stats.availableDonations}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                      Food donations currently available for organizations.
                    </p>
                  </div>
                </div>

                <Link
                  to="/organization/donations"
                  className="mt-5 flex items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Browse available food
                  <ArrowRight size={17} />
                </Link>
              </div>

              {/* Impact message */}
              <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <Sparkles size={18} />

                  <h3 className="text-sm font-bold">
                    Make every meal count
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-6 text-emerald-800/80 dark:text-emerald-200/80">
                  Every successful collection helps redirect surplus food to
                  people and communities that can use it.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default OrganizationDashboard;