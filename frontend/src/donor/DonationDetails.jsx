import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  ShieldAlert,
  Thermometer,
  UtensilsCrossed,
  ClipboardList,
  XCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import api from "../services/api";

function DonationDetails() {
  const { donationId } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadDonation = async (showFullLoader = true) => {
    if (showFullLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");
    setActionError("");

    try {
      const [donationResponse, requestsResponse] = await Promise.all([
        api.get(`/donations/${donationId}`),
        api.get("/requests"),
      ]);

      const donationData = donationResponse.data?.data;

      if (!donationData) {
        throw new Error("Donation information could not be loaded.");
      }

      setDonation(donationData);

      const allRequests = requestsResponse.data?.data || [];

      setRequests(
        allRequests.filter(
          (request) => request.donation_id === donationId,
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.message ||
          "Unable to load donation details.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDonation();
  }, [donationId]);

  const remainingQuantity = useMemo(() => {
    if (!donation) {
      return 0;
    }

    return Math.max(
      0,
      Number(donation.quantity || 0) -
        Number(donation.reserved_quantity || 0),
    );
  }, [donation]);

  const canCancel = ["AVAILABLE", "PARTIALLY_RESERVED"].includes(
    donation?.status,
  );

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this donation? Pending requests may no longer be fulfilled.",
    );

    if (!confirmed) {
      return;
    }

    setCancelling(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const response = await api.patch(
        `/donations/${donationId}/cancel`,
      );

      setDonation(response.data?.data || donation);

      setSuccessMessage(
        "Donation cancelled successfully.",
      );

      await loadDonation(false);
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.detail ||
          requestError.message ||
          "Unable to cancel this donation.",
      );
    } finally {
      setCancelling(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getRequestStatusMessage = (status) => {
    switch (status) {
      case "PENDING":
        return "Waiting for your decision.";

      case "ACCEPTED":
        return "You accepted this request.";

      case "REJECTED":
        return "You rejected this request.";

      case "CANCELLED":
        return "The organization cancelled this request.";

      case "COLLECTION_CONFIRMED":
        return "Collection has been confirmed.";

      case "COMPLETED":
        return "This donation request has been completed.";

      default:
        return "Request status updated.";
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />

        <main className="lg:ml-64">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <Package
                size={38}
                className="mx-auto mb-4 text-[var(--text-secondary)]"
              />

              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Donation not found
              </h1>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                This donation may have been removed or is no longer
                available.
              </p>

              <button
                type="button"
                onClick={() => navigate("/donor/donations")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <ArrowLeft size={16} />
                Back to My Donations
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => navigate("/donor/donations")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
            >
              <ArrowLeft size={16} />
              Back to My Donations
            </button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                    {donation.food_name}
                  </h1>

                  <StatusBadge status={donation.status} />
                </div>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Donation details and incoming organization requests.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadDonation(false)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Action messages */}
          {actionError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {actionError}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 size={17} />
              {successMessage}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            {/* Main information */}
            <div className="space-y-6">
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                    <UtensilsCrossed size={19} />
                  </div>

                  <div>
                    <h2 className="font-bold text-[var(--text-primary)]">
                      Food Information
                    </h2>

                    <p className="text-xs text-[var(--text-secondary)]">
                      Information provided by you
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Food Name"
                    value={donation.food_name}
                  />

                  <InfoItem
                    label="Category"
                    value={donation.category}
                  />

                  <InfoItem
                    label="Total Quantity"
                    value={`${donation.quantity} ${donation.unit}`}
                  />

                  <InfoItem
                    label="Reserved Quantity"
                    value={`${donation.reserved_quantity || 0} ${
                      donation.unit
                    }`}
                  />

                  <InfoItem
                    label="Remaining Quantity"
                    value={`${remainingQuantity} ${donation.unit}`}
                    highlight
                  />

                  <InfoItem
                    label="Preparation"
                    value={formatDateTime(
                      donation.preparation_datetime,
                    )}
                  />

                  <InfoItem
                    label="Safe Consumption Deadline"
                    value={formatDateTime(
                      donation.safe_consumption_deadline,
                    )}
                  />

                  <InfoItem
                    label="Dietary Information"
                    value={
                      donation.dietary_information || "Not provided"
                    }
                  />
                </div>

                {donation.description && (
                  <div className="mt-5 border-t border-[var(--border)] pt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      Description
                    </p>

                    <p className="text-sm leading-6 text-[var(--text-primary)]">
                      {donation.description}
                    </p>
                  </div>
                )}
              </section>

              {/* Pickup and storage */}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h2 className="font-bold text-[var(--text-primary)]">
                      Pickup & Storage
                    </h2>

                    <p className="text-xs text-[var(--text-secondary)]">
                      Collection information
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <InfoItem
                    label="Pickup Address"
                    value={donation.pickup_address}
                  />

                  <InfoItem
                    label="Storage Instructions"
                    value={
                      donation.storage_instructions ||
                      "No storage instructions provided."
                    }
                  />
                </div>
              </section>

              {/* Food safety notice */}
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20 sm:p-6">
                <div className="flex gap-3">
                  <ShieldAlert
                    size={21}
                    className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                  />

                  <div>
                    <h2 className="font-semibold text-amber-800 dark:text-amber-300">
                      Food Safety Reminder
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-amber-700 dark:text-amber-400">
                      The platform does not certify that food is safe to
                      consume. Food safety information shown here comes from
                      the donor-provided information. Organizations should
                      independently follow applicable food safety practices
                      before accepting or distributing food.
                    </p>
                  </div>
                </div>
              </section>

              {/* Incoming requests */}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                <div className="border-b border-[var(--border)] p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-bold text-[var(--text-primary)]">
                        Incoming Requests
                      </h2>

                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        Organizations requesting this donation.
                      </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                      {requests.length}{" "}
                      {requests.length === 1 ? "request" : "requests"}
                    </span>
                  </div>
                </div>

                {requests.length === 0 ? (
                  <div className="px-5 py-10 text-center sm:px-6">
                    <ClipboardEmpty />

                    <p className="mt-3 font-semibold text-[var(--text-primary)]">
                      No requests yet
                    </p>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Organization requests for this donation will appear
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="p-5 sm:p-6"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge status={request.status} />

                              <span className="text-xs text-[var(--text-secondary)]">
                                {formatDateTime(request.created_at)}
                              </span>
                            </div>

                            <h3 className="mt-3 font-semibold text-[var(--text-primary)]">
                              Organization request
                            </h3>

                            <div className="mt-2 grid gap-2 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
                              <p>
                                Requested:{" "}
                                <span className="font-semibold text-[var(--text-primary)]">
                                  {request.requested_quantity}{" "}
                                  {donation.unit}
                                </span>
                              </p>

                              <p>
                                Collection:{" "}
                                <span className="font-semibold text-[var(--text-primary)]">
                                  {request.collection_time || "Not specified"}
                                </span>
                              </p>
                            </div>

                            <p className="mt-3 text-sm text-[var(--text-secondary)]">
                              {getRequestStatusMessage(request.status)}
                            </p>

                            {request.message && (
                              <div className="mt-3 rounded-xl bg-[var(--surface-muted)] p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                                  Organization Message
                                </p>

                                <p className="mt-1 text-sm leading-5 text-[var(--text-primary)]">
                                  {request.message}
                                </p>
                              </div>
                            )}
                          </div>

                          <Link
                            to={`/donor/requests/${request.id}`}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                          >
                            View Request
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar information */}
            <aside className="space-y-6">
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                <h2 className="font-bold text-[var(--text-primary)]">
                  Donation Status
                </h2>

                <div className="mt-5 flex items-center gap-3">
                  <StatusBadge status={donation.status} />

                  <span className="text-sm text-[var(--text-secondary)]">
                    {remainingQuantity} {donation.unit} remaining
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <StatusRow
                    icon={Package}
                    label="Total"
                    value={`${donation.quantity} ${donation.unit}`}
                  />

                  <StatusRow
                    icon={CheckCircle2}
                    label="Reserved"
                    value={`${donation.reserved_quantity || 0} ${
                      donation.unit
                    }`}
                  />

                  <StatusRow
                    icon={Clock3}
                    label="Remaining"
                    value={`${remainingQuantity} ${donation.unit}`}
                  />

                  <StatusRow
                    icon={CalendarDays}
                    label="Deadline"
                    value={formatDateTime(
                      donation.safe_consumption_deadline,
                    )}
                  />
                </div>
              </section>

              {/* Actions */}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                <h2 className="font-bold text-[var(--text-primary)]">
                  Actions
                </h2>

                <div className="mt-4 space-y-3">
                  <Link
                    to="/donor/donations/create"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <UtensilsCrossed size={17} />
                    Create Another Donation
                  </Link>

                  <Link
                    to="/donor/requests"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    <ArrowRight size={17} />
                    View All Requests
                  </Link>

                  {canCancel && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                    >
                      <XCircle size={17} />

                      {cancelling
                        ? "Cancelling..."
                        : "Cancel Donation"}
                    </button>
                  )}
                </div>
              </section>

              {/* Deadline reminder */}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:p-6">
                <div className="flex gap-3">
                  <Thermometer
                    size={20}
                    className="mt-0.5 shrink-0 text-[var(--primary)]"
                  />

                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      Keep information current
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
                      Make sure pickup, storage, quantity, and deadline
                      information accurately reflects the food being offered.
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value, highlight = false }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </p>

      <p
        className={`mt-1.5 text-sm leading-5 ${
          highlight
            ? "font-bold text-[var(--primary)]"
            : "font-medium text-[var(--text-primary)]"
        }`}
      >
        {value || "Not provided"}
      </p>
    </div>
  );
}

function StatusRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        size={17}
        className="mt-0.5 shrink-0 text-[var(--text-secondary)]"
      />

      <div className="min-w-0">
        <p className="text-xs text-[var(--text-secondary)]">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function ClipboardEmpty() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-secondary)]">
      <ClipboardListIcon />
    </div>
  );
}

function ClipboardListIcon() {
  return <ClipboardList size={24} />;
}

export default DonationDetails;