import { useAuth } from "@/context/AuthContext";
import BrandMark from "@/components/ui/BrandMark";
import Button from "@/components/ui/Button";
import { getDisplayName, getProfileImageUrl } from "@/utils/userCapabilities";
import { getRoleLabel } from "@/utils/authRoles";

function getInitials(user) {
  const name = getDisplayName(user);
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function VendorDashboard() {
  const { user, logout, role, setCurrentView } = useAuth();
  const roleLabel = getRoleLabel(role);

  const theme = {
    mode: "vendor",
    mainClass: "min-h-screen text-white bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.14),transparent_28%),radial-gradient(circle_at_right_15%,rgba(255,255,255,0.04),transparent_24%),linear-gradient(145deg,rgba(4,9,18,0.98),rgba(11,17,31,0.96))]",
    headerClass: "border-b border-white/5 bg-[rgba(6,12,22,0.7)] backdrop-blur-xl",
    cardClass: "border border-white/8 bg-[rgba(8,15,28,0.48)] backdrop-blur-md rounded-2xl p-6 shadow-xl",
    mutedText: "text-white/60",
    titleText: "text-white",
    accentText: "text-[#f5d367]",
    buttonClass: "bg-[#f5d367] text-[#120c00] hover:opacity-90 shadow-[0_4px_16px_rgba(245,211,103,0.16)]",
    secondaryBtnClass: "border border-white/10 bg-white/5 text-white hover:bg-white/10"
  };

  const widgets = [
    {
      title: "Catálogo de Productos",
      description: "Gestiona y actualiza tu lista de artículos en venta de forma ágil y moderna.",
      actionText: "Administrar Catálogo"
    },
    {
      title: "Control de Pedidos",
      description: "Visualiza solicitudes de compra de tus clientes y administra el estado de envío.",
      actionText: "Ver Pedidos"
    },
    {
      title: "Estadísticas de Venta",
      description: "Analiza el rendimiento comercial, tus ganancias y tendencias de mercado.",
      actionText: "Ver Reportes"
    }
  ];

  return (
    <main
      data-mode={theme.mode}
      className={`min-h-screen theme-transition overflow-hidden ${theme.mainClass}`}
    >
      <header className={`sticky top-0 z-30 px-6 py-3.5 ${theme.headerClass}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandMark mode={theme.mode} tone="light" />
            <div className="hidden h-5 w-px bg-white/10 sm:block" />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold opacity-85 text-white/80">{roleLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-white">
            <div
              onClick={() => setCurrentView("profile")}
              className="hidden flex-col items-end sm:flex cursor-pointer group select-none"
            >
              <p className="text-sm font-medium group-hover:text-[#f5d367] transition-colors">
                {user ? [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || getDisplayName(user) : getDisplayName(user)}
              </p>
              <p className="text-[0.7rem] opacity-60 text-white/50">{user?.email}</p>
            </div>
            <div
              onClick={() => setCurrentView("profile")}
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold overflow-hidden shrink-0 cursor-pointer hover:border-white/20 transition-colors ${theme.accentText}`}
            >
              {user?.profile_image_url ? (
                <img
                  src={getProfileImageUrl(user.profile_image_url)}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "";
                  }}
                />
              ) : (
                getInitials(user)
              )}
            </div>
            <Button
              type="button"
              onClick={logout}
              className={`rounded-[0.85rem] px-4 py-2 text-sm ${theme.buttonClass}`}
            >
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className={`mb-8 p-6 sm:p-8 ${theme.cardClass}`}>
          <p className={`text-[0.65rem] font-bold uppercase tracking-[0.5em] ${theme.accentText}`}>
            Dashboard de {roleLabel}
          </p>
          <h1 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${theme.titleText}`}>
            Bienvenido de vuelta, {getDisplayName(user)}
          </h1>
          <p className={`mt-3 max-w-2xl text-sm leading-6 ${theme.mutedText}`}>
            Tu panel de vendedor está listo. Administra tu catálogo, ventas y pedidos desde un entorno seguro y profesional.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {widgets.map((widget, i) => (
            <div key={i} className={`flex flex-col justify-between transition-all duration-300 hover:border-white/[0.12] ${theme.cardClass}`}>
              <div>
                <h3 className={`text-lg font-bold ${theme.titleText}`}>{widget.title}</h3>
                <p className="mt-2 text-xs leading-5 opacity-70">{widget.description}</p>
              </div>
              <button
                type="button"
                className={`mt-6 w-full rounded-[0.85rem] py-2.5 text-xs font-semibold transition-all ${theme.secondaryBtnClass}`}
              >
                {widget.actionText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
