import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    AlertCircle,
    ArrowLeft,
    CalendarClock,
    CheckCircle2,
    Info,
    MapPin,
    Package,
    Save,
    Sparkles,
    LoaderCircle,
    X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import api from "../services/api";

const initialForm = {
    food_name: "",
    category: "Prepared Meals",
    quantity: "",
    unit: "meals",
    preparation_datetime: "",
    safe_consumption_deadline: "",
    pickup_address: "",
    latitude: "",
    longitude: "",
    storage_instructions: "",
    dietary_information: "",
    description: "",
};

function CreateDonation() {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);

    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [aiError, setAiError] = useState("");
    const [aiAnalysis, setAiAnalysis] = useState(null);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (aiAnalysis) {
            setAiAnalysis(null);
        }

        if (aiError) {
            setAiError("");
        }
    };

    const validateRequiredFields = () => {
        if (!form.food_name.trim()) {
            return "Please enter the food name.";
        }

        if (!form.quantity || Number(form.quantity) <= 0) {
            return "Please enter a quantity greater than 0.";
        }

        if (!form.preparation_datetime) {
            return "Please provide the preparation date and time.";
        }

        if (!form.safe_consumption_deadline) {
            return "Please provide the safe consumption deadline.";
        }

        const preparationDate = new Date(
            form.preparation_datetime,
        );

        const deadlineDate = new Date(
            form.safe_consumption_deadline,
        );

        if (
            Number.isNaN(preparationDate.getTime()) ||
            Number.isNaN(deadlineDate.getTime())
        ) {
            return "Please provide valid date and time values.";
        }

        if (deadlineDate <= preparationDate) {
            return (
                "The safe consumption deadline must be after " +
                "the preparation date and time."
            );
        }

        return null;
    };

    const validateCoordinates = () => {
        const hasLatitude =
            form.latitude.trim() !== "";

        const hasLongitude =
            form.longitude.trim() !== "";

        if (!hasLatitude && !hasLongitude) {
            return null;
        }

        if (hasLatitude && !hasLongitude) {
            return "Please provide both latitude and longitude.";
        }

        if (!hasLatitude && hasLongitude) {
            return "Please provide both latitude and longitude.";
        }

        const latitude = Number(
            form.latitude,
        );

        const longitude = Number(
            form.longitude,
        );

        if (
            !Number.isFinite(latitude) ||
            latitude < -90 ||
            latitude > 90
        ) {
            return (
                "Latitude must be a number between -90 and 90."
            );
        }

        if (
            !Number.isFinite(longitude) ||
            longitude < -180 ||
            longitude > 180
        ) {
            return (
                "Longitude must be a number between -180 and 180."
            );
        }

        return null;
    };

    const handleAnalyzeFood = async () => {
        setAiError("");
        setAiAnalysis(null);

        const validationError =
            validateRequiredFields();

        if (validationError) {
            setAiError(validationError);
            return;
        }

        try {
            setAiLoading(true);

            const preparationDate = new Date(
                form.preparation_datetime,
            );

            const deadlineDate = new Date(
                form.safe_consumption_deadline,
            );

            const payload = {
                food_name: form.food_name.trim(),
                category: form.category,
                quantity: Number(form.quantity),
                unit: form.unit,
                preparation_datetime:
                    preparationDate.toISOString(),
                safe_consumption_deadline:
                    deadlineDate.toISOString(),
                storage_instructions:
                    form.storage_instructions.trim(),
                dietary_information:
                    form.dietary_information.trim(),
                description:
                    form.description.trim(),
            };

            const response = await api.post(
                "/ai/food-analysis",
                payload,
            );

            const result = response.data;

            if (!result?.success) {
                throw new Error(
                    result?.message ||
                    "AI food analysis is currently unavailable.",
                );
            }

            const analysis = result?.data;

            if (!analysis) {
                throw new Error(
                    "The AI returned an empty analysis.",
                );
            }

            setAiAnalysis(analysis);
        } catch (err) {
            setAiError(
                err.response?.data?.detail ||
                err.message ||
                "Unable to analyze the food information.",
            );
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError =
            validateRequiredFields();

        if (validationError) {
            setError(validationError);
            return;
        }

        if (!form.pickup_address.trim()) {
            setError(
                "Please provide the pickup address.",
            );
            return;
        }

        const coordinateError =
            validateCoordinates();

        if (coordinateError) {
            setError(coordinateError);
            return;
        }

        try {
            setLoading(true);

            const preparationDate = new Date(
                form.preparation_datetime,
            );

            const deadlineDate = new Date(
                form.safe_consumption_deadline,
            );

            const payload = {
                food_name: form.food_name.trim(),
                category: form.category,
                quantity: Number(form.quantity),
                unit: form.unit,
                preparation_datetime:
                    preparationDate.toISOString(),
                safe_consumption_deadline:
                    deadlineDate.toISOString(),
                pickup_address:
                    form.pickup_address.trim(),
                storage_instructions:
                    form.storage_instructions.trim(),
                dietary_information:
                    form.dietary_information.trim(),
                description:
                    form.description.trim(),
            };

            if (
                form.latitude.trim() !== "" &&
                form.longitude.trim() !== ""
            ) {
                payload.latitude = Number(
                    form.latitude,
                );

                payload.longitude = Number(
                    form.longitude,
                );
            }

            const response = await api.post(
                "/donations",
                payload,
            );

            const createdDonation =
                response.data?.data;

            if (!createdDonation) {
                throw new Error(
                    "Donation was created but no donation data was returned.",
                );
            }

            setSuccess(
                "Donation created successfully. Organizations can now view it.",
            );

            setTimeout(() => {
                navigate(
                    `/donor/donations/${createdDonation.id}`,
                );
            }, 900);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                err.message ||
                "Unable to create the donation.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Sidebar />

            <main className="min-h-screen lg:ml-64">
                <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            to="/donor/donations"
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
                        >
                            <ArrowLeft size={16} />
                            Back to My Donations
                        </Link>

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                                <Package
                                    size={24}
                                    className="text-[var(--primary)]"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-[var(--primary)]">
                                    Donor workspace
                                </p>

                                <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                                    Create Donation
                                </h1>

                                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                    Share surplus food with organizations that can
                                    collect and distribute it to their communities.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Important information */}
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <Info
                            size={20}
                            className="mt-0.5 shrink-0 text-[var(--primary)]"
                        />

                        <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                                Food safety information
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                                Please provide accurate preparation, storage, and
                                consumption information. The platform does not
                                independently certify food safety.
                            </p>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                            <AlertCircle
                                size={20}
                                className="mt-0.5 shrink-0 text-red-600"
                            />

                            <div>
                                <p className="font-semibold text-red-700 dark:text-red-400">
                                    Unable to create donation
                                </p>

                                <p className="mt-1 text-sm leading-6 text-red-600 dark:text-red-300">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-950/20">
                            <CheckCircle2
                                size={20}
                                className="mt-0.5 shrink-0 text-green-600"
                            />

                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                {success}
                            </p>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        {/* Food information */}
                        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                    Food Information
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                    Tell organizations what food is available.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">

                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="food_name"
                                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Food Name
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <input
                                        id="food_name"
                                        name="food_name"
                                        type="text"
                                        value={form.food_name}
                                        onChange={handleChange}
                                        placeholder="e.g. Vegetable Rice"
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="category"
                                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Category
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <select
                                        id="category"
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className="form-input"
                                    >
                                        <option value="Prepared Meals">
                                            Prepared Meals
                                        </option>
                                        <option value="Bakery">
                                            Bakery
                                        </option>
                                        <option value="Fruits">
                                            Fruits
                                        </option>
                                        <option value="Vegetables">
                                            Vegetables
                                        </option>
                                        <option value="Dairy">
                                            Dairy
                                        </option>
                                        <option value="Packaged Food">
                                            Packaged Food
                                        </option>
                                        <option value="Beverages">
                                            Beverages
                                        </option>
                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="quantity"
                                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Quantity
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <input
                                        id="quantity"
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={form.quantity}
                                        onChange={handleChange}
                                        placeholder="e.g. 30"
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="unit"
                                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Unit
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <select
                                        id="unit"
                                        name="unit"
                                        value={form.unit}
                                        onChange={handleChange}
                                        className="form-input"
                                    >
                                        <option value="meals">
                                            Meals
                                        </option>
                                        <option value="kg">
                                            Kilograms
                                        </option>
                                        <option value="liters">
                                            Liters
                                        </option>
                                        <option value="boxes">
                                            Boxes
                                        </option>
                                        <option value="packs">
                                            Packs
                                        </option>
                                        <option value="pieces">
                                            Pieces
                                        </option>
                                        <option value="servings">
                                            Servings
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="preparation_datetime"
                                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Preparation Date & Time
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <div className="relative">
                                        <CalendarClock
                                            size={17}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                                        />

                                        <input
                                            id="preparation_datetime"
                                            name="preparation_datetime"
                                            type="datetime-local"
                                            value={form.preparation_datetime}
                                            onChange={handleChange}
                                            className="form-input ml-6 pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="safe_consumption_deadline"
                                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Safe Consumption Deadline
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <div className="relative">
                                        <CalendarClock
                                            size={17}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                                        />

                                        <input
                                            id="safe_consumption_deadline"
                                            name="safe_consumption_deadline"
                                            type="datetime-local"
                                            value={form.safe_consumption_deadline}
                                            onChange={handleChange}
                                            className="form-input ml-6 pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Pickup information */}
                        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                                    <MapPin
                                        size={19}
                                        className="text-[var(--primary)]"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                        Pickup & Storage
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        Help organizations understand where and how
                                        the food can be collected.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="pickup_address"
                                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Pickup Address
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <input
                                        id="pickup_address"
                                        name="pickup_address"
                                        type="text"
                                        value={form.pickup_address}
                                        onChange={handleChange}
                                        placeholder="e.g. University Central Cafeteria, Lahore"
                                        className="form-input"
                                    />

                                    <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                                        The address is used to help organizations
                                        understand where the donation can be collected.
                                    </p>
                                </div>

                                {/* Coordinates */}
                                <div>
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-[var(--text-primary)]">
                                            Pickup Coordinates
                                            <span className="ml-2 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xs font-normal text-[var(--text-secondary)]">
                                                Optional
                                            </span>
                                        </label>

                                        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                            Coordinates allow the platform to calculate
                                            the distance between the donation and an
                                            organization. They are not required to create
                                            a donation.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="latitude"
                                                className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                            >
                                                Latitude
                                            </label>

                                            <input
                                                id="latitude"
                                                name="latitude"
                                                type="number"
                                                step="any"
                                                min="-90"
                                                max="90"
                                                value={form.latitude}
                                                onChange={handleChange}
                                                placeholder="e.g. 31.5204"
                                                className="form-input"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="longitude"
                                                className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                            >
                                                Longitude
                                            </label>

                                            <input
                                                id="longitude"
                                                name="longitude"
                                                type="number"
                                                step="any"
                                                min="-180"
                                                max="180"
                                                value={form.longitude}
                                                onChange={handleChange}
                                                placeholder="e.g. 74.3587"
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="storage_instructions"
                                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Storage Instructions
                                    </label>

                                    <textarea
                                        id="storage_instructions"
                                        name="storage_instructions"
                                        value={form.storage_instructions}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="e.g. Keep refrigerated until collection."
                                        className="form-input resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Additional information */}
                        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                    Additional Information
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                    Optional details that can help organizations
                                    decide whether the donation fits their needs.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="dietary_information"
                                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Dietary Information
                                    </label>

                                    <input
                                        id="dietary_information"
                                        name="dietary_information"
                                        type="text"
                                        value={form.dietary_information}
                                        onChange={handleChange}
                                        placeholder="e.g. Vegetarian, contains dairy"
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Add any other useful information about this donation..."
                                        className="form-input resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* AI Food Analysis */}
                        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">

                            <div className="border-b border-[var(--border)] bg-[var(--primary)]/5 p-5 sm:p-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                                        <Sparkles
                                            size={20}
                                            className="text-[var(--primary)]"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                            AI Food Analysis
                                        </h2>

                                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                                            Review the information you entered and get
                                            an AI-generated analysis before creating the
                                            donation.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6">

                                {/* Analyze controls */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-[var(--text-primary)]">
                                            Analyze the current donation information
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                            AI analysis does not certify that food is
                                            safe and does not create the donation.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAnalyzeFood}
                                        disabled={aiLoading || loading}
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {aiLoading ? (
                                            <>
                                                <LoaderCircle
                                                    size={17}
                                                    className="animate-spin"
                                                />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={17} />
                                                Analyze Food with AI
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* AI error */}
                                {aiError && (
                                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                                        <AlertCircle
                                            size={19}
                                            className="mt-0.5 shrink-0 text-red-600"
                                        />

                                        <div>
                                            <p className="font-semibold text-red-700 dark:text-red-400">
                                                AI analysis unavailable
                                            </p>

                                            <p className="mt-1 text-sm leading-6 text-red-600 dark:text-red-300">
                                                {aiError}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Structured AI result */}
                                {aiAnalysis && (
                                    <div className="relative mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:p-6">

                                        {/* Close button */}
                                        <button
                                            type="button"
                                            onClick={() => setAiAnalysis(null)}
                                            className="absolute right-3 top-3 rounded-lg p-1.5 text-[var(--text-secondary)] transition hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                                            aria-label="Close AI analysis"
                                        >
                                            <X size={16} />
                                        </button>

                                        {/* Analysis header */}
                                        <div className="mb-6 flex items-center gap-2 pr-8">
                                            <Sparkles
                                                size={18}
                                                className="text-[var(--primary)]"
                                            />

                                            <h3 className="text-base font-semibold text-[var(--text-primary)]">
                                                AI Analysis
                                            </h3>
                                        </div>

                                        <div className="space-y-6">

                                            {/* Summary */}
                                            {aiAnalysis.summary && (
                                                <div>
                                                    <h4 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                                                        1. Summary
                                                    </h4>

                                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                                                        <p className="text-sm leading-7 text-[var(--text-secondary)]">
                                                            {aiAnalysis.summary}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Food category */}
                                            {aiAnalysis.food_category && (
                                                <div>
                                                    <h4 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                                                        2. Food Category
                                                    </h4>

                                                    <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)]">
                                                        {aiAnalysis.food_category}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Important information */}
                                            {Array.isArray(
                                                aiAnalysis.important_information,
                                            ) &&
                                                aiAnalysis.important_information
                                                    .length > 0 && (
                                                    <div>
                                                        <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                                                            3. Important Information
                                                        </h4>

                                                        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                                            <div className="overflow-x-auto">
                                                                <table className="min-w-full text-sm">
                                                                    <thead className="bg-[var(--surface-muted)]">
                                                                        <tr className="border-b border-[var(--border)]">
                                                                            <th className="px-4 py-3 text-left font-semibold text-[var(--text-primary)]">
                                                                                Information
                                                                            </th>

                                                                            <th className="px-4 py-3 text-left font-semibold text-[var(--text-primary)]">
                                                                                Details
                                                                            </th>
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody>
                                                                        {aiAnalysis.important_information.map(
                                                                            (
                                                                                item,
                                                                                index,
                                                                            ) => (
                                                                                <tr
                                                                                    key={`${item.label}-${index}`}
                                                                                    className="border-b border-[var(--border)] last:border-b-0"
                                                                                >
                                                                                    <td className="px-4 py-3 align-top font-medium text-[var(--text-primary)]">
                                                                                        {item.label ||
                                                                                            "Information"}
                                                                                    </td>

                                                                                    <td className="px-4 py-3 align-top leading-6 text-[var(--text-secondary)]">
                                                                                        {item.value ||
                                                                                            "—"}
                                                                                    </td>
                                                                                </tr>
                                                                            ),
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Missing information */}
                                            <div>
                                                <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                                                    4. Missing Information
                                                </h4>

                                                {Array.isArray(
                                                    aiAnalysis.missing_information,
                                                ) &&
                                                aiAnalysis.missing_information
                                                    .length > 0 ? (
                                                    <ul className="space-y-2">
                                                        {aiAnalysis.missing_information.map(
                                                            (
                                                                item,
                                                                index,
                                                            ) => (
                                                                <li
                                                                    key={`${item}-${index}`}
                                                                    className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                                                                >
                                                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />

                                                                    <span className="text-sm leading-6 text-[var(--text-secondary)]">
                                                                        {item}
                                                                    </span>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                ) : (
                                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                                                        <p className="text-sm text-[var(--text-secondary)]">
                                                            No additional missing information
                                                            was identified from the provided data.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Dietary tags */}
                                            <div>
                                                <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                                                    5. Dietary Tags
                                                </h4>

                                                {Array.isArray(
                                                    aiAnalysis.dietary_tags,
                                                ) &&
                                                aiAnalysis.dietary_tags
                                                    .length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {aiAnalysis.dietary_tags.map(
                                                            (
                                                                tag,
                                                                index,
                                                            ) => (
                                                                <span
                                                                    key={`${tag}-${index}`}
                                                                    className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)]"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-[var(--text-secondary)]">
                                                        No dietary tags were provided.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Safety disclaimer */}
                                        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                                            <div className="flex items-start gap-2">
                                                <Info
                                                    size={17}
                                                    className="mt-0.5 shrink-0 text-amber-600"
                                                />

                                                <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
                                                    This is an AI-generated analysis based
                                                    only on the information you provided.
                                                    It does not certify food safety. Please
                                                    verify the information yourself before
                                                    submitting the donation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Link
                                to="/donor/donations"
                                className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)]"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save size={17} />

                                {loading
                                    ? "Creating Donation..."
                                    : "Create Donation"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default CreateDonation;