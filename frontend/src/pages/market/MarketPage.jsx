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
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import Navbar from "@/components/layout/Navbar";
import { getDisplayName, getProfileImageUrl } from "@/utils/userCapabilities";
import { useCart } from "../../context/CartContext";
import { getRoleLabel, AUTH_ROLES } from "@/utils/authRoles";
import {
  getAllProducts,
  getAllServices,
  getAllStores,
  getAllServiceProfiles,
  getAllCategories,
} from "@/services/marketApi";
import { API_BASE_URL } from "@/config/appSettings";

const TABS = [
  { id: "all", label: "Todo", icon: "🌐" },
  { id: "stores", label: "Tiendas", icon: "🏪" },
  { id: "products", label: "Productos", icon: "🛍️" },
  { id: "services", label: "Servicios", icon: "🔧" },
];

// Navbar is imported globally

function StoreCard({ store, onClick }) {
  const API_BASE = API_BASE_URL;
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
      className="group cursor-pointer rounded-md overflow-hidden border border-[rgba(201,150,12,0.1)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
        <div className="h-12 w-12 rounded bg-white/10 border border-white/10 flex items-center justify-center text-xl shrink-0 overflow-hidden">
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

function ProductCard({ product, isAuthenticated, onBuy, onClick }) {
  const API_BASE = API_BASE_URL;
  const imageUrl = product.image_url
    ? product.image_url.startsWith("http")
      ? product.image_url
      : `${API_BASE}${product.image_url}`
    : null;

  return (
    <article onClick={onClick} className="group cursor-pointer rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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
            onClick={(e) => {
              e.stopPropagation();
              if (onBuy) onBuy(product);
            }}
            className={`rounded-md px-4 py-2 text-xs font-bold transition-all ${isAuthenticated
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
  const API_BASE = API_BASE_URL;
  const imageUrl = service.image_url
    ? service.image_url.startsWith("http")
      ? service.image_url
      : `${API_BASE}${service.image_url}`
    : null;

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-md border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
    >
      <div className="h-40 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-4xl opacity-30">🔧</div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="min-w-0">
          <p className="font-bold text-sm text-slate-900 truncate">
            {service.name}
          </p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {service.description || "Sin descripción"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs pt-2 mt-auto">
          <span className="rounded-md bg-[#c8960c]/10 text-[#c8960c] font-bold px-3 py-1">
            Bs {Number(service.price || 0).toFixed(2)}
          </span>
          {service.estimated_time && (
            <span className="rounded-md bg-slate-100 text-slate-600 px-3 py-1">
              ⏱ {service.estimated_time}
            </span>
          )}
        </div>
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
        className="rounded-lg border border-[rgba(201,150,12,0.2)] bg-[#fffdf7] p-8 shadow-2xl max-w-sm w-full space-y-5"
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
        <div key={i} className="h-52 rounded-md bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-12 text-center col-span-full">
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
  const { token, user, role, isAuthenticated, logout, capabilities } = useAuth();
  const { addToCart, openCart } = useCart();
  const routerNavigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState([]);
  const [serviceProfiles, setServiceProfiles] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const navigate = (view) => {
    const viewToRoute = {
      home: "/home",
      login: "/login",
      register: "/register",
      market: "/market",
      profile: "/profile",
      dashboard: capabilities?.canAccessAdminPanel ? "/dashboard/admin" : capabilities?.canAccessVendorPanel ? "/dashboard/vendor" : capabilities?.canDeliverOrders ? "/dashboard/delivery" : "/profile",
      "store-setup": "/dashboard/vendor",
    };
    routerNavigate(viewToRoute[view] || "/home");
  };

  const loadMarketData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [storesResult, servicesResult, productsResult, profilesResult, categoriesResult] = await Promise.all([
        getAllStores(null),
        getAllServices(null),
        getAllProducts(null),
        getAllServiceProfiles(null),
        getAllCategories(null),
      ]);
      setStores(Array.isArray(storesResult?.data) ? storesResult.data : []);
      setServiceProfiles(Array.isArray(profilesResult?.data) ? profilesResult.data : []);
      setServices(
        Array.isArray(servicesResult?.data) ? servicesResult.data : [],
      );
      setProducts(
        Array.isArray(productsResult?.data) ? productsResult.data : [],
      );
      setCategories(
        Array.isArray(categoriesResult?.data) ? categoriesResult.data : [],
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

  const handleBuyProduct = useCallback(async (product) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      const success = await addToCart(product, 1);
      if (success) openCart();
    }
  }, [isAuthenticated, addToCart, openCart]);

  // Reset selected category if not compatible with the newly selected tab
  useEffect(() => {
    if (selectedCategoryId) {
      const cat = categories.find(c => Number(c.id) === Number(selectedCategoryId));
      if (!cat) return;
      if (activeTab === "products" && cat.type !== "product") {
        setSelectedCategoryId(null);
      } else if (activeTab === "services" && cat.type !== "service") {
        setSelectedCategoryId(null);
      }
    }
  }, [activeTab, selectedCategoryId, categories]);

  // Filter categories to show only relevant ones based on current tab
  const displayedCategories = useMemo(() => {
    if (activeTab === "products") {
      return categories.filter((cat) => cat.type === "product");
    }
    if (activeTab === "services") {
      return categories.filter((cat) => cat.type === "service");
    }
    return categories;
  }, [categories, activeTab]);

  // Compute available cities dynamically
  const availableCities = useMemo(() => {
    const citiesSet = new Set();
    stores.forEach(s => s?.city && citiesSet.add(s.city.trim()));
    serviceProfiles.forEach(p => p?.city && citiesSet.add(p.city.trim()));
    return Array.from(citiesSet);
  }, [stores, serviceProfiles]);

  const filteredProducts = useMemo(() => {
    const activeStoreIds = new Set(stores.filter(s => !s.status || s.status === 'active').map(s => Number(s.id)));
    let activeProds = products.filter(
      (p) => (!p.status || p.status === 'active') && activeStoreIds.has(Number(p.store_id))
    );

    if (selectedCategoryId) {
      activeProds = activeProds.filter(p => Number(p.category_id) === Number(selectedCategoryId));
    }

    if (selectedCity) {
      activeProds = activeProds.filter((p) => {
        const storeObj = stores.find(s => Number(s.id) === Number(p.store_id));
        return storeObj?.city?.toLowerCase() === selectedCity.toLowerCase();
      });
    }

    if (priceRange.min) {
      activeProds = activeProds.filter(p => Number(p.price) >= Number(priceRange.min));
    }
    if (priceRange.max) {
      activeProds = activeProds.filter(p => Number(p.price) <= Number(priceRange.max));
    }

    if (!searchQuery.trim()) return activeProds;
    const q = searchQuery.toLowerCase();
    return activeProds.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [products, stores, searchQuery, selectedCategoryId, selectedCity, priceRange]);

  const filteredStores = useMemo(() => {
    const activeStores = stores.filter(s => !s.status || s.status === 'active').map(s => ({ ...s, isServiceProfile: false }));
    const activeProfiles = serviceProfiles.filter(p => !p.status || p.status === 'active').map(p => ({ ...p, isServiceProfile: true }));
    let combined = [...activeStores, ...activeProfiles];

    if (selectedCity) {
      combined = combined.filter(s => s.city?.toLowerCase() === selectedCity.toLowerCase());
    }

    if (selectedCategoryId) {
      combined = combined.filter((s) => {
        if (s.isServiceProfile) {
          const hasService = services.some(
            (srv) => Number(srv.service_profile_id) === Number(s.id) && Number(srv.category_id) === Number(selectedCategoryId)
          );
          return hasService;
        } else {
          const hasProduct = products.some(
            (p) => Number(p.store_id) === Number(s.id) && Number(p.category_id) === Number(selectedCategoryId)
          );
          return hasProduct;
        }
      });
    }

    if (!searchQuery.trim()) return combined;
    const q = searchQuery.toLowerCase();
    return combined.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q),
    );
  }, [stores, serviceProfiles, searchQuery, selectedCategoryId, selectedCity, products, services]);

  const filteredServices = useMemo(() => {
    let activeServs = services.filter(s => !s.status || s.status === 'active');

    if (selectedCategoryId) {
      activeServs = activeServs.filter(s => Number(s.category_id) === Number(selectedCategoryId));
    }

    if (selectedCity) {
      activeServs = activeServs.filter((s) => {
        const profileObj = serviceProfiles.find(p => Number(p.id) === Number(s.service_profile_id));
        return profileObj?.city?.toLowerCase() === selectedCity.toLowerCase();
      });
    }

    if (priceRange.min) {
      activeServs = activeServs.filter(s => Number(s.price) >= Number(priceRange.min));
    }
    if (priceRange.max) {
      activeServs = activeServs.filter(s => Number(s.price) <= Number(priceRange.max));
    }

    if (!searchQuery.trim()) return activeServs;
    const q = searchQuery.toLowerCase();
    return activeServs.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q),
    );
  }, [services, serviceProfiles, searchQuery, selectedCategoryId, selectedCity, priceRange]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(91,141,255,0.02),transparent_28%),linear-gradient(180deg,#faf9f5,#f5f2e9)] text-[#1a1200] font-sans pb-16">
      <Navbar />

      {showLoginModal && (
        <LoginPromptModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            setShowLoginModal(false);
            navigate("login");
          }}
        />
      )}

      {/* Hero section */}
      <div className="border-b border-[rgba(201,150,12,0.1)] bg-white/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c8960c]">
              Mercado ShopyMarket
            </p>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Explora tiendas, productos y servicios
            </h1>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Navega libremente. Necesitas cuenta solo para comprar o contratar.
            </p>
          </div>
          <Button
            type="button"
            onClick={loadMarketData}
            className="whitespace-nowrap text-xs font-bold bg-[#1a1200] text-[#fff8df] hover:opacity-90 self-start md:self-auto rounded-md py-2.5 px-5"
          >
            🔄 Actualizar Mercado
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filters Toggle Button */}
          <div className="lg:hidden w-full">
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-between rounded-md border border-[rgba(201,150,12,0.15)] bg-white/95 px-5 py-3.5 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🎛️</span>
                <span>{showMobileFilters ? "Ocultar Filtros" : "Mostrar Filtros y Categorías"}</span>
              </div>
              <span className={`text-slate-400 transform transition-transform duration-200 ${showMobileFilters ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>

          {/* Sidebar de Filtros (Columna Izquierda) */}
          <aside
            className={`w-full lg:w-72 shrink-0 lg:block ${
              showMobileFilters ? "block" : "hidden"
            }`}
          >
            <div className="sticky top-20 rounded-lg border border-[rgba(201,150,12,0.12)] bg-white/70 backdrop-blur-md p-6 shadow-sm space-y-6">
              
              {/* Buscador */}
              <div className="space-y-2">
                <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#6f6041]">
                  Búsqueda
                </label>
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 pl-4 pr-10 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#c8960c] focus:ring-2 focus:ring-[#c8960c]/20 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    🔍
                  </span>
                </div>
              </div>

              {/* Tipo de Comercio */}
              <div className="space-y-2">
                <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#6f6041]">
                  Tipo de Comercio
                </label>
                <div className="flex flex-col gap-1.5">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between rounded px-4 py-2.5 text-xs font-bold transition-all ${
                        activeTab === tab.id
                          ? "bg-[#1a1200] text-[#fff8df] shadow-sm"
                          : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </div>
                      {activeTab === tab.id && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorías Globales */}
              <div className="space-y-2">
                <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#6f6041]">
                  Categorías Globales
                </label>
                <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(null)}
                    className={`w-full text-left rounded px-3 py-2.5 text-xs font-bold transition-all ${
                      selectedCategoryId === null
                        ? "bg-[#c8960c]/10 text-[#c8960c]"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    📁 Todas las Categorías
                  </button>
                  {displayedCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`w-full text-left rounded px-3 py-2.5 text-xs font-bold transition-all ${
                        Number(selectedCategoryId) === Number(cat.id)
                          ? "bg-[#c8960c]/10 text-[#c8960c] font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {cat.type === "product" ? "🛍️" : "🔧"} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#6f6041]">
                  Ubicación
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-[#c8960c] transition-all cursor-pointer font-semibold"
                >
                  <option value="">📍 Todo Bolivia</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      📍 {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de Precios */}
              <div className="space-y-2">
                <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#6f6041]">
                  Rango de Precios
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min Bs"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-1/2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#c8960c]"
                  />
                  <span className="text-slate-300 text-xs">—</span>
                  <input
                    type="number"
                    placeholder="Max Bs"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-1/2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#c8960c]"
                  />
                </div>
              </div>

              {/* Limpiar Filtros */}
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                  setSelectedCategoryId(null);
                  setSelectedCity("");
                  setPriceRange({ min: "", max: "" });
                }}
                className="w-full text-center text-xs font-bold text-red-500 hover:text-red-600 hover:underline pt-3 border-t border-slate-100 transition-all cursor-pointer"
              >
                Limpiar Filtros
              </button>

            </div>
          </aside>

          {/* Grilla Masiva de Contenidos (Columna Derecha) */}
          <div className="flex-1 space-y-8 min-w-0">
            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 flex items-center gap-3">
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

            {(activeTab === "all" || activeTab === "stores") && (
              <section aria-labelledby="stores-section-heading">
                <h2
                  id="stores-section-heading"
                  className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2"
                >
                  🏪 Tiendas y Comercios
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 rounded-md px-2.5 py-0.5">
                    {filteredStores.length}
                  </span>
                </h2>
                {loading ? (
                  <SkeletonGrid
                    count={3}
                    className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  />
                ) : filteredStores.length === 0 ? (
                  <EmptyState
                    message={
                      searchQuery || selectedCategoryId || selectedCity
                        ? "Sin resultados para los filtros seleccionados."
                        : "Aún no hay tiendas registradas."
                    }
                    actionLabel={
                      !isAuthenticated ? "Crea la primera tienda →" : null
                    }
                    onAction={() => navigate("store-setup")}
                  />
                ) : (
                  <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredStores.map((store) => (
                      <StoreCard
                        key={store.isServiceProfile ? `profile-${store.id}` : `store-${store.id}`}
                        store={store}
                        onClick={() => {
                          if (store.isServiceProfile) {
                            routerNavigate(`/service/${encodeURIComponent(store.name)}`);
                          } else {
                            routerNavigate(`/store/${encodeURIComponent(store.name)}`);
                          }
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
                  className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2"
                >
                  📦 Productos
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 rounded-md px-2.5 py-0.5">
                    {filteredProducts.length}
                  </span>
                </h2>
                {loading ? (
                  <SkeletonGrid
                    count={4}
                    className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  />
                ) : filteredProducts.length === 0 ? (
                  <EmptyState
                    message={
                      searchQuery || selectedCategoryId || selectedCity || priceRange.min || priceRange.max
                        ? "Sin productos para los filtros seleccionados."
                        : "Aún no hay productos publicados."
                    }
                  />
                ) : (
                  <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredProducts.map((product) => {
                      const storeForProduct = stores.find(s => Number(s.id) === Number(product.store_id) && !s.isServiceProfile);
                      return (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isAuthenticated={isAuthenticated}
                          onBuy={handleBuyProduct}
                          onClick={() => {
                            routerNavigate(`/product/${product.id}`);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {(activeTab === "all" || activeTab === "services") && (
              <section aria-labelledby="services-section-heading">
                <h2
                  id="services-section-heading"
                  className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2"
                >
                  🔧 Servicios
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 rounded-md px-2.5 py-0.5">
                    {filteredServices.length}
                  </span>
                </h2>
                {loading ? (
                  <SkeletonGrid
                    count={3}
                    className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  />
                ) : filteredServices.length === 0 ? (
                  <EmptyState
                    message={
                      searchQuery || selectedCategoryId || selectedCity || priceRange.min || priceRange.max
                        ? "Sin servicios para los filtros seleccionados."
                        : "Aún no hay servicios publicados."
                    }
                  />
                ) : (
                  <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredServices.map((service) => {
                      const profileForService = serviceProfiles.find(p => Number(p.id) === Number(service.service_profile_id));
                      return (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          onClick={() => {
                            routerNavigate(`/service-detail/${service.id}`);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {!isAuthenticated && !loading && (
              <div className="rounded-lg border border-[rgba(201,150,12,0.2)] bg-gradient-to-br from-[#fffdf7] to-[#fdf5d5] p-8 text-center space-y-4">
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

        </div>
      </div>
    </main>
  );
}

