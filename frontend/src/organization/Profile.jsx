import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/auth/me");

      setProfile(response.data?.data || null);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to load your profile.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const displayProfile = profile || user;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--primary)]">
                Organization workspace
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                Profile
              </h1>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                View the account information associated with your
                organization.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadProfile(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />

              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="font-semibold text-red-700 dark:text-red-400">
                  Unable to load profile
                </p>

                <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => loadProfile()}
                  className="mt-3 text-sm font-semibold text-red-700 underline dark:text-red-400"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <Loading message="Loading your profile..." />
          ) : displayProfile ? (
            <div className="mt-8 space-y-6">
              {/* Profile overview */}
              <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-6 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                      <Building2
                        size={30}
                        className="text-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        {displayProfile.name}
                      </h2>

                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        Organization account
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
                  {/* Name */}
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2
                        size={17}
                        className="text-[var(--primary)]"
                      />

                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                        Organization Name
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                      {displayProfile.name}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <div className="flex items-center gap-2">
                      <Mail
                        size={17}
                        className="text-[var(--primary)]"
                      />

                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                        Email Address
                      </p>
                    </div>

                    <p className="mt-2 break-all text-sm font-medium text-[var(--text-primary)]">
                      {displayProfile.email}
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      Account Type
                    </p>

                    <p className="mt-2 text-sm font-medium capitalize text-[var(--text-primary)]">
                      {displayProfile.role}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      Account Status
                    </p>

                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                      <ShieldCheck size={15} />
                      {displayProfile.status || "ACTIVE"}
                    </div>
                  </div>
                </div>
              </section>

              {/* Account information */}
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                    <ShieldCheck
                      size={20}
                      className="text-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)]">
                      Account Information
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                      Your account is authenticated and managed by
                      the Smart Food Waste Management platform.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-[var(--surface-muted)] p-4">
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    Profile editing is not enabled yet. We will add
                    editable organization information after the core
                    donation and request workflows are complete.
                  </p>
                </div>
              </section>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
              <Building2
                size={28}
                className="mx-auto text-[var(--text-secondary)]"
              />

              <h2 className="mt-3 font-semibold text-[var(--text-primary)]">
                Profile information unavailable
              </h2>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                We could not find your account information.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;