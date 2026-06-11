import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import { getDisplayName } from "@/utils/userCapabilities";
import { getRoleLabel } from "@/utils/authRoles";

function getInitials(user) {
  if (!user) return "?";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.email || "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DeliveryDashboard() {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const roleLabel = getRoleLabel(role);

  const theme = {
    mode: "delivery",
    mainClass: "min-h-screen text-[#f4dcc0] bg-[radial-gradient(circle_at_top_right,rgba(201,147,90,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(72,42,20,0.22),transparent_26%),linear-gradient(180deg,rgba(56,33,16,0.98),rgba(44,25,13,0.96))]",
    headerClass: "border-b border-[rgba(201,147,90,0.12)] bg-[rgba(44,25,13,0.78)] backdrop-blur-xl",
    cardClass: "border border-[rgba(201,147,90,0.16)] bg-[rgba(110,76,42,0.24)] backdrop-blur-md rounded-2xl p-6 shadow-xl",
    mutedText: "text-[#e6c79d]",
    titleText: "text-[#f7d98d]",
    accentText: "text-[#f7d98d]",
    buttonClass: "bg-[linear-gradient(135deg,#7d4e27,#f7d98d)] text-[#2a1a0d] hover:opacity-90 shadow-[0_8px_20px_-10px_rgba(201,147,90,0.5)]",
    secondaryBtnClass: "border border-[rgba(201,147,90,0.2)] bg-[rgba(110,76,42,0.1)] text-[#f4dcc0] hover:bg-[rgba(110,76,42,0.2)]"
  };

  const widgets = [
    {
      title: "Entregas en Espera",
      description: "Revisa la lista de pedidos disponibles y listos para ser transportados.",
      actionText: "Ver Entregas"
    },
    {
      title: "Historial de Viajes",
      description: "Consulta tus trayectos completados, comisiones y calificaciones.",
      actionText: "Ver Historial"
    },
    {
      title: "Estado y Disponibilidad",
      description: "Configura tu estado activo, tus zonas preferidas y horarios de trabajo.",
      actionText: "Preferencias"
    }
  ];

  return (
    <main
      data-mode={theme.mode}
      className={`min-h-screen theme-transition overflow-hidden ${theme.mainClass}`}
    >
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className={`mb-8 p-6 sm:p-8 ${theme.cardClass}`}>
          <p className={`text-[0.65rem] font-bold uppercase tracking-[0.5em] ${theme.accentText}`}>
            Dashboard de {roleLabel}
          </p>
          <h1 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${theme.titleText}`}>
            Bienvenido, {getDisplayName(user)}
          </h1>
          <p className={`mt-3 max-w-2xl text-sm leading-6 ${theme.mutedText}`}>
            Tu panel de distribución está listo para operar. Revisa tus asignaciones de entrega y mantén tu estado de servicio actualizado.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {widgets.map((widget, i) => (
            <div key={i} className={`flex flex-col justify-between transition-all duration-300 hover:border-[rgba(201,147,90,0.3)] ${theme.cardClass}`}>
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
