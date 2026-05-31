import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const getImageUrl = (url) => url ? (url.startsWith("http") ? url : `${API_BASE}${url}`) : null;

// ── Componente de paso en el stepper ─────────────────────────────────────────
function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 select-none">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold border-2 transition-all duration-300 ${
                isCompleted ? 'bg-[#1a1200] border-[#1a1200] text-[#f5d367]' :
                isActive    ? 'bg-[#c8960c] border-[#c8960c] text-white shadow-lg shadow-[#c8960c]/40' :
                              'bg-white border-slate-200 text-slate-400'
              }`}>
                {isCompleted ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:block ${
                isActive ? 'text-[#c8960c]' : isCompleted ? 'text-[#1a1200]' : 'text-slate-400'
              }`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-10 sm:w-16 mx-1 transition-all duration-500 ${
                i < currentStep ? 'bg-[#1a1200]' : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Checkbox personalizado ────────────────────────────────────────────────────
function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex items-center justify-center mt-0.5 shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
        <div className="w-5 h-5 rounded border-2 border-slate-300 peer-checked:bg-[#c8960c] peer-checked:border-[#c8960c] transition-colors" />
        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
          <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed">{label}</span>
    </label>
  );
}

// ── Input / Select de formulario ────────────────────────────────────────────
function FormInput({ label, id, required, type = 'text', options, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label} {required && <span className="text-[#c8960c]">*</span>}
      </label>
      {options ? (
        <select
          id={id}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#c8960c]/50 focus:border-[#c8960c] transition-all"
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#c8960c]/50 focus:border-[#c8960c] transition-all placeholder:text-slate-400"
          {...props}
        />
      )}
    </div>
  );
}

