import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import { AUTH_ROLES, normalizeFrontendRole } from "@/utils/authRoles";

export default function MyOrdersPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");

  // Since we don't have a backend orders API yet, we'll use a visual placeholder
  const mockProductOrders = [];
  const mockServiceBookings = [];

  // Security check: Only allow customers
  if (normalizeFrontendRole(role) !== AUTH_ROLES.CUSTOMER) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-3xl shadow-sm max-w-md w-full border border-slate-100">
            <span className="text-6xl mb-4 block">🚫</span>
            <h2 className="text-xl font-bold text-slate-800">Acceso denegado</h2>
            <p className="text-slate-500 mt-2 text-sm">Esta vista es exclusiva para clientes compradores.</p>
            <Button onClick={() => navigate("/dashboard")} className="mt-6 bg-[#c8960c] text-white w-full rounded-full font-bold">
              Ir a mi panel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] font-sans">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1200] tracking-tight">
            Mis Pedidos y Reservas
          </h1>
          <p className="text-slate-500 mt-3 max-w-2xl text-sm md:text-base">
            Revisa el historial de tus compras de productos físicos y el estado de los servicios profesionales que has agendado en ShopyMarket.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-white rounded-full p-1.5 border border-slate-200 w-full max-w-md mx-auto md:mx-0 mb-10 shadow-sm">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === "products"
                ? "bg-[#1a1200] text-[#fff8df] shadow-md"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            📦 Productos Físicos
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === "services"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🔧 Servicios Agendados
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-16 min-h-[400px] flex items-center justify-center">
          
          {activeTab === "products" && (
            <div className="w-full">
              {mockProductOrders.length === 0 ? (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🛍️</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Aún no has comprado productos</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Cuando finalices una compra en el carrito, podrás darle seguimiento al envío y ver el detalle de la factura aquí.
                  </p>
                  <Button onClick={() => navigate("/market")} className="mt-8 bg-[#c8960c] text-white rounded-full font-bold px-8 shadow-md">
                    Explorar el mercado
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {/* Aquí se mapearían las compras */}
                </div>
              )}
            </div>
          )}

          {activeTab === "services" && (
            <div className="w-full">
              {mockServiceBookings.length === 0 ? (
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📅</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">No tienes servicios agendados</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Cuando solicites la reserva de un servicio profesional, el estado de tu agenda aparecerá en esta sección.
                  </p>
                  <Button onClick={() => navigate("/market")} className="mt-8 bg-blue-600 text-white rounded-full font-bold px-8 shadow-md">
                    Ver servicios disponibles
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {/* Aquí se mapearían las reservas */}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
