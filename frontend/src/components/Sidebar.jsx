import {
  BarChart3,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  PlusCircle,
  Settings,
  Sun,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role;

  const organizationNavigation = [
    {
      label: "Dashboard",
      path: "/organization/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Available Donations",
      path: "/organization/donations",
      icon: UtensilsCrossed,
    },
    {
      label: "My Requests",
      path: "/organization/requests",
      icon: ClipboardList,
    },
    {
      label: "Completed",
      path: "/organization/completed",
      icon: FileText,
    },
    {
      label: "Profile",
      path: "/organization/profile",
      icon: Settings,
    },
  ];

  const donorNavigation = [
    {
      label: "Dashboard",
      path: "/donor/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Donations",
      path: "/donor/donations",
      icon: Package,
    },
    {
      label: "Create Donation",
      path: "/donor/donations/create",
      icon: PlusCircle,
    },
    {
      label: "Organizations",
      path: "/donor/organizations",
      icon: Users,
    },
    {
      label: "Requests",
      path: "/donor/requests",
      icon: ClipboardList,
    },
    {
      label: "Profile",
      path: "/donor/profile",
      icon: Settings,
    },
  ];

  const adminNavigation = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Donations",
      path: "/admin/donations",
      icon: Package,
    },
    {
      label: "Requests",
      path: "/admin/requests",
      icon: ClipboardList,
    },
    {
      label: "Audit Logs",
      path: "/admin/audit-logs",
      icon: FileText,
    },
  ];

  let navigation = [];

  if (role === "organization") {
    navigation = organizationNavigation;
  } else if (role === "donor") {
    navigation = donorNavigation;
  } else if (role === "admin") {
    navigation = adminNavigation;
  }

  /*
   * Active-link logic
   *
   * Exact matches are used for normal navigation items.
   *
   * This prevents:
   *
   * /donor/donations
   *
   * from also becoming active when the user visits:
   *
   * /donor/donations/create
   * /donor/donations/123
   *
   * Special handling is added for detail pages so they still belong
   * to the correct section without causing sibling items to activate.
   */
  const isActive = (path) => {
    if (location.pathname === path) {
      return true;
    }

    // My Donations should also be considered active on a
    // donation detail page, but NOT on Create Donation.
    if (path === "/donor/donations") {
      return (
        location.pathname.startsWith("/donor/donations/") &&
        location.pathname !== "/donor/donations/create"
      );
    }

    // Available Donations should also remain active on
    // organization donation detail pages.
    if (path === "/organization/donations") {
      return location.pathname.startsWith(
        "/organization/donations/",
      );
    }

    // My Requests should remain active on organization
    // request detail pages.
    if (path === "/organization/requests") {
      return location.pathname.startsWith(
        "/organization/requests/",
      );
    }

    // Donor Requests should remain active on request detail pages.
    if (path === "/donor/requests") {
      return location.pathname.startsWith("/donor/requests/");
    }

    return false;
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-[var(--border)] bg-[var(--surface)] lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-[var(--border)] px-6">
          <Link
            to={
              role === "organization"
                ? "/organization/dashboard"
                : role === "donor"
                  ? "/donor/dashboard"
                  : role === "admin"
                    ? "/admin/dashboard"
                    : "/"
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
              <UtensilsCrossed size={21} />
            </div>

            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                FoodConnect
              </p>

              <p className="text-xs text-[var(--text-secondary)]">
                Smart Food Donation
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Menu
          </p>

          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon
                    size={19}
                    className={
                      active
                        ? "text-white"
                        : "text-[var(--text-secondary)] group-hover:text-[var(--primary)]"
                    }
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-[var(--border)] p-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="mb-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
          >
            {theme === "dark" ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}

            <span>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:hidden">
        <Link
          to={
            role === "organization"
              ? "/organization/dashboard"
              : role === "donor"
                ? "/donor/dashboard"
                : role === "admin"
                  ? "/admin/dashboard"
                  : "/"
          }
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <UtensilsCrossed size={18} />
          </div>

          <span className="text-sm font-bold text-[var(--text-primary)]">
            FoodConnect
          </span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)]"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>
      </div>
    </>
  );
}

export default Sidebar;