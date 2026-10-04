import {
  ArrowRight,
  Leaf,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";


function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const {
    isDark,
    toggleTheme,
  } = useTheme();


  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };


  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] transition-transform duration-200 group-hover:scale-105">
            <Leaf
              size={20}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <p className="text-sm font-bold tracking-tight text-[var(--text-primary)] sm:text-base">
              Smart Food Waste
            </p>

            <p className="hidden text-[10px] font-medium text-[var(--text-muted)] sm:block">
              Community Impact Platform
            </p>
          </div>
        </Link>


        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)]"
          >
            How It Works
          </a>

          <a
            href="#impact"
            className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)]"
          >
            Our Impact
          </a>

          <a
            href="#ai"
            className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)]"
          >
            AI Assistance
          </a>
        </nav>


        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">

          {/* Theme */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            aria-label={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {isDark ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}
          </button>

          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="group flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-md"
          >
            Get Started

            <ArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>


        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)]"
            aria-label={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {isDark ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (current) => !current,
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X size={19} />
            ) : (
              <Menu size={19} />
            )}
          </button>
        </div>
      </div>


      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

            <nav className="flex flex-col gap-1">

              <a
                href="#how-it-works"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              >
                How It Works
              </a>

              <a
                href="#impact"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              >
                Our Impact
              </a>

              <a
                href="#ai"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              >
                AI Assistance
              </a>

              <div className="my-2 border-t border-[var(--border)]" />

              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={closeMobileMenu}
                className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;