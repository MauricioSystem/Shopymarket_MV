import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import { getDisplayName, getProfileImageUrl } from "@/utils/userCapabilities";
import { getRoleLabel, AUTH_ROLES } from "@/utils/authRoles";

function getInitials(user) {
  if (!user) return "?";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.email || "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("es", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const ArrowLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const EditIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const EnvelopeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const PhoneIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0 6-6M2.25 6.622C2.25 12.512 7.03 17.25 13 17.25a7.519 7.519 0 0 0 4.007-1.157l3.2 3.2c.282.282.741.282 1.023 0l1.2-1.2c.282-.282.282-.741 0-1.023l-3.2-3.2A7.513 7.513 0 0 0 17.25 13C17.25 7.03 12.512 2.25 6.622 2.25c-.25 0-.495.009-.738.026a1.124 1.124 0 0 0-.964.847l-1.018 4.07a1.125 1.125 0 0 0 .542 1.22l2.793 1.55a11.517 11.517 0 0 1 3.73 3.73l-1.55 2.793a1.125 1.125 0 0 0-1.22.542l-4.07 1.018a1.125 1.125 0 0 0-.847.964c-.017.243-.026.488-.026.738Z" />
  </svg>
);

const MapPinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

export default function ProfilePage() {
  const { user, role, setCurrentView } = useAuth();
  const roleLabel = getRoleLabel(role);

  const getTheme = () => {
    switch (role) {
      case AUTH_ROLES.ADMINISTRATOR:
        return {
          mode: "admin",
          mainClass: "min-h-screen text-white bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(4,9,18,0.8),transparent_25%),linear-gradient(180deg,#02060d,#050c18)]",
          headerClass: "border-b border-white/5 bg-[#030814]/80 backdrop-blur-xl",
          cardClass: "border border-white/5 bg-white/[0.03] backdrop-blur-md rounded-3xl p-8 shadow-2xl",
          mutedText: "text-white/60",
          titleText: "text-white",
          accentText: "text-[#f5d367]",
          buttonClass: "bg-[#f5d367] text-[#120c00] hover:bg-[#ffeb99] transition-all duration-200",
          secondaryBtnClass: "border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-200",
          badgeClass: "border-[#f5d367]/30 bg-[#f5d367]/5 text-[#f5d367]",
          dividerClass: "border-white/5"
        };
      case AUTH_ROLES.VENDOR:
        return {
          mode: "vendor",
          mainClass: "min-h-screen text-white bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.14),transparent_28%),radial-gradient(circle_at_right_15%,rgba(255,255,255,0.04),transparent_24%),linear-gradient(145deg,rgba(4,9,18,0.98),rgba(11,17,31,0.96))]",
          headerClass: "border-b border-white/5 bg-[rgba(6,12,22,0.7)] backdrop-blur-xl",
          cardClass: "border border-white/8 bg-[rgba(8,15,28,0.48)] backdrop-blur-md rounded-3xl p-8 shadow-xl",
          mutedText: "text-white/60",
          titleText: "text-white",
          accentText: "text-[#f5d367]",
          buttonClass: "bg-[#f5d367] text-[#120c00] hover:opacity-90 shadow-[0_4px_16px_rgba(245,211,103,0.16)]",
          secondaryBtnClass: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
          badgeClass: "border-blue-500/30 bg-blue-500/5 text-blue-400",
          dividerClass: "border-white/5"
        };
      case AUTH_ROLES.DELIVERY:
        return {
          mode: "delivery",
          mainClass: "min-h-screen text-[#f4dcc0] bg-[radial-gradient(circle_at_top_right,rgba(201,147,90,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(72,42,20,0.22),transparent_26%),linear-gradient(180deg,rgba(56,33,16,0.98),rgba(44,25,13,0.96))]",
          headerClass: "border-b border-[rgba(201,147,90,0.12)] bg-[rgba(44,25,13,0.78)] backdrop-blur-xl",
          cardClass: "border border-[rgba(201,147,90,0.16)] bg-[rgba(110,76,42,0.24)] backdrop-blur-md rounded-3xl p-8 shadow-xl",
          mutedText: "text-[#e6c79d]/80",
          titleText: "text-[#f7d98d]",
          accentText: "text-[#f7d98d]",
          buttonClass: "bg-[linear-gradient(135deg,#7d4e27,#f7d98d)] text-[#2a1a0d] hover:opacity-90 shadow-[0_8px_20px_-10px_rgba(201,147,90,0.5)]",
          secondaryBtnClass: "border border-[rgba(201,147,90,0.2)] bg-[rgba(110,76,42,0.1)] text-[#f4dcc0] hover:bg-[rgba(110,76,42,0.2)]",
          badgeClass: "border-[#f7d98d]/30 bg-[#f7d98d]/5 text-[#f7d98d]",
          dividerClass: "border-[rgba(201,147,90,0.12)]"
        };
      default: // CUSTOMER
        return {
          mode: "customer",
          mainClass: "min-h-screen text-[#1a1200] bg-[radial-gradient(circle_at_top_left,rgba(91,141,255,0.06),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,211,103,0.1),transparent_26%),linear-gradient(180deg,rgba(255,252,244,0.98),rgba(249,244,231,0.96))]",
          headerClass: "border-b border-[rgba(201,150,12,0.1)] bg-[rgba(255,252,244,0.72)] backdrop-blur-xl",
          cardClass: "border border-[rgba(201,150,12,0.12)] bg-[rgba(255,255,255,0.65)] backdrop-blur-md rounded-3xl p-8 shadow-[0_20px_50px_-20px_rgba(39,29,0,0.08)]",
          mutedText: "text-[#6d5f43]",
          titleText: "text-[#1a1200]",
          accentText: "text-[#c8960c]",
          buttonClass: "bg-[linear-gradient(135deg,#f6d56d,#d6a208)] text-[#120c00] hover:opacity-90 shadow-[0_8px_20px_-10px_rgba(214,162,8,0.5)]",
          secondaryBtnClass: "border border-[rgba(201,150,12,0.16)] bg-white text-[#1a1200] hover:bg-neutral-50",
          badgeClass: "border-green-500/30 bg-green-500/5 text-green-600",
          dividerClass: "border-[rgba(201,150,12,0.08)]"
        };
    }
  };

  const theme = getTheme();

  return (
    <main data-mode={theme.mode} className={`min-h-screen theme-transition pb-16 ${theme.mainClass}`}>
      <header className={`sticky top-0 z-30 px-6 py-3.5 ${theme.headerClass}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandMark mode={theme.mode} tone={theme.mode === "customer" ? "dark" : "light"} />
            <div className={`hidden h-5 w-px ${theme.dividerClass} sm:block`} />
            <div className="hidden sm:block">
              <p className={`text-xs font-semibold opacity-80 ${theme.titleText}`}>Perfil de Usuario</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => setCurrentView("dashboard")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${theme.secondaryBtnClass}`}
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Volver</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className={`${theme.cardClass} overflow-hidden relative`}>
          <div className="absolute top-0 left-0 right-0 h-32 bg-[linear-gradient(135deg,rgba(245,211,103,0.25),rgba(200,150,12,0.05))] opacity-80" />

          <div className="relative mt-8 flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-8">
            
            <div className="flex flex-col items-center shrink-0">
              <div className={`relative flex h-32 w-32 items-center justify-center rounded-full border-4 ${theme.mode === 'customer' ? 'border-white shadow-lg' : 'border-[#080f1c]'} bg-neutral-100 text-3xl font-extrabold overflow-hidden shadow-2xl`}>
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
                  <span className={theme.accentText}>{getInitials(user)}</span>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2.5 w-full">
                <Button
                  onClick={() => setCurrentView("edit-profile")}
                  className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold w-full ${theme.buttonClass}`}
                >
                  <EditIcon className="h-3.5 w-3.5" />
                  <span>Editar Perfil</span>
                </Button>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col items-center md:items-start gap-2.5">
                <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider ${theme.badgeClass}`}>
                  {roleLabel}
                </span>
                <h1 className={`text-3xl font-extrabold tracking-tight ${theme.titleText}`}>
                  {user ? [user.first_name, user.last_name].filter(Boolean).join(" ") || "Nombre del Usuario" : "Usuario"}
                </h1>
                <p className={`text-sm ${theme.mutedText} font-medium`}>{user?.email}</p>
              </div>

              <div className={`mt-8 grid gap-6 border-t pt-8 ${theme.dividerClass} sm:grid-cols-2`}>
                
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2 bg-neutral-500/5 border ${theme.dividerClass} shrink-0`}>
                    <EnvelopeIcon className={`h-4.5 w-4.5 ${theme.accentText}`} />
                  </div>
                  <div>
                    <h3 className={`text-[0.68rem] font-bold uppercase tracking-wider ${theme.mutedText}`}>Correo Electrónico</h3>
                    <p className={`mt-1 text-sm font-medium ${theme.titleText}`}>{user?.email || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2 bg-neutral-500/5 border ${theme.dividerClass} shrink-0`}>
                    <PhoneIcon className={`h-4.5 w-4.5 ${theme.accentText}`} />
                  </div>
                  <div>
                    <h3 className={`text-[0.68rem] font-bold uppercase tracking-wider ${theme.mutedText}`}>Teléfono de Contacto</h3>
                    <p className={`mt-1 text-sm font-medium ${theme.titleText}`}>{user?.phone || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2 bg-neutral-500/5 border ${theme.dividerClass} shrink-0`}>
                    <MapPinIcon className={`h-4.5 w-4.5 ${theme.accentText}`} />
                  </div>
                  <div>
                    <h3 className={`text-[0.68rem] font-bold uppercase tracking-wider ${theme.mutedText}`}>Ubicación</h3>
                    <p className={`mt-1 text-sm font-medium ${theme.titleText}`}>
                      {[user?.city, user?.country].filter(Boolean).join(", ") || "Bolivia"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2 bg-neutral-500/5 border ${theme.dividerClass} shrink-0`}>
                    <UserIcon className={`h-4.5 w-4.5 ${theme.accentText}`} />
                  </div>
                  <div>
                    <h3 className={`text-[0.68rem] font-bold uppercase tracking-wider ${theme.mutedText}`}>Dirección Completa</h3>
                    <p className={`mt-1 text-sm font-medium ${theme.titleText}`}>{user?.address || "—"}</p>
                  </div>
                </div>

              </div>

              <div className={`mt-8 border-t pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs ${theme.mutedText} ${theme.dividerClass}`}>
                <div>
                  Miembro desde: <span className="font-semibold">{formatDate(user?.created_at || user?.createdAt)}</span>
                </div>
                {user?.updated_at && (
                  <div>
                    Última actualización: <span className="font-semibold">{formatDate(user.updated_at || user.updatedAt)}</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
