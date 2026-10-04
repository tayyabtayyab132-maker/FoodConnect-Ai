import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Clock3,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

function Requests() {
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const loadRequests = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [requestsResponse, donationsResponse] =
        await Promise.all([
          api.get("/requests"),
          api.get("/donations"),
        ]);

      setRequests(
        requestsResponse.data?.data || [],
      );

      setDonations(
        donationsResponse.data?.data || [],
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to load donation requests.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const donationMap = useMemo(() => {
    const map = {};

    donations.forEach((donation) => {
      map[donation.id] = donation;
    });

    return map;
  }, [donations]);

  const filteredRequests = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return requests.filter((request) => {
      const donation =
        donationMap[request.donation_id];

      const matchesStatus =
        statusFilter === "ALL" ||
        request.status === statusFilter;

      const matchesSearch =
        !search ||
        donation?.food_name
          ?.toLowerCase()
          .includes(search) ||
        donation?.category
          ?.toLowerCase()
          .includes(search) ||
        request.collection_time
          ?.toLowerCase()
          .includes(search) ||
        request.message
          ?.toLowerCase()
          .includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [
    requests,
    donations,
    donationMap,
    searchTerm,
    statusFilter,
  ]);

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING",
  ).length;

  const acceptedCount = requests.filter(
    (request) =>
      request.status === "ACCEPTED" ||
      request.status === "COLLECTION_CONFIRMED",
  ).length;

  const completedCount = requests.filter(
    (request) => request.status === "COMPLETED",
  ).length;

  const formatDateTime = (value) => {
    if (!value) {
      return "Not provided";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getDonationName = (request) => {
    return (
      donationMap[request.donation_id]?.food_name ||
      "Donation"
    );
  };

  const getDonationCategory = (request) => {
    return (
      donationMap[request.donation_id]?.category ||
      "Food donation"
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--primary)]">
                Donor workspace
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                Requests
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Review organizations requesting the food
                donations you have posted.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadRequests(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <p className="text-sm text-[var(--text-secondary)]">
                Total Requests
              </p>

              <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                {requests.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <p className="text-sm text-[var(--text-secondary)]">
                Pending
              </p>

              <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <p className="text-sm text-[var(--text-secondary)]">
                Accepted / In Collection
              </p>

              <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                {acceptedCount}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by food name, category, or message..."
                className="form-input pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="form-input lg:w-56"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="COLLECTION_CONFIRMED">
                Collection Confirmed
              </option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="font-semibold text-red-700 dark:text-red-400">
                  Unable to load requests
                </p>

                <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => loadRequests()}
                  className="mt-3 text-sm font-semibold text-red-700 underline dark:text-red-400"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Request list */}
          {loading ? (
            <Loading message="Loading donation requests..." />
          ) : filteredRequests.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-muted)]">
                <ClipboardList
                  size={28}
                  className="text-[var(--text-secondary)]"
                />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
                {requests.length === 0
                  ? "No requests yet"
                  : "No matching requests"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                {requests.length === 0
                  ? "When an organization requests one of your donations, the request will appear here."
                  : "Try changing your search or status filter."}
              </p>

              {(searchTerm ||
                statusFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-5 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {filteredRequests.map((request) => {
                const donation =
                  donationMap[request.donation_id];

                return (
                  <article
                    key={request.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                            <Package
                              size={21}
                              className="text-[var(--primary)]"
                            />
                          </div>

                          <div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                              {getDonationName(
                                request,
                              )}
                            </h2>

                            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                              {getDonationCategory(
                                request,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                              Requested Quantity
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                              {request.requested_quantity}{" "}
                              {donation?.unit ||
                                "units"}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <Clock3
                                size={15}
                                className="text-[var(--text-secondary)]"
                              />

                              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                                Collection
                              </p>
                            </div>

                            <p className="mt-1 text-sm text-[var(--text-primary)]">
                              {request.collection_time ||
                                "Not provided"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                              Submitted
                            </p>

                            <p className="mt-1 text-sm text-[var(--text-primary)]">
                              {formatDateTime(
                                request.created_at,
                              )}
                            </p>
                          </div>
                        </div>

                        {request.message && (
                          <div className="mt-5 rounded-xl bg-[var(--surface-muted)] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                              Organization Message
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[var(--text-primary)]">
                              {request.message}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                        <StatusBadge
                          status={request.status}
                        />

                        <Link
                          to={`/donor/requests/${request.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--primary)] hover:bg-[var(--surface-muted)] hover:text-[var(--primary)]"
                        >
                          View Details
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Completed count */}
          {!loading &&
            filteredRequests.length > 0 &&
            completedCount > 0 && (
              <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
                {completedCount} request
                {completedCount === 1 ? "" : "s"} completed
                successfully.
              </p>
            )}
        </div>
      </main>
    </div>
  );
}

export default Requests;