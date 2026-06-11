import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import VendorNavbar from "@/components/layout/VendorNavbar";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/context/CartContext";
import { AUTH_ROLES } from "@/utils/authRoles";
import {
  getAllStores,
  getAllProducts,
  getAllServiceProfiles,
  getAllServices,
  updateMyStore,
  updateServiceProfile,
  createProduct,
  createService,
  getAllCategories,
  getAllSubcategories,
} from "@/services/marketApi";
import { API_BASE_URL } from "@/config/appSettings";
import LeafletMap, { parseAddressCoords } from "@/components/ui/LeafletMap";
import { ProductVoteButtons, StarRatingPanel } from "@/components/RatingActions";
import {
  getStoreRating,
  submitStoreRating,
  getItemLikes,
  submitItemVote,
  trackStoreVisit,
} from "@/utils/ratingStorage";

const API_BASE = API_BASE_URL;

function LoginPromptModal({ onClose, onLogin }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="rounded-none border border-[rgba(245,211,103,0.2)] bg-[#0d1726] p-8 shadow-2xl max-w-sm w-full space-y-5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2 flex flex-col items-center">
          <Icon name="lock" className="h-10 w-10 text-[#f5d367] mb-1" />
          <h3 className="text-xl font-bold text-white">
            Inicia sesión para calificar
          </h3>
          <p className="text-sm text-white/60">
            Debes ingresar con tu cuenta para poder calificar comercios y dar likes en productos o servicios.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={onLogin}
            className="w-full bg-[#f5d367] text-[#120c00] hover:opacity-90 font-bold rounded-none"
          >
            Iniciar sesión / Registrarse
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            Seguir explorando →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoreDetailPage({ type }) {
  const { storeName, serviceName } = useParams();
  const routerNavigate = useNavigate();
  const location = useLocation();
  const {
    token,
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
  const [storeRating, setStoreRating] = useState(null);
  const [serviceProfileRating, setServiceProfileRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState(null);
  const [productVoteLoading, setProductVoteLoading] = useState(null);
  const [serviceVoteLoading, setServiceVoteLoading] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Modals Open State
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  // Categories & Subcategories list (lazy loaded for owner modals)
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Store Setup Form State
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    background_color: "#07111f",
    city: "Santa Cruz",
    country: "Bolivia",
    address: "",
  });
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [editBannerFile, setEditBannerFile] = useState(null);
  const [editLogoPreview, setEditLogoPreview] = useState(null);
  const [editBannerPreview, setEditBannerPreview] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Add Product Form State
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "0",
    category_id: "",
    subcategory_id: "",
  });
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState(null);

  // Add Service Form State
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    estimated_time: "",
    category_id: "",
  });
  const [serviceImageFile, setServiceImageFile] = useState(null);
  const [serviceImagePreview, setServiceImagePreview] = useState(null);
  const [serviceSaving, setServiceSaving] = useState(false);
  const [serviceError, setServiceError] = useState(null);

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
      setRatingMessage(null);

      const storeRatingResult = currentStore ? getStoreRating(currentStore.id, false) : null;
      const serviceRatingResult = currentProfile ? getStoreRating(currentProfile.id, true) : null;

      setStoreRating(storeRatingResult);
      setServiceProfileRating(serviceRatingResult);

      if (currentStore) {
        const storeProducts = allProducts.filter(
          (p) =>
            p &&
            Number(p.store_id) === Number(currentStore.id) &&
            p.status !== 'inactive',
        );
        const mappedProducts = storeProducts.map(p => ({
          ...p,
          likesData: getItemLikes(p.id, "product")
        }));
        // Sort products descending by likes count
        mappedProducts.sort((a, b) => {
          const likesA = a.likesData?.likes || 0;
          const likesB = b.likesData?.likes || 0;
          if (likesB === likesA) {
            return (a.likesData?.dislikes || 0) - (b.likesData?.dislikes || 0);
          }
          return likesB - likesA;
        });
        setProducts(mappedProducts);
      } else {
        setProducts([]);
      }

      if (currentProfile) {
        const profileServices = allServices.filter((s) => s && Number(s.service_profile_id) === Number(currentProfile.id));
        const mappedServices = profileServices.map(s => ({
          ...s,
          likesData: getItemLikes(s.id, "service")
        }));
        // Sort services descending by likes count
        mappedServices.sort((a, b) => {
          const likesA = a.likesData?.likes || 0;
          const likesB = b.likesData?.likes || 0;
          if (likesB === likesA) {
            return (a.likesData?.dislikes || 0) - (b.likesData?.dislikes || 0);
          }
          return likesB - likesA;
        });
        setServices(mappedServices);
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

      // Increment page visit if not owner
      const isOwnerStore = currentStore && isAuthenticated && user && Number(currentStore.admin_user_id) === Number(user.id);
      const isOwnerProfile = currentProfile && isAuthenticated && user && Number(currentProfile.admin_user_id) === Number(user.id);

      if (currentStore && !isOwnerStore) {
        trackStoreVisit(currentStore.id, false);
      }
      if (currentProfile && !isOwnerProfile) {
        trackStoreVisit(currentProfile.id, true);
      }
    } catch (err) {
      setError(err?.message || "Error al cargar la información del comercio.");
    } finally {
      setLoading(false);
    }
  }, [selectedStoreId, selectedServiceProfileId, storeName, serviceName, user, isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isOwner =
    isAuthenticated &&
    user &&
    ((store && Number(store.admin_user_id) === Number(user.id)) ||
      (serviceProfile && Number(serviceProfile.admin_user_id) === Number(user.id)));

  useEffect(() => {
    async function fetchCats() {
      if (isOwner) {
        try {
          const [catsRes, subsRes] = await Promise.all([
            getAllCategories(null),
            getAllSubcategories(null)
          ]);
          setCategories(Array.isArray(catsRes?.data) ? catsRes.data : (Array.isArray(catsRes) ? catsRes : []));
          setSubcategories(Array.isArray(subsRes?.data) ? subsRes.data : (Array.isArray(subsRes) ? subsRes : []));
        } catch (err) {
          console.error("Error loading categories for owner modals", err);
        }
      }
    }
    fetchCats();
  }, [isOwner]);

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

  const handleBuy = async (item, quantity = 1) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    const result = await addToCart(item, quantity);
    if (result.success) {
      openCart();
    } else {
      alert(result.message || "No se pudo agregar al carrito. Verifica si eres un cliente y si el producto tiene stock.");
    }
  };

  const handleRate = async (rating) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setRatingLoading(true);
    setRatingMessage(null);

    try {
      const userId = user?.id || user?.email || "logged_in_user";
      if (isServicesActive) {
        const result = submitStoreRating(serviceProfile.id, true, userId, rating);
        if (result) setServiceProfileRating(result);
      } else {
        const result = submitStoreRating(store.id, false, userId, rating);
        if (result) setStoreRating(result);
      }
      setRatingMessage({ type: "success", text: "Calificación guardada." });
    } catch (err) {
      setRatingMessage({ type: "error", text: err?.message || "No se pudo guardar la calificación." });
    } finally {
      setRatingLoading(false);
    }
  };

  const handleProductVote = async (product, vote) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Prevent vendors from voting on any product
    if (role === AUTH_ROLES.VENDOR) {
      console.warn('[Vote] Vendors cannot vote on products');
      return;
    }

    setProductVoteLoading(product.id);

    try {
      const userId = user?.id || user?.email || "logged_in_user";
      const newStats = submitItemVote(product.id, "product", userId, vote === 1 ? "like" : "dislike");
      if (newStats) {
        setProducts((current) =>
          current.map((entry) =>
            Number(entry.id) === Number(product.id)
              ? { ...entry, likesData: newStats }
              : entry,
          ),
        );
      }
    } finally {
      setProductVoteLoading(null);
    }
  };

  const handleServiceVote = async (service, vote) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Prevent vendors from voting on any service
    if (role === AUTH_ROLES.VENDOR) {
      console.warn('[Vote] Vendors cannot vote on services');
      return;
    }

    setServiceVoteLoading(service.id);

    try {
      const userId = user?.id || user?.email || "logged_in_user";
      const newStats = submitItemVote(service.id, "service", userId, vote === 1 ? "like" : "dislike");
      if (newStats) {
        setServices((current) =>
          current.map((entry) =>
            Number(entry.id) === Number(service.id)
              ? { ...entry, likesData: newStats }
              : entry,
          ),
        );
      }
    } finally {
      setServiceVoteLoading(null);
    }
  };

  const handleOpenEditInfo = () => {
    const activeObj = isServicesActive ? serviceProfile : store;
    setEditForm({
      name: activeObj?.name || "",
      description: activeObj?.description || "",
      background_color: activeObj?.background_color || "#07111f",
      city: activeObj?.city || "Santa Cruz",
      country: activeObj?.country || "Bolivia",
      address: activeObj?.address || "",
    });
    setEditLogoFile(null);
    setEditBannerFile(null);
    setEditLogoPreview(null);
    setEditBannerPreview(null);
    setEditError(null);
    setShowEditInfoModal(true);
  };

  const handleSaveEditInfo = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError(null);
    try {
      const activeObj = isServicesActive ? serviceProfile : store;
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('description', editForm.description || '');
      formData.append('background_color', editForm.background_color);
      formData.append('country', editForm.country || 'Bolivia');
      formData.append('city', editForm.city || 'Santa Cruz');
      formData.append('address', editForm.address || '');
      
      if (isServicesActive) {
        if (editLogoFile) {
          formData.append('logo', editLogoFile);
        } else if (serviceProfile?.profile_image_url) {
          formData.append('profile_image_url', serviceProfile.profile_image_url);
        }
        if (editBannerFile) {
          formData.append('banner', editBannerFile);
        } else if (serviceProfile?.banner_url) {
          formData.append('banner_url', serviceProfile.banner_url);
        }
        await updateServiceProfile(token, serviceProfile.id, formData);
      } else {
        if (editLogoFile) {
          formData.append('logo', editLogoFile);
        } else if (store?.logo_url) {
          formData.append('logo_url', store.logo_url);
        }
        if (editBannerFile) {
          formData.append('banner', editBannerFile);
        } else if (store?.banner_url) {
          formData.append('banner_url', store.banner_url);
        }
        await updateMyStore(token, store.id, formData);
      }
      setShowEditInfoModal(false);
      await loadData();
    } catch (err) {
      setEditError(err?.message || "Ocurrió un error al guardar la información.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productImageFile) {
      setProductError("La imagen del producto es obligatoria.");
      return;
    }
    setProductSaving(true);
    setProductError(null);
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description || '');
      formData.append('price', Number(productForm.price));
      formData.append('stock', Number(productForm.stock || 0));
      formData.append('category_id', productForm.category_id);
      if (productForm.subcategory_id) {
        formData.append('subcategory_id', productForm.subcategory_id);
      }
      formData.append('store_id', store.id);
      formData.append('status', 'active');
      formData.append('image', productImageFile);
      
      await createProduct(token, formData);
      
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "0",
        category_id: "",
        subcategory_id: "",
      });
      setProductImageFile(null);
      setProductImagePreview(null);
      setShowAddProductModal(false);
      await loadData();
    } catch (err) {
      setProductError(err?.message || "Ocurrió un error al crear el producto.");
    } finally {
      setProductSaving(false);
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceImageFile) {
      setServiceError("La imagen de referencia es obligatoria.");
      return;
    }
    setServiceSaving(true);
    setServiceError(null);
    try {
      const formData = new FormData();
      formData.append('name', serviceForm.name);
      formData.append('description', serviceForm.description || '');
      formData.append('price', Number(serviceForm.price));
      formData.append('estimated_time', serviceForm.estimated_time || '');
      formData.append('category_id', serviceForm.category_id);
      formData.append('service_profile_id', serviceProfile.id);
      formData.append('status', 'active');
      formData.append('image', serviceImageFile);
      
      await createService(token, formData);
      
      setServiceForm({
        name: "",
        description: "",
        price: "",
        estimated_time: "",
        category_id: "",
      });
      setServiceImageFile(null);
      setServiceImagePreview(null);
      setShowAddServiceModal(false);
      await loadData();
    } catch (err) {
      setServiceError(err?.message || "Ocurrió un error al crear el servicio.");
    } finally {
      setServiceSaving(false);
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
      <div className="min-h-screen flex items-center justify-center bg-[#040912] text-white p-4">
        <div className="max-w-md w-full rounded-none border border-white/10 bg-white/5 p-8 text-center space-y-5 flex flex-col items-center justify-center">
          <Icon name="store" className="h-16 w-16 text-[#f5d367] mb-2" />
          <h2 className="text-xl font-bold text-white">Comercio no encontrado</h2>
          <p className="text-sm text-white/50">
            {error || "El comercio que intentas visualizar no existe o no tiene datos configurados."}
          </p>
          <Button onClick={handleBack} className="w-full bg-[#f5d367] text-[#120c00] font-bold rounded-none">
            {capabilities?.canAccessAdminPanel ? "Volver al Panel de Admin" : "Volver al Mercado"}
          </Button>
        </div>
      </div>
    );
  }

  const isServicesActive = activeTab === "services" && serviceProfile;
  const activeRating = isServicesActive ? serviceProfileRating : storeRating;
  const canRate = isAuthenticated && !isOwner;

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
  const isHybrid = isOwner 
    ? (store !== null && serviceProfile !== null)
    : (showProducts && showServices);

  const parsedAddress = parseAddressCoords(displayAddress);

  return (
    <main
      className="min-h-screen text-white pb-20 font-sans"
      style={{
        background: `radial-gradient(circle at top left, rgba(245, 211, 103, 0.08), transparent 35%), linear-gradient(180deg, ${displayBg}, #040912)`,
      }}
    >
      {isOwner ? <VendorNavbar /> : <Navbar />}

      {showLoginModal && (
        <LoginPromptModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            setShowLoginModal(false);
            routerNavigate("/login");
          }}
        />
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
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center opacity-25 text-white">
            <Icon name="store" className="h-20 w-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Floating Back Button */}
        {currentView !== "store-setup" && (
          <button
            onClick={handleBack}
            className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-white/90 hover:text-[#f5d367] bg-black/40 hover:bg-black/60 border border-white/15 hover:border-[#f5d367]/40 rounded-none px-4 py-2.5 transition-all duration-300 shadow-lg font-sans"
          >
            {capabilities?.canAccessAdminPanel
              ? "← Volver al Panel de Admin"
              : role === AUTH_ROLES.VENDOR
              ? "← Volver a mi panel"
              : "← Volver al mercado"}
          </button>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 -mt-16 sm:-mt-24 relative z-10 space-y-6">
        {/* Profile Card Header */}
        <div className="rounded-none border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left shadow-2xl">
          <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-none bg-[#0d1726] border-2 border-[#f5d367]/40 flex items-center justify-center shrink-0 overflow-hidden shadow-xl">
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
              <Icon name="store" className="h-12 w-12 text-[#f5d367]" />
            )}
          </div>

          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {displayName}
              </h1>
              {!isServicesActive && store && (
                <span className="rounded-none bg-[#f5d367]/10 border border-[#f5d367]/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#f5d367]">
                  Tienda
                </span>
              )}
              {isServicesActive && serviceProfile && (
                <span className="rounded-none bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-blue-400">
                  Servicios
                </span>
              )}
              {isOwner && (
                <button
                  type="button"
                  onClick={handleOpenEditInfo}
                  className="rounded-none bg-[#f5d367] text-[#120c00] hover:opacity-90 transition-all px-3.5 py-1 text-xs font-bold flex items-center gap-1.5 border border-[#f5d367]/20 ml-2"
                >
                  <Icon name="settings" className="h-3.5 w-3.5 shrink-0" />
                  <span>Editar Información</span>
                </button>
              )}
            </div>

            <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
              {displayDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-xs text-white/40">
              {(displayCity || displayCountry) && (
                <span className="flex items-center gap-1">
                  <Icon name="pin" className="h-3.5 w-3.5 text-[#f5d367] shrink-0" />
                  <span>{displayCity}{displayCountry ? `, ${displayCountry}` : ""}</span>
                </span>
              )}
              {displayAddress && (
                <span className="flex items-center gap-1">
                  <Icon name="store" className="h-3.5 w-3.5 text-[#f5d367] shrink-0" />
                  <span>{parsedAddress.text}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <StarRatingPanel
          stats={activeRating}
          userId={user?.id || user?.email}
          canInteract={canRate}
          onRate={handleRate}
          loading={ratingLoading}
          message={ratingMessage}
        />

        {/* Ubicación del Comercio Section */}
        {parsedAddress.hasCoords && (
          <section className="rounded-none border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 space-y-4 shadow-2xl mt-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Icon name="pin" className="h-5 w-5 text-[#f5d367]" />
              <span>Ubicación y Dirección</span>
            </h2>
            <p className="text-sm text-white/70">
              {parsedAddress.text}
            </p>
            <div className="w-full mt-4">
              <LeafletMap
                value={displayAddress}
                readOnly={true}
              />
            </div>
          </section>
        )}

        {/* Catalog Section */}

        <div className="space-y-6">
          {/* Tabs header */}
          {isHybrid && (
            <div className="flex justify-center md:justify-start gap-3 border-b border-white/10 pb-4">
              <button
                onClick={() => setActiveTab("products")}
                className={`rounded-none px-6 py-2.5 text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "products"
                    ? "bg-[#f5d367] text-[#120c00] shadow-lg shadow-[#f5d367]/20"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                <Icon name="market" className="h-4 w-4 shrink-0" />
                <span>Catálogo de Productos</span>
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`rounded-none px-6 py-2.5 text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "services"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                <Icon name="wrench" className="h-4 w-4 shrink-0" />
                <span>Servicios Ofrecidos</span>
              </button>
            </div>
          )}

          {/* Products Grid */}
          {activeTab === "products" && store && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-3 gap-4">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Productos en catálogo ({products.length})
                </h2>
                {isOwner && (
                  <button
                    onClick={() => {
                      setProductForm({
                        name: "",
                        description: "",
                        price: "",
                        stock: "0",
                        category_id: "",
                        subcategory_id: "",
                      });
                      setProductImageFile(null);
                      setProductImagePreview(null);
                      setProductError(null);
                      setShowAddProductModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-none bg-[#f5d367] text-[#120c00] hover:opacity-90 font-bold px-4 py-2 text-xs shadow-md shadow-[#f5d367]/20 transition-all uppercase tracking-wider"
                  >
                    <span>+ Agregar Producto</span>
                  </button>
                )}
              </div>

              {products.length === 0 ? (
                <div className="rounded-none border border-dashed border-white/10 bg-white/[0.02] p-16 text-center flex flex-col items-center justify-center space-y-3">
                  <Icon name="market" className="h-12 w-12 opacity-40 text-white" />
                  <p className="text-sm text-white/40">Este comercio aún no tiene productos disponibles en su catálogo.</p>
                </div>
              ) : (
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
                        onClick={() => {
                          if (!isOwner) {
                            routerNavigate(`/product/${product.id}`);
                          }
                        }}
                        className={`group rounded-none border border-white/5 bg-white/[0.03] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                          isOwner ? "cursor-default" : "cursor-pointer hover:-translate-y-1"
                        }`}
                      >
                        <div className="h-44 bg-white/5 overflow-hidden relative rounded-none">
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
                            <div className="w-full h-full flex items-center justify-center opacity-25 text-white">
                              <Icon name="market" className="h-10 w-10" />
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
                            {isOwner ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  routerNavigate("/dashboard/vendor", {
                                    state: { activeTab: "products", editProductId: product.id }
                                  });
                                }}
                                className="rounded-none bg-[#f5d367] text-[#120c00] hover:opacity-90 transition-all px-4 py-1.5 text-xs font-bold flex items-center gap-1.5"
                              >
                                <Icon name="edit" className="h-3.5 w-3.5 shrink-0" />
                                <span>Editar</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleBuy(product, 1); }}
                                className="rounded-none bg-[#f5d367] text-[#120c00] hover:opacity-90 transition-all px-4 py-1.5 text-xs font-bold flex items-center gap-1.5"
                              >
                                <Icon name="cart" className="h-3.5 w-3.5 shrink-0" />
                                <span>Comprar</span>
                              </button>
                            )}
                          </div>
                          <div className="pt-1">
                            <ProductVoteButtons
                              likes={product.likesData?.likes || 0}
                              dislikes={product.likesData?.dislikes || 0}
                              userVote={user?.id || user?.email ? product.likesData?.userVotes?.[user?.id || user?.email] || 0 : 0}
                              canInteract={isAuthenticated && !isOwner}
                              onVote={(vote) => handleProductVote(product, vote)}
                              loading={productVoteLoading === product.id}
                              tone="dark"
                            />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Services Grid */}
          {activeTab === "services" && serviceProfile && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-3 gap-4">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Servicios ofrecidos ({services.length})
                </h2>
                {isOwner && (
                  <button
                    onClick={() => {
                      setServiceForm({
                        name: "",
                        description: "",
                        price: "",
                        estimated_time: "",
                        category_id: "",
                      });
                      setServiceImageFile(null);
                      setServiceImagePreview(null);
                      setServiceError(null);
                      setShowAddServiceModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-none bg-blue-500 text-white hover:opacity-90 font-bold px-4 py-2 text-xs shadow-md shadow-blue-500/20 transition-all uppercase tracking-wider"
                  >
                    <span>+ Agregar Servicio</span>
                  </button>
                )}
              </div>

              {services.length === 0 ? (
                <div className="rounded-none border border-dashed border-white/10 bg-white/[0.02] p-16 text-center flex flex-col items-center justify-center space-y-3">
                  <Icon name="wrench" className="h-12 w-12 opacity-40 text-white" />
                  <p className="text-sm text-white/40">Este comercio aún no tiene servicios publicados para contratar.</p>
                </div>
              ) : (
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
                        onClick={() => {
                          if (!isOwner) {
                            routerNavigate(`/service-detail/${service.id}`);
                          }
                        }}
                        className={`group rounded-none border border-white/5 bg-[#07111f]/60 backdrop-blur-sm overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                          isOwner ? "cursor-default" : "cursor-pointer hover:-translate-y-1"
                        }`}
                      >
                        <div className="h-44 bg-gradient-to-br from-indigo-950/20 to-blue-955/20 overflow-hidden relative shrink-0 flex items-center justify-center border-b border-white/5 rounded-none">
                          {sImgSrc ? (
                            <img
                              src={sImgSrc}
                              alt={service.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <Icon name="wrench" className="h-10 w-10 text-indigo-400/20" />
                          )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <p className="font-bold text-sm text-white truncate">
                              {service.name}
                            </p>
                            <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                              {service.description || "Sin descripción adicional"}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <div>
                              <p className="text-base font-extrabold text-blue-400">
                                Bs {Number(service.price || 0).toFixed(2)}
                              </p>
                              {service.estimated_time && (
                                <p className="text-[0.65rem] text-white/30 mt-0.5">
                                  Tiempo: {service.estimated_time}
                                </p>
                              )}
                            </div>
                            {isOwner ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  routerNavigate("/dashboard/vendor", {
                                    state: { activeTab: "services", editServiceId: service.id }
                                  });
                                }}
                                className="rounded-none bg-blue-500 text-white hover:opacity-90 transition-all px-4 py-1.5 text-xs font-bold flex items-center gap-1.5"
                              >
                                <Icon name="edit" className="h-3.5 w-3.5 shrink-0" />
                                <span>Editar</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); routerNavigate(`/service-detail/${service.id}`); }}
                                className="rounded-none bg-blue-500 text-white hover:opacity-90 transition-all px-4 py-1.5 text-xs font-bold"
                              >
                                Contratar
                              </button>
                            )}
                          </div>
                          <div className="pt-1">
                            <ProductVoteButtons
                              likes={service.likesData?.likes || 0}
                              dislikes={service.likesData?.dislikes || 0}
                              userVote={user?.id || user?.email ? service.likesData?.userVotes?.[user?.id || user?.email] || 0 : 0}
                              canInteract={isAuthenticated && !isOwner}
                              onVote={(vote) => handleServiceVote(service, vote)}
                              loading={serviceVoteLoading === service.id}
                              tone="dark"
                            />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>


      {/* Owner In-Page Modals */}
      {showEditInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowEditInfoModal(false)}>
          <div className="rounded-none border border-white/10 bg-[#0a121e] p-6 sm:p-8 shadow-2xl max-w-lg w-full space-y-5 overflow-y-auto max-h-[90vh] text-white" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Editar Información del Comercio</h3>
              <button onClick={() => setShowEditInfoModal(false)} className="text-white/40 hover:text-white text-2xl">×</button>
            </div>
            {editError && <p className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-none">⚠️ {editError}</p>}
            <form onSubmit={handleSaveEditInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Nombre comercial *</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367]" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Descripción</label>
                <textarea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367] h-20 resize-none"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Ciudad</label>
                  <select value={editForm.city} onChange={e => setEditForm(prev => ({ ...prev, city: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367]">
                    {["Santa Cruz", "Tarija", "Beni", "Chuquisaca", "Cochabamba", "La Paz", "Oruro", "Pando", "Potosí"].map(c => <option key={c} value={c} className="bg-[#0a121e]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">País</label>
                  <input type="text" value={editForm.country} disabled className="w-full bg-white/5 border border-white/10 text-white/40 rounded-none p-3 text-sm" />
                </div>
              </div>
              <div>
                <LeafletMap
                  value={editForm.address}
                  onChange={(val) => setEditForm(prev => ({ ...prev, address: val }))}
                  label="Ubicación y Dirección del Comercio"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Color de fondo</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={editForm.background_color} onChange={e => setEditForm(prev => ({ ...prev, background_color: e.target.value }))} className="h-10 w-16 cursor-pointer border border-white/10 bg-[#040912] p-0.5" />
                  <span className="text-xs text-white/40 font-mono">{editForm.background_color}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Subir Logo</label>
                  <input type="file" accept=".png, .jpg, .jpeg" onChange={e => {
                    const file = e.target.files[0];
                    if (file) { setEditLogoFile(file); setEditLogoPreview(URL.createObjectURL(file)); }
                  }} className="w-full text-xs text-white/40 file:bg-white/10 file:text-white file:border-none file:px-3 file:py-1.5 file:cursor-pointer hover:file:bg-white/15" />
                  {editLogoPreview && <img src={editLogoPreview} alt="" className="h-12 w-12 object-cover mt-2 border border-white/10" />}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Subir Banner</label>
                  <input type="file" accept=".png, .jpg, .jpeg" onChange={e => {
                    const file = e.target.files[0];
                    if (file) { setEditBannerFile(file); setEditBannerPreview(URL.createObjectURL(file)); }
                  }} className="w-full text-xs text-white/40 file:bg-white/10 file:text-white file:border-none file:px-3 file:py-1.5 file:cursor-pointer hover:file:bg-white/15" />
                  {editBannerPreview && <img src={editBannerPreview} alt="" className="h-12 w-24 object-cover mt-2 border border-white/10" />}
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowEditInfoModal(false)} className="flex-1 bg-white/5 border border-white/10 text-white rounded-none p-3 text-sm hover:bg-white/10 transition-colors">Cancelar</button>
                <button type="submit" disabled={editSaving} className="flex-1 bg-[#f5d367] text-[#120c00] font-bold rounded-none p-3 text-sm hover:opacity-90 transition-all">{editSaving ? "Guardando..." : "Guardar Cambios"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowAddProductModal(false)}>
          <div className="rounded-none border border-white/10 bg-[#0a121e] p-6 sm:p-8 shadow-2xl max-w-lg w-full space-y-5 overflow-y-auto max-h-[90vh] text-white" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Agregar Producto al Catálogo</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-white/40 hover:text-white text-2xl">×</button>
            </div>
            {productError && <p className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-none">⚠️ {productError}</p>}
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Nombre del Producto *</label>
                <input type="text" value={productForm.name} onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367]" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Precio (Bs) *</label>
                  <input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm(prev => ({ ...prev, price: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367]" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Stock disponible *</label>
                  <input type="number" value={productForm.stock} onChange={e => setProductForm(prev => ({ ...prev, stock: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367]" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Categoría *</label>
                  <select value={productForm.category_id} onChange={e => setProductForm(prev => ({ ...prev, category_id: e.target.value, subcategory_id: "" }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367]" required>
                    <option value="" className="bg-[#0a121e]">Selecciona categoría</option>
                    {categories.filter(c => c.type === 'product').map(c => <option key={c.id} value={c.id} className="bg-[#0a121e]">{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Subcategoría</label>
                  <select value={productForm.subcategory_id} onChange={e => setProductForm(prev => ({ ...prev, subcategory_id: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367]" disabled={!productForm.category_id}>
                    <option value="" className="bg-[#0a121e]">Selecciona subcategoría</option>
                    {subcategories.filter(s => Number(s.category_id) === Number(productForm.category_id)).map(s => <option key={s.id} value={s.id} className="bg-[#0a121e]">{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Descripción</label>
                <textarea value={productForm.description} onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367] h-20 resize-none"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Imagen del Producto *</label>
                <input type="file" accept=".png, .jpg, .jpeg" onChange={e => {
                  const file = e.target.files[0];
                  if (file) { setProductImageFile(file); setProductImagePreview(URL.createObjectURL(file)); }
                }} className="w-full text-xs text-white/40 file:bg-white/10 file:text-white file:border-none file:px-3 file:py-1.5 file:cursor-pointer hover:file:bg-white/15" required />
                {productImagePreview && <img src={productImagePreview} alt="" className="h-16 w-16 object-cover mt-2 border border-white/10" />}
              </div>
              <div className="flex gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 bg-white/5 border border-white/10 text-white rounded-none p-3 text-sm hover:bg-white/10 transition-colors">Cancelar</button>
                <button type="submit" disabled={productSaving} className="flex-1 bg-[#f5d367] text-[#120c00] font-bold rounded-none p-3 text-sm hover:opacity-90 transition-all">{productSaving ? "Agregando..." : "Agregar Producto"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowAddServiceModal(false)}>
          <div className="rounded-none border border-white/10 bg-[#0a121e] p-6 sm:p-8 shadow-2xl max-w-lg w-full space-y-5 overflow-y-auto max-h-[90vh] text-white" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Publicar Nuevo Servicio</h3>
              <button onClick={() => setShowAddServiceModal(false)} className="text-white/40 hover:text-white text-2xl">×</button>
            </div>
            {serviceError && <p className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-none">⚠️ {serviceError}</p>}
            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Título o Especialidad *</label>
                <input type="text" value={serviceForm.name} onChange={e => setServiceForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367]" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Tarifa Base (Bs) *</label>
                  <input type="number" step="0.01" value={serviceForm.price} onChange={e => setServiceForm(prev => ({ ...prev, price: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367]" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Tiempo Estimado *</label>
                  <input type="text" placeholder="Ej. 2 horas, 1 día laborable" value={serviceForm.estimated_time} onChange={e => setServiceForm(prev => ({ ...prev, estimated_time: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367]" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Categoría de Especialidad *</label>
                <select value={serviceForm.category_id} onChange={e => setServiceForm(prev => ({ ...prev, category_id: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367]" required>
                  <option value="" className="bg-[#0a121e]">Selecciona categoría</option>
                  {categories.filter(c => c.type === 'service').map(c => <option key={c.id} value={c.id} className="bg-[#0a121e]">{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Descripción y Alcance *</label>
                <textarea value={serviceForm.description} onChange={e => setServiceForm(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-[#040912] border border-white/10 text-white rounded-none p-3 text-sm focus:outline-none focus:border-[#f5d367] h-20 resize-none" required></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Imagen de Referencia / Portafolio *</label>
                <input type="file" accept=".png, .jpg, .jpeg" onChange={e => {
                  const file = e.target.files[0];
                  if (file) { setServiceImageFile(file); setServiceImagePreview(URL.createObjectURL(file)); }
                }} className="w-full text-xs text-white/40 file:bg-white/10 file:text-white file:border-none file:px-3 file:py-1.5 file:cursor-pointer hover:file:bg-white/15" required />
                {serviceImagePreview && <img src={serviceImagePreview} alt="" className="h-16 w-16 object-cover mt-2 border border-white/10" />}
              </div>
              <div className="flex gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowAddServiceModal(false)} className="flex-1 bg-white/5 border border-white/10 text-white rounded-none p-3 text-sm hover:bg-white/10 transition-colors">Cancelar</button>
                <button type="submit" disabled={serviceSaving} className="flex-1 bg-blue-500 text-white font-bold rounded-none p-3 text-sm hover:bg-blue-600 transition-all">{serviceSaving ? "Publicando..." : "Publicar Servicio"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </main>
);
}
