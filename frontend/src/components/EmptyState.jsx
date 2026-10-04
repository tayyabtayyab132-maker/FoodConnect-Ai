import { Inbox } from "lucide-react";

function EmptyState({
  title = "Nothing here yet",
  description = "There is nothing to display at the moment.",
  icon: Icon = Inbox,
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] shadow-sm">
        <Icon size={25} strokeWidth={1.8} />
      </div>

      <h3 className="mt-5 text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;