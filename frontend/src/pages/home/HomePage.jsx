/**
 * HomePage — ShopyMarket MV
 * Public landing page. Accessible to ALL users (authenticated or not).
 *
 * Structure:
 *   1. Hero            – full-screen dark hero with animated slide
 *   2. Value prop      – two-column text + visual
 *   3. Visual banner   – full-width accent section
 *   4. Benefit cards   – buy / hire / deliver
 *   5. Featured stores – real data
 *   6. Products        – horizontal scroll carousel
 *   7. Services        – horizontal scroll carousel
 *   8. Stats           – numbers + social proof
 *   9. CTA             – full-width invitation to explore
 *  10. Footer
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import BrandMark from "@/components/ui/BrandMark";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getAllProducts, getAllStores, getAllServiceProfiles, getAllServices } from "@/services/marketApi";
import { API_BASE_URL } from "@/config/appSettings";

// ─── helpers ──────────────────────────────────────────────────────────────────
function imgUrl(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StoreAvatar({ store }) {
  const [err, setErr] = useState(false);
  const logo = imgUrl(store.logo_url || store.profile_image_url);
  const banner = imgUrl(store.banner_url);
  const letter = (store.name || "?")[0].toUpperCase();

  return (
    <article
      className="group relative overflow-hidden rounded-none border border-[rgba(201,150,12,0.12)] bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Banner */}
      <div className="h-28 bg-gradient-to-br from-[#f5f0e4] to-[#ece7d5] overflow-hidden">
        {banner && !err ? (
          <img src={banner} alt="" className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" onError={() => setErr(true)} />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-5xl opacity-10 font-black text-[#c8960c]">{letter}</span>
          </div>
        )}
      </div>

      <div className="absolute top-16 left-4">
        <div className="h-14 w-14 rounded-none border-2 border-white shadow-md bg-[#f5f0e4] overflow-hidden flex items-center justify-center">
          {logo && !err ? (
            <img src={logo} alt={store.name} className="h-full w-full object-cover" onError={() => setErr(true)} />
          ) : (
            <span className="text-xl font-black text-[#c8960c]">{letter}</span>
          )}
        </div>
      </div>

      <div className="pt-10 pb-4 px-4">
        <p className="font-bold text-[#1a1200] text-sm truncate">{store.name}</p>
        {store.city && (
          <p className="text-[0.7rem] text-[#6f6041] mt-0.5 truncate flex items-center gap-0.5">
            <Icon name="pin" className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{store.city}{store.country ? `, ${store.country}` : ""}</span>
          </p>
        )}
        <div className="mt-2 flex">
          {store.isServiceProfile ? (
            <span className="inline-block rounded-none bg-indigo-50 text-indigo-600 text-[0.6rem] font-bold uppercase tracking-wider px-2.5 py-0.5 border border-indigo-100">
              {store.itemCount || 0} {store.itemCount === 1 ? "servicio" : "servicios"}
            </span>
          ) : (
            <span className="inline-block rounded-none bg-[#c8960c]/5 text-[#c8960c] text-[0.6rem] font-bold uppercase tracking-wider px-2.5 py-0.5 border border-[#c8960c]/10">
              {store.itemCount || 0} {store.itemCount === 1 ? "producto" : "productos"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function ProductSlide({ product, onBuy }) {
  const [err, setErr] = useState(false);
  const url = imgUrl(product.image_url);

  return (
    <article className="group flex-shrink-0 w-52 rounded-none border border-[rgba(201,150,12,0.1)] bg-white overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="h-36 bg-[#f5f0e4] overflow-hidden">
        {url && !err ? (
          <img src={url} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setErr(true)} />
        ) : (
          <div className="h-full flex items-center justify-center opacity-20 text-slate-500">
            <Icon name="market" className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-bold text-[#1a1200] text-xs truncate">{product.name}</p>
        <p className="text-[0.65rem] text-[#6f6041] mt-0.5 line-clamp-2 leading-relaxed">{product.description || "—"}</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-extrabold text-[#c8960c]">Bs {Number(product.price || 0).toFixed(2)}</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onBuy(product); }}
            className="text-[0.6rem] font-bold rounded-none bg-[#1a1200] text-[#fff8df] px-2.5 py-1 hover:opacity-80 transition-opacity"
          >
            Comprar
          </button>
        </div>
      </div>
    </article>
  );
}

function ServiceSlide({ service, onView }) {
  const [err, setErr] = useState(false);
  const url = imgUrl(service.image_url);

  return (
    <article className="group flex-shrink-0 w-52 rounded-none border border-[rgba(99,102,241,0.12)] bg-white overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="h-36 bg-gradient-to-br from-[#ede9fe] to-[#e0e7ff] overflow-hidden">
        {url && !err ? (
          <img src={url} alt={service.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setErr(true)} />
        ) : (
          <div className="h-full flex items-center justify-center opacity-20 text-indigo-500">
            <Icon name="wrench" className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="font-bold text-[#1a1200] text-xs truncate">{service.name}</p>
        <p className="text-[0.65rem] text-[#6f6041] mt-0.5 line-clamp-2 leading-relaxed flex-1">{service.description || "—"}</p>
        <div className="mt-2 flex items-center justify-between gap-1">
          <p className="text-sm font-extrabold text-indigo-600">Bs {Number(service.price || 0).toFixed(2)}</p>
          {service.estimated_time && (
            <span className="text-[0.58rem] font-semibold text-indigo-500 bg-indigo-50 rounded-none px-2 py-0.5 whitespace-nowrap flex items-center gap-1">
              <Icon name="clock" className="h-3 w-3 shrink-0" />
              <span>{service.estimated_time}</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onView}
          className="mt-2 w-full text-[0.6rem] font-bold rounded-none bg-indigo-600 text-white py-1.5 hover:bg-indigo-700 transition-colors"
        >
          Ver servicio →
        </button>
      </div>
    </article>
  );
}

function HScrollCarousel({ children }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 220, behavior: "smooth" });
  };
  return (
    <div className="relative px-10">
      <button type="button" onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-none bg-white border border-[rgba(201,150,12,0.2)] shadow text-[#c8960c] flex items-center justify-center hover:border-[#c8960c] transition-all">
        ‹
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: "none" }}>
        {children}
      </div>
      <button type="button" onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-none bg-white border border-[rgba(201,150,12,0.2)] shadow text-[#c8960c] flex items-center justify-center hover:border-[#c8960c] transition-all">
        ›
      </button>
    </div>
  );
}

function SkeletonCard({ h = "h-52", color = "bg-[#f5f0e4]" }) {
  return <div className={`flex-shrink-0 w-52 ${h} rounded-none ${color} animate-pulse`} />;;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isAuthenticated, capabilities } = useAuth();
  const { addToCart, openCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts]     = useState([]);
  const [stores, setStores]         = useState([]);
  const [services, setServices]     = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, sr, pfr, svr] = await Promise.all([
        getAllProducts(null),
        getAllStores(null),
        getAllServiceProfiles(null),
        getAllServices(null),
      ]);

      const rawStores    = Array.isArray(sr?.data)  ? sr.data  : [];
      const rawProfiles  = Array.isArray(pfr?.data) ? pfr.data : [];
      const rawServices  = Array.isArray(svr) ? svr : Array.isArray(svr?.data) ? svr.data : [];
      const rawProducts  = Array.isArray(pr?.data)  ? pr.data  : [];

      const activeStores   = rawStores.filter(s => !s.status || s.status === "active").map(s => {
        const count = rawProducts.filter(p => (!p.status || p.status === "active") && Number(p.store_id) === Number(s.id)).length;
        return { ...s, isServiceProfile: false, itemCount: count };
      });
      const activeProfiles = rawProfiles.filter(p => !p.status || p.status === "active").map(p => {
        const count = rawServices.filter(sv => (!sv.status || sv.status === "active") && Number(sv.service_profile_id) === Number(p.id)).length;
        return { ...p, isServiceProfile: true, itemCount: count };
      });
      const activeServices = rawServices.filter(s => !s.status || s.status === "active");
      const activeStoreIds = new Set(activeStores.map(s => Number(s.id)));
      const activeProducts = rawProducts.filter(p => (!p.status || p.status === "active") && activeStoreIds.has(Number(p.store_id)));


      setStores([...activeStores, ...activeProfiles].slice(0, 8));
      setAllProfiles(activeProfiles);
      setServices(activeServices.slice(0, 12));
      setProducts(activeProducts.slice(0, 12));
    } catch (err) {
      console.error("HomePage data error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const goTo = (path) => navigate(path);

  const handleBuy = async (product) => {
    if (!isAuthenticated) { setShowLoginModal(true); return; }
    const ok = await addToCart(product, 1);
    if (ok) openCart();
  };

  const stats = [
    { value: stores.length || "—", label: "Comercios registrados" },
    { value: products.length || "—", label: "Productos publicados" },
    { value: services.length || "—", label: "Servicios disponibles" },
  ];

  return (
    <div className="min-h-screen bg-[#fffdf7] text-[#1a1200] font-sans">
      <Navbar />

      {/* ── Login modal ── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowLoginModal(false)}>
          <div className="rounded-none border border-[rgba(201,150,12,0.2)] bg-[#fffdf7] p-8 shadow-2xl max-w-sm w-full space-y-5" onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-2">
              <div className="flex justify-center text-[#c8960c] mb-2">
                <Icon name="lock" className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1200]">Inicia sesión para comprar</h3>
              <p className="text-sm text-[#6f6041]">Puedes explorar el catálogo sin cuenta, pero necesitas una para comprar.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={() => { setShowLoginModal(false); navigate("/login"); }}
                className="w-full rounded-none bg-[#1a1200] text-[#fff8df] py-3 text-sm font-bold hover:opacity-90 transition-opacity">
                Iniciar sesión
              </button>
              <button type="button" onClick={() => setShowLoginModal(false)}
                className="text-sm text-[#6f6041] hover:text-[#1a1200] transition-colors">
                Seguir explorando →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#040912] min-h-[92vh] flex items-center">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-[#f5d367]/8 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-900/20 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl w-full px-6 sm:px-10 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <span className="inline-block rounded-none border border-[#f5d367]/25 bg-[#f5d367]/10 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.35em] text-[#f5d367]">
              ShopyMarket MV
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
              Tu mercado digital,<br />
              <span className="text-[#f5d367]">todo en un lugar.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-lg">
              Compra productos locales, contrata servicios y apoya a comerciantes de tu ciudad — sin importar dónde estés.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="button" onClick={() => goTo("/market")}
                className="rounded-none bg-[#f5d367] text-[#120c00] px-8 py-3.5 text-sm font-extrabold uppercase tracking-wider hover:bg-[#ffeb99] shadow-[0_4px_24px_rgba(245,211,103,0.35)] transition-all">
                Explorar el mercado
              </button>
              {!isAuthenticated && (
                <button type="button" onClick={() => goTo("/register")}
                  className="rounded-none border border-white/15 bg-white/5 text-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-all">
                  Crear cuenta gratis
                </button>
              )}
            </div>
          </div>

          {/* Visual — abstract grid of cards */}
          <div className="hidden lg:grid grid-cols-2 gap-3 opacity-85">
            {[
              { icon: "market", label: "Productos",  color: "from-[#f5d367]/15 to-[#c8960c]/5", text: "text-[#f5d367]" },
              { icon: "wrench", label: "Servicios",  color: "from-indigo-900/40 to-indigo-800/20", text: "text-indigo-300" },
              { icon: "store",  label: "Tiendas",    color: "from-emerald-900/30 to-emerald-800/10", text: "text-emerald-300" },
              { icon: "truck",  label: "Entregas",   color: "from-amber-900/30 to-amber-800/10", text: "text-amber-300" },
            ].map(c => (
              <div key={c.label} className={`rounded-none border border-white/5 bg-gradient-to-br ${c.color} p-6 flex flex-col gap-3 hover:border-white/10 transition-all`}>
                <Icon name={c.icon} className={`h-8 w-8 ${c.text}`} />
                <p className={`text-sm font-bold ${c.text}`}>{c.label}</p>
                <div className="h-1 w-8 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-40">
          <div className="w-px h-8 bg-white/50" />
          <div className="text-white/50 text-[0.6rem] uppercase tracking-widest">scroll</div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. VALOR PRINCIPAL — dos columnas
      ══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 sm:px-10 py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Texto */}
          <div className="space-y-6 order-2 lg:order-1">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.4em] text-[#c8960c]">Una sola plataforma</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1a1200] leading-tight">
              Productos, servicios y comercios<br />conviviendo juntos.
            </h2>
            <p className="text-[#6f6041] leading-relaxed text-sm sm:text-base">
              ShopyMarket no es solo una tienda. Es un ecosistema donde los comerciantes locales pueden vender productos físicos <em>y</em> ofrecer servicios profesionales desde el mismo perfil, y los clientes encuentran todo en un solo lugar.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                "Catálogo unificado de productos y servicios",
                "Tiendas físicas con presencia digital real",
                "Solicitud de servicios con reserva de horario",
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#1a1200]">
                  <span className="mt-0.5 text-[#c8960c] font-black text-base">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => goTo("/market")}
              className="inline-flex items-center gap-2 rounded-none border border-[rgba(201,150,12,0.3)] px-6 py-3 text-sm font-bold text-[#1a1200] hover:border-[#c8960c] transition-all mt-4">
              Explorar ahora <span>→</span>
            </button>
          </div>

          {/* Visual */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -top-4 -left-4 w-full h-full rounded-none border-2 border-[rgba(201,150,12,0.15)] pointer-events-none" />
              <div className="rounded-none bg-[#040912] p-8 space-y-4 border border-white/5 shadow-2xl">
                {[
                  { icon: "market", title: "Marketplace de Productos", sub: "Catálogo de tiendas locales verificadas" },
                  { icon: "wrench", title: "Directorio de Servicios",  sub: "Profesionales disponibles para contratar" },
                  { icon: "truck", title: "Red de Entregas",          sub: "Repartidores conectados en tiempo real" },
                ].map(row => (
                  <div key={row.title} className="flex items-center gap-4 p-4 rounded-none bg-white/[0.04] border border-white/5">
                    <Icon name={row.icon} className="h-6 w-6 text-[#f5d367] shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white">{row.title}</p>
                      <p className="text-[0.7rem] text-white/40">{row.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. VISUAL BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#040912] py-24 px-6 sm:px-10 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 w-[500px] h-[500px] rounded-full bg-[#f5d367]/6 blur-[130px]" />
          <div className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-indigo-900/15 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.4em] text-[#f5d367]/70">Variedad y alcance</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Desde artesanías únicas hasta<br />servicios profesionales especializados.
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Cada comercio en ShopyMarket tiene su propio espacio digital. Banners personalizados, catálogos propios y presencia verificada para que los clientes confíen antes de comprar.
          </p>
          <button type="button" onClick={() => goTo("/market")}
            className="inline-block mt-4 rounded-none bg-[#f5d367] text-[#120c00] px-10 py-4 text-sm font-extrabold uppercase tracking-wider hover:bg-[#ffeb99] shadow-[0_4px_24px_rgba(245,211,103,0.3)] transition-all">
            Ver todos los comercios
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. BENEFICIOS — tres tarjetas
      ══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 sm:px-10 py-28">
        <div className="text-center mb-16 space-y-3">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.4em] text-[#c8960c]">¿Qué puedes hacer?</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1a1200]">
            Una plataforma para cada perfil
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: "market",
              title: "Comprar productos",
              text: "Explora catálogos de tiendas locales, compara precios y recibe tus pedidos en casa. Sin complicaciones.",
              cta: "Ir al mercado",
              action: () => goTo("/market"),
              accent: "#c8960c",
              light: true,
            },
            {
              icon: "wrench",
              title: "Contratar servicios",
              text: "Encuentra expertos locales para diseño, reparación, salud, tecnología y más. Agenda directamente desde la plataforma.",
              cta: "Explorar catálogo",
              action: () => goTo("/market"),
              accent: "#6366f1",
              dark: true,
            },
            {
              icon: "truck",
              title: "Seguimiento de pedidos",
              text: "Únete como repartidor y genera ingresos entregando pedidos pagados en tu zona. Flexibilidad total.",
              cta: isAuthenticated ? "Mis pedidos" : "Registrarme",
              action: () => isAuthenticated ? goTo("/my-orders") : goTo("/register"),
              accent: "#d97706",
              warm: true,
            },
          ].map(card => (
            <div key={card.title}
              className={`rounded-none p-8 flex flex-col gap-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                card.dark
                  ? "bg-[#040912] border-white/8 text-white"
                  : card.warm
                  ? "bg-[rgba(84,51,27,0.95)] border-[rgba(201,147,90,0.2)] text-[#f4dcc0]"
                  : "bg-white border-[rgba(201,150,12,0.12)] text-[#1a1200]"
              }`}>
              <Icon name={card.icon} className={`h-8 w-8 shrink-0 ${card.dark ? 'text-indigo-400' : card.warm ? 'text-amber-200' : 'text-[#c8960c]'}`} />
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-extrabold">{card.title}</h3>
                <p className={`text-sm leading-relaxed ${card.dark ? "text-white/55" : card.warm ? "text-[#f4dcc0]/70" : "text-[#6f6041]"}`}>{card.text}</p>
              </div>
              <button type="button" onClick={card.action}
                style={{ background: card.accent }}
                className="w-full rounded-none py-3 text-sm font-extrabold text-[#120c00] uppercase tracking-wider hover:opacity-90 transition-opacity">
                {card.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. COMERCIOS DESTACADOS
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#faf7ef] py-24 px-6 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div className="space-y-2">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.4em] text-[#c8960c]">Comercios</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1a1200]">
                Tiendas y servicios en ShopyMarket
              </h2>
              <p className="text-sm text-[#6f6041]">Comercios locales con presencia digital verificada.</p>
            </div>
            <button type="button" onClick={() => goTo("/market")} className="text-sm font-bold text-[#c8960c] hover:underline whitespace-nowrap">
              Ver todos →
            </button>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-52 rounded-none bg-[#f5f0e4] animate-pulse" />
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="rounded-none border border-dashed border-[rgba(201,150,12,0.2)] bg-white/50 p-12 text-center flex flex-col items-center">
              <Icon name="store" className="h-8 w-8 text-[#c8960c] mb-3" />
              <p className="text-sm text-[#6f6041]">Aún no hay comercios registrados. ¡Sé el primero!</p>
              <button type="button" onClick={() => goTo(isAuthenticated ? "/dashboard/vendor" : "/register")}
                className="mt-4 text-xs font-bold text-[#c8960c] hover:underline">
                Crear mi tienda →
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {stores.map(store => (
                <div key={`${store.isServiceProfile ? "p" : "s"}-${store.id}`}
                  onClick={() => store.isServiceProfile
                    ? navigate(`/service/${encodeURIComponent(store.name)}`)
                    : navigate(`/store/${encodeURIComponent(store.name)}`)}
                  className="cursor-pointer">
                  <StoreAvatar store={store} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. PRODUCTOS — carrusel horizontal
      ══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 sm:px-10 py-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="space-y-2">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.4em] text-[#c8960c]">Catálogo</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1a1200]">Productos disponibles ahora</h2>
            <p className="text-sm text-[#6f6041]">Explora libremente. Solo necesitas cuenta para comprar.</p>
          </div>
          <button type="button" onClick={() => goTo("/market")} className="text-sm font-bold text-[#c8960c] hover:underline whitespace-nowrap">
            Ver catálogo completo →
          </button>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-none border border-dashed border-[rgba(201,150,12,0.2)] bg-white/50 p-12 text-center flex flex-col items-center">
            <Icon name="box" className="h-8 w-8 text-[#c8960c] mb-3" />
            <p className="text-sm text-[#6f6041]">Aún no hay productos publicados.</p>
          </div>
        ) : (
          <HScrollCarousel>
            {products.map(p => (
              <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}>
                <ProductSlide product={p} onBuy={handleBuy} />
              </div>
            ))}
          </HScrollCarousel>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════
          7. SERVICIOS — carrusel horizontal
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#faf7ef] py-24 px-6 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div className="space-y-2">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.4em] text-indigo-500">Servicios</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1a1200]">Servicios disponibles ahora</h2>
              <p className="text-sm text-[#6f6041]">Contrata expertos locales para lo que necesites.</p>
            </div>
            <button type="button" onClick={() => goTo("/market")} className="text-sm font-bold text-indigo-500 hover:underline whitespace-nowrap">
              Ver todos los servicios →
            </button>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} color="bg-indigo-50" />)}
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-none border border-dashed border-indigo-100 bg-white/50 p-12 text-center flex flex-col items-center">
              <Icon name="wrench" className="h-8 w-8 text-indigo-500 mb-3" />
              <p className="text-sm text-[#6f6041]">Aún no hay servicios publicados.</p>
            </div>
          ) : (
            <HScrollCarousel>
              {services.map(sv => {
                const profile = allProfiles.find(p => Number(p.id) === Number(sv.service_profile_id));
                return (
                  <ServiceSlide
                    key={sv.id}
                    service={sv}
                    onView={() => navigate(`/service-detail/${sv.id}`)}
                  />
                );
              })}
            </HScrollCarousel>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          8. MÉTRICAS
      ══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 sm:px-10 py-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center space-y-2 p-8 rounded-none border border-[rgba(201,150,12,0.1)] bg-white">
              <p className="text-5xl font-extrabold text-[#c8960c]">{s.value}+</p>
              <p className="text-sm font-semibold text-[#6f6041]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          9. CTA FINAL
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#040912] py-32 px-6 sm:px-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#f5d367]/6 blur-[140px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center space-y-8">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.4em] text-[#f5d367]/60">¿Listo para empezar?</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Empieza a explorar<br />
            <span className="text-[#f5d367]">el mercado hoy.</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Sin barreras de entrada. El catálogo es público y gratuito. Solo necesitarás una cuenta cuando quieras comprar o vender.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button type="button" onClick={() => goTo("/market")}
              className="rounded-none bg-[#f5d367] text-[#120c00] px-10 py-4 text-sm font-extrabold uppercase tracking-wider hover:bg-[#ffeb99] shadow-[0_4px_24px_rgba(245,211,103,0.3)] transition-all">
              Explorar el mercado
            </button>
            {!isAuthenticated && (
              <button type="button" onClick={() => goTo("/register")}
                className="rounded-none border border-white/15 bg-white/5 text-white px-10 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-all">
                Crear cuenta gratis
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          10. FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[rgba(201,150,12,0.12)] bg-[#fffdf7] py-12 px-6 sm:px-10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <BrandMark compact tone="dark" />
          <div className="flex flex-wrap gap-5 text-xs font-semibold text-[#6f6041]">
            {[
              { label: "Inicio",    path: "/home" },
              { label: "Mercado",  path: "/market" },
              { label: "Ingresar", path: "/login" },
              { label: "Registrarse", path: "/register" },
            ].map(l => (
              <button key={l.path} type="button" onClick={() => goTo(l.path)}
                className="hover:text-[#c8960c] transition-colors">
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-[0.65rem] text-[#6f6041]/60 text-center">
            © {new Date().getFullYear()} ShopyMarket MV. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
