import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllUsers } from "@/services/usersApi";
import BrandMark from "@/components/Atoms/BrandMark";
import Button from "@/components/Atoms/Button";

// ── Configuración de roles (nombres de la BD) ─────────────────────────────────
const ROLE_CONFIG = {
  super_admin: {
    label: "Super Admin",
    bg: "bg-[rgba(245,211,103,0.12)]",
    border: "border-[rgba(245,211,103,0.28)]",
    text: "text-[#f5d367]",
    dot: "bg-[#f5d367]",
    stat: "text-[#f5d367]",
  },
  admin: {
    label: "Vendedor",
    bg: "bg-[rgba(96,165,250,0.12)]",
    border: "border-[rgba(96,165,250,0.28)]",
    text: "text-[#60a5fa]",
    dot: "bg-[#60a5fa]",
    stat: "text-[#60a5fa]",
  },
  cliente: {
    label: "Cliente",
    bg: "bg-[rgba(52,211,153,0.12)]",
    border: "border-[rgba(52,211,153,0.28)]",
    text: "text-[#34d399]",
    dot: "bg-[#34d399]",
    stat: "text-[#34d399]",
  },
  repartidor: {
    label: "Repartidor",
    bg: "bg-[rgba(251,146,60,0.12)]",
    border: "border-[rgba(251,146,60,0.28)]",
    text: "text-[#fb923c]",
    dot: "bg-[#fb923c]",
    stat: "text-[#fb923c]",
  },
};

