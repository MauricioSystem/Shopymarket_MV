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

export default function CustomerDashboard() {
  const { user, logout, role, setCurrentView } = useAuth();
  const roleLabel = getRoleLabel(role);

  const theme = {
    mode: "customer",
    mainClass: "min-h-screen text-[#1a1200] bg-[radial-gradient(circle_at_top_left,rgba(91,141,255,0.06),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,211,103,0.1),transparent_26%),linear-gradient(180deg,rgba(255,252,244,0.98),rgba(249,244,231,0.96))]",
    headerClass: "border-b border-[rgba(201,150,12,0.1)] bg-[rgba(255,252,244,0.72)] backdrop-blur-xl",
    cardClass: "border border-[rgba(201,150,12,0.12)] bg-[rgba(255,255,255,0.65)] backdrop-blur-md rounded-2xl p-6 shadow-[0_20px_50px_-20px_rgba(39,29,0,0.08)]",
    mutedText: "text-[#6d5f43]",
    titleText: "text-[#1a1200]",
    accentText: "text-[#c8960c]",
    buttonClass: "bg-[linear-gradient(135deg,#f6d56d,#d6a208)] text-[#120c00] hover:opacity-90 shadow-[0_8px_20px_-10px_rgba(214,162,8,0.5)]",
    secondaryBtnClass: "border border-[rgba(201,150,12,0.16)] bg-white text-[#1a1200] hover:bg-neutral-50"
  };

  const widgets = [
    {
      title: "Explorar Mercado",
      description: "Descubre los mejores productos recomendados y las ofertas de nuestros vendedores.",
      actionText: "Comprar Ahora"
    },
    {
      title: "Mis Compras",
      description: "Realiza el seguimiento de tus pedidos activos, historial de compras y facturas.",
      actionText: "Seguir Pedidos"
    },
    {
      title: "Perfil y Direcciones",
      description: "Administra tus datos personales, direcciones de envío y métodos de pago.",
      actionText: "Configurar Perfil"
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
            <BrandMark mode={theme.mode} tone="dark" />
            <div className="hidden h-5 w-px bg-neutral-200 sm:block" />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold opacity-85 text-neutral-800">{roleLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-neutral-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCurrentView("market")}
              className="rounded-[0.85rem] px-4 py-2 text-sm"
            >
              Explorar Mercado
            </Button>
            <div
              onClick={() => setCurrentView("profile")}
              className="hidden flex-col items-end sm:flex cursor-pointer group select-none"
            >
              <p className="text-sm font-medium group-hover:text-[#c8960c] transition-colors">
                {user ? [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || getDisplayName(user) : getDisplayName(user)}
              </p>
              <p className="text-[0.7rem] opacity-60">{user?.email}</p>
            </div>
            <div
              onClick={() => setCurrentView("profile")}
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-neutral-100 text-xs font-bold overflow-hidden shrink-0 cursor-pointer hover:border-neutral-300 transition-colors ${theme.accentText}`}
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
            Tu cuenta de cliente está lista. Explora la tienda, adquiere productos de calidad y realiza el seguimiento de tus pedidos.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {widgets.map((widget, i) => (
            <div key={i} className={`flex flex-col justify-between transition-all duration-300 hover:border-black/[0.08] ${theme.cardClass}`}>
              <div>
                <h3 className={`text-lg font-bold ${theme.titleText}`}>{widget.title}</h3>
                <p className="mt-2 text-xs leading-5 opacity-70">{widget.description}</p>
              </div>
              <button
                type="button"
                onClick={widget.title === "Explorar Mercado" ? () => setCurrentView("market") : undefined}
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
