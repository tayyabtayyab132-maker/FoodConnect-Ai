import { useEffect, useState } from "react";
import {
  Mail,
  User,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/auth/me");

      const profileData = response.data?.data;

      if (!profileData) {
        throw new Error("Unable to load profile information.");
      }

      setProfile(profileData);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.message ||
          "Unable to load your profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (loading && !profile) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="lg:ml-64">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-[var(--primary)]">
                Account
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                My Profile
              </h1>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                View your donor account information and account status.
              </p>
            </div>

            <button
              type="button"
              onClick={loadProfile}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Profile card */}
          <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            {/* Profile header */}
            <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-6 sm:px-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-sm">
                  <User size={36} />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                    {profile?.name || "Donor"}
                  </h2>

                  <p className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Mail size={15} />
                    {profile?.email || "No email available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                    <User size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                      Full Name
                    </p>

                    <p className="mt-1 font-semibold text-[var(--text-primary)]">
                      {profile?.name || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                    <Mail size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                      Email Address
                    </p>

                    <p className="mt-1 truncate font-semibold text-[var(--text-primary)]">
                      {profile?.email || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                    <Building2 size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                      Account Type
                    </p>

                    <p className="mt-1 font-semibold capitalize text-[var(--text-primary)]">
                      {profile?.role || "Donor"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                      Account Status
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        profile?.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      }`}
                    >
                      {profile?.status || "UNKNOWN"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account notice */}
            <div className="border-t border-[var(--border)] px-5 py-5 sm:px-8">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Your account information is managed by the platform.
                  Contact an administrator if you need to update account
                  details or resolve an account issue.
                </p>
              </div>
            </div>
          </section>

          {/* Logout */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;