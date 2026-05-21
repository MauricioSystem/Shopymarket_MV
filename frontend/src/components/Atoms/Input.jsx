import { cx } from "@/utils/cx";

function Input({
  label,
  error,
  helperText,
  className,
  id,
  type = "text",
  ...props
}) {
  const inputId = id || props.name;

  if (type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text)]">
        <input
          id={inputId}
          type={type}
          className={cx(
            "h-4 w-4 rounded border-[var(--border)] bg-[var(--surface-strong)] text-[var(--primary)] outline-none focus:ring-4 focus:ring-[var(--ring)]",
            className,
          )}
          {...props}
        />

        <span className="font-medium">{label}</span>
      </label>
    );
  }

  return (
    <label className="block space-y-2">
      {label ? (
        <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          {label}
        </span>
      ) : null}

      <input
        id={inputId}
        type={type}
        className={cx(
          "w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]",
          className,
        )}
        {...props}
      />

      {error ? (
        <span className="block text-xs font-medium text-red-500">{error}</span>
      ) : null}
      {!error && helperText ? (
        <span className="block text-xs text-[var(--text-muted)]">
          {helperText}
        </span>
      ) : null}
    </label>
  );
}

export default Input;
