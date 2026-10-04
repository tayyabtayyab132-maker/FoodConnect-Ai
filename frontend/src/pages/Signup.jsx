import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  HeartHandshake,
  Leaf,
  Loader2,
  LogOut,
  Moon,
  Sun,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";


function RoleCard({
  selected,
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group w-full rounded-2xl border p-4 text-left transition",
        selected
          ? "border-[var(--primary)] bg-[var(--primary-soft)] shadow-sm"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition",
            selected
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--surface-muted)] text-[var(--text-secondary)] group-hover:text-[var(--primary)]",
          ].join(" ")}
        >
          <Icon size={21} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--text-primary)]">
              {title}
            </h3>

            {selected && (
              <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Selected
              </span>
            )}
          </div>

          <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}


function Signup() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const { theme, toggleTheme } = useTheme();

  const [role, setRole] = useState("organization");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };


  const handleLogout = () => {
    logout();

    setError("");
    setSuccess("");

    /*
     * Stay on the signup page.
     * The user can now create another account.
     */
  };


  const validateForm = () => {
    if (!form.name.trim()) {
      return "Please enter your name or organization name.";
    }

    if (!form.email.trim()) {
      return "Please enter your email address.";
    }

    if (!form.password) {
      return "Please enter a password.";
    }

    if (form.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (!form.confirmPassword) {
      return "Please confirm your password.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/signup", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
      });

      setSuccess(
        "Your account has been created successfully. Redirecting to sign in...",
      );

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (requestError) {
      const backendMessage =
        requestError.response?.data?.detail;

      setError(
        backendMessage ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
              <Leaf size={19} />
            </div>

            <span className="text-base font-bold tracking-tight sm:text-lg">
              FoodShare
            </span>
          </Link>


          <div className="flex items-center gap-2">

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:flex"
              >
                <LogOut size={16} />
                Sign out
              </button>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
            >
              {theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

          </div>
        </div>
      </header>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center px-5 py-10 sm:px-8 lg:py-14">

        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl lg:grid-cols-[0.85fr_1.15fr]">

          {/* =================================================
              LEFT INFORMATION PANEL
          ================================================== */}

          <section className="hidden bg-[var(--primary)] p-10 text-white lg:flex lg:flex-col lg:justify-between">

            <div>
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <HeartHandshake size={25} />
              </div>

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                Join the community
              </p>

              <h1 className="max-w-md text-4xl font-bold leading-tight">
                Turn surplus food into meaningful impact.
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-white/80">
                Connect food businesses with organizations
                that can help surplus food reach people who
                need it.
              </p>
            </div>


            <div className="space-y-4">

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm font-semibold">
                  For donors
                </p>

                <p className="mt-1 text-sm leading-6 text-white/75">
                  Share available surplus food and coordinate
                  collection with community organizations.
                </p>
              </div>


              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm font-semibold">
                  For organizations
                </p>

                <p className="mt-1 text-sm leading-6 text-white/75">
                  Discover available donations and request
                  quantities your organization can collect.
                </p>
              </div>

            </div>
          </section>


          {/* =================================================
              SIGNUP FORM
          ================================================== */}

          <section className="p-6 sm:p-9 lg:p-12">

            <div className="mx-auto max-w-xl">

              <Link
                to="/"
                className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
              >
                <ArrowLeft size={16} />
                Back to home
              </Link>


              {/* =================================================
                  AUTHENTICATED USER NOTICE
              ================================================== */}

              {isAuthenticated && user && (
                <div className="mb-7 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] p-4">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-sm font-semibold text-[var(--primary)]">
                        You are currently signed in
                      </p>

                      <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
                        Signed in as{" "}
                        <span className="font-medium text-[var(--text-primary)]">
                          {user.email}
                        </span>
                        .
                      </p>
                    </div>


                    <button
                      type="button"
                      onClick={handleLogout}
                      className="shrink-0 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      Sign out
                    </button>

                  </div>

                </div>
              )}


              <div className="mb-8">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <UserPlus size={23} />
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Choose how you want to participate in the
                  food donation community.
                </p>

              </div>


              {/* =================================================
                  ROLE SELECTION
              ================================================== */}

              <div className="mb-7">

                <label className="mb-3 block text-sm font-semibold">
                  I want to join as
                </label>

                <div className="grid gap-3 sm:grid-cols-2">

                  <RoleCard
                    selected={role === "organization"}
                    icon={HeartHandshake}
                    title="Organization"
                    description="Receive surplus food for your community."
                    onClick={() =>
                      setRole("organization")
                    }
                  />

                  <RoleCard
                    selected={role === "donor"}
                    icon={Building2}
                    title="Donor"
                    description="Share surplus food from your business."
                    onClick={() =>
                      setRole("donor")
                    }
                  />

                </div>
              </div>


              {/* =================================================
                  ERROR
              ================================================== */}

              {error && (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </div>
              )}


              {/* =================================================
                  SUCCESS
              ================================================== */}

              {success && (
                <div
                  role="status"
                  className="mb-6 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-4 py-3 text-sm text-[var(--primary)]"
                >
                  {success}
                </div>
              )}


              {/* =================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Name */}

                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold"
                  >
                    {role === "organization"
                      ? "Organization name"
                      : "Business / donor name"}
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={
                      role === "organization"
                        ? "e.g. Hope Community Kitchen"
                        : "e.g. Central Cafeteria"
                    }
                    autoComplete="organization"
                    disabled={loading}
                    className="input-field"
                  />

                </div>


                {/* Email */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="input-field"
                  />

                </div>


                {/* Password */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      disabled={loading}
                      className="input-field pr-12"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous,
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--primary)]"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>


                {/* Confirm Password */}

                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Confirm password
                  </label>

                  <div className="relative">

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Enter your password again"
                      autoComplete="new-password"
                      disabled={loading}
                      className="input-field pr-12"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous,
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--primary)]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>


                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create account
                    </>
                  )}
                </button>

              </form>


              {/* =================================================
                  LOGIN LINK
              ================================================== */}

              <p className="mt-7 text-center text-sm text-[var(--text-secondary)]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[var(--primary)] hover:underline"
                >
                  Sign in
                </Link>
              </p>


              <p className="mt-5 text-center text-xs leading-5 text-[var(--text-secondary)]">
                By creating an account, you agree to use the
                platform responsibly and provide accurate
                information about your organization or donations.
              </p>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default Signup;