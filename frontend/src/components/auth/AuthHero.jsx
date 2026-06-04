import BrandMark from "@/components/ui/BrandMark";
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
  administrator: {
    eyebrow: "Administración del sistema",
    title: "Panel central para la gestión global de ShopyMarket.",
    description:
      "Acceso reservado para la operación general de la plataforma con una interfaz ejecutiva y segura.",
    highlights: ["Control total", "Gestión global", "Acceso restringido"],
    metricLabel: "Sistema",
    metricValue: "Admin",
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
  isAdminLoginRoute = false,
  onToggleVendorMode,
  onSelectRole,
}) {
  const isAdministratorMode =
    isAdminLoginRoute || accessRole === AUTH_ROLES.ADMINISTRATOR;
  const isDeliveryMode = accessRole === AUTH_ROLES.DELIVERY;
  const theme = isAdministratorMode
    ? heroCopy.administrator
    : isDeliveryMode
      ? heroCopy.delivery
      : isVendorMode
        ? heroCopy.vendor
        : heroCopy.customer;
  const heroShellClass = isAdministratorMode || isVendorMode
    ? "bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_26%),linear-gradient(155deg,rgba(3,7,15,0.96),rgba(10,16,30,0.92))]"
    : isDeliveryMode
      ? "bg-[radial-gradient(circle_at_top_left,rgba(72,42,20,0.94),transparent_22%),radial-gradient(circle_at_top_right,rgba(245,211,103,0.22),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(201,147,90,0.22),transparent_30%),linear-gradient(155deg,rgba(39,23,12,0.98),rgba(109,74,43,0.94))]"
      : "bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.28),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(91,141,255,0.12),transparent_28%),linear-gradient(155deg,rgba(255,252,244,0.98),rgba(248,244,233,0.95))]";

  const customerTextClass = isDeliveryMode
    ? "text-[#2a1a0d]"
    : "text-[#1a1200]";
  const customerMutedClass = isDeliveryMode
    ? "text-[#f4d9ad]/80"
    : "text-[#7a6a48]";
  const themeLabel = isAdministratorMode
    ? "vendor"
    : isDeliveryMode
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
          isAdministratorMode || isVendorMode
            ? "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-25 [mask-image:linear-gradient(to_bottom,white,transparent_92%)]"
            : "absolute inset-0 bg-[linear-gradient(rgba(26,18,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(26,18,0,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-22 [mask-image:linear-gradient(to_bottom,white,transparent_92%)]"
        }
      />
      <div
        className={
          isAdministratorMode || isVendorMode
            ? "absolute -left-16 top-20 h-44 w-44 rounded-full bg-[rgba(245,211,103,0.12)] blur-3xl animate-float"
            : "absolute -left-16 top-20 h-52 w-52 rounded-full bg-[rgba(91,141,255,0.16)] blur-3xl animate-float"
        }
      />
      <div
        className={
          isAdministratorMode || isVendorMode
            ? "absolute right-0 top-14 h-60 w-60 rounded-full bg-[rgba(255,255,255,0.06)] blur-3xl animate-float"
            : "absolute right-0 top-14 h-60 w-60 rounded-full bg-[rgba(245,211,103,0.18)] blur-3xl animate-float"
        }
      />
      <div
        className={
          isAdministratorMode || isVendorMode
            ? "absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(245,211,103,0.1)] blur-3xl"
            : "absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(91,141,255,0.09)] blur-3xl"
        }
      />

      <div className="relative flex flex-col gap-5 min-w-0 overflow-hidden">
        <div className="max-w-2xl">
          <BrandMark
            mode={themeLabel}
            tone={isAdministratorMode || isVendorMode || isDeliveryMode ? "light" : "dark"}
          />
        </div>

        <div className="max-w-2xl space-y-4">
          <p
            className={
              isAdministratorMode || isVendorMode
                ? "text-xs font-bold uppercase tracking-[0.5em] text-white/60"
                : `text-xs font-bold uppercase tracking-[0.5em] ${customerMutedClass}`
            }
          >
            {theme.eyebrow}
          </p>
          <h2
            className={
              isAdministratorMode || isVendorMode
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
              isAdministratorMode || isVendorMode
                ? "max-w-xl text-sm leading-7 text-white/70 sm:text-base"
                : isDeliveryMode
                  ? "max-w-xl text-sm leading-7 text-[#f6e4c7] sm:text-base"
                  : "max-w-xl text-sm leading-7 text-[#67583e] sm:text-base"
            }
          >
            {theme.description}
          </p>
        </div>

        <div className="relative w-full overflow-hidden py-4 mask-gradient-x">
          <div className="animate-marquee-left flex gap-5">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={`carousel-1-${num}`}
                className="flex-shrink-0 w-[240px] h-[150px] rounded-[1.25rem] overflow-hidden border border-black/5 dark:border-white/10 shadow-lg"
              >
                <img
                  src={`/carousel/img${num}.png`}
                  alt={`Carousel slide ${num}`}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>
            ))}
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={`carousel-2-${num}`}
                className="flex-shrink-0 w-[240px] h-[150px] rounded-[1.25rem] overflow-hidden border border-black/5 dark:border-white/10 shadow-lg"
              >
                <img
                  src={`/carousel/img${num}.png`}
                  alt={`Carousel slide ${num}`}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>
            ))}
          </div>
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
