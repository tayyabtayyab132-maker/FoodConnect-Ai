function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName = "",
}) {
  return (
    <div className="surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
          >
            <Icon size={21} />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;