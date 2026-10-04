import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Leaf,
  MapPin,
  PackageCheck,
  Recycle,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Utensils,
} from "lucide-react";

import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";


function Landing() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

      <Navbar />


      {/* =====================================================
          HERO
      ===================================================== */}

      <main>

        <section className="relative overflow-hidden">

          {/* Soft background decoration */}
          <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[var(--primary-soft)] opacity-60 blur-3xl" />

          <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[var(--info-soft)] opacity-40 blur-3xl" />


          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:px-8 lg:pb-28 lg:pt-24">

            {/* Hero copy */}
            <div className="animate-fade-in">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)] shadow-sm">
                <Sparkles size={14} />
                Technology for community impact
              </div>


              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">

                Turn Surplus Food Into

                <span className="mt-2 block text-[var(--primary)]">
                  Community Impact.
                </span>

              </h1>


              <p className="mt-6 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
                Connect surplus food from cafeterias,
                restaurants, bakeries and food businesses
                with organizations that can distribute it
                where it is needed.
              </p>


              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/signup"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-md"
                >
                  Start Making an Impact

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>


                <a
                  href="#how-it-works"
                  className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
                >
                  See How It Works
                </a>

              </div>


              {/* Trust points */}
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">

                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                  <CheckCircle2
                    size={15}
                    className="text-[var(--primary)]"
                  />
                  Simple donation workflow
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                  <ShieldCheck
                    size={15}
                    className="text-[var(--primary)]"
                  />
                  Backend-controlled actions
                </div>

              </div>

            </div>


            {/* Hero visual */}
            <div className="relative animate-slide-up lg:pl-8">

              <div className="relative mx-auto max-w-md">

                {/* Main dashboard card */}
                <div className="surface overflow-hidden p-5 shadow-[var(--shadow-lg)]">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Today's impact
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        Community food flow
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                      <Leaf size={20} />
                    </div>

                  </div>


                  <div className="mt-6 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-[var(--surface-secondary)] p-4">
                      <PackageCheck
                        size={18}
                        className="text-[var(--primary)]"
                      />

                      <p className="mt-3 text-2xl font-bold">
                        30
                      </p>

                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Meals available
                      </p>
                    </div>


                    <div className="rounded-xl bg-[var(--surface-secondary)] p-4">
                      <HeartHandshake
                        size={18}
                        className="text-[var(--primary)]"
                      />

                      <p className="mt-3 text-2xl font-bold">
                        20
                      </p>

                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Meals requested
                      </p>
                    </div>

                  </div>


                  {/* Donation flow */}
                  <div className="mt-4 rounded-xl border border-[var(--border)] p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                        <Utensils size={17} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">

                          <div>
                            <p className="text-sm font-semibold">
                              Vegetable Rice
                            </p>

                            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                              30 meals · Prepared today
                            </p>
                          </div>

                          <span className="rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--success)]">
                            AVAILABLE
                          </span>

                        </div>


                        <div className="mt-4 flex items-center gap-4 text-xs text-[var(--text-secondary)]">

                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} />
                            2.4 km
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Clock3 size={13} />
                            Today
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* AI status */}
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--primary-soft)] p-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--primary)]">
                      <Bot size={16} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[var(--primary)]">
                        AI-assisted coordination
                      </p>

                      <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                        Matching, logistics and workflow summaries
                      </p>
                    </div>

                  </div>

                </div>


                {/* Floating mini card */}
                <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-md)] sm:block">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                      <HeartHandshake size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        Donation connected
                      </p>

                      <p className="text-[11px] text-[var(--text-muted)]">
                        Community organization
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            IMPACT
        ===================================================== */}

        <section
          id="impact"
          className="border-y border-[var(--border)] bg-[var(--surface)]"
        >

          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">

              <ImpactStat
                icon={PackageCheck}
                value="30+"
                label="Meals can be shared"
              />

              <ImpactStat
                icon={Building2}
                value="10+"
                label="Community organizations"
              />

              <ImpactStat
                icon={Users}
                value="25+"
                label="Potential community connections"
              />

              <ImpactStat
                icon={Recycle}
                value="1"
                label="Shared mission"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section
          id="how-it-works"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        >

          <SectionHeading
            eyebrow="Simple workflow"
            title="From surplus to community impact"
            description="The platform keeps the process simple for donors and recipient organizations while handling the operational rules in the backend."
          />


          <div className="mt-12 grid gap-5 md:grid-cols-3">

            <WorkflowCard
              number="01"
              icon={Utensils}
              title="Share surplus food"
              description="Donors provide the food details, quantity, preparation information, collection details and available deadline."
            />

            <WorkflowCard
              number="02"
              icon={HeartHandshake}
              title="Connect with organizations"
              description="Recipient organizations discover available donations and submit requests based on their needs."
            />

            <WorkflowCard
              number="03"
              icon={Truck}
              title="Coordinate collection"
              description="Once a request is accepted, collection and receipt are confirmed through a clear workflow."
            />

          </div>

        </section>


        {/* =====================================================
            AI
        ===================================================== */}

        <section
          id="ai"
          className="border-y border-[var(--border)] bg-[var(--surface)]"
        >

          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">

            <SectionHeading
              eyebrow="AI-assisted platform"
              title="AI helps coordinate. The backend stays in control."
              description="AI provides explanations, summaries and suggestions while deterministic backend rules remain responsible for important application decisions."
            />


            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <AgentCard
                icon={Utensils}
                title="Food Inventory"
                description="Organizes and summarizes donor-provided food information."
              />

              <AgentCard
                icon={HeartHandshake}
                title="Matching"
                description="Explains why a donation may fit an organization's verified needs."
              />

              <AgentCard
                icon={Truck}
                title="Logistics"
                description="Provides practical collection suggestions using supplied information."
              />

              <AgentCard
                icon={Bot}
                title="Coordinator"
                description="Creates human-friendly workflow summaries and next actions."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            CTA
        ===================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

          <div className="relative overflow-hidden rounded-3xl bg-[var(--primary)] px-6 py-12 text-white sm:px-10 lg:px-14">

            <div className="relative z-10 max-w-2xl">

              <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                Start today
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Have surplus food?
                <br />
                Turn it into something useful.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/80">
                Create a donor account or join as a community
                organization and start connecting surplus food
                with people who can use it.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/signup"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[var(--primary)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Create an account

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  to="/login"
                  className="flex items-center justify-center rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  I already have an account
                </Link>

              </div>

            </div>


            <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-28 -right-4 h-80 w-80 rounded-full border border-white/10" />

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <Leaf size={16} />
            </div>

            <span className="text-sm font-semibold">
              Smart Food Waste
            </span>

          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Building better connections around surplus food.
          </p>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   REUSABLE SECTIONS
   ========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">

      <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
        {description}
      </p>

    </div>
  );
}


function ImpactStat({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div className="text-center">

      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
        <Icon size={19} />
      </div>

      <p className="mt-4 text-2xl font-bold sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-xs text-[var(--text-secondary)] sm:text-sm">
        {label}
      </p>

    </div>
  );
}


function WorkflowCard({
  number,
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="surface surface-hover relative p-6">

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Icon size={21} />
        </div>

        <span className="text-3xl font-bold text-[var(--border-strong)]">
          {number}
        </span>

      </div>

      <h3 className="mt-6 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>

    </div>
  );
}


function AgentCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="surface surface-hover p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
        <Icon size={19} />
      </div>

      <h3 className="mt-5 text-sm font-bold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
        {description}
      </p>

    </div>
  );
}


export default Landing;