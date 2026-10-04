import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  RefreshCw,
  Search,
  Utensils,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

function getRequestDonationId(request) {
  return (
    request?.donation_id ||
    request?.donationId ||
    request?.donation?.id ||
    request?.donation?.donation_id ||
    null
  );
}

function getFoodName(request) {
  return (
    request?.food_name ||
    request?.foodName ||
    request?.donation?.food_name ||
    request?.donation?.foodName ||
    request?.donation?.name ||
    "Food donation"
  );
}

function getFoodCategory(request) {
  return (
    request?.food_category ||
    request?.foodCategory ||
    request?.category ||
    request?.donation?.food_category ||
    request?.donation?.foodCategory ||
    request?.donation?.category ||
    "Food"
  );
}

function getRequestedQuantity(request) {
  const quantity =
    request?.requested_quantity ??
    request?.requestedQuantity ??
    request?.quantity ??
    request?.donation?.requested_quantity ??
    0;

  const parsed = Number(quantity);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getUnit(request) {
  return (
    request?.unit ||
    request?.quantity_unit ||
    request?.donation?.unit ||
    "units"
  );
}

function getCompletedDate(request) {
  return (
    request?.completed_at ||
    request?.completedAt ||
    request?.collection_confirmed_at ||
    request?.collectionConfirmedAt ||
    request?.updated_at ||
    request?.updatedAt ||
    null
  );
}

function getPickupAddress(request) {
  return (
    request?.pickup_address ||
    request?.pickupAddress ||
    request?.donation?.pickup_address ||
    request?.donation?.pickupAddress ||
    request?.donation?.address ||
    "Pickup address not available"
  );
}

function formatDate(value) {
  if (!value) {
    return "Date not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeRequests(response) {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.requests)) {
    return response.data.requests;
  }

  if (Array.isArray(response?.requests)) {
    return response.requests;
  }

  return [];
}

function normalizeDonations(response) {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.donations)) {
    return response.data.donations;
  }

  if (Array.isArray(response?.donations)) {
    return response.donations;
  }

  return [];
}

function Completed() {
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadCompletedData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [requestsResponse, donationsResponse] = await Promise.all([
        api.get("/requests"),
        api.get("/donations"),
      ]);

      const allRequests = normalizeRequests(requestsResponse);
      const allDonations = normalizeDonations(donationsResponse);

      const completedRequests = allRequests.filter(
        (request) =>
          String(request?.status || "").toUpperCase() === "COMPLETED",
      );

      setRequests(completedRequests);
      setDonations(allDonations);
    } catch (err) {
      console.error("Failed to load completed requests:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load completed collections right now.";

      setError(message);
      setRequests([]);
      setDonations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCompletedData();
  }, [loadCompletedData]);

  const completedRecords = useMemo(() => {
    return requests.map((request) => {
      const donationId = getRequestDonationId(request);

      const donation =
        allDonationsFind(donations, donationId) || request?.donation || null;

      return {
        ...request,
        donation,
        donationId,
      };
    });
  }, [requests, donations]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return completedRecords;
    }

    return completedRecords.filter((record) => {
      const values = [
        getFoodName(record),
        getFoodCategory(record),
        getPickupAddress(record),
        record?.id,
        record?.request_id,
        record?.requestId,
        record?.donationId,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [completedRecords, search]);

  const totalRequestedQuantity = useMemo(() => {
    return completedRecords.reduce(
      (total, request) => total + getRequestedQuantity(request),
      0,
    );
  }, [completedRecords]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />

        <main className="min-h-screen lg:ml-64">
          <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
            <Loading />
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
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <ClipboardCheck size={22} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                    Completed
                  </h1>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    View donation requests that have successfully completed
                    their collection workflow.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadCompletedData(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Completed Requests
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    {completedRecords.length}
                  </p>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Successfully completed collections
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]">
                  <CheckCircle2 size={21} />
                </div>
              </div>
            </div>

            <div className="surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Food Received
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    {totalRequestedQuantity}
                  </p>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Total requested quantity
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <PackageCheck size={21} />
                </div>
              </div>
            </div>
          </div>

          {/* Completed collections */}
          <section className="surface overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Completed Collections
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {filteredRecords.length} completed{" "}
                    {filteredRecords.length === 1 ? "record" : "records"}
                  </p>
                </div>

                {completedRecords.length > 0 && (
                  <div className="relative w-full lg:w-80">
                    <Search
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search completed collections..."
                      className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                    />
                  </div>
                )}
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              search ? (
                <div className="px-5 py-14 sm:px-6">
                  <EmptyState
                    icon={Search}
                    title="No matching collections"
                    description="Try changing your search term to find a completed collection."
                  />
                </div>
              ) : (
                <div className="px-5 py-14 sm:px-6">
                  <EmptyState
                    icon={Utensils}
                    title="No completed collections"
                    description="Completed donation requests will appear here after the collection workflow is successfully completed."
                  />
                </div>
              )
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {filteredRecords.map((request) => (
                  <CompletedCollectionCard
                    key={
                      request?.id ||
                      request?.request_id ||
                      request?.requestId
                    }
                    request={request}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function allDonationsFind(donations, donationId) {
  if (!donationId) {
    return null;
  }

  return (
    donations.find(
      (donation) =>
        String(donation?.id || donation?.donation_id) ===
        String(donationId),
    ) || null
  );
}

function CompletedCollectionCard({ request }) {
  const foodName = getFoodName(request);
  const category = getFoodCategory(request);
  const quantity = getRequestedQuantity(request);
  const unit = getUnit(request);
  const completedDate = getCompletedDate(request);
  const pickupAddress = getPickupAddress(request);

  return (
    <article className="px-5 py-5 transition-colors hover:bg-[var(--surface-hover)] sm:px-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]">
              <Utensils size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold text-[var(--text-primary)]">
                  {foodName}
                </h3>

                <StatusBadge status="COMPLETED" />
              </div>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {category}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem label="Quantity">
              {quantity} {unit}
            </InfoItem>

            <InfoItem label="Completed">
              {formatDate(completedDate)}
            </InfoItem>

            <InfoItem label="Pickup">
              {pickupAddress}
            </InfoItem>

            <InfoItem label="Request ID">
              {request?.id ||
                request?.request_id ||
                request?.requestId ||
                "—"}
            </InfoItem>
          </div>
        </div>
      </div>
    </article>
  );
}

function InfoItem({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-[var(--text-primary)]">
        {children}
      </p>
    </div>
  );
}

export default Completed;