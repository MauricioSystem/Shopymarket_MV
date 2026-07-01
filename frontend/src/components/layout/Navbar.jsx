import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getDisplayName, getProfileImageUrl } from '../../utils/userCapabilities';
import { AUTH_ROLES } from '../../utils/authRoles';
import BrandMark from '../ui/BrandMark';
import Icon from '../ui/Icon';

// ─── Nav link helper ──────────────────────────────────────────────────────────
function NavLink({ label, to, onClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = pathname === to || (to !== '/home' && pathname.startsWith(to));

  const handleClick = () => {
    if (onClick) { onClick(); return; }
    navigate(to);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        'text-sm font-semibold transition-colors whitespace-nowrap',
        active
          ? 'text-[#c8960c]'
          : 'text-[#6f6041] hover:text-[#c8960c]',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, onClick }) {
  const [imgError, setImgError] = useState(false);
  const initial = user?.first_name?.[0]?.toUpperCase() || '?';
  const imgSrc = user?.profile_image_url && !imgError
    ? getProfileImageUrl(user.profile_image_url)
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(201,150,12,0.25)] bg-white text-xs font-bold text-[#c8960c] overflow-hidden hover:border-[#c8960c] transition-all"
      aria-label="Ver perfil"
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt="Perfil"
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        initial
      )}
    </button>
  );
}

