import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Send,
  ShieldAlert,
  Utensils,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import api from "../services/api";


function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-slate-500">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-sm text-slate-800">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}


function MatchCheck({
  label,
  value,
}) {
  const matched = Boolean(value);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <span className="text-sm text-slate-700">
        {label}
      </span>

      <span
        className={
          matched
            ? "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
            : "inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
        }
      >
        {matched ? (
          <>
            <CheckCircle2 size={14} />
            Matched
          </>
        ) : (
          <>
            <AlertTriangle size={14} />
            Not matched
          </>
        )}
      </span>
    </div>
  );
}


export default function DonationDetails() {
  const { donationId } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [matchExplanation, setMatchExplanation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [matchError, setMatchError] = useState("");
  const [success, setSuccess] = useState("");

  const [requestedQuantity, setRequestedQuantity] = useState("");
  const [collectionTime, setCollectionTime] = useState("");
  const [message, setMessage] = useState("");


  // ----------------------------------------------------------------
  // Load donation + organization profile
  // ----------------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          donationResponse,
          organizationResponse,
        ] = await Promise.all([
          api.get(`/donations/${donationId}`),
          api.get("/organizations/me/profile"),
        ]);

        if (!mounted) {
          return;
        }

        const donationData =
          donationResponse.data?.data;

        const organizationData =
          organizationResponse.data?.data;

        setDonation(donationData);
        setOrganization(organizationData);

        const quantity = Math.max(
          Number(donationData?.quantity || 0) -
            Number(
              donationData?.reserved_quantity || 0
            ),
          0,
        );

        setRequestedQuantity(
          quantity > 0 ? "1" : ""
        );

      } catch (requestError) {
        if (!mounted) {
          return;
        }

        console.error(
          "Unable to load donation details:",
          requestError,
        );

        setError(
          requestError.response?.data?.detail ||
            "Unable to load donation details.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [donationId]);


  // ----------------------------------------------------------------
  // Calculate remaining quantity
  // ----------------------------------------------------------------

  const remainingQuantity = useMemo(() => {
    if (!donation) {
      return 0;
    }

    return Math.max(
      Number(donation.quantity || 0) -
        Number(donation.reserved_quantity || 0),
      0,
    );
  }, [donation]);


  // ----------------------------------------------------------------
  // Check whether request can be created
  // ----------------------------------------------------------------

  const isRequestable =
    donation &&
    [
      "AVAILABLE",
      "PARTIALLY_RESERVED",
    ].includes(donation.status) &&
    remainingQuantity > 0;


  // ----------------------------------------------------------------
  // Format dates
  // ----------------------------------------------------------------

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


  // ----------------------------------------------------------------
  // Run AI matching explanation
  // ----------------------------------------------------------------

  const handleCheckMatch = async () => {
    if (!donation || !organization) {
      return;
    }

    try {
      setMatching(true);
      setMatchError("");
      setMatchExplanation(null);

      const response = await api.post(
        "/ai/match-explanation",
        {
          donation,
          organization,
        },
      );

      const result = response.data;

      if (!result) {
        throw new Error(
          "The matching service returned an empty response."
        );
      }

      setMatchExplanation(result);

    } catch (requestError) {
      console.error(
        "Unable to generate match explanation:",
        requestError,
      );

      setMatchError(
        requestError.response?.data?.detail ||
          "Unable to generate the match explanation.",
      );
    } finally {
      setMatching(false);
    }
  };


  // ----------------------------------------------------------------
  // Submit donation request
  // ----------------------------------------------------------------

  const handleSubmitRequest = async (event) => {
    event.preventDefault();

    if (!donation) {
      return;
    }

    const quantity = Number(
      requestedQuantity
    );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Please enter a valid requested quantity."
      );
      return;
    }

    if (quantity > remainingQuantity) {
      setError(
        `You can request at most ${remainingQuantity} ${donation.unit}.`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await api.post(
        `/donations/${donation.id}/requests`,
        {
          requested_quantity: quantity,
          collection_time:
            collectionTime.trim(),
          message: message.trim(),
        },
      );

      setSuccess(
        "Your donation request has been submitted successfully."
      );

      setTimeout(() => {
        navigate(
          "/organization/requests"
        );
      }, 900);

    } catch (requestError) {
      console.error(
        "Unable to submit request:",
        requestError,
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to submit the donation request.",
      );
    } finally {
      setSubmitting(false);
    }
  };


  // ----------------------------------------------------------------
  // Loading state
  // ----------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <main className="md:ml-64 p-6">
          <Loading />
        </main>
      </div>
    );
  }


  // ----------------------------------------------------------------
  // Error state
  // ----------------------------------------------------------------

  if (!donation) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <main className="md:ml-64 p-6">
          <div className="mx-auto max-w-4xl">
            <Link
              to="/organization/donations"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={17} />
              Back to Donations
            </Link>

            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error ||
                "Donation not found."}
            </div>
          </div>
        </main>
      </div>
    );
  }


  // ----------------------------------------------------------------
  // Main page
  // ----------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="md:ml-64 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">

          {/* ------------------------------------------------------ */}
          {/* Back link */}
          {/* ------------------------------------------------------ */}

          <Link
            to="/organization/donations"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to Donations
          </Link>


          {/* ------------------------------------------------------ */}
          {/* Header */}
          {/* ------------------------------------------------------ */}

          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge
                  status={donation.status}
                />

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {donation.category}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                {donation.food_name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Review the donation information,
                check the matching factors, and
                submit a request if the donation
                meets your organization's needs.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
              <Package
                size={19}
                className="text-slate-500"
              />

              <div>
                <p className="text-xs text-slate-500">
                  Available
                </p>

                <p className="font-semibold text-slate-900">
                  {remainingQuantity}{" "}
                  {donation.unit}
                </p>
              </div>
            </div>
          </div>


          {/* ------------------------------------------------------ */}
          {/* Alerts */}
          {/* ------------------------------------------------------ */}

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{success}</span>
            </div>
          )}


          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">

            <div className="space-y-6">

              {/* -------------------------------------------------- */}
              {/* Donation Information */}
              {/* -------------------------------------------------- */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                    <Package size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Donation Information
                    </h2>

                    <p className="text-sm text-slate-500">
                      Information provided by the donor.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  <InfoItem
                    icon={Utensils}
                    label="Food"
                    value={
                      donation.food_name
                    }
                  />

                  <InfoItem
                    icon={Package}
                    label="Quantity"
                    value={`${remainingQuantity} ${donation.unit} available of ${donation.quantity} ${donation.unit}`}
                  />

                  <InfoItem
                    icon={CalendarClock}
                    label="Prepared"
                    value={formatDate(
                      donation.preparation_datetime
                    )}
                  />

                  <InfoItem
                    icon={Clock3}
                    label="Safe Consumption Deadline"
                    value={formatDate(
                      donation.safe_consumption_deadline
                    )}
                  />

                  <div className="sm:col-span-2">
                    <InfoItem
                      icon={MapPin}
                      label="Pickup Address"
                      value={
                        donation.pickup_address
                      }
                    />
                  </div>

                </div>

                {donation.description && (
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Description
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {donation.description}
                    </p>
                  </div>
                )}
              </section>


              {/* -------------------------------------------------- */}
              {/* Storage and Dietary Information */}
              {/* -------------------------------------------------- */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                    <Utensils size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Storage & Dietary Information
                    </h2>

                    <p className="text-sm text-slate-500">
                      Donor-provided handling information.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">

                  <InfoItem
                    icon={Package}
                    label="Storage Instructions"
                    value={
                      donation.storage_instructions
                    }
                  />

                  <InfoItem
                    icon={Utensils}
                    label="Dietary Information"
                    value={
                      donation.dietary_information
                    }
                  />

                </div>
              </section>


              {/* -------------------------------------------------- */}
              {/* AI Match Explanation */}
              {/* -------------------------------------------------- */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Donation Match
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Backend matching checks your organization's
                      requirements against this donation.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckMatch}
                    disabled={
                      matching ||
                      !organization
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {matching
                      ? "Checking Match..."
                      : "Check Match"}
                  </button>

                </div>


                {!organization && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    Your organization profile could not
                    be loaded. Matching cannot be calculated
                    until the organization profile is available.
                  </div>
                )}


                {matchError && (
                  <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertTriangle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{matchError}</span>
                  </div>
                )}


                {matchExplanation && (
                  <div className="space-y-5">

                    {/* Match status */}

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Match Status
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {matchExplanation.matching_facts?.match_status ||
                              "UNKNOWN"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-500">
                            Checks matched
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {matchExplanation.matching_facts?.matched_count ?? 0}
                            {" / "}
                            {matchExplanation.matching_facts?.total_checks ?? 0}
                          </p>
                        </div>

                      </div>
                    </div>


                    {/* Deterministic checks */}

                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-slate-900">
                        Matching Checks
                      </h3>

                      <div className="space-y-2">

                        <MatchCheck
                          label="Food Category"
                          value={
                            matchExplanation
                              .matching_facts
                              ?.category_match
                          }
                        />

                        <MatchCheck
                          label="Dietary Requirements"
                          value={
                            matchExplanation
                              .matching_facts
                              ?.dietary_match
                          }
                        />

                        <MatchCheck
                          label="Quantity Requirement"
                          value={
                            matchExplanation
                              .matching_facts
                              ?.quantity_match
                          }
                        />

                      </div>
                    </div>


                    {/* Distance */}

                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Distance
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {matchExplanation.matching_facts?.distance_km !== null &&
                        matchExplanation.matching_facts?.distance_km !== undefined
                          ? `${matchExplanation.matching_facts.distance_km} km`
                          : "Distance unavailable"}
                      </p>
                    </div>


                    {/* AI explanation */}

                    {matchExplanation.ai?.data?.raw && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">

                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          AI Explanation
                        </p>

                        <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                          {matchExplanation.ai.data.raw}
                        </p>

                      </div>
                    )}

                  </div>
                )}


                {!matchExplanation &&
                  !matching &&
                  !matchError && (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                      Click <strong>Check Match</strong> to
                      compare this donation with your
                      organization's current matching
                      preferences.
                    </div>
                  )}

              </section>


              {/* -------------------------------------------------- */}
              {/* Food Safety Reminder */}
              {/* -------------------------------------------------- */}

              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <ShieldAlert
                    size={20}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />

                  <div>
                    <h2 className="font-semibold text-amber-900">
                      Food Safety Reminder
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      The information shown here comes
                      from the donor. The AI system does
                      not certify that food is safe to eat.
                      Your organization should follow its
                      own food-safety procedures before
                      accepting or collecting donated food.
                    </p>
                  </div>
                </div>
              </section>

            </div>


            {/* ---------------------------------------------------- */}
            {/* Request Form */}
            {/* ---------------------------------------------------- */}

            <aside>
              <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Request Donation
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Submit a request for the amount
                    your organization needs.
                  </p>
                </div>


                {!isRequestable ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    This donation is currently not
                    available for a new request.
                  </div>
                ) : (
                  <form
                    onSubmit={
                      handleSubmitRequest
                    }
                    className="space-y-5"
                  >

                    {/* Quantity */}

                    <div>
                      <label
                        htmlFor="requestedQuantity"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Requested Quantity
                      </label>

                      <div className="flex items-center gap-2">
                        <input
                          id="requestedQuantity"
                          type="number"
                          min="1"
                          max={remainingQuantity}
                          value={
                            requestedQuantity
                          }
                          onChange={(event) =>
                            setRequestedQuantity(
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                          required
                        />

                        <span className="text-sm text-slate-500">
                          {donation.unit}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        Maximum available:{" "}
                        {remainingQuantity}{" "}
                        {donation.unit}
                      </p>
                    </div>


                    {/* Collection time */}

                    <div>
                      <label
                        htmlFor="collectionTime"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Collection Time
                      </label>

                      <input
                        id="collectionTime"
                        type="datetime-local"
                        value={
                          collectionTime
                        }
                        onChange={(event) =>
                          setCollectionTime(
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        required
                      />
                    </div>


                    {/* Message */}

                    <div>
                      <label
                        htmlFor="requestMessage"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Message
                      </label>

                      <textarea
                        id="requestMessage"
                        rows="4"
                        value={message}
                        onChange={(event) =>
                          setMessage(
                            event.target.value
                          )
                        }
                        placeholder="Add any relevant collection information..."
                        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>


                    {/* Submit */}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send size={17} />

                      {submitting
                        ? "Submitting..."
                        : "Submit Request"}
                    </button>

                  </form>
                )}


                {/* Organization profile reminder */}

                {organization && (
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Your Matching Profile
                    </p>

                    <div className="mt-3 space-y-2 text-sm text-slate-600">

                      <p>
                        <span className="font-medium text-slate-800">
                          Categories:
                        </span>{" "}
                        {organization.accepted_food_categories?.length
                          ? organization.accepted_food_categories.join(
                              ", "
                            )
                          : "None specified"}
                      </p>

                      <p>
                        <span className="font-medium text-slate-800">
                          Dietary:
                        </span>{" "}
                        {organization.dietary_requirements?.length
                          ? organization.dietary_requirements.join(
                              ", "
                            )
                          : "None specified"}
                      </p>

                      <p>
                        <span className="font-medium text-slate-800">
                          Minimum quantity:
                        </span>{" "}
                        {organization.minimum_quantity || 0}
                      </p>

                    </div>

                  </div>
                )}

              </div>
            </aside>

          </div>

        </div>
      </main>
    </div>
  );
}