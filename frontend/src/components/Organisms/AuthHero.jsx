import BrandMark from "@/components/Atoms/BrandMark";
import { AUTH_ROLES } from "@/utils/authRoles";

const heroCopy = {
  customer: {
    eyebrow: "Experiencia para compradores",
    title: "Compra productos increíbles y contrata servicios en un solo lugar",
    description: "",
    highlights: [
      "Explora con rapidez",
      "Compra con claridad",
      "Acceso inmediato",
    ],
    metricLabel: "Compras",
    metricValue: "Rápidas",
  },
  vendor: {
    eyebrow: "Experiencia para vendedores",
    title:
      "Un panel premium para vender con presencia, control y una estética más ejecutiva.",
    description:
      "El modo vendedor sube el contraste, refuerza la lectura y transmite una sensación más corporativa sin perder la identidad de la marca.",
    highlights: [
      "Catálogo bajo control",
      "Ventas visibles",
      "Marca más sólida",
    ],
    metricLabel: "Ventas",
    metricValue: "Premium",
  },
  delivery: {
    eyebrow: "Experiencia para delivery",
    title:
      "Un panel práctico para organizar entregas, rutas y estados con claridad.",
    description:
      "El modo repartidor usa tonalidades café para diferenciarse visualmente sin cambiar la estructura actual.",
    highlights: ["Rutas claras", "Estados visibles", "Seguimiento ágil"],
    metricLabel: "Entregas",
    metricValue: "Activas",
  },
};

