import { useState } from 'react';
import Button from './Button';
import Icon from './Icon';

export default function PaymentModal({ isOpen, onClose, onSuccess, plan }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'expiry') {
      // Remove any non-digits
      value = value.replace(/\D/g, '');
      // Insert slash after first 2 digits
      if (value.length >= 3) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular procesamiento de pago
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Icon name="x" className="h-6 w-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-black text-[#1a1200] uppercase tracking-wider">Pago Seguro</h2>
          <p className="text-sm text-slate-500 mt-1">
            Estás adquiriendo: <strong className="text-[#c8960c]">{plan?.name}</strong> por Bs {plan?.price}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nombre en la Tarjeta
            </label>
            <input 
              type="text" 
              name="cardName"
              required
              placeholder="Ej. Juan Pérez"
              value={formData.cardName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#c8960c] focus:ring-2 focus:ring-[#c8960c]/20 outline-none transition-all font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Número de Tarjeta
            </label>
            <div className="relative">
              <input 
                type="text" 
                name="cardNumber"
                required
                maxLength="16"
                pattern="\d{16}"
                placeholder="0000 0000 0000 0000"
                value={formData.cardNumber}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#c8960c] focus:ring-2 focus:ring-[#c8960c]/20 outline-none transition-all font-mono text-slate-700"
              />
              <Icon name="credit-card" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vencimiento
              </label>
              <input 
                type="text" 
                name="expiry"
                required
                maxLength="5"
                placeholder="MM/YY"
                pattern="(0[1-9]|1[0-2])\/([0-9]{2})"
                value={formData.expiry}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#c8960c] focus:ring-2 focus:ring-[#c8960c]/20 outline-none transition-all font-mono text-slate-700 text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                CVC
              </label>
              <input 
                type="password" 
                name="cvc"
                required
                maxLength="3"
                pattern="\d{3}"
                placeholder="123"
                value={formData.cvc}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#c8960c] focus:ring-2 focus:ring-[#c8960c]/20 outline-none transition-all font-mono text-slate-700 text-center tracking-[0.2em]"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm font-bold uppercase tracking-wider rounded-xl bg-[#1a1200] text-[#f5d367] hover:bg-[#2c1f06] transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]"
            >
              {loading ? (
                <>
                  <Icon name="loader" className="h-5 w-5 animate-spin" />
                  Procesando Pago...
                </>
              ) : (
                <>
                  <Icon name="lock" className="h-4 w-4" />
                  Pagar Bs {plan?.price}
                </>
              )}
            </Button>
            <p className="text-center text-[10px] text-slate-400 mt-3 flex justify-center items-center gap-1 font-medium">
              <Icon name="shield-check" className="h-3 w-3" />
              Pagos protegidos con encriptación de 256 bits
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
