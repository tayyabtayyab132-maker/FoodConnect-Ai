import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarClock,
  ChevronRight,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

function Donations() {
  const [donations, setDonations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDonations = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/donations");

      setDonations(response.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to load your donations.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const filteredDonations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return donations.filter((donation) => {
      const matchesSearch =
        !normalizedSearch ||
        donation.food_name?.toLowerCase().includes(normalizedSearch) ||
        donation.category?.toLowerCase().includes(normalizedSearch) ||
        donation.pickup_address?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        donation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [donations, searchTerm, statusFilter]);

  const getRemainingQuantity = (donation) => {
    const quantity = Number(donation.quantity || 0);
    const reserved = Number(donation.reserved_quantity || 0);

    return Math.max(quantity - reserved, 0);
  };

  const formatDate = (value) => {
    if (!value) {
      return "Not provided";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
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
                Donor workspace
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                My Donations
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Manage the surplus food you have shared with community
                organizations.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadDonations(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />

                Refresh
              </button>

              <Link
                to="/donor/donations/create"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Plus size={17} />

                Create Donation
              </Link>
            </div>
          </div>

          {/* Search and filters */}
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search donations..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--primary)]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
              >
                <option value="ALL">All statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="PARTIALLY_RESERVED">
                  Partially Reserved
                </option>
                <option value="RESERVED">Reserved</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
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
                  Unable to load donations
                </p>

                <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => loadDonations()}
                  className="mt-3 text-sm font-semibold text-red-700 underline dark:text-red-400"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && <Loading message="Loading your donations..." />}

          {/* Content */}
          {!loading && !error && (
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Donations
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {filteredDonations.length} donation
                    {filteredDonations.length === 1 ? "" : "s"} found
                  </p>
                </div>
              </div>

              {filteredDonations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-muted)]">
                    <Package
                      size={26}
                      className="text-[var(--text-secondary)]"
                    />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
                    No donations found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                    {donations.length === 0
                      ? "You have not created any food donations yet. Create your first donation to make surplus food available to organizations."
                      : "No donations match your current search or status filter."}
                  </p>

                  {donations.length === 0 && (
                    <Link
                      to="/donor/donations/create"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      <Plus size={17} />
                      Create Donation
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredDonations.map((donation) => {
                    const remaining = getRemainingQuantity(donation);

                    return (
                      <Link
                        key={donation.id}
                        to={`/donor/donations/${donation.id}`}
                        className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-lg font-semibold text-[var(--text-primary)]">
                                {donation.food_name}
                              </h3>

                              <StatusBadge
                                status={donation.status}
                              />
                            </div>

                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                              {donation.category}
                            </p>
                          </div>

                          <ChevronRight
                            size={20}
                            className="shrink-0 text-[var(--text-secondary)] transition group-hover:translate-x-1 group-hover:text-[var(--primary)]"
                          />
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                              Quantity
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                              {donation.quantity}{" "}
                              {donation.unit}
                            </p>

                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                              {remaining} {donation.unit} remaining
                            </p>
                          </div>

                          <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                              <CalendarClock size={15} />

                              <p className="text-xs font-medium uppercase tracking-wide">
                                Safe until
                              </p>
                            </div>

                            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                              {formatDate(
                                donation.safe_consumption_deadline,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <MapPin
                            size={17}
                            className="mt-0.5 shrink-0"
                          />

                          <span className="line-clamp-2">
                            {donation.pickup_address ||
                              "Pickup address not provided"}
                          </span>
                        </div>

                        {donation.dietary_information && (
                          <div className="mt-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                              Dietary information
                            </p>

                            <p className="mt-1 line-clamp-2 text-sm text-[var(--text-primary)]">
                              {donation.dietary_information}
                            </p>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Donations;