function AuthHero({
  accessRole,
  isVendorMode,
  onToggleVendorMode,
  onSelectRole,
}) {
  const isDeliveryMode = accessRole === AUTH_ROLES.DELIVERY;
  const theme = isDeliveryMode
    ? heroCopy.delivery
    : isVendorMode
      ? heroCopy.vendor
      : heroCopy.customer;
  const heroShellClass = isVendorMode
    ? "bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_26%),linear-gradient(155deg,rgba(3,7,15,0.96),rgba(10,16,30,0.92))]"
    : isDeliveryMode
      ? "bg-[radial-gradient(circle_at_top_left,rgba(72,42,20,0.94),transparent_22%),radial-gradient(circle_at_top_right,rgba(245,211,103,0.22),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(201,147,90,0.22),transparent_30%),linear-gradient(155deg,rgba(39,23,12,0.98),rgba(109,74,43,0.94))]"
      : "bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.28),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(91,141,255,0.12),transparent_28%),linear-gradient(155deg,rgba(255,252,244,0.98),rgba(248,244,233,0.95))]";
  const pillClass = isVendorMode
    ? "border-white/10 bg-white/5 text-white/78 hover:bg-white/10"
    : isDeliveryMode
      ? "border-[rgba(201,147,90,0.34)] bg-[rgba(110,76,42,0.84)] text-[#f7d98d] hover:bg-[rgba(122,82,44,0.96)]"
      : "border-[rgba(201,150,12,0.18)] bg-[rgba(245,211,103,0.13)] text-[#1a1200] hover:bg-[rgba(245,211,103,0.2)]";
  const customerTextClass = isDeliveryMode
    ? "text-[#2a1a0d]"
    : "text-[#1a1200]";
  const customerMutedClass = isDeliveryMode
    ? "text-[#f4d9ad]/80"
    : "text-[#7a6a48]";
  const themeLabel = isDeliveryMode
    ? "delivery"
    : isVendorMode
      ? "vendor"
      : "customer";

  return (
    <section
      className={`relative flex h-full min-h-0 flex-col justify-center overflow-hidden px-6 py-6 sm:px-8 lg:px-10 xl:px-12 ${heroShellClass}`}
    >
      <div
        className={
          isVendorMode
            ? "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-25 [mask-image:linear-gradient(to_bottom,white,transparent_92%)]"
            : "absolute inset-0 bg-[linear-gradient(rgba(26,18,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(26,18,0,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-22 [mask-image:linear-gradient(to_bottom,white,transparent_92%)]"
        }
      />
      <div
        className={
          isVendorMode
            ? "absolute -left-16 top-20 h-44 w-44 rounded-full bg-[rgba(245,211,103,0.12)] blur-3xl animate-float"
            : "absolute -left-16 top-20 h-52 w-52 rounded-full bg-[rgba(91,141,255,0.16)] blur-3xl animate-float"
        }
      />
      <div
        className={
          isVendorMode
            ? "absolute right-0 top-14 h-60 w-60 rounded-full bg-[rgba(255,255,255,0.06)] blur-3xl animate-float"
            : "absolute right-0 top-14 h-60 w-60 rounded-full bg-[rgba(245,211,103,0.18)] blur-3xl animate-float"
        }
      />
      <div
        className={
          isVendorMode
            ? "absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(245,211,103,0.1)] blur-3xl"
            : "absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(91,141,255,0.09)] blur-3xl"
        }
      />

      <div className="relative flex flex-col gap-5">
        <div className="max-w-2xl">
          <BrandMark
            mode={themeLabel}
            tone={isVendorMode || isDeliveryMode ? "light" : "dark"}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onToggleVendorMode(false)}
            className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] transition-all duration-300 ${pillClass}`}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_0_6px_rgba(245,211,103,0.15)]" />
            Cliente
          </button>
          <button
            type="button"
            onClick={() => onToggleVendorMode(true)}
            className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] transition-all duration-300 ${pillClass}`}
          >
            <span
              className={
                isVendorMode
                  ? "h-2 w-2 rounded-full bg-white/70 shadow-[0_0_0_6px_rgba(255,255,255,0.08)]"
                  : "h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_0_6px_rgba(245,211,103,0.15)]"
              }
            />
            Vendedor
          </button>
          <button
            type="button"
            onClick={() => onSelectRole?.(AUTH_ROLES.DELIVERY)}
            className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] transition-all duration-300 ${isDeliveryMode ? "border-[rgba(140,90,43,0.2)] bg-[rgba(140,90,43,0.14)] text-[#2a1a0d]" : "border-[rgba(140,90,43,0.16)] bg-[rgba(140,90,43,0.08)] text-[#6f5a42] hover:bg-[rgba(140,90,43,0.12)]"}`}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_0_6px_rgba(140,90,43,0.12)]" />
            Delivery
          </button>
        </div>

        <div className="max-w-2xl space-y-4">
          <p
            className={
              isVendorMode
                ? "text-xs font-bold uppercase tracking-[0.5em] text-white/60"
                : `text-xs font-bold uppercase tracking-[0.5em] ${customerMutedClass}`
            }
          >
            {theme.eyebrow}
          </p>
          <h2
            className={
              isVendorMode
                ? "max-w-xl font-display text-3xl font-bold leading-[1.05] text-white sm:text-4xl xl:text-5xl"
                : isDeliveryMode
                  ? "max-w-xl font-display text-3xl font-bold leading-[1.05] text-[#f7d98d] sm:text-4xl xl:text-5xl"
                  : `max-w-xl font-display text-3xl font-bold leading-[1.05] ${customerTextClass} sm:text-4xl xl:text-5xl`
            }
          >
            {theme.title}
          </h2>
          <p
            className={
              isVendorMode
                ? "max-w-xl text-sm leading-7 text-white/70 sm:text-base"
                : isDeliveryMode
                  ? "max-w-xl text-sm leading-7 text-[#f6e4c7] sm:text-base"
                  : "max-w-xl text-sm leading-7 text-[#67583e] sm:text-base"
            }
          >
            {theme.description}
          </p>
        </div>

        <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
          {theme.highlights.map((item, index) => (
            <div
              key={item}
              className={
                isVendorMode
                  ? "rounded-[1.25rem] border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white/88 backdrop-blur-md"
                  : isDeliveryMode
                    ? `rounded-[1.25rem] border ${index === 1 ? "border-[rgba(247,217,141,0.82)]" : "border-[rgba(201,147,90,0.32)]"} bg-[rgba(110,76,42,0.76)] px-4 py-3 text-sm font-medium text-[#f7d98d] backdrop-blur-md`
                    : "rounded-[1.25rem] border border-[rgba(201,150,12,0.16)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-sm font-medium text-[#1a1200] backdrop-blur-md"
              }
              style={{ animationDelay: `${index * 90}ms` }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="sr-only">
        {isVendorMode
          ? "Negro grafito, dorado y una jerarquía más ejecutiva para vender con presencia."
          : isDeliveryMode
            ? "Tono café, claridad y una jerarquía visual más práctica para delivery."
            : "Dorado suave, más cercanía y un flujo visual que acompaña la compra sin ruido."}
      </div>
    </section>
  );
}

export default AuthHero;
