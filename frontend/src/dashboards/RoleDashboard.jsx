import Button from "@/components/Atoms/Button";
import BrandMark from "@/components/Atoms/BrandMark";
import { getRoleLabel, resolveDashboardPath } from "@/utils/authRoles";

const roleMessages = {
  super_admin:
    "Acceso total habilitado. Aquí puedes validar que el inicio fue exitoso.",
  vendor:
    "Tu panel de vendedor está listo para recibir catálogo, pedidos y ventas.",
  customer: "Tu panel de cliente está listo para explorar y comprar.",
  delivery: "Tu panel de delivery está listo para revisar entregas y estados.",
};

function RoleDashboard({ role, user, onLogout }) {
  const normalizedRole = role || "customer";
  const roleLabel = getRoleLabel(normalizedRole);
  const dashboardPath = resolveDashboardPath(normalizedRole);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.22),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(91,141,255,0.12),transparent_28%),linear-gradient(145deg,rgba(255,252,244,0.98),rgba(249,244,231,0.95))] px-6 py-8 text-[#1a1200]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-center gap-8 rounded-[2rem] border border-[rgba(201,150,12,0.14)] bg-[rgba(255,255,255,0.72)] p-6 shadow-[0_30px_100px_-32px_rgba(39,29,0,0.22)] backdrop-blur-2xl sm:p-8 lg:p-10">
        <div className="flex items-center justify-between gap-6">
          <BrandMark
            mode={
              normalizedRole === "vendor" || normalizedRole === "super_admin"
                ? "vendor"
                : "customer"
            }
            tone="dark"
          />
          <Button
            type="button"
            onClick={onLogout}
            className="rounded-[1rem] px-5 py-3"
          >
            Cerrar sesión
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.45em] text-[#8a774f]">
            Dashboard {roleLabel}
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Inicio exitoso como {roleLabel}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-[#6f6041]">
            {roleMessages[normalizedRole] || roleMessages.customer}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.4rem] border border-[rgba(201,150,12,0.14)] bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.35em] text-[#8a774f]">
              Rol
            </p>
            <p className="mt-2 text-lg font-semibold">{roleLabel}</p>
          </div>
          <div className="rounded-[1.4rem] border border-[rgba(201,150,12,0.14)] bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.35em] text-[#8a774f]">
              Usuario
            </p>
            <p className="mt-2 text-lg font-semibold">
              {user?.displayName || user?.email || "Usuario"}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-[rgba(201,150,12,0.14)] bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.35em] text-[#8a774f]">
              Ruta
            </p>
            <p className="mt-2 text-lg font-semibold">{dashboardPath}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RoleDashboard;
