import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Loading from "../components/Loading";
import api from "../services/api";

function Organizations() {
  const [organizations, setOrganizations] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const loadOrganizations = async (
    showRefreshState = false,
  ) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/organizations");

      setOrganizations(response.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to load organizations.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const filteredOrganizations = organizations.filter(
    (organization) => {
      const search = searchTerm.trim().toLowerCase();

      if (!search) {
        return true;
      }

      return (
        organization.name
          ?.toLowerCase()
          .includes(search) ||
        organization.email
          ?.toLowerCase()
          .includes(search)
      );
    },
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--primary)]">
                Donor workspace
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                Organizations
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                View organizations participating in the food
                donation network.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadOrganizations(true)}
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

          {/* Search */}
          <div className="mt-6">
            <div className="relative max-w-xl">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search organizations..."
                className="form-input pl-10"
              />
            </div>
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
                  Unable to load organizations
                </p>

                <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => loadOrganizations()}
                  className="mt-3 text-sm font-semibold text-red-700 underline dark:text-red-400"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <Loading message="Loading organizations..." />
          ) : filteredOrganizations.length === 0 ? (
            /* Empty state */
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-muted)]">
                <Building2
                  size={28}
                  className="text-[var(--text-secondary)]"
                />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
                {searchTerm
                  ? "No organizations found"
                  : "No organizations available"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                {searchTerm
                  ? "Try changing your search term."
                  : "Organizations will appear here when they join the platform."}
              </p>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-5 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            /* Organization cards */
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredOrganizations.map(
                (organization) => (
                  <article
                    key={organization.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                        <Building2
                          size={24}
                          className="text-[var(--primary)]"
                        />
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <ShieldCheck size={13} />
                        Organization
                      </div>
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                      {organization.name}
                    </h2>

                    <div className="mt-4 flex items-start gap-2.5">
                      <Mail
                        size={17}
                        className="mt-0.5 shrink-0 text-[var(--text-secondary)]"
                      />

                      <p className="break-all text-sm leading-6 text-[var(--text-secondary)]">
                        {organization.email}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-[var(--border)] pt-4">
                      <p className="text-xs leading-5 text-[var(--text-secondary)]">
                        This organization can request surplus
                        food donations and coordinate collection
                        through the platform.
                      </p>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}

          {/* Result count */}
          {!loading &&
            filteredOrganizations.length > 0 && (
              <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
                Showing {filteredOrganizations.length}{" "}
                {filteredOrganizations.length === 1
                  ? "organization"
                  : "organizations"}
              </p>
            )}
        </div>
      </main>
    </div>
  );
}

export default Organizations;