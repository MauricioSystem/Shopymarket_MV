import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getDisplayName, getProfileImageUrl } from '../../utils/userCapabilities';
import { getRoleLabel, AUTH_ROLES } from '../../utils/authRoles';
import BrandMark from '../ui/BrandMark';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const navigate = useNavigate();

  const isCustomer = role === AUTH_ROLES.CUSTOMER;

  const handleLogin = () => {
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleDashboard = () => {
    if (role === AUTH_ROLES.ADMIN) {
      navigate('/dashboard/admin');
    } else if (role === AUTH_ROLES.VENDOR) {
      navigate('/dashboard/vendor');
    } else if (role === AUTH_ROLES.DELIVERY) {
      navigate('/dashboard/delivery');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(201,150,12,0.12)] bg-[#fffdf7]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/home')}
          aria-label="Ir al inicio"
        >
          <BrandMark compact tone="dark" />
        </button>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Navegación principal"
        >
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="text-sm font-semibold text-[#6f6041] hover:text-[#c8960c] transition-colors"
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => navigate('/market')}
            className="text-sm font-semibold text-[#6f6041] hover:text-[#c8960c] transition-colors"
          >
            Explorar Mercado
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button
                onClick={openCart}
                className="relative p-2 text-slate-500 hover:text-[#c8960c] transition-colors"
                aria-label="Ver carrito"
              >
                <span className="text-xl">🛒</span>
              </button>
              <Button
                type="button"
                onClick={handleLogin}
                className="rounded-full bg-[#1a1200] px-5 py-2 text-xs font-bold text-[#fff8df] hover:opacity-90 shadow-[0_4px_16px_rgba(26,18,0,0.15)]"
              >
                Ingresar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {isCustomer && (
                <button
                  type="button"
                  onClick={() => navigate('/my-orders')}
                  className="text-sm font-semibold text-[#6f6041] hover:text-[#c8960c] transition-colors"
                >
                  Mis Pedidos
                </button>
              )}
              <button
                onClick={openCart}
                className="relative p-2 text-slate-500 hover:text-[#c8960c] transition-colors"
                aria-label="Ver carrito"
              >
                <span className="text-xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleProfile}
                className="hidden flex-col items-end sm:flex group select-none"
              >
                <p className="text-xs font-semibold text-[#1a1200] group-hover:text-[#c8960c] transition-colors">
                  {getDisplayName(user)}
                </p>
                <p className="text-[0.6rem] text-[#6f6041]">
                  {getRoleLabel(role)}
                </p>
              </button>

              <button
                type="button"
                onClick={handleProfile}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(201,150,12,0.2)] bg-white text-xs font-bold overflow-hidden shrink-0 hover:border-[#c8960c] transition-all"
                aria-label="Ver perfil"
              >
                {user?.profile_image_url ? (
                  <img
                    src={getProfileImageUrl(user.profile_image_url)}
                    alt="Perfil"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  user?.first_name?.[0]?.toUpperCase() || "?"
                )}
              </button>

              {!isCustomer && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDashboard}
                  className="rounded-full border border-[rgba(201,150,12,0.2)] px-4 py-2 text-xs font-bold"
                >
                  Mi Panel
                </Button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-bold text-[#6f6041] hover:text-red-500 transition-colors"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
