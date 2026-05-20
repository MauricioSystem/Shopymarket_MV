import { cx } from "@/utils/cx";
import { useState } from "react";

function BrandMark({
  compact = false,
  mode = "customer",
  logoSrc = "/logoDiseño.png",
  tone = "dark",
}) {
  const [logoError, setLogoError] = useState(false);
  const modeLabel = mode === "vendor" ? "Modo vendedor" : "Modo cliente";
  const textToneClass = tone === "light" ? "text-white" : "text-[var(--text)]";
  const mutedToneClass = tone === "light" ? "text-white/60" : "text-[var(--text-muted)]";

  return (
    <div className={cx("flex items-center gap-4", compact ? "scale-95" : "")}> 
      <div className="relative flex items-center">
        <div
          aria-hidden
          className="h-16 w-16 rounded-[1.25rem] bg-center bg-no-repeat bg-contain sm:h-20 sm:w-20"
          style={{ backgroundImage: `url(${logoSrc})` }}
        />
      </div>

      <div className="space-y-1">
        <h1 className={cx("font-display text-xl font-bold tracking-[0.05em] sm:text-2xl", textToneClass)}>
          ShopyMarket MV
        </h1>
      </div>
    </div>
  );
}

export default BrandMark;
