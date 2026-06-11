import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import Icon from "@/components/ui/Icon";
import { useCart } from "../../context/CartContext";
import { AUTH_ROLES } from "@/utils/authRoles";
import {
  getAllProducts,
  getAllServices,
  getAllStores,
  getAllServiceProfiles,
  getAllCategories,
} from "@/services/marketApi";
import { API_BASE_URL } from "@/config/appSettings";
import { ProductVoteButtons } from "@/components/RatingActions";
import {
  getStoreRating,
  submitStoreRating,
  getItemLikes,
  submitItemVote,
} from "@/utils/ratingStorage";

// ── Rating/Voting Buttons for Stores ─────────────────────────────────────────

function StoreRatingButtons({ stats, userId, canInteract, onRate, loading }) {
  const userRating = userId ? Number(stats?.userVotes?.[userId] || 0) : 0;
  const average = Number(stats?.average || 0);
  const count = Number(stats?.count || 0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (event, value) => {
    event.stopPropagation();
    if (!canInteract) return;
    onRate(value);
  };

  return (
    <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-slate-100" onClick={e => e.stopPropagation()}>
      <div className="flex items-center flex-wrap gap-0.5">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = hoverRating ? star <= hoverRating : star <= (userRating || Math.round(average));
            return (
              <button
                key={star}
                type="button"
                disabled={loading}
                onMouseEnter={() => canInteract && setHoverRating(star)}
                onMouseLeave={() => canInteract && setHoverRating(0)}
                onClick={(e) => handleStarClick(e, star)}
                className={`p-0.5 transition-colors focus:outline-none ${
                  !canInteract ? 'cursor-default' : 'cursor-pointer'
                }`}
                title={canInteract ? `Calificar con ${star} estrellas` : `Calificación promedio: ${average}`}
              >
                <Icon
                  name="star"
                  className={`h-3.5 w-3.5 shrink-0 ${
                    active
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-slate-200 hover:text-[#c8960c]'
                  }`}
                />
              </button>
            );
          })}
        </div>
        <span className="text-xs font-bold text-slate-700 ml-1.5">
          {average > 0 ? average.toFixed(1) : "0.0"}
        </span>
      </div>
      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
        ({count} {count === 1 ? "voto" : "votos"})
      </div>
    </div>
  );
}

// ── Cards ────────────────────────────────────────────────────────────────────

