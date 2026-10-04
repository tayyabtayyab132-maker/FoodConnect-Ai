import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageSquare,
  Package,
  RefreshCw,
  UserRound,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import api from "../services/api";

function RequestDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [donation, setDonation] = useState(null);
  const [organization, setOrganization] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadRequest = async () => {
    setLoading(true);
    setError("");

    try {
      const requestResponse = await api.get(
        `/requests/${requestId}`,
      );

      const requestData = requestResponse.data?.data;

      if (!requestData) {
        throw new Error("Request information was not returned.");
      }

      setRequest(requestData);

      // Load related donation.
      try {
        const donationResponse = await api.get(
          `/donations/${requestData.donation_id}`,
        );

        setDonation(donationResponse.data?.data || null);
      } catch {
        setDonation(null);
      }

      // Load organization information.
      try {
        const organizationResponse = await api.get(
          `/organizations/${requestData.organization_id}`,
        );

        setOrganization(
          organizationResponse.data?.data || null,
        );
      } catch {
        setOrganization(null);
      }
    } catch (requestError) {
      console.error("Unable to load donor request:", requestError);

      if (requestError.response) {
        setError(
          requestError.response.data?.detail ||
            `Request failed with status ${requestError.response.status}.`,
        );
      } else if (requestError.request) {
        setError(
          "The backend server could not be reached. Make sure FastAPI is running on http://127.0.0.1:8000.",
        );
      } else {
        setError(
          requestError.message ||
            "Unable to load this request.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      loadRequest();
    } else {
      setError("No request ID was provided.");
      setLoading(false);
    }
  }, [requestId]);

  const handleAction = async (action) => {
    if (!request) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.post(
        `/requests/${request.id}/${action}`,
      );

      const updatedRequest = response.data?.data;

      if (updatedRequest) {
        setRequest(updatedRequest);
      }

      if (action === "accept") {
        setSuccessMessage(
          "The donation request has been accepted successfully.",
        );
      } else {
        setSuccessMessage(
          "The donation request has been rejected successfully.",
        );
      }
    } catch (requestError) {
      console.error(
        `Unable to ${action} request:`,
        requestError,
      );

      setError(
        requestError.response?.data?.detail ||
          requestError.message ||
          `Unable to ${action} this request.`,
      );
    } finally {
      setActionLoading(false);
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

  const canAccept =
    request?.status === "PENDING" &&
    donation &&
    Number(request.requested_quantity) <=
      Math.max(
        0,
        Number(donation.quantity || 0) -
          Number(donation.reserved_quantity || 0),
      );

  const remainingQuantity = donation
    ? Math.max(
        0,
        Number(donation.quantity || 0) -
          Number(donation.reserved_quantity || 0),
      )
    : null;

  if (loading) {
    return <Loading />;
  }

  if (error && !request) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />

        <main className="lg:ml-64">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => navigate("/donor/requests")}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
            >
              <ArrowLeft size={16} />
              Back to Requests
            </button>

            <div className="rounded-2xl border border-red-200 bg-[var(--surface)] p-8 text-center shadow-sm dark:border-red-900/40">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <XCircle size={28} />
              </div>

              <h1 className="mt-4 text-xl font-bold text-[var(--text-primary)]">
                Unable to load request
              </h1>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
                {error}
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={loadRequest}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/donor/requests")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  Back to Requests
                </button>
              </div>
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
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => navigate("/donor/requests")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
            >
              <ArrowLeft size={16} />
              Back to Requests
            </button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                    Donation Request
                  </h1>

                  {request && (
                    <StatusBadge status={request.status} />
                  )}
                </div>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Review the organization request and decide how to proceed.
                </p>
              </div>

              <button
                type="button"
                onClick={loadRequest}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-60"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 size={17} />
              {successMessage}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            {/* Main */}
            <div className="space-y-6">
              {/* Organization */}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                    <UserRound size={19} />
                  </div>

                  <div>
                    <h2 className="font-bold text-[var(--text-primary)]">
                      Requesting Organization
                    </h2>

                    <p className="text-xs text-[var(--text-secondary)]">
                      Organization information
                    </p>
                  </div>
                </div>

                {organization ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoItem
                      label="Organization"
                      value={organization.name}
                    />

                    <InfoItem
                      label="Email"
                      value={organization.email}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)]">
                    Organization information is unavailable.
                  </p>
                )}
              </section>

              {/* Request information */}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                    <Package size={19} />
                  </div>

                  <div>
                    <h2 className="font-bold text-[var(--text-primary)]">
                      Request Information
                    </h2>

                    <p className="text-xs text-[var(--text-secondary)]">
                      Details submitted by the organization
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    label="Requested Quantity"
                    value={
                      donation
                        ? `${request.requested_quantity} ${donation.unit}`
                        : request.requested_quantity
                    }
                  />

                  <InfoItem
                    label="Collection Time"
                    value={request.collection_time}
                  />

                  <InfoItem
                    label="Request Submitted"
                    value={formatDateTime(request.created_at)}
                  />

                  <InfoItem
                    label="Request Status"
                    value={request.status}
                  />
                </div>

                {request.message && (
                  <div className="mt-6 border-t border-[var(--border)] pt-5">
                    <div className="mb-2 flex items-center gap-2">
                      <MessageSquare
                        size={16}
                        className="text-[var(--text-secondary)]"
                      />

                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                        Organization Message
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                      <p className="text-sm leading-6 text-[var(--text-primary)]">
                        {request.message}
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Donation */}
              {donation && (
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                      <Package size={19} />
                    </div>

                    <div>
                      <h2 className="font-bold text-[var(--text-primary)]">
                        Related Donation
                      </h2>

                      <p className="text-xs text-[var(--text-secondary)]">
                        Food associated with this request
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      label="Food"
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
                      label="Currently Remaining"
                      value={`${remainingQuantity} ${donation.unit}`}
                    />

                    <InfoItem
                      label="Pickup Address"
                      value={donation.pickup_address}
                    />

                    <InfoItem
                      label="Safe Consumption Deadline"
                      value={formatDateTime(
                        donation.safe_consumption_deadline,
                      )}
                    />
                  </div>
                </section>
              )}
            </div>

            {/* Right side */}
            <aside className="space-y-6">
              {/* Decision */}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                <h2 className="font-bold text-[var(--text-primary)]">
                  Request Decision
                </h2>

                {request.status === "PENDING" ? (
                  <>
                    <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">
                      Review the requested quantity and collection time before
                      accepting or rejecting this request.
                    </p>

                    {donation && (
                      <div className="mt-4 rounded-xl bg-[var(--surface-muted)] p-4">
                        <p className="text-xs text-[var(--text-secondary)]">
                          Available quantity
                        </p>

                        <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                          {remainingQuantity} {donation.unit}
                        </p>

                        {Number(request.requested_quantity) >
                          remainingQuantity && (
                          <p className="mt-2 text-xs leading-5 text-red-600 dark:text-red-400">
                            This request exceeds the currently available
                            quantity and cannot be accepted.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-5 space-y-3">
                      <button
                        type="button"
                        onClick={() => handleAction("accept")}
                        disabled={
                          actionLoading ||
                          !canAccept
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCircle2 size={17} />

                        {actionLoading
                          ? "Processing..."
                          : "Accept Request"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction("reject")}
                        disabled={actionLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                      >
                        <XCircle size={17} />

                        {actionLoading
                          ? "Processing..."
                          : "Reject Request"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 rounded-xl bg-[var(--surface-muted)] p-4">
                    <StatusBadge status={request.status} />

                    <p className="mt-3 text-sm leading-5 text-[var(--text-secondary)]">
                      This request is no longer pending, so no decision
                      action is available.
                    </p>
                  </div>
                )}
              </section>

              {/* Collection */}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <h2 className="font-bold text-[var(--text-primary)]">
                      Collection
                    </h2>

                    <p className="text-xs text-[var(--text-secondary)]">
                      Requested collection schedule
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <StatusRow
                    icon={Clock3}
                    label="Collection Time"
                    value={request.collection_time || "Not specified"}
                  />

                  {donation?.pickup_address && (
                    <StatusRow
                      icon={MapPin}
                      label="Pickup Address"
                      value={donation.pickup_address}
                    />
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-medium leading-5 text-[var(--text-primary)]">
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

        <p className="mt-0.5 break-words text-sm font-semibold text-[var(--text-primary)]">
          {value}
        </p>
      </div>
    </div>
  );
}

export default RequestDetails;