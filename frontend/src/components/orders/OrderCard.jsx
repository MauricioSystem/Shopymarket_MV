import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

const OrderCard = ({ order, onViewDetails, onViewMap }) => {
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

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
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
          onClick={() => onViewDetails(order.id)}
          className="flex-1 bg-[#c8960c] text-white rounded-full font-bold py-2 hover:bg-[#b88609] transition-colors"
        >
          Ver Detalles
        </Button>
        <Button
          onClick={() => onViewMap(order)}
          className="flex-1 bg-blue-600 text-white rounded-full font-bold py-2 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="map" className="h-4 w-4" />
          Ver Mapa
        </Button>
      </div>
    </div>
  );
};

export default OrderCard;