// ── Paso 1: Resumen del Carrito ───────────────────────────────────────────────
function StepCart({ cartItems, cartTotal, onNext }) {
  const navigate = useNavigate();
  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center space-y-6 shadow-sm">
        <span className="text-6xl opacity-40 block">🛒</span>
        <h2 className="text-2xl font-bold text-slate-900">Tu carrito está vacío</h2>
        <p className="text-slate-500">Explora nuestras tiendas y encuentra lo que necesitas.</p>
        <Button onClick={() => navigate('/market')} className="bg-[#1a1200] text-[#fff8df] rounded-full px-8 py-3 font-bold hover:opacity-90">
          Ir al Mercado
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-900 mb-6 pb-4 border-b border-slate-100">
          Artículos en tu orden ({cartItems.length})
        </h2>
        <div className="space-y-5">
          {cartItems.map((item) => (
            <div key={item.product_id} className="flex gap-4 pb-5 border-b border-slate-50 last:border-0 last:pb-0">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                {item.product_image
                  ? <img src={getImageUrl(item.product_image)} alt={item.product_name} className="h-full w-full object-cover" />
                  : <span className="text-3xl opacity-20">🛍️</span>}
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-bold text-slate-900 truncate">{item.product_name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-extrabold text-[#c8960c] text-lg">
                  Bs {Number(item.subtotal || item.unit_price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-[rgba(201,150,12,0.2)] p-6 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">Total del pedido</p>
          <p className="text-3xl font-extrabold text-[#1a1200]">Bs {Number(cartTotal).toFixed(2)}</p>
        </div>
        <Button onClick={onNext} className="bg-[#1a1200] text-[#fff8df] font-bold px-8 py-3.5 rounded-full hover:opacity-90 shadow-lg">
          Continuar →
        </Button>
      </div>
    </div>
  );
}

// ── Paso 2: Datos de Facturación ──────────────────────────────────────────────
function StepBilling({ user, billingData, setBillingData, onNext, onBack }) {
  const handleChange = (e) => setBillingData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  const isValid = billingData.full_name && billingData.email && billingData.document_number;
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-10 shadow-sm space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Datos de facturación</h2>
        <p className="text-sm text-slate-500 mt-1">Estos datos aparecerán en tu comprobante de pago.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <FormInput id="full_name" label="Nombre completo" required placeholder="Como aparece en tu CI o pasaporte" value={billingData.full_name} onChange={handleChange} />
        </div>
        <FormInput id="email" label="Correo electrónico" required type="email" placeholder="correo@ejemplo.com" value={billingData.email} onChange={handleChange} />
        <FormInput id="phone" label="Teléfono" placeholder="+591 7XXXXXXX" value={billingData.phone} onChange={handleChange} />
        <FormInput id="document_type" label="Tipo de documento" required
          options={[
            { value: 'CI', label: 'Cédula de Identidad (CI)' },
            { value: 'NIT', label: 'NIT Empresa' },
            { value: 'PASSPORT', label: 'Pasaporte' },
          ]}
          value={billingData.document_type} onChange={handleChange} />
        <FormInput id="document_number" label="Número de documento" required placeholder="Ej: 1234567" value={billingData.document_number} onChange={handleChange} />
        <div className="sm:col-span-2">
          <FormInput id="billing_address" label="Dirección de facturación" placeholder="Ej: Av. Ballivián #120, Cochabamba" value={billingData.billing_address} onChange={handleChange} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="px-6 py-3 rounded-full border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
          ← Volver
        </button>
        <Button onClick={onNext} disabled={!isValid} className={`flex-1 py-3.5 rounded-full font-bold text-sm ${!isValid ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#1a1200] text-[#fff8df] hover:opacity-90'}`}>
          Continuar →
        </Button>
      </div>
    </div>
  );
}

// ── Paso 3: Entrega ───────────────────────────────────────────────────────────
function StepDelivery({ deliveryData, setDeliveryData, onNext, onBack }) {
  const isPickup = deliveryData.method === 'pickup';
  const isValid = deliveryData.method && (isPickup || deliveryData.address);
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-10 shadow-sm space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Método de entrega</h2>
        <p className="text-sm text-slate-500 mt-1">¿Cómo quieres recibir tu pedido?</p>
      </div>

      {/* Opciones de entrega */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { value: 'pickup', icon: '🏪', title: 'Recoger en tienda', desc: 'Sin costo adicional. Coordina con la tienda.' },
          { value: 'delivery', icon: '🚚', title: 'Delivery a domicilio', desc: 'Envío a tu dirección. Costo según zona.' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDeliveryData(prev => ({ ...prev, method: opt.value }))}
            className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
              deliveryData.method === opt.value
                ? 'border-[#c8960c] bg-[#fffbf0] shadow-lg shadow-[#c8960c]/10'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="text-3xl mb-3">{opt.icon}</div>
            <p className="font-bold text-slate-900 text-sm">{opt.title}</p>
            <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* Si elige delivery, mostrar campos de dirección */}
      {deliveryData.method === 'delivery' && (
        <div className="space-y-4 animate-fade-in">
          <div className="h-px bg-slate-100" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Dirección de entrega</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FormInput id="address" label="Dirección completa" required placeholder="Calle, número, zona/barrio" value={deliveryData.address} onChange={(e) => setDeliveryData(p => ({ ...p, address: e.target.value }))} />
            </div>
            <FormInput id="city" label="Ciudad" required placeholder="Ej: Cochabamba" value={deliveryData.city} onChange={(e) => setDeliveryData(p => ({ ...p, city: e.target.value }))} />
            <FormInput id="notes" label="Referencias / Notas" placeholder="Ej: Edificio azul, 2do piso" value={deliveryData.notes} onChange={(e) => setDeliveryData(p => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>
      )}

      {/* Si elige pickup, mostrar info */}
      {deliveryData.method === 'pickup' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 animate-fade-in">
          <p className="font-bold mb-1">📍 Información de recogida</p>
          <p>Una vez confirmado tu pedido, la tienda te contactará para coordinar el horario y punto de recogida.</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="px-6 py-3 rounded-full border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
          ← Volver
        </button>
        <Button onClick={onNext} disabled={!isValid} className={`flex-1 py-3.5 rounded-full font-bold text-sm ${!isValid ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#1a1200] text-[#fff8df] hover:opacity-90'}`}>
          Continuar →
        </Button>
      </div>
    </div>
  );
}

// ── Paso 4: Pago ──────────────────────────────────────────────────────────────
function StepPayment({ cartItems, cartTotal, billingData, deliveryData, paymentData, setPaymentData, onBack }) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const allPaymentMethods = [
    { value: 'card', icon: '💳', label: 'Tarjeta de crédito / débito' },
    { value: 'transfer', icon: '🏦', label: 'Transferencia bancaria' },
    { value: 'qr', icon: '📱', label: 'Pago QR (Bolivia)' },
    { value: 'cash', icon: '💵', label: 'Efectivo al entregar' },
  ];

  const paymentMethods = deliveryData.method === 'delivery' 
    ? allPaymentMethods.filter(m => m.value !== 'cash') 
    : allPaymentMethods;

  const [finalTotal, setFinalTotal] = useState(0);
  const [finalItems, setFinalItems] = useState([]);

  const isCardValid = paymentData.card_number?.length > 10 && paymentData.card_expiry && paymentData.card_cvv && paymentData.card_name;
  const canSubmit = agreedToTerms && paymentData.method && (paymentData.method !== 'card' || isCardValid);

  const handlePlaceOrder = async () => {
    if (!canSubmit) return;
    setPlacing(true);
    // Save the values securely
    setFinalTotal(cartTotal);
    setFinalItems(cartItems);
    
    // Simular procesamiento (aquí iría la integración con pasarela real)
    await new Promise(r => setTimeout(r, 1800));
    
    setPlacing(false);
    setPlaced(true);
  };

  const handleFinish = () => {
    clearCart();
    navigate('/market');
  };

  if (placed) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-12 md:p-16 text-center space-y-6 shadow-sm animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-4xl">✅</div>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">¡Pedido confirmado!</h2>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Tu orden ha sido registrada. Recibirás un correo a <b>{billingData.email}</b> con los detalles.</p>
        </div>
        <div className="inline-block bg-slate-50 border border-slate-200 rounded-2xl px-8 py-5 text-left space-y-3 text-sm text-slate-700 shadow-sm">
          <p>📦 Método: <b className="text-slate-900">{deliveryData.method === 'pickup' ? 'Recogida en tienda' : 'Delivery a domicilio'}</b></p>
          <p>💳 Pago: <b className="text-slate-900">{paymentMethods.find(m => m.value === paymentData.method)?.label}</b></p>
          <div className="border-t border-slate-200 pt-3 mt-1">
            <p className="flex justify-between items-center gap-6">
              <span>Total Pagado:</span>
              {/* Use finalTotal if available, fallback to cartTotal if finalTotal hasn't captured yet */}
              <b className="text-[#c8960c] text-xl">Bs {Number(finalTotal || cartTotal).toFixed(2)}</b>
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4">
          <Button onClick={() => alert("La impresión de facturas se implementará pronto. ¡Gracias por tu paciencia!")} className="bg-white border-2 border-slate-200 text-slate-700 rounded-full px-8 py-3 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-2">
            🖨️ Imprimir Factura
          </Button>
          <Button onClick={handleFinish} className="bg-[#1a1200] text-[#fff8df] rounded-full px-8 py-3 font-bold hover:opacity-90 transition-all">
            Seguir comprando
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métodos de pago */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Método de pago</h2>
          <p className="text-sm text-slate-500 mt-1">Selecciona cómo deseas pagar.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.value}
              onClick={() => setPaymentData(p => ({ ...p, method: method.value }))}
              className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all duration-200 ${
                paymentData.method === method.value
                  ? 'border-[#c8960c] bg-[#fffbf0] shadow-md shadow-[#c8960c]/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-2xl">{method.icon}</span>
              <span className="text-sm font-bold text-slate-800">{method.label}</span>
              {paymentData.method === method.value && (
                <span className="ml-auto w-5 h-5 bg-[#c8960c] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Datos de tarjeta si eligió card */}
        {paymentData.method === 'card' && (
          <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Datos de tarjeta</h3>
            <FormInput id="card_number" label="Número de tarjeta" placeholder="•••• •••• •••• ••••" maxLength="19" value={paymentData.card_number || ''} onChange={(e) => setPaymentData(p => ({ ...p, card_number: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <FormInput id="card_expiry" label="Vencimiento" placeholder="MM/AA" maxLength="5" value={paymentData.card_expiry || ''} onChange={(e) => setPaymentData(p => ({ ...p, card_expiry: e.target.value }))} />
              <FormInput id="card_cvv" label="CVV" placeholder="•••" maxLength="4" type="password" value={paymentData.card_cvv || ''} onChange={(e) => setPaymentData(p => ({ ...p, card_cvv: e.target.value }))} />
            </div>
            <FormInput id="card_name" label="Nombre en la tarjeta" placeholder="Como aparece en la tarjeta" value={paymentData.card_name || ''} onChange={(e) => setPaymentData(p => ({ ...p, card_name: e.target.value }))} />
          </div>
        )}

        {paymentData.method === 'transfer' && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 animate-fade-in">
            <p className="font-bold mb-2">🏦 Datos para transferencia</p>
            <p><b>Banco:</b> Banco Mercantil Santa Cruz</p>
            <p><b>Cuenta:</b> 1234567890</p>
            <p><b>Titular:</b> ShopyMarket SRL</p>
            <p className="mt-2 text-xs text-blue-600">Envía el comprobante por WhatsApp al confirmar.</p>
          </div>
        )}

        {paymentData.method === 'qr' && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center animate-fade-in">
            <p className="text-sm font-bold text-purple-800 mb-3">📱 Escanea el QR con tu app bancaria</p>
            <div className="w-40 h-40 mx-auto flex items-center justify-center overflow-hidden rounded-xl border border-purple-300 bg-white shadow-sm p-2">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PagoShopyMarket_Bs${Number(cartTotal).toFixed(2)}`} 
                alt="Código QR de Pago" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <p className="text-xs text-purple-600 mt-3 font-bold">Monto a pagar: Bs {Number(cartTotal).toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Resumen final */}
      <div className="bg-white rounded-3xl border border-[rgba(201,150,12,0.2)] p-6 md:p-8 shadow-sm space-y-5">
        <h2 className="text-lg font-extrabold text-slate-900">Resumen final</h2>

        <div className="space-y-2.5 text-sm text-slate-600">
          <div className="flex justify-between"><span>Subtotal ({cartItems.length} artículos)</span><span className="font-bold">Bs {Number(cartTotal).toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Envío</span><span className="font-bold text-[#c8960c]">{deliveryData.method === 'pickup' ? 'Gratis (recogida)' : 'Por calcular'}</span></div>
          <div className="flex justify-between text-base pt-2 border-t border-slate-100"><span className="font-bold text-slate-900">Total</span><span className="font-extrabold text-[#c8960c] text-xl">Bs {Number(cartTotal).toFixed(2)}</span></div>
        </div>

        <div className="space-y-3 pt-2">
          <Checkbox
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            label={<>Acepto los <a href="#" className="font-bold underline text-[#c8960c]">Términos y Condiciones</a> y la <a href="#" className="font-bold underline text-[#c8960c]">Política de Privacidad</a>.</>}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onBack} className="px-6 py-3 rounded-full border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
            ← Volver
          </button>
          <Button
            onClick={handlePlaceOrder}
            disabled={!canSubmit || placing}
            className={`flex-1 py-4 rounded-full font-extrabold text-sm uppercase tracking-wider transition-all ${
              !canSubmit ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
              placing ? 'bg-[#c8960c] text-white animate-pulse' :
              'bg-[#1a1200] text-[#fff8df] hover:opacity-90 shadow-xl shadow-[#1a1200]/20'
            }`}
          >
            {placing ? '⏳ Procesando...' : '🔒 Confirmar y Pagar'}
          </Button>
        </div>
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">Transacción 100% segura y encriptada</p>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 'cart',     label: 'Carrito'     },
  { id: 'billing',  label: 'Facturación' },
  { id: 'delivery', label: 'Entrega'     },
  { id: 'payment',  label: 'Pago'        },
];

export default function CheckoutPage() {
  const { cartItems, cartTotal, loadingCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const [billingData, setBillingData] = useState({
    full_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    document_type: 'CI',
    document_number: '',
    billing_address: user?.address || '',
  });

  const [deliveryData, setDeliveryData] = useState({
    method: '',
    address: user?.address || '',
    city: user?.city || '',
    notes: '',
  });

  const [paymentData, setPaymentData] = useState({ method: '' });

  if (loadingCart) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#c8960c] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] font-sans pb-20">
      <Navbar />

      {/* Stepper header */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm py-4">
        <div className="max-w-2xl mx-auto px-4">
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">
          {STEPS[step].label === 'Carrito' ? 'Revisa tu pedido' :
           STEPS[step].label === 'Facturación' ? 'Datos de facturación' :
           STEPS[step].label === 'Entrega' ? 'Método de entrega' :
           'Método de pago'}
        </h1>

        {step === 0 && (
          <StepCart cartItems={cartItems} cartTotal={cartTotal} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <StepBilling
            user={user}
            billingData={billingData}
            setBillingData={setBillingData}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepDelivery
            deliveryData={deliveryData}
            setDeliveryData={setDeliveryData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepPayment
            cartItems={cartItems}
            cartTotal={cartTotal}
            billingData={billingData}
            deliveryData={deliveryData}
            paymentData={paymentData}
            setPaymentData={setPaymentData}
            onBack={() => setStep(2)}
          />
        )}
      </main>
    </div>
  );
}
