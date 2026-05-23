import { cx } from "@/utils/cx";

const variantClasses = {
  primary:
    "bg-[var(--primary)] text-[#120c00] hover:bg-[var(--primary-soft)] shadow-glow",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)]",
  ghost:
    "bg-transparent text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--primary-soft)_22%,transparent)]",
};

function Button({
  children,
  className,
  variant = "primary",
  loading = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Procesando..." : children}
    </button>
  );
}

export default Button;
