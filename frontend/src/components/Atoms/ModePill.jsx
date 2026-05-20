import { cx } from "@/utils/cx";

function ModePill({ children, active = false, className }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.26em] transition-all duration-300",
        active
          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] text-[var(--text)]"
          : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export default ModePill;
