/**
 * Public landing page for ShopyMarket MV. Accessible to ALL users (authenticated or not).
 *
 * Sections:
 *   1. Navbar                  — navigation + conditional auth buttons
 *   2. Hero Carousel           — animated slides with 3 audience CTAs
 *   3. Products Grid           — real products from GET /api/products (public)
 *   4. Stores Grid             — real stores from GET /api/stores (public)
 *   5. Services Grid           — individual services from GET /api/services (public)
 *   6. Audience Cards          — pitches for Clients, Vendors, Delivery
 *   7. Footer
 */

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { AUTH_ROLES } from "@/utils/authRoles";
import BrandMark from "@/components/ui/BrandMark";
import Button from "@/components/ui/Button";
import { getDisplayName, getProfileImageUrl } from "@/utils/userCapabilities";
import { getRoleLabel } from "@/utils/authRoles";
import { getAllProducts, getAllStores, getAllServiceProfiles, getAllServices } from "@/services/marketApi";

const HERO_SLIDES = [
  {
    title: "Tu mercado digital, todo en un lugar",
    desc: "Compra productos locales, contrata servicios y rastrea tus pedidos en tiempo real.",
    badge: "ShopyMarket MV",
    image: "/carousel/img1.png",
    cta: { label: "Explorar Catálogo", view: "market" },
  },
  {
    title: "Digitaliza tu negocio hoy mismo",
    desc: "Crea tu tienda virtual, personaliza colores, sube productos y ofrece servicios al mundo.",
    badge: "Para Vendedores",
    image: "/carousel/img2.png",
    cta: { label: "Crear mi Tienda", view: "vendor" },
  },
  {
    title: "Entrega ágil, gana más",
    desc: "Únete como repartidor, toma órdenes pagadas y planifica tus rutas de entrega.",
    badge: "Para Repartidores",
    image: "/carousel/img3.png",
    cta: { label: "Unirme como Repartidor", view: "delivery" },
  },
];

const AUDIENCE_CARDS = [
  {
    id: "clients",
    icon: "🛍️",
    title: "Para Compradores",
    subtitle: "Compra sin límites",
    description:
      "Explora tiendas locales, compara precios, contrata servicios a domicilio y rastrea tu pedido en tiempo real. No necesitas cuenta para ver el catálogo.",
    perks: [
      "Catálogo público gratuito",
      "Descuentos con suscripción",
      "Envío gratuito Premium",
      "Puntos canjeables",
    ],
    ctaLabel: "Ver Catálogo",
    ctaView: "market",
    requiresAuth: false,
    theme: {
      bg: "bg-white/60",
      border: "border-[rgba(201,150,12,0.12)]",
      accent: "text-[#c8960c]",
      cta: "bg-[#1a1200] text-[#fff8df]",
    },
  },
  {
    id: "vendors",
    icon: "🏪",
    title: "Para Vendedores",
    subtitle: "Abre tu comercio digital",
    description:
      "Crea tu tienda, sube productos con imágenes, gestiona tu inventario y ofrece servicios profesionales desde un mismo panel. Ecommerce híbrido: productos + servicios.",
    perks: [
      "Tienda de productos",
      "Perfil de servicios",
      "Personalización visual",
      "Estadísticas de ventas",
    ],
    ctaLabel: "Crear mi Tienda",
    ctaView: "vendor",
    requiresAuth: true,
    theme: {
      bg: "bg-[#07111f]",
      border: "border-[#f5d367]/20",
      accent: "text-[#f5d367]",
      cta: "bg-[#f5d367] text-[#120c00]",
    },
  },
  {
    id: "delivery",
    icon: "🚚",
    title: "Para Repartidores",
    subtitle: "Genera ingresos entregando",
    description:
      "Visualiza órdenes pagadas listas para recoger, planifica tu ruta de entrega óptima y actualiza el estado del pedido para mantener informado al cliente.",
    perks: [
      "Órdenes disponibles",
      "Seguimiento de ruta",
      "Historial de entregas",
      "Gestión de estado",
    ],
    ctaLabel: "Registrarme como Repartidor",
    ctaView: "delivery",
    requiresAuth: true,
    theme: {
      bg: "bg-[rgba(84,51,27,0.95)]",
      border: "border-[rgba(201,147,90,0.2)]",
      accent: "text-[#f7d98d]",
      cta: "bg-[#f7d98d] text-[#2a1800]",
    },
  },
];

