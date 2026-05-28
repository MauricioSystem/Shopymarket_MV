/**
 * Public product & store exploration page. Fully accessible without authentication.
 * Authenticated users can proceed to purchase; unauthenticated users see a login prompt.
 *
 * Data sources (all public endpoints — no token required):
 *   - GET /api/stores
 *   - GET /api/products
 *   - GET /api/services
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import { getDisplayName, getProfileImageUrl } from "@/utils/userCapabilities";
import { getRoleLabel, AUTH_ROLES } from "@/utils/authRoles";
import {
  getAllProducts,
  getAllServices,
  getAllStores,
  getAllServiceProfiles,
} from "@/services/marketApi";

const TABS = [
  { id: "all", label: "Todo" },
  { id: "stores", label: "Tiendas" },
  { id: "products", label: "Productos" },
  { id: "services", label: "Servicios" },
];

function Navbar({
  isAuthenticated,
  user,
  role,
  onNavigate,
  onLogin,
  onProfile,
  onDashboard,
  onLogout,
}) {
  const isCustomer = role === AUTH_ROLES.CUSTOMER;

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(201,150,12,0.12)] bg-[#fffdf7]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate("home")}
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
            onClick={() => onNavigate("home")}
            className="text-sm font-semibold text-[#6f6041] hover:text-[#c8960c] transition-colors"
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => onNavigate("market")}
            className="text-sm font-semibold text-[#1a1200] border-b-2 border-[#c8960c] pb-0.5"
          >
            Explorar Mercado
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <Button
              type="button"
              onClick={onLogin}
              className="rounded-full bg-[#1a1200] px-5 py-2 text-xs font-bold text-[#fff8df] hover:opacity-90"
            >
              Ingresar
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onProfile}
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
                onClick={onProfile}
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

              {isCustomer && (
                <button
                  id="cart-btn-market"
                  type="button"
                  onClick={onDashboard}
                  aria-label="Carrito de compras"
                  title="Carrito (próximamente)"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(201,150,12,0.2)] bg-white hover:border-[#c8960c] hover:bg-[#fff8df] transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-4 h-4 text-[#1a1200]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                </button>
              )}

              {!isCustomer && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onDashboard}
                  className="rounded-full border border-[rgba(201,150,12,0.2)] px-4 py-2 text-xs font-bold"
                >
                  Mi Panel
                </Button>
              )}

              <button
                type="button"
                onClick={onLogout}
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

function StoreCard({ store, onClick }) {
  const API_BASE = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const logo = store.logo_url || store.profile_image_url;
  const logoUrl = logo
    ? logo.startsWith("http")
      ? logo
      : `${API_BASE}${logo}`
    : null;
  const bannerUrl = store.banner_url
    ? store.banner_url.startsWith("http")
      ? store.banner_url
      : `${API_BASE}${store.banner_url}`
    : null;
  const isDark =
    store.background_color &&
    store.background_color !== "#ffffff" &&
    store.background_color !== "#fff";
  const textColor = isDark ? "text-white" : "text-[#1a1200]";
  const mutedColor = isDark ? "text-white/50" : "text-[#6f6041]";

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden border border-[rgba(201,150,12,0.1)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      style={{ background: store.background_color || "#ffffff" }}
    >
      <div className="h-28 overflow-hidden bg-gradient-to-br from-white/10 to-transparent">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={`Banner de ${store.name}`}
            className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center opacity-10">
            <span className="text-5xl">{store.isServiceProfile ? "🔧" : "🏪"}</span>
          </div>
        )}
      </div>
      <div className="p-5 flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xl shrink-0 overflow-hidden">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`Logo de ${store.name}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            store.isServiceProfile ? "🔧" : "🏪"
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-extrabold text-sm truncate ${textColor}`}>
            {store.name}
          </p>
          {(store.city || store.country) && (
            <p className={`text-xs mt-0.5 truncate ${mutedColor}`}>
              📍 {[store.city, store.country].filter(Boolean).join(", ")}
            </p>
          )}
          {store.description && (
            <p
              className={`text-xs mt-2 line-clamp-2 leading-relaxed ${mutedColor}`}
            >
              {store.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function ProductCard({ product, isAuthenticated, onBuy }) {
  const API_BASE = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const imageUrl = product.image_url
    ? product.image_url.startsWith("http")
      ? product.image_url
      : `${API_BASE}${product.image_url}`
    : null;

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="h-44 bg-slate-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-4xl opacity-20">
            🛍️
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="font-bold text-sm text-slate-900 truncate">
            {product.name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
            {product.description || "Sin descripción"}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-extrabold text-[#c8960c]">
              Bs {Number(product.price || 0).toFixed(2)}
            </p>
            {product.stock !== undefined && (
              <p className="text-[0.65rem] text-slate-400">
                Stock: {product.stock}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onBuy}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              isAuthenticated
                ? "bg-[#1a1200] text-[#fff8df] hover:opacity-80"
                : "border border-[rgba(201,150,12,0.3)] text-[#c8960c] hover:bg-[#c8960c]/5"
            }`}
          >
            {isAuthenticated ? "🛒 Comprar" : "🔐 Ingresar"}
          </button>
        </div>
        {product.average_rating > 0 && (
          <p className="text-[0.65rem] text-slate-400">
            {"⭐".repeat(Math.round(Number(product.average_rating)))}{" "}
            {Number(product.average_rating).toFixed(1)}
          </p>
        )}
      </div>
    </article>
  );
}

function ServiceCard({ service, onClick }) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-sm text-slate-900 truncate">
            {service.name}
          </p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {service.description || "Sin descripción"}
          </p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0">
          🔧
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-[#c8960c]/10 text-[#c8960c] font-bold px-3 py-1">
          Bs {Number(service.price || 0).toFixed(2)}
        </span>
        {service.estimated_time && (
          <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-1">
            ⏱ {service.estimated_time}
          </span>
        )}
      </div>
    </article>
  );
}

function LoginPromptModal({ onClose, onLogin }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="rounded-3xl border border-[rgba(201,150,12,0.2)] bg-[#fffdf7] p-8 shadow-2xl max-w-sm w-full space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-2">
          <div className="text-4xl">🛒</div>
          <h3 className="text-xl font-bold text-[#1a1200]">
            Inicia sesión para comprar
          </h3>
          <p className="text-sm text-[#6f6041]">
            Puedes ver todo el catálogo sin cuenta. Regístrate solo cuando
            quieras comprar.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={onLogin}
            className="w-full bg-[#1a1200] text-[#fff8df] hover:opacity-90 font-bold"
          >
            Iniciar sesión / Registrarse
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#6f6041] hover:text-[#1a1200] transition-colors"
          >
            Seguir explorando →
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 6, className = "" }) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-52 rounded-2xl bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center col-span-full">
      <p className="text-3xl mb-3">🔍</p>
      <p className="text-sm text-slate-500">{message}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 text-xs font-bold text-[#c8960c] hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default function MarketPage() {
  const { token, user, role, isAuthenticated, logout, setCurrentView, setSelectedStoreId, setSelectedServiceProfileId } =
    useAuth();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState([]);
  const [serviceProfiles, setServiceProfiles] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navigate = (view) => setCurrentView(view);

  const loadMarketData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [storesResult, servicesResult, productsResult, profilesResult] = await Promise.all([
        getAllStores(null),
        getAllServices(null),
        getAllProducts(null),
        getAllServiceProfiles(null),
      ]);
      setStores(Array.isArray(storesResult?.data) ? storesResult.data : []);
      setServiceProfiles(Array.isArray(profilesResult?.data) ? profilesResult.data : []);
      setServices(
        Array.isArray(servicesResult?.data) ? servicesResult.data : [],
      );
      setProducts(
        Array.isArray(productsResult?.data) ? productsResult.data : [],
      );
    } catch (err) {
      setError(err?.message || "No fue posible cargar el mercado.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  const handleBuyProduct = useCallback(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      // Future: cart logic
    }
  }, [isAuthenticated]);

  const filteredProducts = useMemo(() => {
    const activeStoreIds = new Set(stores.filter(s => !s.status || s.status === 'active').map(s => Number(s.id)));
    const activeProds = products.filter(
      (p) => (!p.status || p.status === 'active') && activeStoreIds.has(Number(p.store_id))
    );
    if (!searchQuery.trim()) return activeProds;
    const q = searchQuery.toLowerCase();
    return activeProds.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [products, stores, searchQuery]);

  const filteredStores = useMemo(() => {
    const activeStores = stores.filter(s => !s.status || s.status === 'active').map(s => ({ ...s, isServiceProfile: false }));
    const activeProfiles = serviceProfiles.filter(p => !p.status || p.status === 'active').map(p => ({ ...p, isServiceProfile: true }));
    const combined = [...activeStores, ...activeProfiles];
    if (!searchQuery.trim()) return combined;
    const q = searchQuery.toLowerCase();
    return combined.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q),
    );
  }, [stores, serviceProfiles, searchQuery]);

  const filteredServices = useMemo(() => {
    const activeServs = services.filter(s => !s.status || s.status === 'active');
    if (!searchQuery.trim()) return activeServs;
    const q = searchQuery.toLowerCase();
    return activeServs.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q),
    );
  }, [services, searchQuery]);


  return (
    <main className="min-h-screen bg-slate-50 text-[#1a1200] font-sans">
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        role={role}
        onNavigate={navigate}
        onLogin={() => navigate("login")}
        onProfile={() => navigate("profile")}
        onDashboard={() => navigate("dashboard")}
        onLogout={logout}
      />

      {showLoginModal && (
        <LoginPromptModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            setShowLoginModal(false);
            navigate("login");
          }}
        />
      )}

      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#c8960c]">
            Mercado ShopyMarket
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Explora tiendas, productos y servicios
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 leading-relaxed">
            Navega libremente. Necesitas cuenta solo para comprar o contratar.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="search"
                placeholder="Buscar productos, tiendas o servicios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#c8960c] focus:ring-2 focus:ring-[#c8960c]/20 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
            </div>
            <Button
              type="button"
              onClick={loadMarketData}
              variant="secondary"
              className="whitespace-nowrap text-sm"
            >
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 flex items-center gap-3">
            <span>⚠️</span> {error}
            <button
              type="button"
              onClick={loadMarketData}
              className="ml-auto text-xs font-bold underline"
            >
              Reintentar
            </button>
          </div>
        )}


        <div
          className="flex gap-2 flex-wrap"
          role="tablist"
          aria-label="Filtros del mercado"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-[#1a1200] text-[#fff8df] shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {(activeTab === "all" || activeTab === "stores") && (
          <section aria-labelledby="stores-section-heading">
            <h2
              id="stores-section-heading"
              className="text-xl font-bold text-slate-900 mb-5"
            >
              🏪 Tiendas
            </h2>
            {loading ? (
              <SkeletonGrid
                count={3}
                className="sm:grid-cols-2 lg:grid-cols-3"
              />
            ) : filteredStores.length === 0 ? (
              <EmptyState
                message={
                  searchQuery
                    ? `Sin resultados para "${searchQuery}"`
                    : "Aún no hay tiendas registradas."
                }
                actionLabel={
                  !isAuthenticated ? "Crea la primera tienda →" : null
                }
                onAction={() => navigate("store-setup")}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStores.map((store) => (
                  <StoreCard
                    key={store.isServiceProfile ? `profile-${store.id}` : `store-${store.id}`}
                    store={store}
                    onClick={() => {
                      if (store.isServiceProfile) {
                        setSelectedStoreId(store.store_id || null);
                        setSelectedServiceProfileId(store.id);
                      } else {
                        setSelectedStoreId(store.id);
                        setSelectedServiceProfileId(null);
                      }
                      setCurrentView("store-detail");
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {(activeTab === "all" || activeTab === "products") && (
          <section aria-labelledby="products-section-heading">
            <h2
              id="products-section-heading"
              className="text-xl font-bold text-slate-900 mb-5"
            >
              📦 Productos
            </h2>
            {loading ? (
              <SkeletonGrid
                count={4}
                className="sm:grid-cols-2 lg:grid-cols-4"
              />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                message={
                  searchQuery
                    ? `Sin productos para "${searchQuery}"`
                    : "Aún no hay productos publicados."
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAuthenticated={isAuthenticated}
                    onBuy={handleBuyProduct}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {(activeTab === "all" || activeTab === "services") && (
          <section aria-labelledby="services-section-heading">
            <h2
              id="services-section-heading"
              className="text-xl font-bold text-slate-900 mb-5"
            >
              🔧 Servicios
            </h2>
            {loading ? (
              <SkeletonGrid
                count={3}
                className="sm:grid-cols-2 lg:grid-cols-3"
              />
            ) : filteredServices.length === 0 ? (
              <EmptyState
                message={
                  searchQuery
                    ? `Sin servicios para "${searchQuery}"`
                    : "Aún no hay servicios publicados."
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => {
                      setSelectedStoreId(service.store_id || null);
                      setSelectedServiceProfileId(service.service_profile_id);
                      setCurrentView("store-detail");
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {!isAuthenticated && !loading && (
          <div className="rounded-3xl border border-[rgba(201,150,12,0.2)] bg-gradient-to-br from-[#fffdf7] to-[#fdf5d5] p-8 text-center space-y-4">
            <p className="text-xl font-extrabold text-[#1a1200]">
              ¿Listo para comprar o vender?
            </p>
            <p className="text-sm text-[#6f6041]">
              Crea tu cuenta gratis y accede a todo el mercado de ShopyMarket.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                onClick={() => navigate("login")}
                className="bg-[#1a1200] text-[#fff8df] font-bold px-8 hover:opacity-90"
              >
                Crear cuenta gratis
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("login")}
                className="border border-[rgba(201,150,12,0.3)] text-[#c8960c]"
              >
                Iniciar sesión
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
