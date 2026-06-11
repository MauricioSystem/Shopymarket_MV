import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import { getDisplayName, getProfileImageUrl } from "@/utils/userCapabilities";
import { getRoleLabel, AUTH_ROLES } from "@/utils/authRoles";
import { getAllUsers } from "@/services/usersApi";

const ArrowLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
  </svg>
);

const ShieldExclamationIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
  </svg>
);

function getInitials(user) {
  if (!user) return "?";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.email || "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UsersPage() {
  const { token, role, setCurrentView } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const hasAccess = role === AUTH_ROLES.ADMINISTRATOR || role === AUTH_ROLES.VENDOR;

  useEffect(() => {
    if (!hasAccess || !token) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAllUsers(token);
        const usersList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setUsers(usersList);
      } catch (err) {
        setError(err.message || "No se pudo cargar la lista de usuarios.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [hasAccess, token]);

  const getTheme = () => {
    switch (role) {
      case AUTH_ROLES.ADMINISTRATOR:
        return {
          mode: "admin",
          mainClass: "min-h-screen text-white bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(4,9,18,0.8),transparent_25%),linear-gradient(180deg,#02060d,#050c18)]",
          headerClass: "border-b border-white/5 bg-[#030814]/80 backdrop-blur-xl",
          cardClass: "border border-white/5 bg-white/[0.03] backdrop-blur-md rounded-3xl p-8 shadow-2xl",
          inputClass: "w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all",
          selectClass: "bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-[#f5d367] transition-all",
          mutedText: "text-white/60",
          titleText: "text-white",
          accentText: "text-[#f5d367]",
          buttonClass: "bg-[#f5d367] text-[#120c00] hover:bg-[#ffeb99] transition-all duration-200",
          secondaryBtnClass: "border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-200",
          dividerClass: "border-white/5"
        };
      case AUTH_ROLES.VENDOR:
        return {
          mode: "vendor",
          mainClass: "min-h-screen text-white bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.14),transparent_28%),radial-gradient(circle_at_right_15%,rgba(255,255,255,0.04),transparent_24%),linear-gradient(145deg,rgba(4,9,18,0.98),rgba(11,17,31,0.96))]",
          headerClass: "border-b border-white/5 bg-[rgba(6,12,22,0.7)] backdrop-blur-xl",
          cardClass: "border border-white/8 bg-[rgba(8,15,28,0.48)] backdrop-blur-md rounded-3xl p-8 shadow-xl",
          inputClass: "w-full bg-[#050c14]/80 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all",
          selectClass: "bg-[#050c14]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-[#f5d367] transition-all",
          mutedText: "text-white/60",
          titleText: "text-white",
          accentText: "text-[#f5d367]",
          buttonClass: "bg-[#f5d367] text-[#120c00] hover:opacity-90 shadow-[0_4px_16px_rgba(245,211,103,0.16)]",
          secondaryBtnClass: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
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
          dividerClass: "border-[rgba(201,150,12,0.08)]"
        };
    }
  };

  const theme = getTheme();

  const filteredUsers = users.filter((u) => {
    const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    
    if (roleFilter === "all") return matchesSearch;
    
    const primaryRole = u.roles?.[0]?.name || u.role;
    if (roleFilter === "admin") {
      return matchesSearch && (primaryRole === "super_admin" || primaryRole === "admin" || primaryRole === "administrator" || primaryRole === "vendor");
    }
    if (roleFilter === "customer") {
      return matchesSearch && (primaryRole === "cliente" || primaryRole === "customer");
    }
    if (roleFilter === "delivery") {
      return matchesSearch && (primaryRole === "repartidor" || primaryRole === "delivery");
    }
    return matchesSearch;
  });

  return (
    <main data-mode={theme.mode} className={`min-h-screen theme-transition pb-16 ${theme.mainClass}`}>
      <header className={`sticky top-0 z-30 px-6 py-3.5 ${theme.headerClass}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandMark mode={theme.mode} tone={theme.mode === "customer" ? "dark" : "light"} />
            <div className={`hidden h-5 w-px ${theme.dividerClass} sm:block`} />
            <div className="hidden sm:block">
              <p className={`text-xs font-semibold opacity-85 ${theme.titleText}`}>Directorio</p>
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

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {!hasAccess ? (
          <div className="mx-auto max-w-lg text-center">
            <div className={`${theme.cardClass} flex flex-col items-center py-12`}>
              <div className="rounded-2xl p-4 bg-red-500/10 text-red-400 border border-red-500/20 mb-6">
                <ShieldExclamationIcon className="h-10 w-10" />
              </div>
              <h1 className={`text-2xl font-extrabold tracking-tight ${theme.titleText}`}>Acceso Restringido</h1>
              <p className={`mt-3 text-sm leading-relaxed ${theme.mutedText}`}>
                El directorio de usuarios está disponible únicamente para administradores y vendedores autorizados en Shopymarket.
              </p>
              <Button
                onClick={() => setCurrentView("dashboard")}
                className={`mt-8 rounded-xl px-6 py-2.5 text-xs font-bold ${theme.buttonClass}`}
              >
                Volver al Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className={`${theme.cardClass}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className={`text-2xl font-extrabold ${theme.titleText}`}>Directorio de Usuarios</h1>
                <p className={`text-xs mt-1.5 ${theme.mutedText}`}>Explora y filtra las cuentas registradas en la plataforma.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex items-center min-w-[240px]">
                  <SearchIcon className={`absolute left-4 h-4 w-4 ${theme.mutedText}`} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o correo..."
                    className={theme.inputClass}
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className={theme.selectClass}
                >
                  <option value="all" className="text-black">Todos los Roles</option>
                  <option value="admin" className="text-black">Administradores/Vendedores</option>
                  <option value="customer" className="text-black">Clientes</option>
                  <option value="delivery" className="text-black">Repartidores</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-semibold text-red-400">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <span className={`animate-pulse text-sm font-semibold ${theme.mutedText}`}>Cargando directorio...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-sm opacity-50">
                No se encontraron usuarios registrados que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${theme.dividerClass} text-[0.7rem] font-bold uppercase tracking-wider ${theme.mutedText}`}>
                      <th className="pb-4 pl-4">Usuario</th>
                      <th className="pb-4">Correo</th>
                      <th className="pb-4">Teléfono</th>
                      <th className="pb-4">Ubicación</th>
                      <th className="pb-4">Rol</th>
                      <th className="pb-4 pr-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u) => {
                      const primaryRole = u.roles?.[0]?.name || u.role;
                      const label = getRoleLabel(primaryRole);
                      
                      return (
                        <tr key={u.id} className="hover:bg-neutral-500/5 transition-colors text-sm">
                          <td className="py-4 pl-4 flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${theme.dividerClass} bg-neutral-500/5 text-xs font-bold overflow-hidden shrink-0`}>
                              {u.profile_image_url ? (
                                <img
                                  src={getProfileImageUrl(u.profile_image_url)}
                                  alt="Profile"
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "";
                                  }}
                                />
                              ) : (
                                <span className={theme.accentText}>{getInitials(u)}</span>
                              )}
                            </div>
                            <span className={`font-semibold ${theme.titleText}`}>
                              {[u.first_name, u.last_name].filter(Boolean).join(" ") || "Usuario"}
                            </span>
                          </td>
                          <td className={`py-4 ${theme.mutedText}`}>{u.email}</td>
                          <td className={`py-4 ${theme.mutedText}`}>{u.phone || "—"}</td>
                          <td className={`py-4 ${theme.mutedText}`}>
                            {[u.city, u.country].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider border-neutral-500/30 text-neutral-400 bg-neutral-500/5`}>
                              {label}
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                              u.status === "deleted"
                                ? "border-red-500/30 bg-red-500/10 text-red-400"
                                : "border-green-500/30 bg-green-500/10 text-green-500"
                            }`}>
                              {u.status === "deleted" ? "Eliminada" : "Activa"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
