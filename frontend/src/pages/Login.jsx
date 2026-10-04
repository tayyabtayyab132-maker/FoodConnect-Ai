import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";


function Login() {
  const navigate = useNavigate();

  const {
    login,
    loading,
  } = useAuth();

  const {
    isDark,
    toggleTheme,
  } = useTheme();


  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const email =
      form.email.trim();

    const password =
      form.password;


    if (!email) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password.",
      );
      return;
    }


    try {
      const result = await login({
        email,
        password,
      });


      const role =
        result?.user?.role;


      if (role === "admin") {
        navigate(
          "/admin/dashboard",
          { replace: true },
        );
      } else if (role === "donor") {
        navigate(
          "/donor/dashboard",
          { replace: true },
        );
      } else if (
        role === "organization"
      ) {
        navigate(
          "/organization/dashboard",
          { replace: true },
        );
      } else {
        navigate(
          "/dashboard",
          { replace: true },
        );
      }

    } catch (requestError) {
      const message =
        requestError?.response?.data?.detail;

      if (
        typeof message === "string"
      ) {
        setError(message);
      } else if (
        message?.message
      ) {
        setError(
          message.message,
        );
      } else {
        setError(
          "Unable to sign in. Please check your details and try again.",
        );
      }
    }
  };


  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="border-b border-[var(--border)] bg-[var(--surface)]">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link
            to="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Leaf
                size={20}
                strokeWidth={2.2}
              />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight sm:text-base">
                Smart Food Waste
              </p>

              <p className="hidden text-[10px] text-[var(--text-muted)] sm:block">
                Community Impact Platform
              </p>
            </div>

          </Link>


          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            aria-label={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {isDark ? (
              <span>☀</span>
            ) : (
              <span>☾</span>
            )}
          </button>

        </div>

      </header>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">

        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] lg:grid-cols-2">


          {/* =================================================
              LEFT INFORMATION PANEL
          ================================================= */}

          <div className="hidden bg-[var(--primary)] p-10 text-white lg:flex lg:flex-col lg:justify-between">

            <div>

              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                <ArrowLeft size={15} />
                Back to home
              </Link>


              <div className="mt-16">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <Leaf
                    size={25}
                    strokeWidth={1.9}
                  />
                </div>


                <h1 className="mt-7 text-3xl font-bold leading-tight">
                  Welcome back.
                  <br />
                  Let's continue the impact.
                </h1>


                <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
                  Sign in to manage food donations,
                  connect with organizations and
                  coordinate community food recovery.
                </p>

              </div>

            </div>


            <div className="space-y-4">

              <InfoPoint
                icon={ShieldCheck}
                text="Secure role-based access"
              />

              <InfoPoint
                icon={Leaf}
                text="Keep surplus food moving"
              />

              <InfoPoint
                icon={LockKeyhole}
                text="Your account stays protected"
              />

            </div>

          </div>


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <div className="p-6 sm:p-10">

            <div className="mx-auto max-w-md">

              {/* Mobile back */}
              <Link
                to="/"
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] lg:hidden"
              >
                <ArrowLeft size={15} />
                Back to home
              </Link>


              <div>

                <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                  Welcome back
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  Sign in to your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  Access your donations, requests and
                  community connections.
                </p>

              </div>


              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-4 py-3"
                >
                  <p className="text-sm font-medium text-[var(--danger)]">
                    {error}
                  </p>
                </div>
              )}


              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    />

                  </div>

                </div>


                {/* Password */}
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold"
                    >
                      Password
                    </label>

                  </div>


                  <div className="relative">

                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 pl-11 pr-12 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current,
                        )
                      }
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
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
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in

                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}

                </button>

              </form>


              {/* Signup */}
              <p className="mt-7 text-center text-sm text-[var(--text-secondary)]">

                Don't have an account?

                {" "}

                <Link
                  to="/signup"
                  className="font-semibold text-[var(--primary)] hover:underline"
                >
                  Create one
                </Link>

              </p>


              {/* Demo Admin */}
              <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] p-4">

                <p className="text-xs font-bold text-[var(--text-primary)]">
                  Demo administrator
                </p>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  For local development and hackathon demonstration.
                </p>

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">

                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                    <span className="text-[var(--text-muted)]">
                      Email
                    </span>

                    <p className="mt-0.5 break-all font-medium">
                      admin@example.com
                    </p>
                  </div>

                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                    <span className="text-[var(--text-muted)]">
                      Password
                    </span>

                    <p className="mt-0.5 font-medium">
                      admin123
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   INFO POINT
   ========================================================= */

function InfoPoint({
  icon: Icon,
  text,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
        <Icon size={16} />
      </div>

      <span className="text-sm text-white/80">
        {text}
      </span>

    </div>
  );
}


export default Login;