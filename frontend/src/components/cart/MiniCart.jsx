import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';
import { API_BASE_URL } from "@/config/appSettings";

export default function MiniCart() {
  const { isCartOpen, closeCart, cartItems, cartTotal, updateQuantity, removeFromCart, loadingCart } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/cart');
  };

  const API_BASE = API_BASE_URL;
  const getImageUrl = (url) => url ? (url.startsWith("http") ? url : `${API_BASE}${url}`) : null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />
      
      <div className="fixed inset-y-0 right-0 z-[110] w-full max-w-sm bg-[#faf9f5] shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-[rgba(201,150,12,0.1)]">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Mi Carrito</h2>
          <button 
            onClick={closeCart}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
              <span className="text-6xl">🛒</span>
              <p className="text-sm font-medium text-slate-500">Tu carrito está vacío</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product_id} className="flex gap-4">
                <div className="h-20 w-20 rounded-xl border border-[rgba(201,150,12,0.15)] bg-white overflow-hidden shrink-0 flex items-center justify-center">
                  {item.product_image ? (
                    <img src={getImageUrl(item.product_image)} alt={item.product_name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-20">🛍️</span>
                  )}
                </div>
                
                <div className="flex flex-col flex-1 min-w-0 justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{item.product_name}</h3>
                    <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600">
                      <span className="text-lg">🗑️</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-white border border-slate-200 rounded-full h-8">
                      <button 
                        onClick={() => updateQuantity(item.product_id, Math.max(1, Number(item.quantity) - 1))}
                        disabled={Number(item.quantity) <= 1 || loadingCart}
                        className={`w-8 h-full flex items-center justify-center font-bold transition-colors ${Number(item.quantity) <= 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product_id, Number(item.quantity) + 1)}
                        disabled={loadingCart || (item.product_stock !== undefined && Number(item.quantity) >= item.product_stock)}
                        className={`w-8 h-full flex items-center justify-center font-bold transition-colors ${item.product_stock !== undefined && Number(item.quantity) >= item.product_stock ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        +
                      </button>
                    </div>
                    <span className="font-extrabold text-[#c8960c] text-sm">
                      Bs {Number(item.unit_price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="bg-white border-t border-[rgba(201,150,12,0.1)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">Subtotal</span>
              <span className="text-lg font-extrabold text-slate-900">Bs {Number(cartTotal).toFixed(2)}</span>
            </div>
            <Button 
              onClick={handleCheckout}
              className="w-full bg-[#1a1200] text-[#fff8df] font-bold py-3.5 rounded-full hover:opacity-90 shadow-lg shadow-black/10 transition-all text-sm uppercase tracking-wider"
            >
              VER CARRITO
            </Button>
            <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-widest">
              Impuestos calculados en el checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