const STATUS_CONFIG = {
  active: {
    label: "Activo",
    text: "text-[#34d399]",
    bg: "bg-[rgba(52,211,153,0.1)]",
    border: "border-[rgba(52,211,153,0.22)]",
  },
  inactive: {
    label: "Inactivo",
    text: "text-white/40",
    bg: "bg-white/5",
    border: "border-white/10",
  },
  deleted: {
    label: "Eliminado",
    text: "text-[#f87171]",
    bg: "bg-[rgba(248,113,113,0.1)]",
    border: "border-[rgba(248,113,113,0.22)]",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(first, last) {
  return [first?.[0], last?.[0]].filter(Boolean).join("").toUpperCase() || "?";
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Sub-componentes ───────────────────────────────────────────────────────────
function RoleBadge({ roleName }) {
  const cfg = ROLE_CONFIG[roleName] || {
    label: roleName || "Sin rol",
    bg: "bg-white/5",
    border: "border-white/10",
    text: "text-white/40",
    dot: "bg-white/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-[rgba(255,255,255,0.04)] p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/14 hover:bg-[rgba(255,255,255,0.06)]">
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-current opacity-[0.04] blur-2xl" style={{ color: color.replace("text-", "") }} />
      <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/35">{label}</p>
      <p className={`mt-3 text-4xl font-bold tabular-nums ${color}`}>{value}</p>
      {icon && <p className="mt-1 text-lg opacity-40">{icon}</p>}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
function SuperAdminDashboard({ onLogout }) {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadState, setLoadState] = useState("idle"); // idle | loading | error | done
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      setLoadState("loading");
      try {
        const result = await getAllUsers(token);
        setUsers(result.data || []);
        setLoadState("done");
      } catch (err) {
        setErrorMsg(err.message || "Error al cargar usuarios");
        setLoadState("error");
      }
    };

    fetchUsers();
  }, [token]);

  // ── Estadísticas ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const counts = { total: users.length, admin: 0, cliente: 0, repartidor: 0 };
    users.forEach((u) => {
      const role = u.roles?.[0]?.name;
      if (role === "admin") counts.admin++;
      else if (role === "cliente") counts.cliente++;
      else if (role === "repartidor") counts.repartidor++;
    });
    return counts;
  }, [users]);

  // ── Filtrado ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = users;

    if (roleFilter !== "all") {
      list = list.filter((u) => u.roles?.[0]?.name === roleFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.first_name?.toLowerCase().includes(q) ||
          u.last_name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q) ||
          u.country?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [users, search, roleFilter]);

  const roleFilters = [
    { value: "all", label: "Todos" },
    { value: "admin", label: "Vendedores" },
    { value: "cliente", label: "Clientes" },
    { value: "repartidor", label: "Repartidores" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(245,211,103,0.08),transparent_36%),radial-gradient(ellipse_at_bottom_right,rgba(91,141,255,0.06),transparent_36%),linear-gradient(160deg,rgba(5,8,20,1),rgba(8,12,24,1))] text-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(5,8,20,0.82)] px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandMark mode="vendor" tone="light" />
            <div className="hidden h-5 w-px bg-white/14 sm:block" />
            <div className="hidden sm:block">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.5em] text-[#f5d367]/65">
                Panel de control
              </p>
              <p className="text-sm font-semibold text-white/80">Super Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden flex-col items-end sm:flex">
              <p className="text-sm font-medium text-white/75">
                {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Super Admin"}
              </p>
              <p className="text-[0.7rem] text-white/38">{user?.email}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(245,211,103,0.3)] bg-[rgba(245,211,103,0.1)] text-xs font-bold text-[#f5d367]">
              {getInitials(user?.first_name, user?.last_name)}
            </div>
            <Button
              type="button"
              onClick={onLogout}
              className="rounded-[1rem] px-4 py-2.5 text-sm"
            >
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* ── Título ── */}
        <div className="mb-8">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.5em] text-[#f5d367]/65">
            Gestión de usuarios
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Todos los usuarios
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/42">
            Vista exclusiva del Super Admin — control total sobre la plataforma.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total usuarios"
            value={stats.total}
            color="text-white"
            icon="👥"
          />
          <StatCard
            label="Vendedores"
            value={stats.admin}
            color="text-[#60a5fa]"
            icon="🏪"
          />
          <StatCard
            label="Clientes"
            value={stats.cliente}
            color="text-[#34d399]"
            icon="🛒"
          />
          <StatCard
            label="Repartidores"
            value={stats.repartidor}
            color="text-[#fb923c]"
            icon="🚚"
          />
        </div>

        {/* ── Tabla ── */}
        <div className="overflow-hidden rounded-[1.75rem] border border-white/8 bg-[rgba(255,255,255,0.025)] backdrop-blur-sm">

          {/* Barra de controles */}
          <div className="flex flex-col gap-3 border-b border-white/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-white/82">
              Registro de usuarios
              {loadState === "done" && (
                <span className="ml-2 text-xs font-normal text-white/35">
                  ({filtered.length} de {users.length})
                </span>
              )}
            </h2>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Filtro de roles */}
              <div className="flex gap-1.5 rounded-[1rem] border border-white/8 bg-white/4 p-1">
                {roleFilters.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setRoleFilter(f.value)}
                    className={`rounded-[0.75rem] px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      roleFilter === f.value
                        ? "bg-[rgba(245,211,103,0.16)] text-[#f5d367]"
                        : "text-white/45 hover:text-white/70"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Búsqueda */}
              <input
                id="search-users"
                type="text"
                placeholder="Buscar usuario…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/28 outline-none transition-all focus:border-[rgba(245,211,103,0.35)] focus:ring-1 focus:ring-[rgba(245,211,103,0.18)] sm:w-52"
              />
            </div>
          </div>

          {/* Estados de carga */}
          {loadState === "loading" && (
            <div className="flex items-center justify-center gap-3 py-24 text-white/35">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#f5d367]" />
              <span className="text-sm">Cargando usuarios…</span>
            </div>
          )}

          {loadState === "error" && (
            <div className="flex flex-col items-center justify-center gap-2 py-24">
              <p className="text-2xl">⚠️</p>
              <p className="text-sm text-[#f87171]">{errorMsg}</p>
              <p className="text-xs text-white/30">
                Verifica que el backend esté corriendo y tu sesión sea válida.
              </p>
            </div>
          )}

          {/* Tabla de usuarios */}
          {loadState === "done" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/6">
                    <th className="px-5 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/30">
                      Usuario
                    </th>
                    <th className="px-5 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/30">
                      Correo
                    </th>
                    <th className="px-5 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/30">
                      Rol
                    </th>
                    <th className="hidden px-5 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/30 md:table-cell">
                      Ubicación
                    </th>
                    <th className="px-5 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/30">
                      Estado
                    </th>
                    <th className="hidden px-5 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/30 lg:table-cell">
                      Registro
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-20 text-center text-sm text-white/25"
                      >
                        {search || roleFilter !== "all"
                          ? "No hay usuarios que coincidan con tu búsqueda."
                          : "No hay usuarios registrados aún."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => {
                      const primaryRole = u.roles?.[0]?.name;
                      const location =
                        [u.city, u.country].filter(Boolean).join(", ") || "—";
                      const fullName =
                        [u.first_name, u.last_name]
                          .filter(Boolean)
                          .join(" ") || "—";

                      return (
                        <tr
                          key={u.id}
                          className="border-b border-white/[0.04] transition-colors duration-150 hover:bg-white/[0.02]"
                        >
                          {/* Nombre + avatar */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(245,211,103,0.18)] bg-[rgba(245,211,103,0.08)] text-[0.7rem] font-bold text-[#f5d367]">
                                {getInitials(u.first_name, u.last_name)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-white/85">
                                  {fullName}
                                </p>
                                <p className="text-[0.68rem] text-white/32">
                                  ID #{u.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-5 py-4 text-white/52">
                            <span className="truncate">{u.email}</span>
                          </td>

                          {/* Rol */}
                          <td className="px-5 py-4">
                            <RoleBadge roleName={primaryRole} />
                          </td>

                          {/* Ubicación */}
                          <td className="hidden px-5 py-4 text-white/40 md:table-cell">
                            {location}
                          </td>

                          {/* Estado */}
                          <td className="px-5 py-4">
                            <StatusBadge status={u.status} />
                          </td>

                          {/* Fecha */}
                          <td className="hidden px-5 py-4 text-white/38 lg:table-cell">
                            {formatDate(u.created_at)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default SuperAdminDashboard;
