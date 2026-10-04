import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import api from "../services/api";

function RequestDetails() {
  const { requestId } = useParams();

  const [request, setRequest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // AI Logistics
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiError, setAiError] = useState("");

  // AI Coordinator
  const [coordinatorLoading, setCoordinatorLoading] =
    useState(false);
  const [coordinatorResult, setCoordinatorResult] =
    useState(null);
  const [coordinatorError, setCoordinatorError] =
    useState("");

  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadRequest = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/requests/${requestId}`,
      );

      setRequest(response.data?.data || null);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to load this request.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const performAction = async (
    action,
    successMessage,
  ) => {
    try {
      setActionLoading(true);
      setError("");
      setActionMessage("");

      await api.post(
        `/requests/${requestId}/${action}`,
      );

      setActionMessage(successMessage);

      // Clear AI results because the workflow status
      // may have changed.
      setCoordinatorResult(null);
      setCoordinatorError("");
      setAiSuggestion(null);
      setAiError("");

      await loadRequest();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to complete this action.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this request?",
    );

    if (!confirmed) {
      return;
    }

    await performAction(
      "cancel",
      "Your request has been cancelled.",
    );
  };

  const handleConfirmCollection = async () => {
    await performAction(
      "confirm-collection",
      "Collection has been confirmed.",
    );
  };

  const handleConfirmReceipt = async () => {
    await performAction(
      "confirm-receipt",
      "Receipt confirmed. This request is now completed.",
    );
  };

  const handleGetAISuggestion = async () => {
    try {
      setAiLoading(true);
      setAiError("");
      setAiSuggestion(null);

      const response = await api.post(
        "/ai/collection-suggestion",
        {
          request_id: requestId,
        },
      );

      setAiSuggestion(
        response.data?.data || null,
      );
    } catch (err) {
      setAiError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to generate the AI collection suggestion.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleGetCoordinatorSummary = async () => {
    try {
      setCoordinatorLoading(true);
      setCoordinatorError("");
      setCoordinatorResult(null);

      const response = await api.post(
        "/ai/coordinate",
        {
          request_id: requestId,
        },
      );

      setCoordinatorResult(
        response.data?.data || null,
      );
    } catch (err) {
      setCoordinatorError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to generate the AI workflow summary.",
      );
    } finally {
      setCoordinatorLoading(false);
    }
  };

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

  const formatDistance = (distance) => {
    if (
      distance === null ||
      distance === undefined ||
      distance === ""
    ) {
      return "Distance not available";
    }

    const numericDistance = Number(distance);

    if (!Number.isFinite(numericDistance)) {
      return "Distance not available";
    }

    return `${numericDistance.toFixed(2)} km`;
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "PENDING":
        return "Your request is waiting for the donor to review it.";

      case "ACCEPTED":
        return "The donor accepted your request. You can now arrange and confirm collection.";

      case "COLLECTION_CONFIRMED":
        return "Collection has been confirmed. Confirm receipt after the food has been received.";

      case "COMPLETED":
        return "The donation has been successfully received and the request is completed.";

      case "REJECTED":
        return "The donor rejected this request.";

      case "CANCELLED":
        return "This request has been cancelled.";

      default:
        return "The request status has been updated.";
    }
  };

  const getStatusIcon = (status) => {
    if (status === "COMPLETED") {
      return CheckCircle2;
    }

    if (
      status === "REJECTED" ||
      status === "CANCELLED"
    ) {
      return XCircle;
    }

    return Clock3;
  };

  const StatusIcon = request
    ? getStatusIcon(request.status)
    : Clock3;

  const logistics =
    aiSuggestion?.logistics || null;

  const aiData =
    aiSuggestion?.ai?.data || null;

  const coordinatorData =
    coordinatorResult?.ai?.data || null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Back */}
          <Link
            to="/organization/requests"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
          >
            <ArrowLeft size={17} />
            Back to My Requests
          </Link>

          {loading ? (
            <Loading message="Loading request..." />
          ) : error && !request ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-950/20">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <h2 className="font-semibold text-red-700 dark:text-red-400">
                    Unable to load request
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-red-600 dark:text-red-300">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadRequest}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    <RefreshCw size={15} />
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : request ? (
            <>
              {/* Header */}
              <div className="mt-6">
                <p className="text-sm font-medium text-[var(--primary)]">
                  Organization workspace
                </p>

                <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                      Request Details
                    </h1>

                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      Review the current status and manage this
                      donation request.
                    </p>
                  </div>

                  <StatusBadge status={request.status} />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}

              {/* Success */}
              {actionMessage && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {actionMessage}
                  </p>
                </div>
              )}

              {/* Status banner */}
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                    <StatusIcon
                      size={22}
                      className="text-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)]">
                      {request.status.replaceAll(
                        "_",
                        " ",
                      )}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                      {getStatusDescription(
                        request.status,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Request information */}
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                      <Package
                        size={20}
                        className="text-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <h2 className="font-semibold text-[var(--text-primary)]">
                        Request Information
                      </h2>

                      <p className="text-xs text-[var(--text-secondary)]">
                        Details submitted with your request
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                        Requested Quantity
                      </p>

                      <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                        {request.requested_quantity}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                        Collection Time
                      </p>

                      <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                        {request.collection_time}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                        Request Created
                      </p>

                      <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                        {formatDate(request.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                        Request ID
                      </p>

                      <p className="mt-1 break-all text-xs text-[var(--text-secondary)]">
                        {request.id}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Message */}
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                  <h2 className="font-semibold text-[var(--text-primary)]">
                    Your Message
                  </h2>

                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Message sent to the donor
                  </p>

                  <div className="mt-6 rounded-xl bg-[var(--surface-muted)] p-4">
                    {request.message ? (
                      <p className="text-sm leading-6 text-[var(--text-primary)]">
                        {request.message}
                      </p>
                    ) : (
                      <p className="text-sm italic text-[var(--text-secondary)]">
                        No message was provided.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              {/* AI Coordinator */}
              <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                      <Sparkles
                        size={20}
                        className="text-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <h2 className="font-semibold text-[var(--text-primary)]">
                        AI Workflow Summary
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        Get a summary of the current donation workflow
                        using verified request and donation information.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetCoordinatorSummary}
                    disabled={coordinatorLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles size={17} />

                    {coordinatorLoading
                      ? "Analyzing..."
                      : "Get AI Summary"}
                  </button>
                </div>

                {/* Coordinator error */}
                {coordinatorError && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                    <AlertCircle
                      size={19}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        Unable to generate workflow summary
                      </p>

                      <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                        {coordinatorError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Coordinator result */}
                {coordinatorResult && (
                  <div className="mt-6 space-y-5">
                    {coordinatorData ? (
                      <>
                        {/* Title and summary */}
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                              <Sparkles
                                size={18}
                                className="text-[var(--primary)]"
                              />
                            </div>

                            <div>
                              <h3 className="font-semibold text-[var(--text-primary)]">
                                {coordinatorData.title ||
                                  "Donation Workflow Update"}
                              </h3>

                              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                {coordinatorData.summary ||
                                  "No workflow summary was provided."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Current status and next action */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                              Current Status
                            </p>

                            <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                              {coordinatorData.current_status
                                ? coordinatorData.current_status.replaceAll(
                                    "_",
                                    " ",
                                  )
                                : request.status.replaceAll(
                                    "_",
                                    " ",
                                  )}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                              Next Action
                            </p>

                            <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
                              {coordinatorData.next_action ||
                                "Follow the action required by the current request status."}
                            </p>
                          </div>
                        </div>

                        {/* Important information */}
                        <div>
                          <h3 className="font-semibold text-[var(--text-primary)]">
                            Important Information
                          </h3>

                          {coordinatorData
                            .important_information
                            ?.length > 0 ? (
                            <ul className="mt-3 space-y-2">
                              {coordinatorData.important_information.map(
                                (item, index) => (
                                  <li
                                    key={`workflow-info-${index}`}
                                    className="rounded-xl bg-[var(--surface-muted)] p-3 text-sm leading-6 text-[var(--text-secondary)]"
                                  >
                                    {item}
                                  </li>
                                ),
                              )}
                            </ul>
                          ) : (
                            <p className="mt-3 text-sm text-[var(--text-secondary)]">
                              No additional information was provided.
                            </p>
                          )}
                        </div>

                        {/* Safety / AI limitation */}
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                          <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
                            AI provides a summary of the verified
                            workflow information only. It does not
                            approve or reject requests, change
                            statuses, schedule collections, modify
                            quantities, or certify food safety.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          The AI returned an unexpected response format.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* AI Logistics Suggestion */}
              {request.status === "ACCEPTED" && (
                <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                        <MapPin
                          size={20}
                          className="text-[var(--primary)]"
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-[var(--text-primary)]">
                          AI Collection Suggestion
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                          Get a logistics summary based only on the
                          verified donation and request information.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGetAISuggestion}
                      disabled={aiLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Sparkles size={17} />

                      {aiLoading
                        ? "Analyzing..."
                        : "Get AI Suggestion"}
                    </button>
                  </div>

                  {/* AI error */}
                  {aiError && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-red-600"
                      />

                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">
                          Unable to generate suggestion
                        </p>

                        <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                          {aiError}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI result */}
                  {aiSuggestion && (
                    <div className="mt-6 space-y-6">
                      {/* Verified logistics */}
                      {logistics && (
                        <div>
                          <div className="flex items-center gap-2">
                            <MapPin
                              size={18}
                              className="text-[var(--primary)]"
                            />

                            <h3 className="font-semibold text-[var(--text-primary)]">
                              Verified Collection Information
                            </h3>
                          </div>

                          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                                Quantity
                              </p>

                              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                {logistics.requested_quantity}{" "}
                                {logistics.unit || ""}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                                Collection Time
                              </p>

                              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                {logistics.collection_time ||
                                  "Not provided"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                                Distance
                              </p>

                              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                {formatDistance(
                                  logistics.distance_km,
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                                Remaining Food
                              </p>

                              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                {logistics.remaining_quantity}{" "}
                                {logistics.unit || ""}
                              </p>
                            </div>
                          </div>

                          {logistics.pickup_address && (
                            <div className="mt-4 rounded-xl bg-[var(--surface-muted)] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                                Pickup Address
                              </p>

                              <p className="mt-1 text-sm leading-6 text-[var(--text-primary)]">
                                {logistics.pickup_address}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI summary */}
                      {aiData && (
                        <>
                          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                            <h3 className="font-semibold text-[var(--text-primary)]">
                              AI Summary
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                              {aiData.summary ||
                                "No summary was provided."}
                            </p>
                          </div>

                          {/* Collection considerations */}
                          <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">
                              Collection Considerations
                            </h3>

                            {aiData.collection_considerations
                              ?.length > 0 ? (
                              <ul className="mt-3 space-y-2">
                                {aiData.collection_considerations.map(
                                  (item, index) => (
                                    <li
                                      key={`collection-${index}`}
                                      className="rounded-xl bg-[var(--surface-muted)] p-3 text-sm leading-6 text-[var(--text-secondary)]"
                                    >
                                      {item}
                                    </li>
                                  ),
                                )}
                              </ul>
                            ) : (
                              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                                No collection considerations were
                                provided.
                              </p>
                            )}
                          </div>

                          {/* Timing considerations */}
                          <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">
                              Timing Considerations
                            </h3>

                            {aiData.timing_considerations
                              ?.length > 0 ? (
                              <ul className="mt-3 space-y-2">
                                {aiData.timing_considerations.map(
                                  (item, index) => (
                                    <li
                                      key={`timing-${index}`}
                                      className="rounded-xl bg-[var(--surface-muted)] p-3 text-sm leading-6 text-[var(--text-secondary)]"
                                    >
                                      {item}
                                    </li>
                                  ),
                                )}
                              </ul>
                            ) : (
                              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                                No timing considerations were
                                provided.
                              </p>
                            )}
                          </div>

                          {/* Practical notes */}
                          <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">
                              Practical Notes
                            </h3>

                            {aiData.practical_notes
                              ?.length > 0 ? (
                              <ul className="mt-3 space-y-2">
                                {aiData.practical_notes.map(
                                  (item, index) => (
                                    <li
                                      key={`practical-${index}`}
                                      className="rounded-xl bg-[var(--surface-muted)] p-3 text-sm leading-6 text-[var(--text-secondary)]"
                                    >
                                      {item}
                                    </li>
                                  ),
                                )}
                              </ul>
                            ) : (
                              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                                No practical notes were provided.
                              </p>
                            )}
                          </div>

                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                            <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
                              AI provides a summary of the supplied
                              logistics information only. It does not
                              schedule collection, change request or
                              donation status, or certify food safety.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Actions */}
              <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                <h2 className="font-semibold text-[var(--text-primary)]">
                  Available Actions
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Actions become available according to the
                  current request status.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {request.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      <XCircle size={17} />

                      {actionLoading
                        ? "Processing..."
                        : "Cancel Request"}
                    </button>
                  )}

                  {request.status === "ACCEPTED" && (
                    <button
                      type="button"
                      onClick={handleConfirmCollection}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 size={17} />

                      {actionLoading
                        ? "Processing..."
                        : "Confirm Collection"}
                    </button>
                  )}

                  {request.status ===
                    "COLLECTION_CONFIRMED" && (
                    <button
                      type="button"
                      onClick={handleConfirmReceipt}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 size={17} />

                      {actionLoading
                        ? "Processing..."
                        : "Confirm Receipt"}
                    </button>
                  )}

                  {request.status === "COMPLETED" && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                      <CheckCircle2 size={17} />
                      Donation successfully completed
                    </div>
                  )}

                  {(request.status === "REJECTED" ||
                    request.status === "CANCELLED") && (
                    <div className="rounded-xl bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-secondary)]">
                      No further actions are available for
                      this request.
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default RequestDetails;