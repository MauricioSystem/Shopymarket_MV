import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import { getProfileImageUrl } from "@/utils/userCapabilities";
import { AUTH_ROLES } from "@/utils/authRoles";
import {
  getAllStores,
  getAllProducts,
  getAllServiceProfiles,
  getAllServices,
} from "@/services/marketApi";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
).replace(/\/$/, "");
// Modals extracted to dedicated pages

export default function StoreDetailPage({ type }) {
  const { storeName, serviceName } = useParams();
  const routerNavigate = useNavigate();
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    selectedStoreId,
    setSelectedStoreId,
    selectedServiceProfileId,
    setSelectedServiceProfileId,
    currentView,
    role,
    capabilities,
  } = useAuth();
  const { addToCart, openCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [store, setStore] = useState(null);
  const [serviceProfile, setServiceProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [cartAlert, setCartAlert] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [storesResult, productsResult, profilesResult, servicesResult] =
        await Promise.all([
          getAllStores(null),
          getAllProducts(null),
          getAllServiceProfiles(null),
          getAllServices(null),
        ]);

      const allStores = Array.isArray(storesResult?.data) ? storesResult.data : [];
      const allProducts = Array.isArray(productsResult?.data) ? productsResult.data : [];
      const allProfiles = Array.isArray(profilesResult?.data) ? profilesResult.data : [];
      const allServices = Array.isArray(servicesResult?.data) ? servicesResult.data : [];

      let currentStore = null;
      let currentProfile = null;

      // Primero buscar por parámetros de ruta (URL)
      if (storeName) {
        currentStore = allStores.find(
          (s) => s && (s.name?.toLowerCase() === storeName.toLowerCase() || s.id == storeName)
        ) || null;
        if (currentStore) {
          currentProfile = allProfiles.find(
            (p) => p && (Number(p.store_id) === Number(currentStore.id) || Number(p.admin_user_id) === Number(currentStore.admin_user_id))
          ) || null;
        }
      } else if (serviceName) {
        currentProfile = allProfiles.find(
          (p) => p && (p.name?.toLowerCase() === serviceName.toLowerCase() || p.id == serviceName)
        ) || null;
        if (currentProfile) {
          currentStore = allStores.find(
            (s) => s && (Number(s.id) === Number(currentProfile.store_id) || Number(s.admin_user_id) === Number(currentProfile.admin_user_id))
          ) || null;
        }
      }

      // Si no encontró por ruta, usar los del contexto
      if (!currentStore && !currentProfile) {
        if (selectedStoreId) {
          currentStore = allStores.find((s) => s && Number(s.id) === Number(selectedStoreId)) || null;
          if (currentStore) {
            currentProfile = allProfiles.find(
              (p) =>
                p && (Number(p.store_id) === Number(currentStore.id) ||
                Number(p.admin_user_id) === Number(currentStore.admin_user_id))
            ) || null;
          }
        } else if (selectedServiceProfileId) {
          currentProfile = allProfiles.find((p) => p && Number(p.id) === Number(selectedServiceProfileId)) || null;
          if (currentProfile && currentProfile.store_id) {
            currentStore = allStores.find((s) => s && Number(s.id) === Number(currentProfile.store_id)) || null;
          }
        }
      }

      setStore(currentStore);
      setServiceProfile(currentProfile);

      if (currentStore) {
        setProducts(allProducts.filter((p) => p && Number(p.store_id) === Number(currentStore.id) && p.status !== 'inactive'));
      } else {
        setProducts([]);
      }

      if (currentProfile) {
        setServices(allServices.filter((s) => s && Number(s.service_profile_id) === Number(currentProfile.id)));
      } else {
        setServices([]);
      }

      // Default active tab selection
      if (serviceName) {
        setActiveTab("services");
      } else if (storeName) {
        setActiveTab("products");
      } else if (currentStore) {
        setActiveTab("products");
      } else if (currentProfile) {
        setActiveTab("services");
      }
    } catch (err) {
      setError(err?.message || "Error al cargar la información del comercio.");
    } finally {
      setLoading(false);
    }
  }, [selectedStoreId, selectedServiceProfileId, storeName, serviceName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Location state logic for modals removed as we now use dedicated routes

  const isVendorPreview = currentView === "store-setup";
  const showBackToPanel = isVendorPreview || role === AUTH_ROLES.VENDOR;

  const handleBack = () => {
    if (capabilities?.canAccessAdminPanel) {
      setSelectedStoreId(null);
      setSelectedServiceProfileId(null);
      routerNavigate("/dashboard/admin");
    } else if (showBackToPanel) {
      routerNavigate("/dashboard/vendor");
    } else {
      setSelectedStoreId(null);
      setSelectedServiceProfileId(null);
      routerNavigate("/market");
    }
  };

  const handleEdit = () => {
    routerNavigate("/dashboard/vendor");
  };

  const handleBuy = async (item, quantity = 1) => {
    if (!isAuthenticated) {
      setCartAlert(true);
      setTimeout(() => setCartAlert(false), 3000);
      return;
    }
    const result = await addToCart(item, quantity);
    if (result.success) {
      openCart();
    } else {
      alert(result.message || "No se pudo agregar al carrito. Verifica si eres un cliente y si el producto tiene stock.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040912] text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#f5d367] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-white/50">Cargando comercio...</p>
        </div>
      </div>
    );
  }

  if (error || (!store && !serviceProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040912] text-white p-6">
        <div className="max-w-md w-full rounded-lg border border-white/10 bg-white/5 p-8 text-center space-y-5">
          <span className="text-5xl">🏪</span>
          <h2 className="text-xl font-bold text-white">Comercio no encontrado</h2>
          <p className="text-sm text-white/50">
            {error || "El comercio que intentas visualizar no existe o no tiene datos configurados."}
          </p>
          <Button onClick={handleBack} className="w-full bg-[#f5d367] text-[#120c00] font-bold">
            {capabilities?.canAccessAdminPanel ? "Volver al Panel de Admin" : "Volver al Mercado"}
          </Button>
        </div>
      </div>
    );
  }

  const isOwner =
    isAuthenticated &&
    user &&
    ((store && Number(store.admin_user_id) === Number(user.id)) ||
      (serviceProfile && Number(serviceProfile.admin_user_id) === Number(user.id)));

  const isServicesActive = activeTab === "services" && serviceProfile;

  const activeBanner = isServicesActive ? serviceProfile?.banner_url : (store?.banner_url || serviceProfile?.banner_url);
  const bannerSrc = activeBanner
    ? activeBanner.startsWith("http")
      ? activeBanner
      : `${API_BASE}${activeBanner}`
    : null;

  const activeLogo = isServicesActive ? serviceProfile?.profile_image_url : (store?.logo_url || serviceProfile?.profile_image_url);
  const logoSrc = activeLogo
    ? activeLogo.startsWith("http")
      ? activeLogo
      : `${API_BASE}${activeLogo}`
    : null;

  const displayName = isServicesActive
    ? (serviceProfile?.name || store?.name || "Comercio en ShopyMarket")
    : (store?.name || serviceProfile?.name || "Comercio en ShopyMarket");

  const displayDesc = isServicesActive
    ? (serviceProfile?.description || store?.description || "Sin descripción proporcionada.")
    : (store?.description || serviceProfile?.description || "Sin descripción proporcionada.");

  const displayBg = isServicesActive
    ? (serviceProfile?.background_color || store?.background_color || "#07111f")
    : (store?.background_color || serviceProfile?.background_color || "#07111f");

  const displayCity = isServicesActive
    ? (serviceProfile?.city || store?.city || "")
    : (store?.city || serviceProfile?.city || "");

  const displayCountry = isServicesActive
    ? (serviceProfile?.country || store?.country || "")
    : (store?.country || serviceProfile?.country || "");

  const displayAddress = isServicesActive
    ? (serviceProfile?.address || store?.address || "")
    : (store?.address || serviceProfile?.address || "");

  // Determine tabs visibility
  const showProducts = store && products.length > 0;
  const showServices = serviceProfile && services.length > 0;
  const isHybrid = showProducts && showServices;

  return (
    <main
      className="min-h-screen text-white pb-20 font-sans"
      style={{
        background: `radial-gradient(circle at top left, rgba(245, 211, 103, 0.08), transparent 35%), linear-gradient(180deg, ${displayBg}, #040912)`,
      }}
    >
      <Navbar />
      {/* Navbar detail view - hidden in dashboard preview */}
      {currentView !== "store-setup" && (
        <header className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(6,12,22,0.8)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-white/80 hover:text-[#f5d367] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#f5d367]/40 rounded-full px-4 py-2 transition-all duration-300 shadow-[0_2px_8px_rgba(245,211,103,0.1)]"
            >
              {capabilities?.canAccessAdminPanel
                ? "← Volver al Panel de Admin"
                : role === AUTH_ROLES.VENDOR
                ? "← Volver a mi panel"
                : "← Volver al mercado"}
            </button>
            <BrandMark compact tone="light" />
            <div>
            </div>
          </div>
        </header>
      )}

      {/* Floating cart alert */}
      {cartAlert && (
        <div className="fixed bottom-6 right-6 z-50 rounded-md border border-[#f5d367]/30 bg-[#0d1726]/90 p-4 text-sm font-bold text-[#f5d367] shadow-[0_10px_40px_rgba(245,211,103,0.15)] animate-bounce">
          🛒 Carrito de compras disponible próximamente
        </div>
      )}

      {/* Banner & Logo section */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 bg-slate-900 overflow-hidden">
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt={`Banner de ${displayName}`}
            className="w-full h-full object-cover opacity-85"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center opacity-25">
            <span className="text-8xl">🏪</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 -mt-16 sm:-mt-24 relative z-10 space-y-6">
        {/* Profile Card Header */}
        <div className="rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left shadow-2xl">
          <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-lg bg-[#0d1726] border-2 border-[#f5d367]/40 flex items-center justify-center text-5xl shrink-0 overflow-hidden shadow-xl">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={`Logo de ${displayName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              "🏪"
            )}
          </div>

          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {displayName}
              </h1>
              {store && (
                <span className="rounded-md bg-[#f5d367]/10 border border-[#f5d367]/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#f5d367]">
                  Tienda
                </span>
              )}
              {serviceProfile && (
                <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-blue-400">
                  Servicios
                </span>
              )}
            </div>

            <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
              {displayDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-xs text-white/40">
              {(displayCity || displayCountry) && (
                <span className="flex items-center gap-1">
                  📍 {displayCity}
                  {displayCountry ? `, ${displayCountry}` : ""}
                </span>
              )}
              {displayAddress && (
                <span className="flex items-center gap-1">
                  🏢 {displayAddress}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Catalog Section */}
        <div className="space-y-6">
          {/* Tabs header */}
          {isHybrid && (
            <div className="flex justify-center md:justify-start gap-3 border-b border-white/10 pb-4">
              <button
                onClick={() => setActiveTab("products")}
                className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                  activeTab === "products"
                    ? "bg-[#f5d367] text-[#120c00] shadow-lg shadow-[#f5d367]/20"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                🛍️ Catálogo de Productos
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                  activeTab === "services"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                🔧 Servicios Ofrecidos
              </button>
            </div>
          )}

          {/* Products Grid */}
          {activeTab === "products" && showProducts && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Productos en catálogo ({products.length})
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => {
                  const pImgSrc = product.image_url
                    ? product.image_url.startsWith("http")
                      ? product.image_url
                      : `${API_BASE}${product.image_url}`
                    : null;
                  return (
                    <article
                      key={product.id}
                      onClick={() => routerNavigate(`/product/${product.id}`)}
                      className="group cursor-pointer rounded-lg border border-white/5 bg-white/[0.03] overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="h-44 bg-white/5 overflow-hidden relative">
                        {pImgSrc ? (
                          <img
                            src={pImgSrc}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
                            🛍️
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <p className="font-bold text-sm text-white truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                            {product.description || "Sin descripción adicional"}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <div>
                            <p className="text-base font-extrabold text-[#f5d367]">
                              Bs {Number(product.price || 0).toFixed(2)}
                            </p>
                            {product.stock !== undefined && (
                              <p className="text-[0.65rem] text-white/30 mt-0.5">
                                Stock: {product.stock}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleBuy(product, 1); }}
                            className="rounded-md bg-[#f5d367] text-[#120c00] hover:opacity-90 transition-all px-4 py-1.5 text-xs font-bold"
                          >
                            🛒 Comprar
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Services Grid */}
          {activeTab === "services" && showServices && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Servicios ofrecidos ({services.length})
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => {
                  const sImgSrc = service.image_url
                    ? service.image_url.startsWith("http")
                      ? service.image_url
                      : `${API_BASE}${service.image_url}`
                    : null;
                  return (
                    <article
                      key={service.id}
                      onClick={() => routerNavigate(`/service-detail/${service.id}`)}
                      className="group cursor-pointer rounded-lg border border-white/5 bg-[#07111f]/60 backdrop-blur-sm overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-4 p-5">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className="font-bold text-sm text-white truncate">
                            {service.name}
                          </p>
                          <p className="text-xs text-white/50 line-clamp-3 leading-relaxed">
                            {service.description || "Sin descripción adicional"}
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl shrink-0">
                          {sImgSrc ? (
                            <img
                              src={sImgSrc}
                              alt={service.name}
                              className="h-full w-full object-cover rounded-md"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            "🔧"
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-white/5 gap-3">
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="rounded-md bg-[#f5d367]/10 text-[#f5d367] border border-[#f5d367]/20 font-bold px-3 py-1">
                            Bs {Number(service.price || 0).toFixed(2)}
                          </span>
                          {service.estimated_time && (
                            <span className="rounded-md bg-white/5 text-white/60 border border-white/10 px-3 py-1">
                              ⏱ {service.estimated_time}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); routerNavigate(`/service-detail/${service.id}`); }}
                          className="rounded-md bg-blue-500 text-white hover:opacity-90 transition-all px-4 py-1.5 text-xs font-bold"
                        >
                          Contratar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty catalog states */}
          {activeTab === "products" && (!store || products.length === 0) && (
            <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-16 text-center space-y-3">
              <span className="text-5xl opacity-40">🛍️</span>
              <p className="text-sm text-white/40">Este comercio aún no tiene productos disponibles en su catálogo.</p>
            </div>
          )}

          {activeTab === "services" && (!serviceProfile || services.length === 0) && (
            <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-16 text-center space-y-3">
              <span className="text-5xl opacity-40">🔧</span>
              <p className="text-sm text-white/40">Este comercio aún no tiene servicios publicados para contratar.</p>
            </div>
          )}
        </div>
      </div>

    </main>
  );
}

