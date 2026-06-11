import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import { AUTH_ROLES, normalizeFrontendRole } from "@/utils/authRoles";
import Icon from "@/components/ui/Icon";
import toast from "react-hot-toast";
import { getMyOrders } from "@/services/orderApi";
import OrderCard from "@/components/orders/OrderCard";
import OrderMapModal from "@/components/orders/OrderMapModal";

export default function MyOrdersPage() {
  const { role, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [orders, setOrders] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);

  // Security check: Only allow customers
  const normalizedRole = normalizeFrontendRole(role);
  
  useEffect(() => {
    if (normalizedRole !== AUTH_ROLES.CUSTOMER) {
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getMyOrders(token);
        if (response.success) {
          setOrders(response.data || []);
        } else {
          toast.error("Error al cargar los pedidos");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Error al cargar los pedidos");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token, normalizedRole]);

  const handleViewMap = (order) => {
    setSelectedOrder(order);
    setShowMapModal(true);
  };

  const getOrderStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-50 border-yellow-200 text-yellow-800",
      confirmed: "bg-blue-50 border-blue-200 text-blue-800",
      sent: "bg-orange-50 border-orange-200 text-orange-800",
      delivered: "bg-green-50 border-green-200 text-green-800",
      cancelled: "bg-red-50 border-red-200 text-red-800"
    };
    return statusColors[status] || "bg-slate-50 border-slate-200 text-slate-800";
  };

  const getOrderStatusLabel = (status) => {
    const labels = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      sent: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado"
    };
    return labels[status] || status;
  };

  const getOrderStatusIcon = (status) => {
    const icons = {
      pending: "clock",
      confirmed: "check-circle",
      sent: "truck",
      delivered: "package",
      cancelled: "x-circle"
    };
    return icons[status] || "info";
  };

  if (normalizedRole !== AUTH_ROLES.CUSTOMER) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-3xl shadow-sm max-w-md w-full border border-slate-100 flex flex-col items-center">
            <Icon name="ban" className="h-16 w-16 text-slate-300 opacity-60 mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Acceso denegado</h2>
            <p className="text-slate-500 mt-2 text-sm">Esta vista es exclusiva para clientes compradores.</p>
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="mt-6 bg-[#c8960c] text-white w-full rounded-full font-bold"
            >
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
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "products"
                ? "bg-[#1a1200] text-[#fff8df] shadow-md"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon name="box" className="h-4 w-4" />
            <span>Productos Físicos</span>
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "services"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon name="wrench" className="h-4 w-4" />
            <span>Servicios Agendados</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-16">
          
          {activeTab === "products" && (
            <div className="w-full">
              {loading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-[#c8960c] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500">Cargando tus pedidos...</p>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center space-y-4 min-h-[400px] flex items-center justify-center">
                  <div className="w-full">
                    <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon name="market" className="h-10 w-10 text-slate-300 opacity-60" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Aún no has comprado productos</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
                      Cuando finalices una compra en el carrito, podrás darle seguimiento al envío y ver el detalle de la factura aquí.
                    </p>
                    <Button 
                      onClick={() => navigate("/market")} 
                      className="mt-8 bg-[#c8960c] text-white rounded-full font-bold px-8 shadow-md"
                    >
                      Explorar el mercado
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
                        <div>
                          <h3 className="text-lg font-bold text-[#1a1200]">
                            Pedido #{order.id}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {new Date(order.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 w-fit ${getOrderStatusColor(order.status)}`}>
                          <Icon name={getOrderStatusIcon(order.status)} className="h-4 w-4" />
                          {getOrderStatusLabel(order.status)}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div>
                          <p className="text-xs text-slate-500 font-semibold uppercase">Subtotal</p>
                          <p className="text-lg font-bold text-[#1a1200] mt-1">
                            Bs. {parseFloat(order.subtotal).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-semibold uppercase">Envío</p>
                          <p className="text-lg font-bold text-orange-600 mt-1">
                            Bs. {parseFloat(order.shipping_cost).toFixed(2)}
                          </p>
                        </div>
                        {order.discount > 0 && (
                          <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Descuento</p>
                            <p className="text-lg font-bold text-green-600 mt-1">
                              -Bs. {parseFloat(order.discount).toFixed(2)}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-slate-500 font-semibold uppercase">Total</p>
                          <p className="text-lg font-bold text-[#c8960c] mt-1">
                            Bs. {parseFloat(order.total).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col md:flex-row gap-3 mt-6 pt-4 border-t border-slate-200">
                        <Button
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="flex-1 bg-[#c8960c] text-white rounded-full font-bold py-2 hover:bg-[#b88609] transition-colors"
                        >
                          Ver Detalles
                        </Button>
                        <Button
                          onClick={() => handleViewMap(order)}
                          className="flex-1 bg-blue-600 text-white rounded-full font-bold py-2 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Icon name="map" className="h-4 w-4" />
                          Ver Mapa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "services" && (
            <div className="w-full">
              {serviceBookings.length === 0 ? (
                <div className="text-center space-y-4 animate-fade-in min-h-[400px] flex items-center justify-center">
                  <div className="w-full">
                    <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon name="calendar" className="h-10 w-10 text-blue-400 opacity-60" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No tienes servicios agendados</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
                      Cuando solicites la reserva de un servicio profesional, el estado de tu agenda aparecerá en esta sección.
                    </p>
                    <Button 
                      onClick={() => navigate("/market")} 
                      className="mt-8 bg-blue-600 text-white rounded-full font-bold px-8 shadow-md"
                    >
                      Ver servicios disponibles
                    </Button>
                  </div>
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

      {/* Map Modal */}
      {showMapModal && selectedOrder && (
        <OrderMapModal
          order={selectedOrder}
          onClose={() => {
            setShowMapModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
