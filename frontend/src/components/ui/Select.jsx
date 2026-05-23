import { cx } from "@/utils/cx";

function Select({
  label,
  error,
  helperText,
  className,
  id,
  options = [],
  ...props
}) {
  const selectId = id || props.name;

  return (
    <label className="block space-y-2">
      {label ? (
        <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          {label}
        </span>
      ) : null}

      <div className="relative">
        <select
          id={selectId}
          className={cx(
            "w-full appearance-none rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)] pr-10",
            className,
          )}
          {...props}
        >
          {options.map((opt) => {
            const val = typeof opt === "object" ? opt.value : opt;
            const lbl = typeof opt === "object" ? opt.label : opt;
            return (
              <option
                key={val}
                value={val}
                className="bg-[var(--surface-strong)] text-[var(--text)]"
              >
                {lbl}
              </option>
            );
          })}
        </select>

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>

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

export default Select;
