import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CircleAlert,
  Clock3,
  Filter,
  Package,
  RefreshCw,
  Search,
  UtensilsCrossed,
  X,
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

function getDonorName(donation, users) {
  if (donation.donor_name) {
    return donation.donor_name;
  }

  const donor = users.find(
    (user) =>
      user.id === donation.donor_id ||
      user.user_id === donation.donor_id,
  );

  return donor?.name || donor?.email || "Unknown donor";
}

function isExpired(donation) {
  if (!donation.expiry_time) {
    return false;
  }

  const expiry = new Date(donation.expiry_time);

  if (Number.isNaN(expiry.getTime())) {
    return false;
  }

  return expiry.getTime() < Date.now();
}

function getRemainingQuantity(donation) {
  if (
    donation.remaining_quantity !== undefined &&
    donation.remaining_quantity !== null
  ) {
    return donation.remaining_quantity;
  }

  return donation.quantity ?? 0;
}

function getQuantityText(donation) {
  const quantity = getRemainingQuantity(donation);
  const unit = donation.unit ? ` ${donation.unit}` : "";

  return `${quantity}${unit}`;
}

function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [cancelDonation, setCancelDonation] = useState(null);
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

      const [
        donationsResponse,
        usersResponse,
      ] = await Promise.all([
        api.get("/admin/donations"),
        api.get("/admin/users"),
      ]);

      const donationData = extractList(
        donationsResponse,
      );

      const userData = extractList(
        usersResponse,
      );

      setDonations(donationData);
      setUsers(userData);

      console.log(
        "Admin donations loaded:",
        donationData,
      );
    } catch (err) {
      console.error(
        "Failed to load admin donations:",
        err,
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load donations. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCancelModal = (donation) => {
    setCancelDonation(donation);
    setCancelReason("");
    setCancelError("");
  };

  const closeCancelModal = () => {
    if (cancelLoading) {
      return;
    }

    setCancelDonation(null);
    setCancelReason("");
    setCancelError("");
  };

  const handleCancelDonation = async () => {
    const reason = cancelReason.trim();

    if (!reason) {
      setCancelError(
        "Please enter a reason for cancelling this donation.",
      );
      return;
    }

    if (!cancelDonation?.id) {
      setCancelError(
        "The selected donation could not be identified.",
      );
      return;
    }

    try {
      setCancelLoading(true);
      setCancelError("");
      setError("");

      await api.patch(
        `/admin/donations/${cancelDonation.id}/cancel`,
        null,
        {
          params: {
            reason,
          },
        },
      );

      setDonations((currentDonations) =>
        currentDonations.map((donation) =>
          donation.id === cancelDonation.id
            ? {
                ...donation,
                status: "CANCELLED",
              }
            : donation,
        ),
      );

      setCancelDonation(null);
      setCancelReason("");
      setCancelError("");
    } catch (err) {
      console.error(
        "Failed to cancel donation:",
        err,
      );

      setCancelError(
        err.response?.data?.detail ||
          "Unable to cancel this donation. Please try again.",
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredDonations = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return donations.filter((donation) => {
      const donorName = getDonorName(
        donation,
        users,
      );

      const matchesSearch =
        !normalizedSearch ||
        donation.food_name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        donation.food_category
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        donation.description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        donation.pickup_address
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        donation.donor_id
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        donorName
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        donation.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    donations,
    users,
    search,
    statusFilter,
  ]);

  const statistics = useMemo(() => {
    const active = donations.filter(
      (donation) =>
        [
          "AVAILABLE",
          "PARTIALLY_RESERVED",
          "RESERVED",
        ].includes(donation.status),
    ).length;

    const completed = donations.filter(
      (donation) =>
        donation.status === "COMPLETED",
    ).length;

    const expired = donations.filter(
      (donation) =>
        donation.status === "EXPIRED" ||
        isExpired(donation),
    ).length;

    const totalQuantity =
      donations.reduce(
        (sum, donation) =>
          sum +
          Number(
            donation.quantity || 0,
          ),
        0,
      );

    return {
      total: donations.length,
      active,
      completed,
      expired,
      totalQuantity,
    };
  }, [donations]);

  const statusOptions = [
    "ALL",
    "AVAILABLE",
    "PARTIALLY_RESERVED",
    "RESERVED",
    "COMPLETED",
    "CANCELLED",
    "EXPIRED",
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Package size={24} />
              </div>

              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Administration
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                  Donations
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
                  Monitor food donations, quantities,
                  expiry information, and donation
                  statuses across the platform.
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                  Unable to load donations
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
                  title="Total Donations"
                  value={statistics.total}
                  description="All donations recorded"
                  icon={Package}
                  iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                />

                <StatCard
                  title="Active Donations"
                  value={statistics.active}
                  description="Available or reserved"
                  icon={UtensilsCrossed}
                  iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                />

                <StatCard
                  title="Completed"
                  value={statistics.completed}
                  description="Successfully completed"
                  icon={CalendarClock}
                  iconClassName="bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
                />

                <StatCard
                  title="Expired"
                  value={statistics.expired}
                  description="Expired or past expiry"
                  icon={Clock3}
                  iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                />
              </div>

              <div className="surface overflow-hidden">
                <div className="border-b border-[var(--border)] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        All Donations
                      </h2>

                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {filteredDonations.length} of{" "}
                        {donations.length} donations shown
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
                          placeholder="Search donations..."
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                          className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-9 text-sm text-[var(--text-primary)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 sm:w-52"
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

                {filteredDonations.length === 0 ? (
                  <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-[var(--text-muted)]">
                      <Package size={26} />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                      No donations found
                    </h3>

                    <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
                      {search ||
                      statusFilter !== "ALL"
                        ? "Try changing your search or status filter."
                        : "There are no donations recorded yet."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-x-auto lg:block">
                      <table className="w-full min-w-[1180px]">
                        <thead>
                          <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Food
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
                              Expiry
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
                          {filteredDonations.map(
                            (donation) => {
                              const expired =
                                donation.status !==
                                  "COMPLETED" &&
                                donation.status !==
                                  "CANCELLED" &&
                                isExpired(
                                  donation,
                                );

                              const canCancel =
                                [
                                  "AVAILABLE",
                                  "PARTIALLY_RESERVED",
                                  "RESERVED",
                                ].includes(
                                  donation.status,
                                );

                              return (
                                <tr
                                  key={donation.id}
                                  className="transition hover:bg-[var(--surface-muted)]"
                                >
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                        <UtensilsCrossed size={18} />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="truncate font-semibold text-[var(--text-primary)]">
                                          {donation.food_name ||
                                            "Unnamed food"}
                                        </p>

                                        <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                                          {donation.food_category ||
                                            "Uncategorized"}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-5 py-4">
                                    <p className="max-w-48 truncate text-sm font-medium text-[var(--text-primary)]">
                                      {getDonorName(
                                        donation,
                                        users,
                                      )}
                                    </p>

                                    <p className="mt-0.5 max-w-48 truncate text-xs text-[var(--text-muted)]">
                                      {donation.donor_id ||
                                        "No donor ID"}
                                    </p>
                                  </td>

                                  <td className="px-5 py-4">
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                                      {getQuantityText(
                                        donation,
                                      )}
                                    </p>

                                    {donation.remaining_quantity !==
                                      undefined &&
                                      donation.quantity !==
                                        undefined && (
                                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                          of{" "}
                                          {
                                            donation.quantity
                                          }
                                          {donation.unit
                                            ? ` ${donation.unit}`
                                            : ""}
                                        </p>
                                      )}
                                  </td>

                                  <td className="px-5 py-4">
                                    <p className="text-sm text-[var(--text-primary)]">
                                      {formatDate(
                                        donation.created_at,
                                      )}
                                    </p>

                                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                      {formatDateTime(
                                        donation.created_at,
                                      )}
                                    </p>
                                  </td>

                                  <td className="px-5 py-4">
                                    <p
                                      className={`text-sm font-medium ${
                                        expired
                                          ? "text-red-600 dark:text-red-400"
                                          : "text-[var(--text-primary)]"
                                      }`}
                                    >
                                      {formatDate(
                                        donation.expiry_time,
                                      )}
                                    </p>

                                    {expired && (
                                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                                        Expired
                                      </p>
                                    )}
                                  </td>

                                  <td className="px-5 py-4">
                                    <StatusBadge
                                      status={
                                        donation.status
                                      }
                                    />
                                  </td>

                                  <td className="px-5 py-4 text-right">
                                    {canCancel ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openCancelModal(
                                            donation,
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
                      {filteredDonations.map(
                        (donation) => {
                          const expired =
                            donation.status !==
                              "COMPLETED" &&
                            donation.status !==
                              "CANCELLED" &&
                            isExpired(
                              donation,
                            );

                          const canCancel =
                            [
                              "AVAILABLE",
                              "PARTIALLY_RESERVED",
                              "RESERVED",
                            ].includes(
                              donation.status,
                            );

                          return (
                            <div
                              key={donation.id}
                              className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    <UtensilsCrossed size={18} />
                                  </div>

                                  <div className="min-w-0">
                                    <h3 className="truncate font-semibold text-[var(--text-primary)]">
                                      {donation.food_name ||
                                        "Unnamed food"}
                                    </h3>

                                    <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                                      {donation.food_category ||
                                        "Uncategorized"}
                                    </p>
                                  </div>
                                </div>

                                <StatusBadge
                                  status={
                                    donation.status
                                  }
                                />
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                                  <p className="text-xs font-medium text-[var(--text-muted)]">
                                    Donor
                                  </p>

                                  <p className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">
                                    {getDonorName(
                                      donation,
                                      users,
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                                  <p className="text-xs font-medium text-[var(--text-muted)]">
                                    Quantity
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                    {getQuantityText(
                                      donation,
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                                  <p className="text-xs font-medium text-[var(--text-muted)]">
                                    Created
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                    {formatDate(
                                      donation.created_at,
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                                  <p className="text-xs font-medium text-[var(--text-muted)]">
                                    Expiry
                                  </p>

                                  <p
                                    className={`mt-1 text-sm font-semibold ${
                                      expired
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-[var(--text-primary)]"
                                    }`}
                                  >
                                    {formatDate(
                                      donation.expiry_time,
                                    )}
                                  </p>
                                </div>
                              </div>

                              {donation.pickup_address && (
                                <div className="mt-3 border-t border-[var(--border)] pt-3">
                                  <p className="text-xs font-medium text-[var(--text-muted)]">
                                    Pickup address
                                  </p>

                                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                    {
                                      donation.pickup_address
                                    }
                                  </p>
                                </div>
                              )}

                              <div className="mt-3 border-t border-[var(--border)] pt-3">
                                <p className="text-xs text-[var(--text-muted)]">
                                  Donation ID
                                </p>

                                <p className="mt-1 break-all font-mono text-xs text-[var(--text-secondary)]">
                                  {donation.id}
                                </p>
                              </div>

                              {canCancel && (
                                <div className="mt-4 border-t border-[var(--border)] pt-4">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openCancelModal(
                                        donation,
                                      )
                                    }
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                                  >
                                    <X size={17} />
                                    Cancel Donation
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

              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/20">
                <div className="flex items-start gap-3">
                  <CircleAlert
                    size={19}
                    className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
                  />

                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                      Donation monitoring
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-blue-800 dark:text-blue-300">
                      This page provides administrative
                      visibility into donation records and
                      workflow statuses. Food safety should
                      always be verified according to the
                      platform's safety guidance and applicable
                      requirements.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {cancelDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Cancel Donation
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  This action will mark the donation as
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <UtensilsCrossed size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--text-primary)]">
                      {cancelDonation.food_name ||
                        "Unnamed food"}
                    </p>

                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      Donor:{" "}
                      {getDonorName(
                        cancelDonation,
                        users,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="cancel-reason"
                  className="text-sm font-semibold text-[var(--text-primary)]"
                >
                  Cancellation reason
                </label>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Please provide a reason. This will be
                  recorded in the administrative action.
                </p>

                <textarea
                  id="cancel-reason"
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
                  placeholder="Enter the reason for cancelling this donation..."
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
                  Keep Donation
                </button>

                <button
                  type="button"
                  onClick={handleCancelDonation}
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
                      Cancel Donation
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

export default AdminDonations;