// ─── Cart button ──────────────────────────────────────────────────────────────
function CartButton({ count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative p-1.5 text-[#6f6041] hover:text-[#c8960c] transition-colors"
      aria-label={`Carrito${count > 0 ? ` (${count})` : ''}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        className="h-5 w-5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold border border-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────
function ActionBtn({ label, onClick, variant = 'ghost' }) {
  const base = 'text-xs font-bold transition-colors whitespace-nowrap';
  const styles = {
    ghost: `${base} text-[#6f6041] hover:text-[#c8960c]`,
    danger: `${base} text-[#6f6041] hover:text-red-500`,
    primary: `${base} rounded-full bg-[#1a1200] px-4 py-1.5 text-[#fff8df] hover:opacity-90 shadow-sm`,
    outline: `${base} rounded-full border border-[rgba(201,150,12,0.3)] px-4 py-1.5 text-[#1a1200] hover:border-[#c8960c]`,
  };
  return (
    <button type="button" onClick={onClick} className={styles[variant]}>
      {label}
    </button>
  );
}

// ─── Role-based right actions ─────────────────────────────────────────────────
function RightActions({ user, role, isAuthenticated, cartCount, openCart, navigate, logout }) {
  const isCustomer  = role === AUTH_ROLES.CUSTOMER;
  const isVendor    = role === AUTH_ROLES.VENDOR;
  const isDelivery  = role === AUTH_ROLES.DELIVERY;

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const profileImg = () => <Avatar user={user} onClick={() => navigate('/profile')} />;

  // ── Visitor ────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <ActionBtn label="Ingresar"    onClick={() => navigate('/login')}    variant="outline" />
        <ActionBtn label="Registrarse" onClick={() => navigate('/register')} variant="primary" />
      </div>
    );
  }

  // ── Customer ───────────────────────────────────────────────────────────────
  if (isCustomer) {
    return (
      <div className="flex items-center gap-3">
        <CartButton count={cartCount} onClick={openCart} />
        <NavLink label="Mis Pedidos" to="/my-orders" />
        {profileImg()}
        <ActionBtn label="Salir" onClick={handleLogout} variant="danger" />
      </div>
    );
  }

  // ── Vendor ─────────────────────────────────────────────────────────────────
  if (isVendor) {
    return (
      <div className="flex items-center gap-3">
        <ActionBtn label="Mi Tienda" onClick={() => navigate('/dashboard/vendor-panel')} variant="ghost" />
        <ActionBtn label="Pedidos"   onClick={() => navigate('/dashboard/vendor')}       variant="ghost" />
        {profileImg()}
        <ActionBtn label="Salir" onClick={handleLogout} variant="danger" />
      </div>
    );
  }

  // ── Delivery ───────────────────────────────────────────────────────────────
  if (isDelivery) {
    return (
      <div className="flex items-center gap-3">
        <ActionBtn label="Entregas" onClick={() => navigate('/dashboard/delivery')} variant="ghost" />
        <ActionBtn label="Pedidos"  onClick={() => navigate('/dashboard/delivery')} variant="ghost" />
        {profileImg()}
        <ActionBtn label="Salir" onClick={handleLogout} variant="danger" />
      </div>
    );
  }

  // ── Admin / fallback ────────────────────────────────────────────────────────
  return (
    <div className="flex items-center gap-3">
      {profileImg()}
      <ActionBtn label="Salir" onClick={handleLogout} variant="danger" />
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 h-[87px] border-b border-[rgba(201,150,12,0.12)] bg-[#fffdf7]/90 backdrop-blur-xl">
      {/*
        Layout: 3 fixed-width zones via CSS grid.
        - left  : nav links (flex-start)
        - center: logo    (absolute centered — always at 50%)
        - right : actions (flex-end)
      */}
      <div className="relative flex h-full w-full items-center px-6 lg:px-8">

        {/* ── LEFT – Navigation ── */}
        <nav
          className="hidden md:flex items-center gap-7 z-10"
          aria-label="Navegación principal"
        >
          <NavLink label="Inicio"          to="/home"   />
          <NavLink label="Explorar Mercado" to="/market" />
          <NavLink label="Mis Planes" to="/plans" />
        </nav>

        {/* ── CENTER – Logo (absolute to guarantee true centering) ── */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          aria-label="ShopyMarket MV"
        >
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#c8960c] rounded"
            aria-label="Ir al inicio"
          >
            <BrandMark compact tone="dark" />
          </button>
        </div>

        {/* ── RIGHT – User actions ── */}
        <div className="hidden md:flex ml-auto z-10">
          <RightActions
            user={user}
            role={role}
            isAuthenticated={isAuthenticated}
            cartCount={cartCount}
            openCart={openCart}
            navigate={navigate}
            logout={logout}
          />
        </div>

        {/* ── Mobile hamburger (small screens) ── */}
        <div className="md:hidden ml-auto z-10">
          <MobileMenu
            isAuthenticated={isAuthenticated}
            role={role}
            navigate={navigate}
            logout={logout}
            openCart={openCart}
            cartCount={cartCount}
          />
        </div>

      </div>
    </header>
  );
}

// ─── Mobile dropdown menu ────────────────────────────────────────────────────

function MobileMenu({ isAuthenticated, role, navigate, logout, openCart, cartCount }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const go = (path) => { close(); navigate(path); };
  const handleLogout = async () => { close(); await logout(); navigate('/login'); };

  const isCustomer = role === AUTH_ROLES.CUSTOMER;
  const isVendor   = role === AUTH_ROLES.VENDOR;
  const isDelivery = role === AUTH_ROLES.DELIVERY;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center h-10 w-10 border border-[#c8960c]/30 bg-[#1a1200] text-[#fff8df] hover:bg-[#c8960c] hover:text-[#1a1200] transition-all duration-300 rounded-none shadow-md"
        aria-label="Menú"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={close} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-56 rounded-none border-2 border-[#c8960c]/40 bg-[#fffdf7] shadow-2xl z-50 py-1.5 divide-y divide-[rgba(201,150,12,0.1)]">
            {/* Navigation */}
            <div className="py-1">
              <MobileItem label="Inicio" icon="home" onClick={() => go('/home')}   />
              <MobileItem label="Explorar Mercado" icon="market" onClick={() => go('/market')} />
              <MobileItem label="Mis Planes" icon="star" onClick={() => go('/plans')} />
            </div>

            {!isAuthenticated ? (
              <div className="py-1">
                <MobileItem label="Ingresar"    onClick={() => go('/login')}    />
                <MobileItem label="Registrarse" onClick={() => go('/register')} />
              </div>
            ) : (
              <>
                <div className="py-1">
                  {isCustomer && (
                    <>
                      <MobileItem label={`Carrito${cartCount > 0 ? ` (${cartCount})` : ''}`} icon="cart" onClick={() => { close(); openCart(); }} />
                      <MobileItem label="Mis Pedidos" icon="box" onClick={() => go('/my-orders')} />
                    </>
                  )}
                  {isVendor && (
                    <>
                      <MobileItem label="Mi Tienda" icon="store" onClick={() => go('/dashboard/vendor-panel')} />
                      <MobileItem label="Pedidos" icon="list" onClick={() => go('/dashboard/vendor')}       />
                    </>
                  )}
                  {isDelivery && (
                    <>
                      <MobileItem label="Entregas" icon="truck" onClick={() => go('/dashboard/delivery')} />
                      <MobileItem label="Pedidos" icon="list" onClick={() => go('/dashboard/delivery')} />
                    </>
                  )}
                  <MobileItem label="Perfil" icon="user" onClick={() => go('/profile')} />
                </div>
                <div className="py-1">
                  <MobileItem label="Salir" onClick={handleLogout} danger />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MobileItem({ label, icon, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-250 flex items-center gap-3',
        danger
          ? 'text-red-500 hover:bg-red-50/80 border-l-2 border-transparent hover:border-red-500'
          : 'text-[#1a1200] hover:bg-[#c8960c]/10 hover:text-[#c8960c] border-l-2 border-transparent hover:border-[#c8960c]',
      ].join(' ')}
    >
      {icon && <Icon name={icon} className={`h-5 w-5 shrink-0 ${danger ? 'text-red-500' : 'text-[#6f6041]'}`} />}
      <span>{label}</span>
    </button>
  );
}
