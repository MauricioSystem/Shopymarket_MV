import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import toast from "react-hot-toast";
import { getOrderById } from "@/services/orderApi";
import { getProfileImageUrl } from "@/utils/userCapabilities";
import { parseAddressCoords } from "@/components/ui/LeafletMap";
import OrderMapModal from "@/components/orders/OrderMapModal";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(id, token);
        if (response.success) {
          setOrder(response.data);
          setOrderItems(response.data.items || []);
        } else {
          toast.error("Error al cargar el pedido");
          navigate("/my-orders");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Error al cargar el pedido");
        navigate("/my-orders");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchOrder();
    }
  }, [token, id, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-[#c8960c] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500">Cargando detalles del pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-3xl shadow-sm max-w-md w-full border border-slate-100">
            <Icon name="alert-circle" className="h-16 w-16 text-slate-300 opacity-60 mb-4 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Pedido no encontrado</h2>
            <p className="text-slate-500 mt-2 text-sm">No pudimos encontrar el pedido que buscas.</p>
            <Button
              onClick={() => navigate("/my-orders")}
              className="mt-6 bg-[#c8960c] text-white w-full rounded-full font-bold"
            >
              Volver a mis pedidos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const parsedDeliveryAddress = parseAddressCoords(order.delivery_address);
  const parsedStoreAddress = parseAddressCoords(order.store_address);
  const deliveryAddressText = parsedDeliveryAddress.text || order.delivery_address;
  const storeAddressText = parsedStoreAddress.text || order.store_address;
  const canShowMap = parsedDeliveryAddress.hasCoords || parsedStoreAddress.hasCoords;

  return (
    <div className="min-h-screen bg-[#faf9f5] font-sans">
      <Navbar />
      {showMapModal && (
        <OrderMapModal
          order={order}
          onClose={() => setShowMapModal(false)}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/my-orders")}
            className="flex items-center gap-2 text-[#c8960c] hover:text-[#b88609] font-semibold mb-4"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            Volver a mis pedidos
          </button>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-200">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1200]">
                  Pedido #{order.id}
                </h1>
                <p className="text-slate-500 mt-2">
                  {new Date(order.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className={`px-6 py-3 rounded-full text-sm font-bold border flex items-center gap-2 w-fit ${getOrderStatusColor(order.status)}`}>
                <Icon name={getOrderStatusIcon(order.status)} className="h-5 w-5" />
                {getOrderStatusLabel(order.status)}
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[#1a1200] mb-4">Productos en el pedido</h2>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-4">
                    {item.product_image && (
                      <img
                        src={getProfileImageUrl(item.product_image)}
                        alt={item.product_name}
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-[#1a1200]">{item.product_name || item.service_name}</h3>
                      <p className="text-sm text-slate-500 mt-1">Cantidad: {item.quantity}</p>
                      <p className="text-sm text-slate-500">Precio unitario: Bs. {parseFloat(item.unit_price).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#c8960c]">
                        Bs. {parseFloat(item.subtotal).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Summary */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h2 className="text-lg font-bold text-[#1a1200] mb-4">Resumen del costo</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-[#1a1200]">Bs. {parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                {parseFloat(order.shipping_cost) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Costo de envío</span>
                    <span className="font-semibold text-orange-600">Bs. {parseFloat(order.shipping_cost).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Descuento</span>
                    <span className="font-semibold text-green-600">-Bs. {parseFloat(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="font-bold text-[#1a1200]">Total</span>
                  <span className="text-2xl font-bold text-[#c8960c]">Bs. {parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            {order.delivery_address && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h2 className="text-lg font-bold text-[#1a1200] mb-4">Dirección de entrega</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-slate-700">{deliveryAddressText}</p>
                </div>
              </div>
            )}

            {order.store_address && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h2 className="text-lg font-bold text-[#1a1200] mb-4">Ubicación de la tienda</h2>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-bold text-[#1a1200]">{order.store_name || "Tienda"}</p>
                  <p className="mt-1 text-slate-700">{storeAddressText}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col md:flex-row gap-4">
              <Button
                onClick={() => navigate("/my-orders")}
                className="flex-1 bg-[#c8960c] text-white rounded-full font-bold py-3 hover:bg-[#b88609] transition-colors"
              >
                Volver a mis pedidos
              </Button>
              {canShowMap && (
                <Button
                  onClick={() => setShowMapModal(true)}
                  className="flex-1 bg-blue-600 text-white rounded-full font-bold py-3 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="map" className="h-4 w-4" />
                  Ver mapa
                </Button>
              )}
              {order.status === 'pending' && (
                <Button
                  onClick={() => toast.info("Función de pago a implementar")}
                  className="flex-1 bg-green-600 text-white rounded-full font-bold py-3 hover:bg-green-700 transition-colors"
                >
                  Proceder al pago
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
