function Loading({ message = "Loading..." }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-emerald-600" />
        <span>{message}</span>
      </div>
    </div>
  );
}

export default Loading;