function ProductCard({ product, onBuy, onClick }) {
  const API_BASE = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const imageUrl = product.image_url
    ? product.image_url.startsWith("http")
      ? product.image_url
      : `${API_BASE}${product.image_url}`
    : null;

  return (
    <article className="group rounded-md border border-[rgba(201,150,12,0.1)] bg-white/70 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-[0_12px_30px_-8px_rgba(200,150,12,0.12)] hover:-translate-y-1 transition-all duration-300">
      <div className="h-40 bg-[#f5f0e4] overflow-hidden">
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
          <div className="h-full flex items-center justify-center text-4xl opacity-30">
            🛍️
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-bold text-[#1a1200] text-sm truncate">
          {product.name}
        </p>
        <p className="text-xs text-[#6f6041] mt-1 line-clamp-2 leading-relaxed">
          {product.description || "Sin descripción"}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-base font-extrabold text-[#c8960c]">
            Bs {Number(product.price || 0).toFixed(2)}
          </p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (onBuy) onBuy(product); }}
            className="text-xs font-bold rounded-full bg-[#1a1200] text-[#fff8df] px-3 py-1.5 hover:opacity-80 transition-opacity"
          >
            Comprar
          </button>
        </div>

        {product.average_rating > 0 && (
          <p className="text-[0.65rem] text-[#6f6041] mt-1.5">
            {"⭐".repeat(Math.round(product.average_rating))} (
            {product.average_rating})
          </p>
        )}
      </div>
    </article>
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

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-md overflow-hidden border border-[rgba(201,150,12,0.12)] shadow-sm hover:shadow-[0_12px_30px_-8px_rgba(200,150,12,0.1)] hover:-translate-y-1 transition-all duration-300"
      style={{ background: store.background_color || "#fff" }}
    >
      <div className="h-24 bg-gradient-to-br from-[rgba(245,211,103,0.15)] to-transparent overflow-hidden">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt={`Banner de ${store.name}`}
            className="h-full w-full object-cover opacity-70"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </div>
      <div className="p-4 flex items-center gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`Logo de ${store.name}`}
            className="h-10 w-10 rounded object-cover border border-white/20 shrink-0"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="h-10 w-10 rounded bg-white/20 flex items-center justify-center text-lg shrink-0">
            🏪
          </div>
        )}
        <div className="min-w-0">
          <p
            className="font-bold text-sm truncate"
            style={{ color: store.background_color ? "#fff" : "#1a1200" }}
          >
            {store.name}
          </p>
          {store.city && (
            <p
              className="text-xs opacity-60 truncate"
              style={{ color: store.background_color ? "#fff" : "#6f6041" }}
            >
              📍 {store.city}
              {store.country ? `, ${store.country}` : ""}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

/** Card de servicio individual — con botón para ver el perfil del proveedor */
function ServiceCard({ service, onViewProfile }) {
  const API_BASE = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const imageUrl = service.image_url
    ? service.image_url.startsWith("http")
      ? service.image_url
      : `${API_BASE}${service.image_url}`
    : null;

  return (
    <article className="group rounded-md border border-[rgba(99,102,241,0.15)] bg-white/70 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-[0_12px_30px_-8px_rgba(99,102,241,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Imagen o placeholder */}
      <div className="h-40 bg-gradient-to-br from-[#ede9fe] to-[#e0e7ff] overflow-hidden shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-4xl opacity-30">🔧</div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="font-bold text-[#1a1200] text-sm truncate">{service.name}</p>
        <p className="text-xs text-[#6f6041] mt-1 line-clamp-2 leading-relaxed flex-1">
          {service.description || "Sin descripción"}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-base font-extrabold text-[#4f46e5]">
            Bs {Number(service.price || 0).toFixed(2)}
          </p>
          {service.estimated_time && (
            <span className="text-[0.65rem] font-semibold text-[#6366f1] bg-[#ede9fe] rounded-full px-2.5 py-1">
              ⏱ {service.estimated_time}
            </span>
          )}
        </div>

        {/* Botón de acción */}
        <button
          type="button"
          onClick={onViewProfile}
          className="mt-3 w-full rounded-full bg-[#4f46e5] text-white text-xs font-bold py-2 hover:bg-[#4338ca] transition-colors"
        >
          Ver perfil del proveedor →
        </button>
      </div>
    </article>
  );
}

function LoginModal({ onClose, onLogin }) {
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
          <div className="text-4xl">🔐</div>
          <h3 className="text-xl font-bold text-[#1a1200]">
            Inicia sesión para comprar
          </h3>
          <p className="text-sm text-[#6f6041]">
            Puedes explorar el catálogo sin cuenta, pero necesitas registrarte
            para comprar.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={onLogin}
            className="w-full bg-[#1a1200] text-[#fff8df] hover:opacity-90 font-bold"
          >
            Iniciar sesión
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



export default function HomePage() {
  const { isAuthenticated, user, role, logout, capabilities } = useAuth();
  const { addToCart, openCart } = useCart();
  const routerNavigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);

  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  // Servicios individuales para su propia sección (tipo catálogo)
  const [services, setServices] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loadingMarket, setLoadingMarket] = useState(true);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const loadMarketData = useCallback(async () => {
    setLoadingMarket(true);
    try {
      const [productsResult, storesResult, profilesResult, servicesResult] = await Promise.all([
        getAllProducts(null),
        getAllStores(null),
        getAllServiceProfiles(null),
        getAllServices(null),
      ]);

      // ── Tiendas activas + perfiles de servicio activos combinados ──
      const allStores = Array.isArray(storesResult?.data) ? storesResult.data : [];
      const activeStores = allStores.filter(s => s.status === 'active' || !s.status)
        .map(s => ({ ...s, isServiceProfile: false }));

      const allProfiles = Array.isArray(profilesResult?.data) ? profilesResult.data : [];
      const activeProfiles = allProfiles.filter(p => p.status === 'active' || !p.status)
        .map(p => ({ ...p, isServiceProfile: true }));

      setStores([...activeStores, ...activeProfiles].slice(0, 6));
      setAllProfiles(activeProfiles);

      // ── Servicios individuales activos (catálogo) ──
      const allServices = Array.isArray(servicesResult) ? servicesResult
        : Array.isArray(servicesResult?.data) ? servicesResult.data : [];
      const activeServices = allServices.filter(s => s.status === 'active' || !s.status);
      setServices(activeServices.slice(0, 8));

      // ── Productos (filtrados a tiendas activas) ──
      const activeStoreIds = new Set(activeStores.map(s => Number(s.id)));
      const allProducts = Array.isArray(productsResult?.data) ? productsResult.data : [];
      const activeProducts = allProducts.filter(
        (p) => (!p.status || p.status === 'active') && activeStoreIds.has(Number(p.store_id))
      );
      setProducts(activeProducts.slice(0, 8));
    } catch (err) {
      console.error("Error loading home market data:", err);
    } finally {
      setLoadingMarket(false);
    }
  }, []);

  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const navigate = (view) => {
    const viewToRoute = {
      home: "/home",
      login: "/login",
      register: "/register",
      market: "/market",
      profile: "/dashboard",
      dashboard: capabilities?.canAccessAdminPanel ? "/dashboard/administrator" : capabilities?.canAccessVendorPanel ? "/dashboard/vendor" : capabilities?.canDeliverOrders ? "/dashboard/delivery" : "/dashboard/customer",
      "store-setup": "/dashboard/vendor",
    };
    routerNavigate(viewToRoute[view] || "/home");
  };

  const handleAudienceCTA = (card) => {
    if (!card.requiresAuth || isAuthenticated) {
      if (card.id === "vendors") {
        routerNavigate(isAuthenticated ? "/dashboard/vendor" : "/register");
      } else if (card.id === "delivery") {
        routerNavigate(isAuthenticated ? "/dashboard/delivery" : "/register");
      } else {
        navigate(card.ctaView);
      }
    } else {
      routerNavigate("/register");
    }
  };

  const handleHeroCTA = (slide) => {
    if (slide.cta.view === "market") routerNavigate("/market");
    else if (slide.cta.view === "vendor")
      routerNavigate(isAuthenticated ? "/dashboard/vendor" : "/register");
    else routerNavigate(isAuthenticated ? "/dashboard/delivery" : "/register");
  };

  const handleBuyProduct = async (product) => { if (isAuthenticated) { const success = await addToCart(product, 1); if (success) openCart(); } else { setShowLoginModal(true); } };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.06),transparent_35%),linear-gradient(180deg,#fffdf7,#fdf9ec)] text-[#1a1200] font-sans">
      <Navbar />

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            setShowLoginModal(false);
            navigate("login");
          }}
        />
      )}
      <section
        className="relative h-[500px] w-full overflow-hidden bg-[#040912] sm:h-[560px]"
        aria-label="Presentación de ShopyMarket"
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            aria-hidden={idx !== activeSlide}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            {/* Solid dark base background */}
            <div className="absolute inset-0 bg-[#040912]" />

            {/* Background image with subtle slow zoom (Ken Burns effect) */}
            {slide.image && (
              <img
                src={slide.image}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-out opacity-65 ${
                  idx === activeSlide ? "scale-105" : "scale-100"
                }`}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}

            {/* Dark gradient overlay to ensure text readability (softened to let the image show through) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#040912] via-black/50 to-black/30" />

            {/* Radial glow effect */}
            <div
              className="absolute inset-0 opacity-25 transition-opacity duration-1000"
              style={{
                background: `radial-gradient(circle at ${40 + idx * 20}% 40%, rgba(245,211,103,0.35), transparent 65%)`,
              }}
            />

            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 space-y-6">
              <span className="inline-block rounded-full border border-[#f5d367]/20 bg-[#f5d367]/10 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#f5d367]">
                {slide.badge}
              </span>
              <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
                {slide.title}
              </h2>
              <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                {slide.desc}
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleHeroCTA(slide)}
                  className="rounded-full bg-[#f5d367] text-[#120c00] px-8 py-3 text-xs font-extrabold uppercase tracking-wider hover:bg-[#ffeb99] shadow-[0_4px_20px_rgba(245,211,103,0.3)] transition-all"
                >
                  {slide.cta.label}
                </button>
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => routerNavigate("/register")}
                    className="rounded-full border border-white/20 bg-white/5 text-white px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all"
                  >
                    Crear Cuenta
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30"
          role="tablist"
          aria-label="Diapositivas"
        >
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === activeSlide}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === activeSlide ? "w-8 bg-[#f5d367]" : "w-2 bg-white/30 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
        aria-labelledby="products-heading"
      >
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#c8960c]">
              Catálogo
            </p>
            <h2
              id="products-heading"
              className="text-2xl font-extrabold tracking-tight text-[#1a1200] sm:text-3xl"
            >
              Productos disponibles ahora
            </h2>
            <p className="text-sm text-[#6f6041]">
              Explora libremente. Necesitarás cuenta solo para comprar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("market")}
            className="text-sm font-bold text-[#c8960c] hover:underline whitespace-nowrap"
          >
            Ver todo el catálogo →
          </button>
        </div>

        {loadingMarket ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-60 rounded-md bg-[#f5f0e4] animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-md border border-dashed border-[rgba(201,150,12,0.2)] bg-white/50 p-12 text-center">
            <p className="text-3xl mb-3">📦</p>
            <p className="text-sm text-[#6f6041]">
              Aún no hay productos publicados. ¡Sé el primero en vender!
            </p>
            <button
              type="button"
              onClick={() =>
                navigate(isAuthenticated ? "store-setup" : "login")
              }
              className="mt-4 text-xs font-bold text-[#c8960c] hover:underline"
            >
              Crear mi tienda →
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onBuy={handleBuyProduct} onClick={() => routerNavigate(`/product/${product.id}`)} />
            ))}
          </div>
        )}
      </section>

      {(stores.length > 0 || loadingMarket) && (
        <section
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6"
          aria-labelledby="stores-heading"
        >
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#c8960c]">
                Comercios
              </p>
              <h2
                id="stores-heading"
                className="text-2xl font-extrabold tracking-tight text-[#1a1200] sm:text-3xl"
              >
                Tiendas en ShopyMarket
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("market")}
              className="text-sm font-bold text-[#c8960c] hover:underline whitespace-nowrap"
            >
              Ver todas las tiendas →
            </button>
          </div>

          {loadingMarket ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-md bg-[#f5f0e4] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {stores.map((store) => (
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

      {/* ── Sección: Catálogo de Servicios ────────────────────────────── */}
      {(services.length > 0 || loadingMarket) && (
        <section
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6"
          aria-labelledby="services-heading"
        >
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#6366f1]">
                Servicios
              </p>
              <h2
                id="services-heading"
                className="text-2xl font-extrabold tracking-tight text-[#1a1200] sm:text-3xl"
              >
                Servicios disponibles ahora
              </h2>
              <p className="text-sm text-[#6f6041]">
                Contrata expertos locales para lo que necesites.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("market")}
              className="text-sm font-bold text-[#6366f1] hover:underline whitespace-nowrap"
            >
              Ver todos los servicios →
            </button>
          </div>

          {loadingMarket ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-60 rounded-md bg-[#ede9fe]/50 animate-pulse" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-md border border-dashed border-[rgba(99,102,241,0.2)] bg-white/50 p-12 text-center">
              <p className="text-3xl mb-3">🔧</p>
              <p className="text-sm text-[#6f6041]">
                Aún no hay servicios publicados. ¡Sé el primero en ofrecer uno!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {services.map((service) => { const profileForService = allProfiles.find(p => Number(p.id) === Number(service.service_profile_id)); return <ServiceCard key={service.id} service={service} onViewProfile={() => { if (profileForService) { routerNavigate(`/service/${encodeURIComponent(profileForService.name)}`); } }} onClick={() => routerNavigate(`/service-detail/${service.id}`)} />; })}
            </div>
          )}
        </section>
      )}

      <section
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6"
        aria-labelledby="audience-heading"
      >
        <div className="mb-14 text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#c8960c]">
            ¿Quién eres?
          </p>
          <h2
            id="audience-heading"
            className="text-3xl font-extrabold tracking-tight text-[#1a1200] sm:text-4xl"
          >
            Una plataforma para cada perfil
          </h2>
          <p className="text-sm text-[#6f6041] leading-relaxed">
            ShopyMarket es un ecosistema híbrido: compradores, comerciantes y
            repartidores en un solo lugar.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {AUDIENCE_CARDS.map((card) => (
            <div
              key={card.id}
              className={`group flex flex-col justify-between rounded-lg border ${card.theme.border} ${card.theme.bg} p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm`}
            >
              <div className="space-y-5">
                <div className="text-4xl">{card.icon}</div>
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.3em] ${card.theme.accent}`}
                  >
                    {card.subtitle}
                  </p>
                  <h3
                    className={`mt-1 text-xl font-extrabold ${card.id === "clients" ? "text-[#1a1200]" : "text-white"}`}
                  >
                    {card.title}
                  </h3>
                </div>
                <p
                  className={`text-xs leading-relaxed ${card.id === "clients" ? "text-[#6f6041]" : "text-white/60"}`}
                >
                  {card.description}
                </p>
                <ul className="space-y-1.5">
                  {card.perks.map((perk) => (
                    <li
                      key={perk}
                      className={`flex items-center gap-2 text-xs ${card.id === "clients" ? "text-[#6f6041]" : "text-white/50"}`}
                    >
                      <span
                        className={`text-[0.6rem] font-bold ${card.theme.accent}`}
                      >
                        ✓
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleAudienceCTA(card)}
                className={`mt-8 w-full rounded-full py-3 text-xs font-extrabold uppercase tracking-wider transition-all hover:opacity-90 ${card.theme.cta}`}
              >
                {card.ctaLabel}
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[rgba(201,150,12,0.12)] bg-[#fffdf7] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <BrandMark compact tone="dark" />
            <div className="flex flex-wrap gap-5 text-xs font-semibold text-[#6f6041]">
              <button
                type="button"
                onClick={() => navigate("market")}
                className="hover:text-[#c8960c] transition-colors"
              >
                Explorar Mercado
              </button>
              <button
                type="button"
                onClick={() =>
                  routerNavigate(isAuthenticated ? "/dashboard/vendor" : "/register")
                }
                className="hover:text-[#c8960c] transition-colors"
              >
                Vender en ShopyMarket
              </button>
              <button
                type="button"
                onClick={() => navigate("login")}
                className="hover:text-[#c8960c] transition-colors"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[rgba(201,150,12,0.1)] text-center text-xs text-[#6f6041]">
            <p>© 2026 ShopyMarket MV — Todos los derechos reservados.</p>
            <p className="mt-1 opacity-60">
              Plataforma de ecommerce híbrida: productos y servicios en un solo
              lugar.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}



