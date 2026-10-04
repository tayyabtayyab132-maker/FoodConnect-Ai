import {
  CalendarClock,
  ChevronRight,
  Filter,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Utensils,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import api from "../services/api";

function Donations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const loadDonations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get("/donations");

      const data = response.data?.data || [];

      setDonations(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load available donations.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set();

    donations.forEach((donation) => {
      if (donation.category) {
        uniqueCategories.add(donation.category);
      }
    });

    return ["ALL", ...Array.from(uniqueCategories).sort()];
  }, [donations]);

  const filteredDonations = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return donations.filter((donation) => {
      const statusAvailable =
        donation.status === "AVAILABLE" ||
        donation.status === "PARTIALLY_RESERVED";

      if (!statusAvailable) {
        return false;
      }

      const matchesCategory =
        category === "ALL" ||
        donation.category?.toLowerCase() === category.toLowerCase();

      if (!matchesCategory) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return [
        donation.food_name,
        donation.category,
        donation.description,
        donation.pickup_address,
        donation.dietary_information,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(searchValue),
        );
    });
  }, [donations, search, category]);

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

    return date.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar role="organization" />

        <main className="min-h-screen lg:ml-64">
          <div className="px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
            <Loading message="Loading available donations..." />
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
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600">
                Food marketplace
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Available Donations
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Browse surplus food shared by donors and request what your
                organization can collect and distribute.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadDonations(true)}
              disabled={refreshing}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <p className="font-semibold">
                Unable to load donations
              </p>

              <p className="mt-1">{error}</p>

              <button
                type="button"
                onClick={() => loadDonations(true)}
                className="mt-3 font-semibold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="surface mt-7 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search food, category, location..."
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter
                  size={17}
                  className="shrink-0 text-[var(--text-secondary)]"
                />

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-11 min-w-44 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item === "ALL" ? "All categories" : item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mt-7">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">
                  {filteredDonations.length}
                </span>{" "}
                donation
                {filteredDonations.length === 1 ? "" : "s"} available
              </p>
            </div>

            {filteredDonations.length === 0 ? (
              <div className="surface p-10 text-center sm:p-14">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                  <Package size={24} />
                </div>

                <h2 className="mt-5 text-lg font-bold text-[var(--text-primary)]">
                  No donations found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                  There are currently no donations matching your search or
                  category filter.
                </p>

                {(search || category !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setCategory("ALL");
                    }}
                    className="mt-5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredDonations.map((donation) => {
                  const remaining = getRemainingQuantity(donation);

                  return (
                    <article
                      key={donation.id}
                      className="surface flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {/* Card header */}
                      <div className="border-b border-[var(--border)] p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <Utensils size={20} />
                            </div>

                            <div className="min-w-0">
                              <h2 className="truncate text-base font-bold text-[var(--text-primary)]">
                                {donation.food_name}
                              </h2>

                              <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                                {donation.category || "Food donation"}
                              </p>
                            </div>
                          </div>

                          <StatusBadge status={donation.status} />
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                              Available
                            </p>

                            <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                              {remaining}
                            </p>

                            <p className="text-xs text-[var(--text-secondary)]">
                              {donation.unit || "units"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                              Total
                            </p>

                            <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                              {donation.quantity}
                            </p>

                            <p className="text-xs text-[var(--text-secondary)]">
                              {donation.unit || "units"}
                            </p>
                          </div>
                        </div>

                        {donation.description && (
                          <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">
                            {donation.description}
                          </p>
                        )}

                        <div className="mt-5 space-y-3">
                          <div className="flex items-start gap-2.5">
                            <CalendarClock
                              size={16}
                              className="mt-0.5 shrink-0 text-[var(--text-muted)]"
                            />

                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[var(--text-muted)]">
                                Safe-consumption deadline
                              </p>

                              <p className="mt-0.5 text-sm text-[var(--text-primary)]">
                                {formatDate(
                                  donation.safe_consumption_deadline,
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <MapPin
                              size={16}
                              className="mt-0.5 shrink-0 text-[var(--text-muted)]"
                            />

                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[var(--text-muted)]">
                                Pickup location
                              </p>

                              <p className="mt-0.5 line-clamp-2 text-sm text-[var(--text-primary)]">
                                {donation.pickup_address || "Not provided"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {donation.dietary_information && (
                          <div className="mt-4 rounded-xl border border-[var(--border)] p-3">
                            <p className="text-xs font-semibold text-[var(--text-primary)]">
                              Dietary information
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                              {donation.dietary_information}
                            </p>
                          </div>
                        )}

                        <div className="mt-auto pt-5">
                          <Link
                            to={`/organization/donations/${donation.id}`}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                          >
                            View Donation
                            <ChevronRight size={17} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Donations;