import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import toast from 'react-hot-toast';
import { parseAddressCoords } from '@/components/ui/LeafletMap';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const OrderMapModal = ({ order, onClose }) => {
  const [mapCenter, setMapCenter] = useState([-17.4, -66.1]); // Default: La Paz, Bolivia
  const [storeLocation, setStoreLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);

  useEffect(() => {
    const parsedStore = parseAddressCoords(order.store_address);
    const parsedCustomer = parseAddressCoords(order.delivery_address);

    const nextStoreLocation = parsedStore.hasCoords
      ? {
          lat: parsedStore.lat,
          lng: parsedStore.lng,
          name: order.store_name || 'Tienda',
          address: parsedStore.text,
        }
      : null;

    const nextCustomerLocation = parsedCustomer.hasCoords
      ? {
          lat: parsedCustomer.lat,
          lng: parsedCustomer.lng,
          name: 'Tu dirección',
          address: parsedCustomer.text,
        }
      : null;

    setStoreLocation(nextStoreLocation);
    setCustomerLocation(nextCustomerLocation);

    if (nextStoreLocation && nextCustomerLocation) {
      setMapCenter([
        (nextStoreLocation.lat + nextCustomerLocation.lat) / 2,
        (nextStoreLocation.lng + nextCustomerLocation.lng) / 2,
      ]);
    } else if (nextStoreLocation) {
      setMapCenter([nextStoreLocation.lat, nextStoreLocation.lng]);
    } else if (nextCustomerLocation) {
      setMapCenter([nextCustomerLocation.lat, nextCustomerLocation.lng]);
    }
  }, [order]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1200]">
              Ubicación del Pedido #{order.id}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Visualiza la ubicación de la tienda y tu dirección de entrega
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <Icon name="x" className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Map */}
          <div className="flex-1 relative">
            {storeLocation || customerLocation ? (
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {storeLocation ? (
                  <Marker position={[storeLocation.lat, storeLocation.lng]} icon={storeIcon}>
                    <Popup>
                      <div className="p-2">
                        <p className="font-bold text-[#c8960c]">Tienda</p>
                        <p className="text-sm text-slate-700 mt-1 font-semibold">
                          {storeLocation.name || 'Ubicación de la tienda'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {storeLocation.address || order.store_address}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ) : null}
                {customerLocation ? (
                  <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
                    <Popup>
                      <div className="p-2">
                        <p className="font-bold text-blue-600">Tu Dirección</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {customerLocation.address || order.delivery_address || 'Dirección de entrega'}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ) : null}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-slate-50">
                <div className="text-center">
                  <Icon name="map" className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Este pedido no tiene coordenadas para mostrar en el mapa.</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="w-full md:w-80 p-6 border-t md:border-l border-slate-200 bg-slate-50 overflow-y-auto">
            <div className="space-y-6">
              {/* Order Status */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Estado del Pedido</h3>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#c8960c] bg-opacity-10 flex items-center justify-center">
                      <Icon name="box" className="h-5 w-5 text-[#c8960c]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1a1200]">{order.order_type === 'delivery' ? 'Entrega a Domicilio' : 'Recogida en Tienda'}</p>
                      <p className="text-xs text-slate-500 mt-1">Desde {new Date(order.created_at).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Dirección de Entrega</h3>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-700">
                    {parseAddressCoords(order.delivery_address).text || order.delivery_address || 'Dirección no especificada'}
                  </p>
                </div>
              </div>

              {/* Costs */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Detalles del Costo</h3>
                <div className="space-y-3 bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Subtotal</span>
                    <span className="font-semibold text-[#1a1200]">Bs. {parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  {parseFloat(order.shipping_cost) > 0 && (
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Costo de Envío</span>
                      <span className="font-semibold text-orange-600">Bs. {parseFloat(order.shipping_cost).toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(order.discount) > 0 && (
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Descuento</span>
                      <span className="font-semibold text-green-600">-Bs. {parseFloat(order.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="text-lg font-bold text-[#c8960c]">Bs. {parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <Button
                onClick={onClose}
                className="w-full bg-slate-300 text-[#1a1200] rounded-full font-bold py-3 hover:bg-slate-400 transition-colors"
              >
                Cerrar Mapa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderMapModal;
