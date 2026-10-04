import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Clock3,
  Package,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import api from "../services/api";

function Requests() {
  const [requests, setRequests] = useState([]);
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

      const response = await api.get("/requests");

      setRequests(response.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to load your requests.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const getRequestStatusDescription = (status) => {
    switch (status) {
      case "PENDING":
        return "Waiting for the donor to review your request.";

      case "ACCEPTED":
        return "The donor accepted your request. Arrange collection.";

      case "COLLECTION_CONFIRMED":
        return "Collection has been confirmed.";

      case "COMPLETED":
        return "The donation has been successfully received.";

      case "REJECTED":
        return "The donor rejected this request.";

      case "CANCELLED":
        return "This request was cancelled.";

      default:
        return "Request status updated.";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--primary)]">
                Organization workspace
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                My Requests
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Track the food donations you have requested and
                follow each request through collection and receipt.
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

          {loading ? (
            <Loading message="Loading your requests..." />
          ) : requests.length === 0 ? (
            /* Empty State */
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                <Package
                  size={26}
                  className="text-[var(--primary)]"
                />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
                No requests yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                When you request available food donations, your
                requests will appear here.
              </p>

              <Link
                to="/organization/donations"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Browse Donations
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            /* Requests */
            <div className="mt-8 space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    {/* Request information */}
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                        <Package
                          size={21}
                          className="text-[var(--primary)]"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-[var(--text-primary)]">
                            Food Donation Request
                          </h2>

                          <StatusBadge
                            status={request.status}
                          />
                        </div>

                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          Requested quantity:{" "}
                          <span className="font-medium text-[var(--text-primary)]">
                            {request.requested_quantity}
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          Collection time:{" "}
                          <span className="font-medium text-[var(--text-primary)]">
                            {request.collection_time}
                          </span>
                        </p>

                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          Requested{" "}
                          {formatDate(request.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Link
                      to={`/organization/requests/${request.id}`}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--primary)] hover:bg-[var(--surface-muted)] hover:text-[var(--primary)]"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>

                  {/* Status description */}
                  <div className="mt-5 rounded-xl bg-[var(--surface-muted)] p-4">
                    <div className="flex items-start gap-2">
                      <Clock3
                        size={16}
                        className="mt-0.5 shrink-0 text-[var(--text-secondary)]"
                      />

                      <p className="text-sm leading-6 text-[var(--text-secondary)]">
                        {getRequestStatusDescription(
                          request.status,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  {request.message && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                        Your message
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[var(--text-primary)]">
                        {request.message}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Requests;