function ModeSwitchLink({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left text-sm font-semibold text-[var(--primary)] underline decoration-[color-mix(in_srgb,var(--primary)_60%,transparent)] decoration-2 underline-offset-4 transition hover:opacity-90 ${className}`}
    >
      {children}
    </button>
  );
}

export default ModeSwitchLink;