function StoreCard({ store, productCount, serviceCount, userId, canRate, onRate, rateLoading, onClick }) {
  const API_BASE = API_BASE_URL;
  const logo = store.logo_url || store.profile_image_url;
  const logoUrl = logo ? (logo.startsWith("http") ? logo : `${API_BASE}${logo}`) : null;
  const bannerUrl = store.banner_url ? (store.banner_url.startsWith("http") ? store.banner_url : `${API_BASE}${store.banner_url}`) : null;

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-none border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-[#c8960c] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
    >
      <div className="flex flex-col">
        <div className="h-32 bg-slate-100 overflow-hidden relative rounded-none shrink-0 border-b border-slate-100">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt=""
              className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-[#1a1200] to-[#2c1f06] opacity-90 flex items-center justify-center">
              <Icon name={store.isServiceProfile ? "wrench" : "store"} className="h-12 w-12 text-[#f5d367]/20" />
            </div>
          )}
        </div>
        <div className="p-4 relative flex flex-col gap-2 flex-1">
          {/* Logo Overlapping */}
          <div className="absolute -top-8 left-4 h-16 w-16 bg-white border border-slate-200 flex items-center justify-center overflow-hidden rounded-none shadow-md">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <Icon name={store.isServiceProfile ? "wrench" : "store"} className="h-8 w-8 text-[#c8960c]" />
            )}
          </div>
          <div className="pt-8 min-w-0 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#1a1200] group-hover:text-[#c8960c] transition-colors truncate">
                {store.name}
              </h3>
              {(store.city || store.country) && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 truncate">
                  <Icon name="pin" className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{[store.city, store.country].filter(Boolean).join(", ")}</span>
                </p>
              )}
              {store.description && (
                <p className="text-xs text-slate-550 mt-2 line-clamp-2 leading-relaxed">
                  {store.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0 shrink-0">
        <StoreRatingButtons
          stats={store.ratingStats}
          userId={userId}
          canInteract={canRate}
          onRate={onRate}
          loading={rateLoading}
        />
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#c8960c] bg-[#c8960c]/5 px-2.5 py-0.5 rounded-none">
            {store.isServiceProfile ? `${serviceCount} servicios` : `${productCount} productos`}
          </span>
        </div>
      </div>
    </article>
  );
}

function ProductCard({
  product,
  storeName,
  isAuthenticated,
  canInteract,
  onBuy,
  onClick,
  onVote,
  voteLoading,
  userId,
}) {
  const API_BASE = API_BASE_URL;
  const imageUrl = product.image_url ? (product.image_url.startsWith("http") ? product.image_url : `${API_BASE}${product.image_url}`) : null;

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-none border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-[#c8960c] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
    >
      <div className="h-44 bg-slate-50 overflow-hidden relative rounded-none flex items-center justify-center shrink-0 border-b border-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <Icon name="market" className="h-10 w-10 text-[#c8960c]/20" />
        )}
        {product.stock !== undefined && product.stock <= 0 ? (
          <div className="absolute top-3 right-3 bg-red-50 border border-red-200 text-red-600 text-[9px] font-black tracking-widest px-2.5 py-1 uppercase rounded-none shadow-sm">
            Sin Stock
          </div>
        ) : (
          product.stock <= 5 && (
            <div className="absolute top-3 right-3 bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-black tracking-widest px-2.5 py-1 uppercase rounded-none shadow-sm">
              Últimas {product.stock}
            </div>
          )
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1">
          {storeName && (
            <p className="text-[10px] font-bold text-[#c8960c] uppercase tracking-wider truncate">
              {storeName}
            </p>
          )}
          <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#c8960c] transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-xs text-slate-505 line-clamp-2 leading-relaxed">
            {product.description || "Sin descripción"}
          </p>
        </div>
        <div className="space-y-2.5 shrink-0 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-[#c8960c]">
              Bs {Number(product.price || 0).toFixed(2)}
            </span>
            {product.stock !== undefined && (
              <span className="text-[10px] font-bold text-slate-400">
                Stock: {product.stock}
              </span>
            )}
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onBuy) onBuy(product);
            }}
            className="w-full flex items-center justify-center gap-1.5 bg-[#1a1200] text-[#fff8df] text-xs font-bold py-2.5 rounded-none hover:bg-[#c8960c] hover:text-[#1a1200] transition-colors"
          >
            <Icon name={isAuthenticated ? "cart" : "lock"} className="h-3.5 w-3.5 shrink-0" />
            <span>{isAuthenticated ? "Agregar al carrito" : "Ingresar"}</span>
          </button>

          <div className="pt-1">
            <ProductVoteButtons
              likes={product.likesData?.likes || 0}
              dislikes={product.likesData?.dislikes || 0}
              userVote={userId ? product.likesData?.userVotes?.[userId] || 0 : 0}
              canInteract={canInteract}
              onVote={(vote) => onVote(product, vote)}
              loading={voteLoading === product.id}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function ServiceCard({
  service,
  providerName,
  isAuthenticated,
  canInteract,
  onClick,
  onVote,
  voteLoading,
  userId,
}) {
  const API_BASE = API_BASE_URL;
  const imageUrl = service.image_url ? (service.image_url.startsWith("http") ? service.image_url : `${API_BASE}${service.image_url}`) : null;

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-none border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
    >
      <div className="h-44 bg-gradient-to-br from-indigo-50 to-blue-50 overflow-hidden relative shrink-0 flex items-center justify-center border-b border-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <Icon name="wrench" className="h-10 w-10 text-indigo-400/20" />
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1">
          {providerName && (
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider truncate">
              {providerName}
            </p>
          )}
          <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
            {service.name}
          </h3>
          <p className="text-xs text-slate-505 line-clamp-2 leading-relaxed">
            {service.description || "Sin descripción"}
          </p>
        </div>
        <div className="space-y-2.5 shrink-0 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-indigo-600">
              Bs {Number(service.price || 0).toFixed(2)}
            </span>
            {service.estimated_time && (
              <span className="rounded-none bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1 border border-indigo-100">
                <Icon name="clock" className="h-3 w-3 text-indigo-500 shrink-0" />
                <span>{service.estimated_time}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <ProductVoteButtons
              likes={service.likesData?.likes || 0}
              dislikes={service.likesData?.dislikes || 0}
              userVote={userId ? service.likesData?.userVotes?.[userId] || 0 : 0}
              canInteract={canInteract}
              onVote={(vote) => onVote(service, vote)}
              loading={voteLoading === service.id}
            />
            
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-none hover:bg-indigo-700 transition-all"
            >
              <span>Ver servicio</span>
              <span>→</span>
            </button>
          </div>
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
        className="rounded-none border border-[rgba(201,150,12,0.2)] bg-[#fffdf7] p-8 shadow-2xl max-w-sm w-full space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-2 flex flex-col items-center">
          <Icon name="cart" className="h-10 w-10 text-[#c8960c] mb-1" />
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
            className="w-full bg-[#1a1200] text-[#fff8df] hover:opacity-90 font-bold rounded-none"
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
        <div key={i} className="h-52 rounded-none bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="rounded-none border border-dashed border-slate-200 bg-slate-50 p-12 text-center col-span-full flex flex-col items-center">
      <Icon name="search" className="h-8 w-8 text-slate-400 mb-3" />
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

// ── Section Pagination Helper ───────────────────────────────────────────────

function SectionPagination({ totalCount, limit, setLimit, page, setPage }) {
  const pageSize = 20;
  
  if (totalCount === 0) return null;

  if (totalCount <= 20) {
    if (totalCount > limit) {
      return (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => setLimit(prev => Math.min(20, prev + 5))}
            className="px-6 py-2.5 bg-[#1a1200] text-[#fff8df] text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-all rounded-none border border-[#c8960c]/30"
          >
            Ver más
          </button>
        </div>
      );
    }
    return null;
  }

  const totalPages = Math.ceil(totalCount / pageSize);
  const windowStart = Math.floor((page - 1) / 5) * 5 + 1;
  const windowEnd = Math.min(totalPages, windowStart + 4);
  
  const pageNumbers = [];
  for (let p = windowStart; p <= windowEnd; p++) {
    pageNumbers.push(p);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-6 select-none">
      <button
        type="button"
        disabled={windowStart === 1}
        onClick={() => setPage(Math.max(1, windowStart - 5))}
        className={`h-8 w-8 flex items-center justify-center border text-xs font-bold rounded-none transition-all ${
          windowStart === 1
            ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
            : 'border-[rgba(201,150,12,0.3)] text-[#1a1200] hover:border-[#c8960c] bg-white'
        }`}
        title="Deslizar 5 páginas atrás"
      >
        «
      </button>

      {/* Previous page */}
      <button
        type="button"
        disabled={page === 1}
        onClick={() => setPage(prev => Math.max(1, prev - 1))}
        className={`h-8 w-8 flex items-center justify-center border text-xs font-bold rounded-none transition-all ${
          page === 1
            ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
            : 'border-[rgba(201,150,12,0.3)] text-[#1a1200] hover:border-[#c8960c] bg-white'
        }`}
      >
        ‹
      </button>

      {/* Page numbers */}
      {pageNumbers.map(p => (
        <button
          key={p}
          type="button"
          onClick={() => setPage(p)}
          className={`h-8 w-8 flex items-center justify-center border text-xs font-bold rounded-none transition-all ${
            page === p
              ? 'bg-[#1a1200] text-[#fff8df] border-[#1a1200] shadow-sm'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
          }`}
        >
          {p}
        </button>
      ))}

      {/* Next page */}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
        className={`h-8 w-8 flex items-center justify-center border text-xs font-bold rounded-none transition-all ${
          page === totalPages
            ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
            : 'border-[rgba(201,150,12,0.3)] text-[#1a1200] hover:border-[#c8960c] bg-white'
        }`}
      >
        ›
      </button>

      {/* Slide forward (5 pages) */}
      <button
        type="button"
        disabled={windowEnd === totalPages}
        onClick={() => setPage(Math.min(totalPages, windowStart + 5))}
        className={`h-8 w-8 flex items-center justify-center border text-xs font-bold rounded-none transition-all ${
          windowEnd === totalPages
            ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
            : 'border-[rgba(201,150,12,0.3)] text-[#1a1200] hover:border-[#c8960c] bg-white'
        }`}
        title="Deslizar 5 páginas adelante"
      >
        »
      </button>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function MarketPage() {
  const { token, role, isAuthenticated, capabilities, user } = useAuth();
  const { addToCart, openCart } = useCart();
  const routerNavigate = useNavigate();

  // Navigation and Filter States
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState([]);
  const [serviceProfiles, setServiceProfiles] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  
  // UI & Loading States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [productVoteLoading, setProductVoteLoading] = useState(null);
  const [serviceVoteLoading, setServiceVoteLoading] = useState(null);
  const [showTypeFilter, setShowTypeFilter] = useState(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(true);

  // Section specific limits / pages (hybrid pagination)
  const [storesLimit, setStoresLimit] = useState(10);
  const [storesPage, setStoresPage] = useState(1);
  const [productsLimit, setProductsLimit] = useState(10);
  const [productsPage, setProductsPage] = useState(1);
  const [servicesLimit, setServicesLimit] = useState(10);
  const [servicesPage, setServicesPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setStoresLimit(10);
    setStoresPage(1);
    setProductsLimit(10);
    setProductsPage(1);
    setServicesLimit(10);
    setServicesPage(1);
  }, [searchQuery, selectedCategoryIds, selectedCity, priceRange]);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: '¡Hola! Soy tu asistente de ShopyMarket. ¿Cómo puedo ayudarte hoy?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const faqs = [
    { text: "Quiero comprar un producto", value: "Quiero comprar un producto" },
    { text: "Ver tiendas de mi ciudad", value: "Quiero ver tiendas locales" },
    { text: "Buscar bajos precios", value: "Quiero buscar productos con bajos precios" },
    { text: "Más servicios disponibles", value: "Quiero conocer más servicios" }
  ];

  const handleFAQClick = (faqText) => {
    setChatInput(faqText);
  };

  const sendChatMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      let botReply = '';
      const lowercaseText = text.toLowerCase();

      if (lowercaseText.includes('quiero') || lowercaseText.includes('comprar')) {
        botReply = 'Puedes explorar la grilla de productos en el centro de la pantalla y agregarlos a tu carrito haciendo clic en el botón "Comprar" o "Agregar al carrito".';
      } else if (lowercaseText.includes('tienda') || lowercaseText.includes('comercios') || lowercaseText.includes('ciudad')) {
        botReply = 'En la sección TIENDAS puedes ver los comercios de tu ciudad. Haz clic en una tienda para ver su perfil completo y su catálogo exclusivo.';
      } else if (lowercaseText.includes('precio') || lowercaseText.includes('bajo') || lowercaseText.includes('barato')) {
        botReply = 'Usa el filtro de rango de precios en el panel izquierdo para establecer un límite de presupuesto. Los resultados se actualizarán al instante.';
      } else if (lowercaseText.includes('servicio') || lowercaseText.includes('agenda')) {
        botReply = 'Ofrecemos servicios profesionales de reparaciones, asesoría y más. Puedes filtrarlos y presionar "Ver servicio" para agendar.';
      } else {
        botReply = 'Entendido. Estoy aquí para asistirte con tu exploración. Prueba buscando "llantas", filtrando por categorías o consultando nuestras tiendas.';
      }

      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botReply }]);
    }, 800);
  };

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
      
      const rawStores = Array.isArray(storesResult?.data) ? storesResult.data : [];
      const mappedStores = rawStores.map(s => ({
        ...s,
        ratingStats: getStoreRating(s.id, false)
      }));
      setStores(mappedStores);

      const rawProfiles = Array.isArray(profilesResult?.data) ? profilesResult.data : [];
      const mappedProfiles = rawProfiles.map(p => ({
        ...p,
        ratingStats: getStoreRating(p.id, true)
      }));
      setServiceProfiles(mappedProfiles);

      const rawProducts = Array.isArray(productsResult?.data) ? productsResult.data : [];
      const mappedProducts = rawProducts.map(p => ({
        ...p,
        likesData: getItemLikes(p.id, "product")
      }));
      setProducts(mappedProducts);

      const rawServices = Array.isArray(servicesResult?.data) ? servicesResult.data : [];
      const mappedServices = rawServices.map(s => ({
        ...s,
        likesData: getItemLikes(s.id, "service")
      }));
      setServices(mappedServices);

      setCategories(Array.isArray(categoriesResult?.data) ? categoriesResult.data : []);
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

  const handleStoreRate = useCallback(async (store, score) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    const userId = user?.id || user?.email || "logged_in_user";
    const newStats = submitStoreRating(store.id, store.isServiceProfile, userId, score);
    if (newStats) {
      if (store.isServiceProfile) {
        setServiceProfiles(current =>
          current.map(p => Number(p.id) === Number(store.id) ? { ...p, ratingStats: newStats } : p)
        );
      } else {
        setStores(current =>
          current.map(s => Number(s.id) === Number(store.id) ? { ...s, ratingStats: newStats } : s)
        );
      }
    }
  }, [isAuthenticated, user]);

  const handleProductVote = useCallback(async (product, vote) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setProductVoteLoading(product.id);
    try {
      const userId = user?.id || user?.email || "logged_in_user";
      const newStats = submitItemVote(product.id, "product", userId, vote === 1 ? "like" : "dislike");
      if (newStats) {
        setProducts((current) =>
          current.map((entry) =>
            Number(entry.id) === Number(product.id) ? { ...entry, likesData: newStats } : entry
          )
        );
      }
    } finally {
      setProductVoteLoading(null);
    }
  }, [isAuthenticated, user]);

  const handleServiceVote = useCallback(async (service, vote) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setServiceVoteLoading(service.id);
    try {
      const userId = user?.id || user?.email || "logged_in_user";
      const newStats = submitItemVote(service.id, "service", userId, vote === 1 ? "like" : "dislike");
      if (newStats) {
        setServices((current) =>
          current.map((entry) =>
            Number(entry.id) === Number(service.id) ? { ...entry, likesData: newStats } : entry
          )
        );
      }
    } finally {
      setServiceVoteLoading(null);
    }
  }, [isAuthenticated, user]);

  // Clean up incompatible categories when tabs shift
  useEffect(() => {
    if (selectedCategoryIds.length > 0) {
      const validIds = categories
        .filter(c => {
          if (activeTab === "products") return c.type === "product";
          if (activeTab === "services") return c.type === "service";
          return true;
        })
        .map(c => Number(c.id));
      
      setSelectedCategoryIds(prev => prev.filter(id => validIds.includes(id)));
    }
  }, [activeTab, categories]);

  const displayedCategories = useMemo(() => {
    if (activeTab === "products") {
      return categories.filter((cat) => cat.type === "product");
    }
    if (activeTab === "services") {
      return categories.filter((cat) => cat.type === "service");
    }
    return categories;
  }, [categories, activeTab]);

  const availableCities = useMemo(() => {
    const citiesSet = new Set();
    stores.forEach(s => s?.city && citiesSet.add(s.city.trim()));
    serviceProfiles.forEach(p => p?.city && citiesSet.add(p.city.trim()));
    return Array.from(citiesSet);
  }, [stores, serviceProfiles]);

  // Filtering Lists
  const filteredProducts = useMemo(() => {
    const activeStoreIds = new Set(stores.filter(s => !s.status || s.status === 'active').map(s => Number(s.id)));
    let activeProds = products.filter(
      (p) => (!p.status || p.status === 'active') && activeStoreIds.has(Number(p.store_id))
    );

    if (selectedCategoryIds.length > 0) {
      activeProds = activeProds.filter(p => selectedCategoryIds.includes(Number(p.category_id)));
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
    
    let result = activeProds;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = activeProds.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }

    // Sort descending by likes count
    return [...result].sort((a, b) => {
      const likesA = a.likesData?.likes || 0;
      const likesB = b.likesData?.likes || 0;
      if (likesB === likesA) {
        return (a.likesData?.dislikes || 0) - (b.likesData?.dislikes || 0);
      }
      return likesB - likesA;
    });
  }, [products, stores, searchQuery, selectedCategoryIds, selectedCity, priceRange]);

  const filteredStores = useMemo(() => {
    const activeStores = stores.filter(s => !s.status || s.status === 'active').map(s => ({ ...s, isServiceProfile: false }));
    const activeProfiles = serviceProfiles.filter(p => !p.status || p.status === 'active').map(p => ({ ...p, isServiceProfile: true }));
    let combined = [...activeStores, ...activeProfiles];

    if (selectedCity) {
      combined = combined.filter(s => s.city?.toLowerCase() === selectedCity.toLowerCase());
    }
    if (selectedCategoryIds.length > 0) {
      combined = combined.filter((s) => {
        if (s.isServiceProfile) {
          return services.some(
            (srv) => Number(srv.service_profile_id) === Number(s.id) && selectedCategoryIds.includes(Number(srv.category_id))
          );
        } else {
          return products.some(
            (p) => Number(p.store_id) === Number(s.id) && selectedCategoryIds.includes(Number(p.category_id))
          );
        }
      });
    }
    
    let result = combined;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = combined.filter(
        (s) => s.name?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q)
      );
    }

    // Sort descending by rating average
    return [...result].sort((a, b) => {
      const ratingA = a.ratingStats?.average || 0;
      const ratingB = b.ratingStats?.average || 0;
      if (ratingB === ratingA) {
        return (b.ratingStats?.count || 0) - (a.ratingStats?.count || 0);
      }
      return ratingB - ratingA;
    });
  }, [stores, serviceProfiles, searchQuery, selectedCategoryIds, selectedCity, products, services]);

  const filteredServices = useMemo(() => {
    let activeServs = services.filter(s => !s.status || s.status === 'active');

    if (selectedCategoryIds.length > 0) {
      activeServs = activeServs.filter(s => selectedCategoryIds.includes(Number(s.category_id)));
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
    
    let result = activeServs;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = activeServs.filter(
        (s) => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
      );
    }

    // Sort descending by likes count
    return [...result].sort((a, b) => {
      const likesA = a.likesData?.likes || 0;
      const likesB = b.likesData?.likes || 0;
      if (likesB === likesA) {
        return (a.likesData?.dislikes || 0) - (b.likesData?.dislikes || 0);
      }
      return likesB - likesA;
    });
  }, [services, serviceProfiles, searchQuery, selectedCategoryIds, selectedCity, priceRange]);

  // sliced arrays for hybrid pagination display
  const displayStores = useMemo(() => {
    const totalCount = filteredStores.length;
    if (totalCount <= 20) {
      return filteredStores.slice(0, storesLimit);
    } else {
      const pageSize = 20;
      return filteredStores.slice((storesPage - 1) * pageSize, storesPage * pageSize);
    }
  }, [filteredStores, storesLimit, storesPage]);

  const displayProducts = useMemo(() => {
    const totalCount = filteredProducts.length;
    if (totalCount <= 20) {
      return filteredProducts.slice(0, productsLimit);
    } else {
      const pageSize = 20;
      return filteredProducts.slice((productsPage - 1) * pageSize, productsPage * pageSize);
    }
  }, [filteredProducts, productsLimit, productsPage]);

  const displayServices = useMemo(() => {
    const totalCount = filteredServices.length;
    if (totalCount <= 20) {
      return filteredServices.slice(0, servicesLimit);
    } else {
      const pageSize = 20;
      return filteredServices.slice((servicesPage - 1) * pageSize, servicesPage * pageSize);
    }
  }, [filteredServices, servicesLimit, servicesPage]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(91,141,255,0.02),transparent_28%),linear-gradient(180deg,#faf9f5,#f5f2e9)] text-[#1a1200] font-sans">
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

      {/* Main Container - Occupies 100% of viewport width */}
      <div className="w-full">
        
        {/* Toggle buttons for Mobile Layout */}
        <div className="flex gap-3 lg:hidden mb-6 w-full px-4 pt-4">
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex-1 flex items-center justify-between border border-[rgba(201,150,12,0.2)] bg-white px-4 py-3 text-xs font-bold text-slate-800 rounded-none shadow-sm font-sans"
          >
            <span className="flex items-center gap-1.5">
              <Icon name="settings" className="h-4 w-4 text-[#c8960c]" />
              <span>{showMobileFilters ? "Ocultar Filtros" : "Mostrar Filtros"}</span>
            </span>
            <span>▼</span>
          </button>

          <button
            type="button"
            onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            className="flex-1 flex items-center justify-between border border-[rgba(201,150,12,0.2)] bg-[#1a1200] text-[#fff8df] px-4 py-3 text-xs font-bold rounded-none shadow-sm font-sans"
          >
            <span className="flex items-center gap-1.5">
              <Icon name="message" className="h-4 w-4 text-[#f5d367]" />
              <span>{isChatbotOpen ? "Ocultar Chatbot" : "Asistente Chat"}</span>
            </span>
            <span>▼</span>
          </button>
        </div>

        <style>{`
          @media (max-width: 1023px) {
            .market-responsive-grid {
              grid-template-columns: 100% !important;
              display: flex !important;
              flex-direction: column !important;
            }
            .market-responsive-grid > aside:first-of-type {
              position: static !important;
              height: auto !important;
              border-right: none !important;
              border-bottom: 1px solid rgba(201,150,12,0.12) !important;
            }
            .market-responsive-grid > aside:last-of-type:not(.pointer-events-none) {
              position: fixed !important;
              bottom: 80px !important;
              right: 16px !important;
              left: 16px !important;
              height: 480px !important;
              width: auto !important;
              max-width: 400px !important;
              z-index: 50 !important;
              border: 1px solid rgba(201,150,12,0.2) !important;
              box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25), 0 10px 10px -5px rgba(0,0,0,0.2) !important;
              background-color: #fffdf7 !important;
            }
            @media (min-width: 640px) {
              .market-responsive-grid > aside:last-of-type:not(.pointer-events-none) {
                left: auto !important;
                width: 380px !important;
              }
            }
            /* Estilo horizontal para la rejilla en móvil/tablet cuando "TODO" está seleccionado */
            .todo-section-grid {
              display: flex !important;
              flex-wrap: nowrap !important;
              overflow-x: auto !important;
              gap: 16px !important;
              padding-bottom: 12px !important;
              -webkit-overflow-scrolling: touch !important;
              scrollbar-width: none !important;
            }
            .todo-section-grid::-webkit-scrollbar {
              display: none !important;
            }
            .todo-section-grid > article {
              flex-shrink: 0 !important;
              width: 260px !important;
            }
          }
        `}</style>

        {/* 3-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid gap-0 market-responsive-grid" style={{ gridTemplateColumns: isChatbotOpen ? '15% 70% 15%' : '15% 85% 0px' }}>
          
          {/* 1. LEFT COLUMN: Sidebar (Filtros & Navegación) */}
          <aside className={`w-full shrink-0 lg:block ${showMobileFilters ? "block" : "hidden"} lg:sticky lg:top-[87px] lg:h-[calc(100vh-87px)] lg:overflow-y-auto border-r border-[rgba(201,150,12,0.12)] bg-white/70 backdrop-blur-md p-5 space-y-6`}>
            {/* Búsqueda por Tipo (Collapsible) */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowTypeFilter(!showTypeFilter)}
                className="w-full flex items-center justify-between border-b border-slate-200 pb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#6f6041] hover:text-[#c8960c] transition-colors rounded-none"
              >
                <span>Búsqueda por Tipo</span>
                <span className="text-[8px]">{showTypeFilter ? '▲' : '▼'}</span>
              </button>
              {showTypeFilter && (
                <div className="flex flex-col gap-1.5 pt-1.5 animate-fade-in">
                  {[
                    { id: "all", label: "TODO", icon: "globe" },
                    { id: "stores", label: "Tiendas", icon: "store" },
                    { id: "products", label: "Productos", icon: "market" },
                    { id: "services", label: "Servicios", icon: "wrench" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left rounded-none px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between ${
                        activeTab === tab.id
                          ? "bg-[#1a1200] text-[#fff8df] border-l-4 border-[#c8960c]"
                          : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon name={tab.icon} className="h-4 w-4 shrink-0" />
                        <span>{tab.label}</span>
                      </div>
                      {activeTab === tab.id && <Icon name="check" className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Categorías Globales (Checks de selección múltiple) */}
            <div className="space-y-3">
              <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#6f6041] border-b border-slate-200 pb-1.5">
                Categorías
              </label>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {displayedCategories.map((cat) => {
                  const isChecked = selectedCategoryIds.includes(Number(cat.id));
                  return (
                    <label key={cat.id} className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedCategoryIds(prev => prev.filter(id => id !== Number(cat.id)));
                          } else {
                            setSelectedCategoryIds(prev => [...prev, Number(cat.id)]);
                          }
                        }}
                        className="rounded-none border-slate-300 text-[#c8960c] focus:ring-[#c8960c]/50 h-4 w-4 shrink-0 cursor-pointer animate-none"
                      />
                      <span className={isChecked ? "text-[#c8960c] font-bold" : ""}>{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Rango de Precios */}
            <div className="space-y-3">
              <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#6f6041] border-b border-slate-200 pb-1.5">
                Rango de Precios
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min Bs"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-1/2 rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#c8960c]"
                />
                <span className="text-slate-300 text-xs">—</span>
                <input
                  type="number"
                  placeholder="Max Bs"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-1/2 rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#c8960c]"
                />
              </div>
            </div>
          </aside>

          {/* 2. CENTRAL COLUMN: Marketplace Central */}
          <section className="flex-1 min-w-0 px-4 lg:px-8 py-6 space-y-8">
            
            {/* Search Bar - Center of Marketplace */}
            <div className="w-full max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Busca llantas, computadoras, repuestos, mecánicos, tiendas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-none border border-slate-300 bg-white pl-5 pr-12 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#c8960c] focus:ring-2 focus:ring-[#c8960c]/20 transition-all shadow-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c8960c]">
                  <Icon name="search" className="h-5 w-5" />
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-none border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 flex items-center gap-3">
                <Icon name="alert" className="h-5 w-5 text-rose-500 shrink-0" />
                <span>{error}</span>
                <button
                  type="button"
                  onClick={loadMarketData}
                  className="ml-auto text-xs font-bold underline"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* A. TIENDAS SECTION */}
            {(activeTab === "all" || activeTab === "stores") && (
              <section aria-labelledby="stores-heading" className="space-y-4">
                <div className="flex items-center justify-between border-b border-[rgba(201,150,12,0.15)] pb-2">
                  <h2 id="stores-heading" className="text-sm font-black uppercase tracking-[0.25em] text-[#1a1200] flex items-center gap-2">
                    <span>Tiendas y Comercios</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    {activeTab === "all" && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("stores")}
                        className="text-xs font-bold text-[#c8960c] hover:underline"
                      >
                        Ver todos
                      </button>
                    )}
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-none">
                      {filteredStores.length}
                    </span>
                  </div>
                </div>

                {loading ? (
                  <SkeletonGrid count={4} className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
                ) : filteredStores.length === 0 ? (
                  <EmptyState message="No se encontraron comercios registrados." />
                ) : (
                  <>
                    <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${activeTab === "all" ? "todo-section-grid" : ""}`}>
                      {displayStores.map((store) => {
                        const productCount = products.filter(p => Number(p.store_id) === Number(store.id)).length;
                        const serviceCount = services.filter(s => Number(s.service_profile_id) === Number(store.id)).length;
                        const isOwner = Number(store.admin_user_id) === Number(user?.id);
                        return (
                          <StoreCard
                            key={store.isServiceProfile ? `profile-${store.id}` : `store-${store.id}`}
                            store={store}
                            productCount={productCount}
                            serviceCount={serviceCount}
                            userId={user?.id || user?.email}
                            canRate={isAuthenticated && !isOwner}
                            onRate={(score) => handleStoreRate(store, score)}
                            onClick={() => {
                              if (store.isServiceProfile) {
                                routerNavigate(`/service/${encodeURIComponent(store.name)}`);
                              } else {
                                routerNavigate(`/store/${encodeURIComponent(store.name)}`);
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    {activeTab !== "all" && (
                      <SectionPagination
                        totalCount={filteredStores.length}
                        limit={storesLimit}
                        setLimit={setStoresLimit}
                        page={storesPage}
                        setPage={setStoresPage}
                      />
                    )}
                  </>
                )}
              </section>
            )}

            {/* B. PRODUCTOS SECTION */}
            {(activeTab === "all" || activeTab === "products") && (
              <section aria-labelledby="products-heading" className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-[rgba(201,150,12,0.15)] pb-2">
                  <h2 id="products-heading" className="text-sm font-black uppercase tracking-[0.25em] text-[#1a1200] flex items-center gap-2">
                    <span>Productos</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    {activeTab === "all" && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("products")}
                        className="text-xs font-bold text-[#c8960c] hover:underline"
                      >
                        Ver todos
                      </button>
                    )}
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-none">
                      {filteredProducts.length}
                    </span>
                  </div>
                </div>

                {loading ? (
                  <SkeletonGrid count={4} className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
                ) : filteredProducts.length === 0 ? (
                  <EmptyState message="No se encontraron productos disponibles." />
                ) : (
                  <>
                    <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${activeTab === "all" ? "todo-section-grid" : ""}`}>
                      {displayProducts.map((product) => {
                        const storeForProduct = stores.find(s => Number(s.id) === Number(product.store_id));
                        const isOwner = storeForProduct && Number(storeForProduct.admin_user_id) === Number(user?.id);
                        return (
                          <ProductCard
                            key={product.id}
                            product={product}
                            storeName={storeForProduct?.name}
                            isAuthenticated={isAuthenticated}
                            canInteract={isAuthenticated && !isOwner}
                            onBuy={handleBuyProduct}
                            onVote={handleProductVote}
                            voteLoading={productVoteLoading}
                            userId={user?.id || user?.email}
                            onClick={() => routerNavigate(`/product/${product.id}`)}
                          />
                        );
                      })}
                    </div>

                    {activeTab !== "all" && (
                      <SectionPagination
                        totalCount={filteredProducts.length}
                        limit={productsLimit}
                        setLimit={setProductsLimit}
                        page={productsPage}
                        setPage={setProductsPage}
                      />
                    )}
                  </>
                )}
              </section>
            )}

            {/* C. SERVICIOS SECTION */}
            {(activeTab === "all" || activeTab === "services") && (
              <section aria-labelledby="services-heading" className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-[rgba(201,150,12,0.15)] pb-2">
                  <h2 id="services-heading" className="text-sm font-black uppercase tracking-[0.25em] text-[#1a1200] flex items-center gap-2">
                    <span>Servicios Profesionales</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    {activeTab === "all" && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("services")}
                        className="text-xs font-bold text-[#c8960c] hover:underline"
                      >
                        Ver todos
                      </button>
                    )}
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-none">
                      {filteredServices.length}
                    </span>
                  </div>
                </div>

                {loading ? (
                  <SkeletonGrid count={4} className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
                ) : filteredServices.length === 0 ? (
                  <EmptyState message="No se encontraron servicios profesionales disponibles." />
                ) : (
                  <>
                    <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${activeTab === "all" ? "todo-section-grid" : ""}`}>
                      {displayServices.map((service) => {
                        const profileForService = serviceProfiles.find(p => Number(p.id) === Number(service.service_profile_id));
                        const isOwner = profileForService && Number(profileForService.admin_user_id) === Number(user?.id);
                        return (
                          <ServiceCard
                            key={service.id}
                            service={service}
                            providerName={profileForService?.name}
                            isAuthenticated={isAuthenticated}
                            canInteract={isAuthenticated && !isOwner}
                            onClick={() => routerNavigate(`/service-detail/${service.id}`)}
                            onVote={handleServiceVote}
                            voteLoading={serviceVoteLoading}
                            userId={user?.id || user?.email}
                          />
                        );
                      })}
                    </div>

                    {activeTab !== "all" && (
                      <SectionPagination
                        totalCount={filteredServices.length}
                        limit={servicesLimit}
                        setLimit={setServicesLimit}
                        page={servicesPage}
                        setPage={setServicesPage}
                      />
                    )}
                  </>
                )}
              </section>
            )}
          </section>

          {/* 3. RIGHT COLUMN: Chatbot Panel (Collapsible) */}
          <aside className={`border-l border-[rgba(201,150,12,0.12)] bg-[#fffdf7] flex flex-col h-[calc(100vh-87px)] sticky top-[87px] shrink-0 transition-all duration-300 overflow-hidden ${
            isChatbotOpen ? 'w-full lg:w-auto opacity-100' : 'w-0 opacity-0 pointer-events-none'
          }`}>
            <div className="p-4 border-b border-[rgba(201,150,12,0.12)] bg-slate-50 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#1a1200] flex items-center gap-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                CHATBOT
              </h2>
              <button
                type="button"
                onClick={() => setIsChatbotOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-5 flex flex-col justify-between">
              {/* Chat history */}
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[35vh] pr-1">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      {msg.sender === 'user' ? 'Tú' : 'ShopyBot'}
                    </span>
                    <div className={`p-3 text-xs max-w-[90%] rounded-none border ${
                      msg.sender === 'user'
                        ? 'bg-[#1a1200] text-[#fff8df] border-[#1a1200]'
                        : 'bg-white text-slate-800 border-slate-200 shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* FAQ Suggestions */}
              <div className="border-t border-slate-100 pt-4 space-y-2 shrink-0">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">Preguntas Frecuentes</p>
                <div className="flex flex-col gap-1.5">
                  {faqs.map((faq, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleFAQClick(faq.value)}
                      className="w-full text-left p-2 border border-slate-150 hover:border-[#c8960c] text-[10px] text-slate-600 hover:text-[#1a1200] bg-white transition-all rounded-none"
                    >
                      {i + 1}. {faq.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input field */}
            <div className="p-4 border-t border-slate-100 bg-white shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); sendChatMessage(chatInput); }} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe tu duda..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-none px-3 py-2.5 text-xs focus:outline-none focus:border-[#c8960c] focus:ring-1 focus:ring-[#c8960c]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#1a1200] text-[#fff8df] hover:opacity-95 text-xs font-bold rounded-none border border-[#c8960c]/20 uppercase tracking-wider shrink-0"
                >
                  Enviar
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating button to reopen chatbot if closed */}
      {!isChatbotOpen && (
        <button
          type="button"
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#1a1200] text-[#fff8df] border-2 border-[#c8960c] p-3 shadow-2xl hover:bg-[#c8960c] hover:text-[#1a1200] transition-colors rounded-none font-bold text-xs uppercase tracking-widest flex items-center gap-2"
        >
          <Icon name="message" className="h-5 w-5 text-[#f5d367]" />
          <span>Chatbot</span>
        </button>
      )}
    </main>
  );
}
