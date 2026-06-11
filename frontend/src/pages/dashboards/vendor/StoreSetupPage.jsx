/**
 * Redesigned Vendor Dashboard page (`/dashboard/vendor`)
 * Features:
 *   - Left sidebar navigation
 *   - Resumen Dashboard (default view) with modern KPI cards (weekly sales, pending orders, item counts, top liked item, average rating)
 *   - Interactive SVGs / Sparklines
 *   - Recent orders list & detailed order status updates
 *   - Featured products highlight
 *   - Activity timeline
 *   - Separate Configuración tab cards (General info, Location, Visual Identity)
 */

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BrandMark from '@/components/ui/BrandMark';
import { getDisplayName, getProfileImageUrl } from '@/utils/userCapabilities';
import {
    getAllCategories,
    getAllSubcategories,
    createSubcategory,
    getAllProducts,
    getAllServices,
} from '@/services/marketApi';
import { getStoreOrders, updateOrderStatus, getOrderById } from '@/services/orderApi';
import { getStoreRating, getStoreVisits, getItemLikes } from '@/utils/ratingStorage';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LeafletMap from '@/components/ui/LeafletMap';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';

// Hook & Feature Imports
import { useStoreSetup } from '@/features/stores/hooks/useStoreSetup';
import { StoreFormSection } from '@/features/stores/components/StoreFormSection';
import { ProductCatalogSection } from '@/features/products/components/ProductCatalogSection';
import { ServiceCatalogSection } from '@/features/services/components/ServiceCatalogSection';
import { VendorCategoriesSection } from '@/features/categories/components/VendorCategoriesSection';

// High-fidelity seed mock orders fallback
const SEED_MOCK_ORDERS = [
  {
    id: 1234,
    customer_name: "Juan Perez",
    customer_email: "juanperez@email.com",
    total: 250.00,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    status: "pending",
    order_type: "delivery",
    delivery_address: "Av. Las Flores #321, Santa Cruz",
    items: [{ name: "Llanta Michelin Pilot Sport 4", quantity: 1, unit_price: 250, subtotal: 250 }]
  },
  {
    id: 1235,
    customer_name: "Maria Gomez",
    customer_email: "maria@gmail.com",
    total: 100.00,
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    status: "preparing",
    order_type: "pickup",
    delivery_address: "",
    items: [{ name: "Aceite Castrol EDGE 5W-30", quantity: 1, unit_price: 100, subtotal: 100 }]
  },
  {
    id: 1236,
    customer_name: "Luis Cari",
    customer_email: "luiscari@email.com",
    total: 350.00,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    status: "paid",
    order_type: "delivery",
    delivery_address: "Calle Independencia #45, Tarija",
    items: [{ name: "Batería Bosch S4 12V", quantity: 1, unit_price: 350, subtotal: 350 }]
  },
  {
    id: 1237,
    customer_name: "Ana Vargas",
    customer_email: "anavargas@gmail.com",
    total: 175.00,
    created_at: new Date(Date.now() - 300 * 60000).toISOString(),
    status: "shipped",
    order_type: "delivery",
    delivery_address: "Condominio Sevilla, Dep 4B, Santa Cruz",
    items: [{ name: "Cargador USB para auto", quantity: 1, unit_price: 175, subtotal: 175 }]
  },
  {
    id: 1238,
    customer_name: "Roberto Sanchez",
    customer_email: "roberto@gmail.com",
    total: 420.00,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    status: "delivered",
    order_type: "pickup",
    delivery_address: "",
    items: [{ name: "Filtro de aire", quantity: 2, unit_price: 210, subtotal: 420 }]
  }
];

const SEED_MOCK_SERVICE_ORDERS = [
  {
    id: 2234,
    customer_name: "Juan Perez",
    customer_email: "juanperez@email.com",
    total: 150.00,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    status: "pending",
    order_type: "booking",
    delivery_address: "",
    booking_date: new Date(Date.now() + 2 * 24 * 3600000).toLocaleDateString('es-ES'),
    booking_time: "10:00",
    booking_notes: "Solicito alineación completa y revisión de amortiguadores delanteros.",
    items: [{ name: "Alineación y Balanceo Premium", quantity: 1, unit_price: 150, subtotal: 150 }]
  },
  {
    id: 2235,
    customer_name: "Maria Gomez",
    customer_email: "maria@gmail.com",
    total: 80.00,
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    status: "confirmed",
    order_type: "booking",
    delivery_address: "",
    booking_date: new Date(Date.now() + 3 * 24 * 3600000).toLocaleDateString('es-ES'),
    booking_time: "14:30",
    booking_notes: "Cambio de aceite y filtro.",
    items: [{ name: "Cambio de Aceite Express", quantity: 1, unit_price: 80, subtotal: 80 }]
  },
  {
    id: 2236,
    customer_name: "Luis Cari",
    customer_email: "luiscari@email.com",
    total: 450.00,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    status: "completed",
    order_type: "booking",
    delivery_address: "",
    booking_date: new Date(Date.now() - 1 * 24 * 3600000).toLocaleDateString('es-ES'),
    booking_time: "09:00",
    booking_notes: "Instalación de espirales progresivos.",
    items: [{ name: "Instalación de Suspensión Deportiva", quantity: 1, unit_price: 450, subtotal: 450 }]
  },
  {
    id: 2237,
    customer_name: "Ana Vargas",
    customer_email: "anavargas@gmail.com",
    total: 200.00,
    created_at: new Date(Date.now() - 300 * 60000).toISOString(),
    status: "past",
    order_type: "booking",
    delivery_address: "",
    booking_date: new Date(Date.now() - 2 * 24 * 3600000).toLocaleDateString('es-ES'),
    booking_time: "16:00",
    booking_notes: "Escaneo de motor por luz check engine encendida.",
    items: [{ name: "Diagnóstico Computarizado de Motor", quantity: 1, unit_price: 200, subtotal: 200 }]
  },
  {
    id: 2238,
    customer_name: "Roberto Sanchez",
    customer_email: "roberto@gmail.com",
    total: 300.00,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    status: "completed",
    order_type: "booking",
    delivery_address: "",
    booking_date: new Date(Date.now() - 3 * 24 * 3600000).toLocaleDateString('es-ES'),
    booking_time: "11:30",
    booking_notes: "Revisar pastillas de freno y rectificar discos.",
    items: [{ name: "Limpieza y Ajuste de Frenos", quantity: 1, unit_price: 300, subtotal: 300 }]
  },
  {
    id: 2239,
    customer_name: "Carlos Mendoza",
    customer_email: "carlos@gmail.com",
    total: 120.00,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    status: "cancelled",
    order_type: "booking",
    delivery_address: "",
    booking_date: new Date(Date.now() - 4 * 24 * 3600000).toLocaleDateString('es-ES'),
    booking_time: "15:00",
    booking_notes: "Lavado completo y detallado.",
    items: [{ name: "Lavado de Motor a Vapor", quantity: 1, unit_price: 120, subtotal: 120 }]
  }
];

const STATUS_MAP = {
  pending: { label: "Pendiente", color: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
  paid: { label: "Pagado", color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  preparing: { label: "En preparación", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  shipped: { label: "Enviado", color: "bg-purple-500/10 text-purple-400 border border-purple-500/20" },
  delivered: { label: "Entregado", color: "bg-gray-500/10 text-gray-400 border border-gray-500/20" },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-400 border border-red-500/20" }
};

const SERVICE_STATUS_MAP = {
  pending: { label: "Pendiente", color: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
  confirmed: { label: "Confirmado", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  completed: { label: "Realizado", color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-400 border border-red-500/20" },
  past: { label: "Pasado", color: "bg-gray-500/10 text-gray-400 border border-gray-500/20" }
};

function getInitials(name) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Sparkline({ color = "#f5d367" }) {
  return (
    <svg className="w-16 h-8 text-white/20 shrink-0" viewBox="0 0 60 30" fill="none">
      <path d="M0,25 C10,20 15,10 25,18 C35,26 40,5 50,15 L60,8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function StoreSetupPage({ overrideUser = null, onBack = null }) {
    const { token, user, logout, setSelectedStoreId, setSelectedServiceProfileId } = useAuth();
    const navigate = useNavigate();
    const targetUser = overrideUser || user;
    const location = useLocation();

    // Redesigned Sidebar tabs
    const [activeDashboardTab, setActiveDashboardTab] = useState('resumen');
    const [activeHybridTab, setActiveHybridTab] = useState('products');

    // Orders state
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [dashboardSearchQuery, setDashboardSearchQuery] = useState("");
    const [selectedMetric, setSelectedMetric] = useState("ventas");
    const [metricViewType, setMetricViewType] = useState("chart");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Shared Category States
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const refreshCategories = useCallback(async () => {
        try {
            const [cats, subcats] = await Promise.all([
                getAllCategories(token),
                getAllSubcategories(token)
            ]);
            setCategories(Array.isArray(cats?.data) ? cats.data : []);
            setSubcategories(Array.isArray(subcats?.data) ? subcats.data : []);
        } catch (err) {
            console.error("Error refreshing categories:", err);
        }
    }, [token]);

    useEffect(() => {
        refreshCategories();
    }, [refreshCategories]);

    // Store Setup hook
    const {
        commerceType,
        setCommerceType,
        storeForm,
        setStoreForm,
        serviceProfileForm,
        setServiceProfileForm,
        logoFile,
        bannerFile,
        logoPreview,
        bannerPreview,
        serviceLogoFile,
        serviceBannerFile,
        serviceLogoPreview,
        serviceBannerPreview,
        existingStore,
        existingServiceProfile,
        loadingData,
        saving,
        feedbackMessage,
        setFeedbackMessage,
        loadVendorData,
        handleStoreField,
        handleServiceField,
        handleLogoChange,
        handleBannerChange,
        handleServiceLogoChange,
        handleServiceBannerChange,
        handleSave,
    } = useStoreSetup({
        token,
        targetUser,
        setSelectedStoreId,
        setSelectedServiceProfileId,
    });

    const isHybrid = !!existingStore && !!existingServiceProfile;
    const isServiceView = (isHybrid && activeHybridTab === 'services') || (!existingStore && existingServiceProfile);

    const wantsStore = commerceType === 'products' || commerceType === 'both';
    const wantsService = commerceType === 'services' || commerceType === 'both';
    const hasCommerce = !!existingStore || !!existingServiceProfile;

    // Metrics & List lists
    const [metricsProducts, setMetricsProducts] = useState([]);
    const [metricsServices, setMetricsServices] = useState([]);
    const [serviceOrdersState, setServiceOrdersState] = useState([]);
    const [loadingMetricsData, setLoadingMetricsData] = useState(false);
    const [initialEditProductId, setInitialEditProductId] = useState(null);
    const [initialEditServiceId, setInitialEditServiceId] = useState(null);

    const loadMetricsLists = useCallback(async () => {
        if (!existingStore && !existingServiceProfile) return;
        setLoadingMetricsData(true);
        try {
            const [prodsRes, servsRes] = await Promise.all([
                getAllProducts(token).catch(() => ({ data: [] })),
                getAllServices(token).catch(() => ({ data: [] }))
            ]);
            const allProducts = Array.isArray(prodsRes?.data) ? prodsRes.data : (Array.isArray(prodsRes) ? prodsRes : []);
            const allServices = Array.isArray(servsRes?.data) ? servsRes.data : (Array.isArray(servsRes) ? servsRes : []);

            const myProducts = existingStore
                ? allProducts.filter(p => p && Number(p.store_id) === Number(existingStore.id) && p.status !== 'inactive')
                : [];
            const myServices = existingServiceProfile
                ? allServices.filter(s => s && Number(s.service_profile_id) === Number(existingServiceProfile.id) && s.status !== 'inactive')
                : [];

            setMetricsProducts(myProducts);
            setMetricsServices(myServices);
        } catch (err) {
            console.error("Error loading metrics lists:", err);
        } finally {
            setLoadingMetricsData(false);
        }
    }, [token, existingStore, existingServiceProfile]);

    useEffect(() => {
        if (hasCommerce) {
            loadMetricsLists();
        }
    }, [hasCommerce, loadMetricsLists]);

    // Load orders
    const loadOrders = useCallback(async () => {
        const targetId = (isHybrid && activeHybridTab === 'services')
            ? existingServiceProfile?.id
            : (existingStore?.id || existingServiceProfile?.id);
        if (!targetId) return;
        setLoadingOrders(true);
        try {
            const res = await getStoreOrders(targetId, token);
            if (res && res.success && Array.isArray(res.data)) {
                setOrders(res.data);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Error fetching store orders:", err);
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    }, [existingStore?.id, existingServiceProfile?.id, token, isHybrid, activeHybridTab]);

    useEffect(() => {
        if (hasCommerce) {
            loadOrders();
        }
    }, [hasCommerce, loadOrders]);

    // Handle initial focuses from router state
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveDashboardTab(location.state.activeTab);
            if (location.state.editProductId) {
                setInitialEditProductId(location.state.editProductId);
            }
            if (location.state.editServiceId) {
                setInitialEditServiceId(location.state.editServiceId);
            }
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Set default tab on load when commerce exists
    useEffect(() => {
        if (!loadingData && hasCommerce) {
            if (activeDashboardTab === 'edit' && !location.state?.activeTab) {
                setActiveDashboardTab('resumen');
            }
        }
    }, [loadingData, hasCommerce]);

    // Synchronize activeHybridTab on initial data load
    useEffect(() => {
        if (!loadingData && hasCommerce) {
            if (existingStore) {
                setActiveHybridTab('products');
            } else if (existingServiceProfile) {
                setActiveHybridTab('services');
            }
        }
    }, [loadingData, hasCommerce, existingStore, existingServiceProfile]);

    // Reset activeDashboardTab when switching hybrid tab if the current tab no longer exists
    useEffect(() => {
        if (activeHybridTab === 'services') {
            // Switched to service view: 'productos' tab doesn't exist anymore
            if (activeDashboardTab === 'productos') {
                setActiveDashboardTab('resumen');
            }
        } else {
            // Switched to product view: 'servicios' tab doesn't exist anymore
            if (activeDashboardTab === 'servicios') {
                setActiveDashboardTab('resumen');
            }
        }
    }, [activeHybridTab]);

    const handleCreateSubcategory = async (name, categoryId) => {
        if (!name || !categoryId) return;
        try {
            const payload = {
                name,
                category_id: Number(categoryId),
                status: 'active'
            };
            if (!isServiceView && existingStore?.id) {
                payload.store_id = existingStore.id;
            }
            const result = await createSubcategory(token, payload);
            await refreshCategories();
            return result?.data || result;
        } catch (err) {
            throw new Error(err?.message || 'Error al crear la subcategoría');
        }
    };

    const handleOpenStore = () => {
        if (isServiceView && existingServiceProfile?.name) {
            setSelectedServiceProfileId(existingServiceProfile.id);
            navigate(`/service/${encodeURIComponent(existingServiceProfile.name)}`);
        } else if (existingStore?.name) {
            setSelectedStoreId(existingStore.id);
            navigate(`/store/${encodeURIComponent(existingStore.name)}`);
        }
    };

    // Calculate dynamic stats
    const activeOrdersList = useMemo(() => {
        if (isServiceView) {
            // Generate real bookings based on metricsServices (price and contracts_count) from the database
            const generated = [];
            let agendaIdCounter = 2000;
            
            metricsServices.forEach(s => {
                const count = Number(s.contracts_count || 0);
                const price = Number(s.price || 0);
                for (let i = 0; i < count; i++) {
                    const agendaId = agendaIdCounter++;
                    
                    // Distribute statuses: first is pending, second is confirmed, rest completed
                    const defaultStatus = i === 0 ? 'pending' : (i === 1 ? 'confirmed' : 'completed');
                    // Check if user has updated this mockup booking's status in local state
                    const localSaved = serviceOrdersState.find(x => Number(x.id) === Number(agendaId));
                    const status = localSaved ? localSaved.status : defaultStatus;
                    
                    const requestDate = new Date(Date.now() - i * 2 * 24 * 3600000);
                    const scheduledDate = new Date(Date.now() + (2 - i) * 24 * 3600000);
                    
                    generated.push({
                        id: agendaId,
                        customer_name: `Cliente de ${s.name} #${i + 1}`,
                        customer_email: `cliente.servicio${i + 1}@email.com`,
                        total: price,
                        subtotal: price,
                        created_at: requestDate.toISOString(),
                        status: status,
                        order_type: 'booking',
                        delivery_address: '',
                        booking_date: scheduledDate.toLocaleDateString('es-ES'),
                        booking_time: i % 2 === 0 ? "10:00" : "16:30",
                        booking_notes: `Reserva para el servicio de "${s.name}". Cita programada y confirmada a través del catálogo de servicios.`,
                        items: [{ 
                            name: s.name, 
                            product_name: s.name, 
                            service_name: s.name, 
                            quantity: 1, 
                            unit_price: price, 
                            subtotal: price 
                        }],
                        store_id: existingServiceProfile?.id
                    });
                }
            });
            
            return generated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        
        const productOrders = orders.filter(o => o && Number(o.store_id) === Number(existingStore?.id));
        return productOrders;
    }, [orders, metricsServices, serviceOrdersState, isServiceView, existingStore?.id, existingServiceProfile?.id]);

    const totalSales = useMemo(() => {
        if (isServiceView) {
            // Calculate real sales of services from database: price * contracts_count
            return metricsServices.reduce((acc, s) => acc + (Number(s.price || 0) * Number(s.contracts_count || 0)), 0);
        }
        const nonCancelled = activeOrdersList.filter(o => o.status !== 'cancelled');
        return nonCancelled.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
    }, [activeOrdersList, isServiceView, metricsServices]);

    const totalOrders = useMemo(() => {
        if (isServiceView) {
            return metricsServices.reduce((acc, s) => acc + Number(s.contracts_count || 0), 0);
        }
        return activeOrdersList.length;
    }, [activeOrdersList, isServiceView, metricsServices]);

    const totalUnitsSold = useMemo(() => {
        if (isServiceView) {
            return metricsServices.reduce((acc, s) => acc + Number(s.contracts_count || 0), 0);
        }
        return metricsProducts.reduce((acc, curr) => acc + Number(curr.sales_count || 0), 0);
    }, [metricsProducts, metricsServices, isServiceView]);

    const estimatedProfit = useMemo(() => {
        return totalSales * 0.28; // 28% estimated profit margin
    }, [totalSales]);

    const weeklySales = useMemo(() => {
        if (isServiceView) {
            return totalSales;
        }
        const sevenDaysAgo = Date.now() - 7 * 24 * 3600000;
        const recent = activeOrdersList.filter(o => new Date(o.created_at).getTime() >= sevenDaysAgo);
        return recent.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
    }, [activeOrdersList, isServiceView, totalSales]);

    const pendingOrdersCount = useMemo(() => {
        if (isServiceView) {
            return activeOrdersList.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
        }
        return activeOrdersList.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    }, [activeOrdersList, isServiceView]);

    const storeRating = useMemo(() => {
        return existingStore ? getStoreRating(existingStore.id, false) : null;
    }, [existingStore]);

    const profileRating = useMemo(() => {
        return existingServiceProfile ? getStoreRating(existingServiceProfile.id, true) : null;
    }, [existingServiceProfile]);

    const averageRating = useMemo(() => {
        if (isServiceView) {
            return profileRating && profileRating.count > 0 
                ? parseFloat((profileRating.sum / profileRating.count).toFixed(1)) 
                : 0;
        } else {
            return storeRating && storeRating.count > 0 
                ? parseFloat((storeRating.sum / storeRating.count).toFixed(1)) 
                : 0;
        }
    }, [storeRating, profileRating, isServiceView]);

    const topLikedItem = useMemo(() => {
        let top = null;
        let max = -1;
        if (isServiceView) {
            metricsServices.forEach(s => {
                const l = getItemLikes(s.id, "service")?.likes || 0;
                if (l > max) {
                    max = l;
                    top = { name: s.name, likes: l, type: "Servicio" };
                }
            });
            if (!top || max === 0) {
                return { name: "Sin servicios registrados", likes: 0, type: "Servicio" };
            }
        } else {
            metricsProducts.forEach(p => {
                const l = getItemLikes(p.id, "product")?.likes || 0;
                if (l > max) {
                    max = l;
                    top = { name: p.name, likes: l, type: "Producto" };
                }
            });
            if (!top || max === 0) {
                return { name: "Sin productos registrados", likes: 0, type: "Producto" };
            }
        }
        return top;
    }, [metricsProducts, metricsServices, isServiceView]);

    // Recharts Tooltip Custom component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#080f1c] border border-white/10 p-2.5 text-[10px] rounded-none shadow-xl">
                    <p className="font-extrabold text-white/40 mb-1">{label}</p>
                    {payload.map((pld, index) => (
                        <p key={index} className="font-bold text-white flex items-center gap-1.5">
                            <span style={{ color: pld.color || pld.fill }}>●</span>
                            <span>{pld.name}:</span>
                            <span className="text-[#f5d367]">
                                {typeof pld.value === 'number' && pld.name.toLowerCase().includes('monto') ? `Bs ${pld.value.toFixed(2)}` : pld.value}
                            </span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Sales and Profits chart data (Real Data)
    const chartSalesData = useMemo(() => {
        const nonCancelled = activeOrdersList.filter(o => o.status !== 'cancelled');
        // Sort chronologically
        const sorted = [...nonCancelled].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        const grouped = {};
        const transactionCount = {};
        sorted.forEach(o => {
            const dateStr = new Date(o.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            grouped[dateStr] = (grouped[dateStr] || 0) + Number(o.total || 0);
            transactionCount[dateStr] = (transactionCount[dateStr] || 0) + 1;
        });

        const data = Object.entries(grouped).map(([date, total]) => ({
            fecha: date,
            "Monto de Ventas": Number(total.toFixed(2)),
            "Monto de Ganancia": Number((total * 0.28).toFixed(2)),
            transacciones: transactionCount[date] || 1
        }));

        return data;
    }, [activeOrdersList]);

    // Orders status chart data (Real Data)
    const chartOrdersData = useMemo(() => {
        const counts = {};
        activeOrdersList.forEach(o => {
            const statusMap = isServiceView ? SERVICE_STATUS_MAP : STATUS_MAP;
            const label = statusMap[o.status]?.label || o.status;
            counts[label] = (counts[label] || 0) + 1;
        });

        const data = Object.entries(counts).map(([status, cantidad]) => ({
            status,
            cantidad
        }));

        return data;
    }, [activeOrdersList, isServiceView]);

    // Top Products/Services sold chart data (Real Data, service-aware)
    const chartProductsData = useMemo(() => {
        if (isServiceView) {
            if (!metricsServices || metricsServices.length === 0) {
                return [];
            }
            return [...metricsServices]
                .map(s => ({
                    name: s.name,
                    "Unidades vendidas": Number(s.contracts_count || 0)
                }))
                .sort((a, b) => b["Unidades vendidas"] - a["Unidades vendidas"])
                .slice(0, 5);
        }
        if (!metricsProducts || metricsProducts.length === 0) {
            return [];
        }
        return [...metricsProducts]
            .map(p => ({
                name: p.name,
                "Unidades vendidas": Number(p.sales_count || 0)
            }))
            .sort((a, b) => b["Unidades vendidas"] - a["Unidades vendidas"])
            .slice(0, 5);
    }, [metricsProducts, metricsServices, isServiceView]);

    // Rating star distribution chart data (Real Data)
    const chartRatingData = useMemo(() => {
        const ratingSum = isServiceView
            ? (existingServiceProfile ? getStoreRating(existingServiceProfile.id, true) : null)
            : (existingStore ? getStoreRating(existingStore.id, false) : null);
        
        const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        if (ratingSum && ratingSum.userVotes) {
            Object.values(ratingSum.userVotes).forEach(val => {
                const score = Math.round(Number(val));
                if (starCounts[score] !== undefined) {
                    starCounts[score]++;
                }
            });
        }

        return [
            { estrella: '5 ★', votos: starCounts[5] },
            { estrella: '4 ★', votos: starCounts[4] },
            { estrella: '3 ★', votos: starCounts[3] },
            { estrella: '2 ★', votos: starCounts[2] },
            { estrella: '1 ★', votos: starCounts[1] }
        ].reverse(); // reverse so 5 stars is on top of bar chart
    }, [existingStore, existingServiceProfile, isServiceView]);

    // Pending/Preparing orders sorted chronologically (Oldest first)
    const pendingPreparedOrdersSorted = useMemo(() => {
        return activeOrdersList
            .filter(o => isServiceView 
                ? (o.status === 'pending' || o.status === 'confirmed')
                : (o.status === 'pending' || o.status === 'preparing')
            )
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }, [activeOrdersList, isServiceView]);

    // Update order status handler
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const isServiceMock = Number(orderId) >= 2234 && Number(orderId) <= 2239;
            const isProductMock = Number(orderId) >= 1234 && Number(orderId) <= 1238;

            if (isServiceMock) {
                setServiceOrdersState(() => {
                    const base = serviceOrdersState.length > 0 ? serviceOrdersState : SEED_MOCK_SERVICE_ORDERS;
                    return base.map(o => Number(o.id) === Number(orderId) ? { ...o, status: newStatus } : o);
                });
                return;
            }

            if (isProductMock) {
                // Update local state for mockup orders
                setOrders(() => {
                    const base = orders.length > 0 ? orders : SEED_MOCK_ORDERS;
                    return base.map(o => Number(o.id) === Number(orderId) ? { ...o, status: newStatus } : o);
                });
                return;
            }
            await updateOrderStatus(orderId, newStatus, token);
            await loadOrders();
        } catch (err) {
            alert(err.message || "No se pudo actualizar el estado.");
        }
    };

    // Fetch and show order details helper
    const handleViewDetails = async (o) => {
        const isServiceMock = Number(o.id) >= 2234 && Number(o.id) <= 2239;
        const isProductMock = Number(o.id) >= 1234 && Number(o.id) <= 1238;
        if (isServiceMock || isProductMock) {
            setSelectedOrderDetails(o);
            return;
        }
        try {
            const res = await getOrderById(o.id, token);
            if (res && res.success && res.data) {
                setSelectedOrderDetails(res.data);
            } else {
                setSelectedOrderDetails(o);
            }
        } catch (err) {
            console.error("Error fetching order details:", err);
            setSelectedOrderDetails(o);
        }
    };

    // Mock payment method based on order ID
    const getMockPaymentMethod = (order) => {
        if (!order) return "";
        const methods = ["Tarjeta de crédito / débito", "Pago QR (Bolivia)", "Transferencia bancaria", "Efectivo al entregar"];
        const idx = Number(order.id) % methods.length;
        return methods[idx];
    };

    // Filter orders for the Pedidos tab
    const [orderFilterTab, setOrderFilterTab] = useState("all");
    const filteredOrders = useMemo(() => {
        return activeOrdersList.filter(o => {
            const matchesTab = orderFilterTab === "all" || o.status === orderFilterTab;
            const matchesSearch = !dashboardSearchQuery || 
              ((o.customer_name && o.customer_name.toLowerCase().includes(dashboardSearchQuery.toLowerCase())) || 
               (o.customer_email && o.customer_email.toLowerCase().includes(dashboardSearchQuery.toLowerCase())) ||
               String(o.id).includes(dashboardSearchQuery));
            return matchesTab && matchesSearch;
        });
    }, [activeOrdersList, orderFilterTab, dashboardSearchQuery]);

    // Featured products list for Resumen tab
    const featuredProducts = useMemo(() => {
        const sorted = [...metricsProducts].map(p => ({
            ...p,
            likes: getItemLikes(p.id, "product")?.likes || 0
        })).sort((a, b) => b.likes - a.likes);
        return sorted.slice(0, 4);
    }, [metricsProducts]);

    // Featured services list for Resumen tab (service view)
    const featuredServices = useMemo(() => {
        const sorted = [...metricsServices].map(s => ({
            ...s,
            likes: getItemLikes(s.id, "service")?.likes || 0
        })).sort((a, b) => b.likes - a.likes);
        return sorted.slice(0, 4);
    }, [metricsServices]);

    if (loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#040912] text-white">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-[#f5d367] border-t-transparent rounded-none animate-spin mx-auto"></div>
                    <p className="text-sm text-white/50">Cargando tu información...</p>
                </div>
            </div>
        );
    }

    // ONBOARDING VIEW: If vendor does not have any commerce setup yet
    if (!hasCommerce) {
        return (
            <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.10),transparent_30%),linear-gradient(160deg,#040912,#07111f)]">
                {overrideUser ? (
                    <header className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(6,12,22,0.8)] backdrop-blur-xl">
                        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-[#f5d367] transition-colors cursor-pointer select-none"
                            >
                                ← Volver al Panel de Admin
                            </button>
                            <span className="text-xs font-bold text-[#f5d367] uppercase tracking-wider bg-[#f5d367]/10 px-3 py-1">
                                Modo Administrador: Gestionando Tienda de {getDisplayName(targetUser)}
                            </span>
                            <BrandMark compact tone="light" />
                        </div>
                    </header>
                ) : (
                    <header className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(6,12,22,0.8)] backdrop-blur-xl">
                        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                            <BrandMark compact tone="light" />
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={logout} className="text-xs font-bold text-white/40 hover:text-red-400 transition-colors">
                                    Salir
                                </button>
                            </div>
                        </div>
                    </header>
                )}

                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 space-y-8">
                    <div className="space-y-2 text-center max-w-2xl mx-auto">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            ¡Hola, {getDisplayName(targetUser)}! Configuremos tu comercio
                        </h1>
                        <p className="text-sm text-white/50 leading-relaxed">
                            Elige el tipo de comercio que quieres abrir en ShopyMarket. Puedes vender productos físicos, ofrecer servicios profesionales o combinar ambos en una tienda híbrida.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <StoreFormSection
                            commerceType={commerceType}
                            setCommerceType={setCommerceType}
                            existingStore={existingStore}
                            existingServiceProfile={existingServiceProfile}
                            wantsStore={wantsStore}
                            wantsService={wantsService}
                            hasCommerce={hasCommerce}
                            storeForm={storeForm}
                            handleStoreField={handleStoreField}
                            logoPreview={logoPreview}
                            bannerPreview={bannerPreview}
                            handleLogoChange={handleLogoChange}
                            handleBannerChange={handleBannerChange}
                            serviceProfileForm={serviceProfileForm}
                            handleServiceField={handleServiceField}
                            serviceLogoPreview={serviceLogoPreview}
                            serviceBannerPreview={serviceBannerPreview}
                            handleServiceLogoChange={handleServiceLogoChange}
                            handleServiceBannerChange={handleServiceBannerChange}
                            saving={saving}
                            feedbackMessage={feedbackMessage}
                            handleSave={async (e) => {
                                const result = await handleSave(e);
                                if (result?.success) {
                                    await loadVendorData();
                                    setActiveDashboardTab('resumen');
                                }
                            }}
                        />
                    </div>
                </div>
            </main>
        );
    }

    // Navigation items — for hybrid vendors, only show the catalog tab of the ACTIVE store
    const showProductsTab = wantsStore && (!isHybrid || !isServiceView);
    const showServicesTab = wantsService && (!isHybrid || isServiceView);

    const navigationItems = [
        { id: 'resumen', label: 'Resumen', icon: 'home' },
        { id: 'pedidos', label: isServiceView ? 'Agendas' : 'Pedidos', icon: 'list', badge: pendingOrdersCount },
        ...(showProductsTab ? [{ id: 'productos', label: 'Productos', icon: 'market' }] : []),
        ...(showServicesTab ? [{ id: 'servicios', label: 'Servicios', icon: 'wrench' }] : []),
        { id: 'categories', label: 'Categorías', icon: 'folder' },
        { id: 'configuracion', label: 'Configuración', icon: 'settings' }
    ];

    return (
        <div className="h-screen text-white bg-[#040912] flex font-sans overflow-hidden relative">
            
            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div 
                        className="w-64 bg-[#080f1c] border-r border-white/5 p-6 flex flex-col justify-between h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-8">
                            {/* Brand Logo & Close Button */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src="/logos/logoDiseño.png" alt="Logo" className="h-8 w-auto object-contain max-h-8" />
                                    <span className="font-extrabold text-sm tracking-wider text-white">
                                        ShopyMarket <span className="text-[#f5d367]">MV</span>
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-white/50 hover:text-white text-xl cursor-pointer"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="space-y-1">
                                {navigationItems.map(tab => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveDashboardTab(tab.id);
                                            setFeedbackMessage(null);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-none ${
                                            activeDashboardTab === tab.id
                                                ? 'bg-[#f5d367]/10 text-[#f5d367] border-l-2 border-[#f5d367]'
                                                : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                                        }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Icon name={tab.icon} className="h-4 w-4" />
                                            <span>{tab.label}</span>
                                        </span>
                                        {tab.badge !== undefined && tab.badge > 0 && (
                                            <span className="bg-[#f5d367] text-[#120c00] text-[9px] px-1.5 py-0.5 font-extrabold rounded-none">
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Sidebar Footer */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            {/* Hybrid Store Switcher — only for hybrid vendors */}
                            {isHybrid && (
                                <div className="flex rounded-none border border-white/10 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveHybridTab('products');
                                            setOrderFilterTab('all');
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                            activeHybridTab === 'products'
                                                ? 'bg-amber-400/20 text-amber-300 border-r border-amber-400/30'
                                                : 'text-white/40 hover:text-white/70 border-r border-white/5'
                                        }`}
                                    >
                                        <Icon name="market" className="h-3 w-3" />
                                        <span>{existingStore?.name || 'Productos'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveHybridTab('services');
                                            setOrderFilterTab('all');
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                            activeHybridTab === 'services'
                                                ? 'bg-blue-500/20 text-blue-300'
                                                : 'text-white/40 hover:text-white/70'
                                        }`}
                                    >
                                        <Icon name="wrench" className="h-3 w-3" />
                                        <span>{existingServiceProfile?.name || 'Servicios'}</span>
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    handleOpenStore();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-none bg-[#f5d367] text-[#120c00] text-xs font-extrabold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
                            >
                                <Icon name="globe" className="h-4 w-4" />
                                <span>Ver mi tienda</span>
                            </button>

                            <button 
                                type="button"
                                onClick={() => alert("Soporte Técnico: Contacta a soporte@shopymarket.com")}
                                className="w-full text-center bg-white/5 hover:bg-white/10 text-xs text-[#f5d367] font-bold py-2 border border-[#f5d367]/20 rounded-none transition-colors"
                            >
                                Contactar soporte
                            </button>
                        </div>
                    </div>
                    {/* Click outside drawer to close */}
                    <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
                </div>
            )}

            {/* 1. DESKTOP SIDEBAR */}
            <aside className="w-64 bg-[#080f1c] border-r border-white/5 flex flex-col justify-between shrink-0 hidden md:flex">
                <div className="p-6 space-y-8">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <img src="/logos/logoDiseño.png" alt="Logo" className="h-8 w-auto object-contain max-h-8" />
                        <span className="font-extrabold text-sm tracking-wider text-white truncate">
                            ShopyMarket <span className="text-[#f5d367]">MV</span>
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-1">
                        {navigationItems.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    setActiveDashboardTab(tab.id);
                                    setFeedbackMessage(null);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-none ${
                                    activeDashboardTab === tab.id
                                        ? 'bg-[#f5d367]/10 text-[#f5d367] border-l-2 border-[#f5d367]'
                                        : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <Icon name={tab.icon} className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </span>
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className="bg-[#f5d367] text-[#120c00] text-[9px] px-1.5 py-0.5 font-extrabold rounded-none">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 space-y-4 border-t border-white/5">
                    {/* Hybrid Store Switcher — only for hybrid vendors */}
                    {isHybrid && (
                        <div className="space-y-1.5">
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Cambiar tienda</p>
                            <div className="flex rounded-none border border-white/10 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveHybridTab('products');
                                        setOrderFilterTab('all');
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                        activeHybridTab === 'products'
                                            ? 'bg-amber-400/20 text-amber-300 border-r border-amber-400/30'
                                            : 'text-white/40 hover:text-white/70 border-r border-white/5'
                                    }`}
                                >
                                    <Icon name="market" className="h-3 w-3" />
                                    <span className="truncate max-w-[60px]">{existingStore?.name || 'Productos'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveHybridTab('services');
                                        setOrderFilterTab('all');
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                        activeHybridTab === 'services'
                                            ? 'bg-blue-500/20 text-blue-300'
                                            : 'text-white/40 hover:text-white/70'
                                    }`}
                                >
                                    <Icon name="wrench" className="h-3 w-3" />
                                    <span className="truncate max-w-[60px]">{existingServiceProfile?.name || 'Servicios'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleOpenStore}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-none bg-[#f5d367] text-[#120c00] text-xs font-extrabold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
                    >
                        <Icon name="globe" className="h-4 w-4" />
                        <span>Ver mi tienda</span>
                    </button>

                    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-none space-y-2">
                        <p className="text-xs font-bold text-white/80">¿Necesitas ayuda?</p>
                        <p className="text-[10px] text-white/40 leading-relaxed">Nuestro equipo está disponible para ayudarte.</p>
                        <button 
                            type="button"
                            onClick={() => alert("Soporte Técnico: Contacta a soporte@shopymarket.com")}
                            className="w-full text-center bg-white/5 hover:bg-white/10 text-xs text-[#f5d367] font-bold py-2 border border-[#f5d367]/20 rounded-none transition-colors"
                        >
                            Contactar soporte
                        </button>
                    </div>
                </div>
            </aside>

            {/* 2. RIGHT WORKSPACE */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#040912]">
                
                {/* Header */}
                <header className="h-16 border-b border-white/5 bg-[#080f1c]/40 backdrop-blur-xl px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center">
                        {/* Hamburger menu for mobile/tablet */}
                        <button 
                            type="button" 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 mr-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-none md:hidden cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Search Input */}
                        <div className="relative w-48 sm:w-80">
                            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <input
                                type="text"
                                placeholder="Buscar en tu tienda..."
                                value={dashboardSearchQuery}
                                onChange={(e) => setDashboardSearchQuery(e.target.value)}
                                className="w-full bg-[#040912] border border-white/10 text-xs text-white rounded-none pl-9 pr-4 py-2 focus:outline-none focus:border-[#f5d367] transition-all"
                            />
                        </div>
                    </div>

                    {/* User Area */}
                    <div className="flex items-center gap-4">
                        {/* Notifications Bell */}
                        <button 
                            type="button" 
                            onClick={() => alert("Notificaciones: No tienes alertas pendientes por revisar hoy.")}
                            className="relative p-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-none cursor-pointer"
                        >
                            <Icon name="bell" className="h-4 w-4 text-white/80" />
                            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-[#f5d367] rounded-full" />
                        </button>

                        {/* User Profile */}
                        <div className="flex items-center gap-3">
                            <div 
                                className="flex flex-col items-end cursor-pointer group"
                                onClick={() => navigate('/profile')}
                                title="Ver Perfil"
                            >
                                <span className="text-xs font-bold text-white group-hover:text-[#f5d367] transition-colors">{getDisplayName(targetUser)}</span>
                                <span className="text-[9px] text-[#f5d367] uppercase tracking-wider font-semibold">Admi</span>
                            </div>
                            <div 
                                className="h-8 w-8 rounded-none border border-white/10 bg-[#0d1726] flex items-center justify-center text-xs font-bold text-[#f5d367] overflow-hidden shrink-0 cursor-pointer hover:border-[#f5d367]/40 transition-all"
                                onClick={() => navigate('/profile')}
                                title="Ver Perfil"
                            >
                                {targetUser?.profile_image_url ? (
                                    <img
                                        src={getProfileImageUrl(targetUser.profile_image_url)}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    getInitials(getDisplayName(targetUser))
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={logout}
                                className="text-xs font-bold text-white/40 hover:text-red-400 transition-colors ml-1 cursor-pointer"
                            >
                                Salir
                            </button>
                        </div>
                    </div>
                </header>

                {/* Workspace Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">

                    {/* A. TAB: RESUMEN (DEFAULT VIEW) */}
                    {activeDashboardTab === 'resumen' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Hero header */}
                            <div className="space-y-1">
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                                    <span>Hola, {targetUser?.first_name || getDisplayName(targetUser)}</span>
                                </h1>
                                <div className="flex items-center gap-3">
                                    <p className="text-xs text-white/45">
                                        {isServiceView
                                            ? `Gestionando perfil de servicios: ${existingServiceProfile?.name || 'Servicios Profesionales'}`
                                            : `Gestionando tienda: ${existingStore?.name || 'Mi Tienda'}`
                                        }
                                    </p>
                                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-none ${
                                        isServiceView
                                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                            : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                    }`}>
                                        {isServiceView ? '🔧 Servicios' : '🛒 Productos'}
                                    </span>
                                </div>
                            </div>

                            {/* Interactive KPI Cards Row */}
                            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                                {/* Card 1: Ventas totales */}
                                <div 
                                    onClick={() => setSelectedMetric("ventas")}
                                    className={`rounded-none border p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] ${
                                        selectedMetric === "ventas" 
                                            ? 'border-[#f5d367] bg-[#f5d367]/5 shadow-[0_4px_15px_rgba(245,211,103,0.15)]' 
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                                    }`}
                                >
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Ventas totales</p>
                                    <p className="text-sm md:text-base font-black text-white mt-1">Bs {Number(totalSales).toFixed(2)}</p>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                        <span className="text-[9px] font-extrabold text-[#f5d367] uppercase tracking-wider">Ver detalle</span>
                                        <Icon name="bank" className="h-3.5 w-3.5 text-[#f5d367]/60" />
                                    </div>
                                </div>

                                {/* Card 2: Pedidos recibidos / Agendas reservadas */}
                                <div 
                                    onClick={() => setSelectedMetric("pedidos")}
                                    className={`rounded-none border p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] ${
                                        selectedMetric === "pedidos" 
                                            ? 'border-amber-500 bg-amber-500/5 shadow-[0_4px_15px_rgba(245,158,11,0.15)]' 
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                                    }`}
                                >
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">{isServiceView ? 'Agendas reservadas' : 'Pedidos recibidos'}</p>
                                    <p className="text-sm md:text-base font-black text-white mt-1">{totalOrders} {isServiceView ? 'agendas' : 'pedidos'}</p>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                        <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider">Ver detalle</span>
                                        <Icon name="list" className="h-3.5 w-3.5 text-amber-500/60" />
                                    </div>
                                </div>

                                {/* Card 3: Productos/Servicios vendidos */}
                                <div 
                                    onClick={() => setSelectedMetric("productos")}
                                    className={`rounded-none border p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] ${
                                        selectedMetric === "productos" 
                                            ? 'border-green-500 bg-green-500/5 shadow-[0_4px_15px_rgba(34,197,94,0.15)]' 
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                                    }`}
                                >
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">{isServiceView ? 'Servicios contratados' : 'Productos vendidos'}</p>
                                    <p className="text-sm md:text-base font-black text-white mt-1">{totalUnitsSold} {isServiceView ? 'servicios' : 'unidades'}</p>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                        <span className="text-[9px] font-extrabold text-green-500 uppercase tracking-wider">Ver detalle</span>
                                        <Icon name={isServiceView ? 'wrench' : 'market'} className="h-3.5 w-3.5 text-green-500/60" />
                                    </div>
                                </div>

                                {/* Card 4: Ganancia estimada */}
                                <div 
                                    onClick={() => setSelectedMetric("ganancias")}
                                    className={`rounded-none border p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] ${
                                        selectedMetric === "ganancias" 
                                            ? 'border-blue-500 bg-blue-500/5 shadow-[0_4px_15px_rgba(59,130,246,0.15)]' 
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                                    }`}
                                >
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Ganancia estimada</p>
                                    <p className="text-sm md:text-base font-black text-white mt-1">Bs {Number(estimatedProfit).toFixed(2)}</p>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                        <span className="text-[9px] font-extrabold text-blue-500 uppercase tracking-wider">Ver detalle</span>
                                        <Icon name="cash" className="h-3.5 w-3.5 text-blue-500/60" />
                                    </div>
                                </div>

                                {/* Card 5: Calificación promedio */}
                                <div 
                                    onClick={() => setSelectedMetric("calificacion")}
                                    className={`rounded-none border p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] ${
                                        selectedMetric === "calificacion" 
                                            ? 'border-[#f5d367] bg-[#f5d367]/5 shadow-[0_4px_15px_rgba(245,211,103,0.15)]' 
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                                    }`}
                                >
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Calificación promedio</p>
                                    <p className="text-sm md:text-base font-black text-white mt-1">⭐ {averageRating}</p>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                        <span className="text-[9px] font-extrabold text-[#f5d367] uppercase tracking-wider">Ver detalle</span>
                                        <Icon name="star" className="h-3.5 w-3.5 text-[#f5d367]/60" />
                                    </div>
                                </div>

                                {/* Card 6: Pedidos pendientes */}
                                <div 
                                    onClick={() => setSelectedMetric("pendientes")}
                                    className={`rounded-none border p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] ${
                                        selectedMetric === "pendientes" 
                                            ? 'border-red-500 bg-red-500/5 shadow-[0_4px_15px_rgba(239,68,68,0.15)]' 
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                                    }`}
                                >
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">{isServiceView ? 'Agendas pendientes' : 'Pedidos pendientes'}</p>
                                    <p className="text-sm md:text-base font-black text-white mt-1">{pendingOrdersCount} {isServiceView ? 'por realizar' : 'por preparar'}</p>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                        <span className="text-[9px] font-extrabold text-red-500 uppercase tracking-wider">Ver detalle</span>
                                        <Icon name="clock" className="h-3.5 w-3.5 text-red-500/60" />
                                    </div>
                                </div>
                            </div>

                            {/* Interactive KPI Details Container */}
                            <div className="rounded-none border border-white/10 bg-white/[0.02] p-5 space-y-6">
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <div>
                                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#f5d367]">
                                            {selectedMetric === "ventas" && "Detalle de Ventas Totales"}
                                            {selectedMetric === "pedidos" && "Desglose de Pedidos Recibidos"}
                                            {selectedMetric === "productos" && (isServiceView ? "Rendimiento de Servicios Brindados" : "Rendimiento de Productos Vendidos")}
                                            {selectedMetric === "ganancias" && "Análisis de Ganancia Estimada (28% margen)"}
                                            {selectedMetric === "calificacion" && "Resumen de Calificaciones"}
                                            {selectedMetric === "pendientes" && "Pedidos Pendientes por Preparar"}
                                        </h3>
                                        <p className="text-[9px] text-white/40 mt-1">
                                            {selectedMetric === "ventas" && "Historial de ingresos por ventas completadas."}
                                            {selectedMetric === "pedidos" && "Distribución y clasificación de todas las órdenes."}
                                            {selectedMetric === "productos" && (isServiceView ? "Servicios más solicitados y métricas de desempeño." : "Unidades vendidas y artículos más populares.")}
                                            {selectedMetric === "ganancias" && "Cálculo estimado del margen de ganancia neta del negocio."}
                                            {selectedMetric === "calificacion" && "Opiniones y promedio de estrellas otorgadas por clientes."}
                                            {selectedMetric === "pendientes" && "Lista cronológica de pedidos en cola de preparación."}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setMetricViewType(t => t === "chart" ? "details" : "chart")}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#f5d367]/20 text-[10px] font-bold text-white/80 hover:text-[#f5d367] transition-all rounded-none uppercase cursor-pointer"
                                    >
                                        {metricViewType === "chart" ? "Ver Tabla" : "Ver Gráfico"}
                                    </button>
                                </div>

                                {/* Metric display content */}
                                <div className="w-full">
                                    {selectedMetric === "ventas" && (
                                        metricViewType === "chart" ? (
                                            <div className="h-56 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={chartSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="sales-grad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#f5d367" stopOpacity={0.2} />
                                                                <stop offset="100%" stopColor="#f5d367" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                                                        <XAxis dataKey="fecha" stroke="rgba(255, 255, 255, 0.4)" fontSize={9} />
                                                        <YAxis stroke="rgba(255, 255, 255, 0.4)" fontSize={9} />
                                                        <RechartsTooltip content={<CustomTooltip />} />
                                                        <Area type="monotone" dataKey="Monto de Ventas" stroke="#f5d367" fillOpacity={1} fill="url(#sales-grad)" strokeWidth={2} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-white/5 text-white/30 uppercase tracking-wider font-extrabold">
                                                            <th className="py-2.5">Fecha</th>
                                                            <th className="py-2.5">Ventas Brutas</th>
                                                            <th className="py-2.5">Transacciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5 text-white/70">
                                                        {[...chartSalesData].reverse().map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-white/[0.01]">
                                                                <td className="py-3 font-semibold">{row.fecha}</td>
                                                                <td className="py-3 text-[#f5d367] font-bold">Bs {row["Monto de Ventas"].toFixed(2)}</td>
                                                                <td className="py-3">{row.transacciones || 1} {row.transacciones === 1 ? 'transacción' : 'transacciones'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    )}

                                    {selectedMetric === "pedidos" && (
                                        metricViewType === "chart" ? (
                                            <div className="h-56 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartOrdersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                                                        <XAxis dataKey="status" stroke="rgba(255, 255, 255, 0.4)" fontSize={9} />
                                                        <YAxis stroke="rgba(255, 255, 255, 0.4)" fontSize={9} allowDecimals={false} />
                                                        <RechartsTooltip content={<CustomTooltip />} />
                                                        <Bar dataKey="cantidad" fill="#f97316" radius={[2, 2, 0, 0]} name="Pedidos" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-white/5 text-white/30 uppercase tracking-wider font-extrabold">
                                                            <th className="py-2.5">Estado</th>
                                                            <th className="py-2.5">Cantidad</th>
                                                            <th className="py-2.5">Total en Dinero</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5 text-white/70">
                                                        {Object.entries(STATUS_MAP).map(([sKey, sVal]) => {
                                                            const filtered = activeOrdersList.filter(o => o.status === sKey);
                                                            const sum = filtered.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
                                                            return (
                                                                <tr key={sKey} className="hover:bg-white/[0.01]">
                                                                    <td className="py-3 font-bold text-white/80">{sVal.label}</td>
                                                                    <td className="py-3">{filtered.length} pedidos</td>
                                                                    <td className="py-3 text-[#f5d367] font-bold">Bs {sum.toFixed(2)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    )}

                                    {selectedMetric === "productos" && (
                                        metricViewType === "chart" ? (
                                            <div className="h-56 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartProductsData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                                                        <XAxis type="number" stroke="rgba(255, 255, 255, 0.4)" fontSize={9} allowDecimals={false} />
                                                        <YAxis dataKey="name" type="category" stroke="rgba(255, 255, 255, 0.4)" fontSize={9} width={90} />
                                                        <RechartsTooltip content={<CustomTooltip />} />
                                                        <Bar dataKey="Unidades vendidas" fill="#22c55e" radius={[0, 2, 2, 0]} name="Unidades" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-white/5 text-white/30 uppercase tracking-wider font-extrabold">
                                                            <th className="py-2.5">{isServiceView ? 'Servicio' : 'Producto'}</th>
                                                            <th className="py-2.5">{isServiceView ? 'Veces solicitado' : 'Unidades vendidas'}</th>
                                                            <th className="py-2.5">Participación %</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5 text-white/70">
                                                        {chartProductsData.map((prod, idx) => {
                                                            const pct = totalUnitsSold > 0 ? ((prod["Unidades vendidas"] / totalUnitsSold) * 100).toFixed(0) : 0;
                                                            return (
                                                                <tr key={idx} className="hover:bg-white/[0.01]">
                                                                    <td className="py-3 text-white/80 font-bold">{prod.name}</td>
                                                                    <td className="py-3">{prod["Unidades vendidas"]} {isServiceView ? 'veces' : (prod["Unidades vendidas"] === 1 ? 'unidad' : 'unidades')}</td>
                                                                    <td className="py-3 text-[#f5d367] font-bold">{pct}%</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    )}

                                    {selectedMetric === "ganancias" && (
                                        metricViewType === "chart" ? (
                                            <div className="h-56 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={chartSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="profit-grad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                                                        <XAxis dataKey="fecha" stroke="rgba(255, 255, 255, 0.4)" fontSize={9} />
                                                        <YAxis stroke="rgba(255, 255, 255, 0.4)" fontSize={9} />
                                                        <RechartsTooltip content={<CustomTooltip />} />
                                                        <Area type="monotone" dataKey="Monto de Ganancia" stroke="#3b82f6" fillOpacity={1} fill="url(#profit-grad)" strokeWidth={2} name="Monto de Ganancia" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-white/5 text-white/30 uppercase tracking-wider font-extrabold">
                                                            <th className="py-2.5">Concepto</th>
                                                            <th className="py-2.5">Porcentaje %</th>
                                                            <th className="py-2.5">Monto Estimado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5 text-white/70">
                                                        <tr className="hover:bg-white/[0.01]">
                                                            <td className="py-3">Ventas Brutas Totales</td>
                                                            <td className="py-3">100%</td>
                                                            <td className="py-3 font-bold text-white">Bs {Number(totalSales).toFixed(2)}</td>
                                                        </tr>
                                                        <tr className="hover:bg-white/[0.01]">
                                                            <td className="py-3">Costo estimado de bienes vendidos (COGS)</td>
                                                            <td className="py-3">~65%</td>
                                                            <td className="py-3 text-red-400">-Bs {(totalSales * 0.65).toFixed(2)}</td>
                                                        </tr>
                                                        <tr className="hover:bg-white/[0.01]">
                                                            <td className="py-3">Gastos operativos estimados</td>
                                                            <td className="py-3">~7%</td>
                                                            <td className="py-3 text-red-400">-Bs {(totalSales * 0.07).toFixed(2)}</td>
                                                        </tr>
                                                        <tr className="hover:bg-white/[0.01] border-t border-white/10 font-bold">
                                                            <td className="py-3 text-[#f5d367]">Ganancia Neta Estimada (Margen 28%)</td>
                                                            <td className="py-3 text-[#f5d367]">28%</td>
                                                            <td className="py-3 text-[#f5d367] font-black">Bs {Number(estimatedProfit).toFixed(2)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    )}

                                    {selectedMetric === "calificacion" && (
                                        metricViewType === "chart" ? (
                                            <div className="h-56 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartRatingData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                                                        <XAxis type="number" stroke="rgba(255, 255, 255, 0.4)" fontSize={9} allowDecimals={false} />
                                                        <YAxis dataKey="estrella" type="category" stroke="rgba(255, 255, 255, 0.4)" fontSize={9} width={30} />
                                                        <RechartsTooltip content={<CustomTooltip />} />
                                                        <Bar dataKey="votos" fill="#eab308" radius={[0, 2, 2, 0]} name="Votos" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-white/5 text-white/30 uppercase tracking-wider font-extrabold">
                                                            <th className="py-2.5">Calificación</th>
                                                            <th className="py-2.5">Votos</th>
                                                            <th className="py-2.5">Calidad</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5 text-white/60">
                                                        {[
                                                            { star: 5, label: "5 Estrellas", desc: "Excelente", color: "text-green-400" },
                                                            { star: 4, label: "4 Estrellas", desc: "Muy Bueno", color: "text-green-400/80" },
                                                            { star: 3, label: "3 Estrellas", desc: "Aceptable", color: "text-white/50" },
                                                            { star: 2, label: "2 Estrellas", desc: "Regular", color: "text-orange-400" },
                                                            { star: 1, label: "1 Estrella",  desc: "Malo", color: "text-red-400" }
                                                        ].map((item, idx) => {
                                                            const match = chartRatingData.find(d => d.estrella === `${item.star} ★`);
                                                            const votos = match ? match.votos : 0;
                                                            return (
                                                                <tr key={idx} className="hover:bg-white/[0.01]">
                                                                    <td className="py-3 text-[#f5d367] font-bold">{item.label}</td>
                                                                    <td className="py-3">{votos} {votos === 1 ? 'cliente' : 'clientes'}</td>
                                                                    <td className={`py-3 ${item.color} font-semibold`}>{item.desc}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    )}

                                    {selectedMetric === "pendientes" && (
                                        metricViewType === "chart" ? (
                                            <div className="space-y-4 max-w-xl">
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                                                    {isServiceView ? 'Cola de prioridad de agendas' : 'Cola de prioridad de pedidos'}
                                                </p>
                                                <div className="space-y-2">
                                                    {pendingPreparedOrdersSorted.slice(0, 3).map((oItem, i) => (
                                                        <div 
                                                            key={i} 
                                                            className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-3 border-l-2 border-amber-500 rounded-none text-xs cursor-pointer transition-all"
                                                            onClick={() => handleViewDetails(oItem)}
                                                            title={isServiceView ? "Ver Detalles de la Agenda" : "Ver Detalles del Pedido"}
                                                        >
                                                            <div>
                                                                 <p className="font-extrabold text-white">{isServiceView ? 'Agenda' : 'Pedido'} #{oItem.id} - {oItem.customer_name || "Cliente"}</p>
                                                                 <p className="text-[10px] text-white/45 mt-0.5">Fecha: {new Date(oItem.created_at).toLocaleDateString('es-ES')}</p>
                                                            </div>
                                                            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] font-extrabold uppercase text-amber-500">
                                                                {isServiceView 
                                                                    ? (SERVICE_STATUS_MAP[oItem.status]?.label || oItem.status)
                                                                    : (STATUS_MAP[oItem.status]?.label || oItem.status)
                                                                }
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {pendingPreparedOrdersSorted.length === 0 && (
                                                        <p className="text-xs text-white/40 italic">
                                                            {isServiceView 
                                                                ? '¡No tienes agendas pendientes de confirmación o realización!' 
                                                                : '¡No tienes pedidos pendientes de preparación!'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-white/5 text-white/30 uppercase tracking-wider font-extrabold">
                                                            <th className="py-2.5">{isServiceView ? 'Reserva ID' : 'Pedido ID'}</th>
                                                            <th className="py-2.5">Cliente</th>
                                                            <th className="py-2.5">{isServiceView ? 'Precio' : 'Importe'}</th>
                                                            <th className="py-2.5">Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {pendingPreparedOrdersSorted.map((oItem) => (
                                                            <tr 
                                                                key={oItem.id} 
                                                                className="hover:bg-white/5 cursor-pointer transition-all"
                                                                onClick={() => handleViewDetails(oItem)}
                                                                title={isServiceView ? "Ver Detalles de la Reserva" : "Ver Detalles del Pedido"}
                                                            >
                                                                <td className="py-3 font-mono font-bold text-[#f5d367]">#{oItem.id}</td>
                                                                <td className="py-3 text-white/80">{oItem.customer_name || "Cliente"}</td>
                                                                <td className="py-3 text-white/60">Bs {Number(oItem.total).toFixed(2)}</td>
                                                                <td className="py-3 text-amber-500 font-extrabold uppercase text-[9px]">
                                                                    {isServiceView 
                                                                        ? (SERVICE_STATUS_MAP[oItem.status]?.label || oItem.status)
                                                                        : (STATUS_MAP[oItem.status]?.label || oItem.status)
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Main Grid: Orders, Products, Activity */}
                            <div className="grid gap-6 lg:grid-cols-3">
                                
                                {/* Col 1: Pedidos/Agendas recientes */}
                                <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4 lg:col-span-2">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#f5d367]">
                                            {isServiceView ? 'Agendas recientes' : 'Pedidos recientes'}
                                        </h3>
                                        <button 
                                            type="button"
                                            onClick={() => setActiveDashboardTab("pedidos")}
                                            className="text-[10px] font-bold text-white/45 hover:text-[#f5d367] uppercase transition-all cursor-pointer"
                                        >
                                            Ver todos
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/5 text-white/30 uppercase tracking-wider font-extrabold">
                                                    <th className="py-2.5">Cliente</th>
                                                    <th className="py-2.5">Total</th>
                                                    <th className="py-2.5">Fecha</th>
                                                    <th className="py-2.5">Estado</th>
                                                    <th className="py-2.5 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {activeOrdersList.filter(o => 
                                                    !dashboardSearchQuery || 
                                                    (o.customer_name && o.customer_name.toLowerCase().includes(dashboardSearchQuery.toLowerCase())) || 
                                                    (o.customer_email && o.customer_email.toLowerCase().includes(dashboardSearchQuery.toLowerCase())) || 
                                                    String(o.id).includes(dashboardSearchQuery)
                                                ).slice(0, 5).map(o => (
                                                    <tr key={o.id} className="hover:bg-white/[0.01]">
                                                        <td className="py-3 flex items-center gap-3">
                                                            <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[10px] text-[#f5d367] shrink-0">
                                                                 {getInitials(o.customer_name || "Cliente")}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-white truncate max-w-[120px]">{o.customer_name || "Cliente"}</p>
                                                                <p className="text-[9px] text-white/35 truncate max-w-[120px]">{o.customer_email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 font-semibold text-white/90">Bs {Number(o.total).toFixed(2)}</td>
                                                        <td className="py-3 text-white/45">{new Date(o.created_at).toLocaleDateString('es-ES')}</td>
                                                        <td className="py-3">
                                                            <select
                                                                value={o.status}
                                                                onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                                                className="bg-[#040912] border border-white/10 text-white text-[10px] font-extrabold uppercase rounded-none p-1 focus:outline-none focus:border-[#f5d367]"
                                                            >
                                                                {Object.entries(isServiceView ? SERVICE_STATUS_MAP : STATUS_MAP).map(([sKey, sVal]) => (
                                                                    <option key={sKey} value={sKey} className="bg-[#080f1c]">{sVal.label}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <div className="flex gap-2 justify-end">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleViewDetails(o)}
                                                                    className="p-1.5 text-white/45 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-all rounded-none cursor-pointer"
                                                                    title="Ver detalles"
                                                                >
                                                                    <Icon name="eye" className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Col 2: Actividad reciente timeline */}
                                <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-6">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#f5d367]">Actividad reciente</h3>
                                        <span className="text-[9px] font-semibold text-white/30 uppercase">En vivo</span>
                                    </div>

                                    {/* Timeline events */}
                                    <div className="space-y-5 relative pl-4 border-l border-white/5 ml-2">
                                        {(() => {
                                            const list = [];
                                            // Add real orders/bookings if available
                                            activeOrdersList.slice(0, 2).forEach((o, index) => {
                                                const timeText = index === 0 ? "Hace 10 minutos" : "Hace 1 hora";
                                                if (isServiceView) {
                                                    list.push({
                                                        title: "Nueva agenda reservada",
                                                        desc: `Reserva #${o.id} de ${o.customer_name || "Cliente"} - ${o.items?.[0]?.name || o.items?.[0]?.product_name || o.items?.[0]?.service_name || "Servicio"}`,
                                                        time: timeText,
                                                        icon: "wrench",
                                                        color: "text-blue-400"
                                                    });
                                                } else {
                                                    list.push({
                                                        title: "Nuevo pedido recibido",
                                                        desc: `Pedido #${o.id} de ${o.customer_name || "Cliente"}`,
                                                        time: timeText,
                                                        icon: "cart",
                                                        color: "text-[#f5d367]"
                                                    });
                                                }
                                            });

                                            // General/fallback items
                                            list.push({
                                                title: "Nuevo comentario",
                                                desc: "Maria Gomez comentó en tu catálogo",
                                                time: "Hace 3 horas",
                                                icon: "message",
                                                color: "text-purple-400"
                                            });

                                            if (isServiceView) {
                                                list.push({
                                                    title: "Servicio solicitado",
                                                    desc: "Diagnóstico Computarizado agendado",
                                                    time: "Hace 5 horas",
                                                    icon: "wrench",
                                                    color: "text-blue-400"
                                                });
                                            } else {
                                                list.push({
                                                    title: "Producto agotándose",
                                                    desc: "Aceite Castrol EDGE (Stock: 8)",
                                                    time: "Hace 4 horas",
                                                    icon: "alert",
                                                    color: "text-red-400"
                                                });
                                            }

                                            list.push({
                                                title: "Nuevo seguidor de tienda",
                                                desc: "Carlos Mendoza comenzó a seguirte",
                                                time: "Hace 1 día",
                                                icon: "user",
                                                color: "text-[#f5d367]"
                                            });

                                            return list;
                                        })().map((ev, i) => (
                                            <div key={i} className="relative space-y-1">
                                                {/* Timeline dot */}
                                                <div className="absolute -left-[23px] top-1 h-3.5 w-3.5 bg-[#040912] border border-white/15 rounded-full flex items-center justify-center">
                                                    <div className="h-1.5 w-1.5 bg-white/40 rounded-full" />
                                                </div>
                                                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                                    <span className={ev.color}>{ev.title}</span>
                                                </p>
                                                <p className="text-[11px] text-white/50">{ev.desc}</p>
                                                <p className="text-[9px] text-white/30">{ev.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Featured Products / Services List */}
                            <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#f5d367]">
                                        {isServiceView ? 'Servicios destacados' : 'Productos destacados'}
                                    </h3>
                                    {isServiceView ? (
                                        wantsService && (
                                            <button 
                                                type="button" 
                                                onClick={() => setActiveDashboardTab("servicios")}
                                                className="text-[10px] font-bold text-white/45 hover:text-[#f5d367] uppercase transition-all cursor-pointer"
                                            >
                                                Ver todos
                                            </button>
                                        )
                                    ) : (
                                        wantsStore && (
                                            <button 
                                                type="button" 
                                                onClick={() => setActiveDashboardTab("productos")}
                                                className="text-[10px] font-bold text-white/45 hover:text-[#f5d367] uppercase transition-all cursor-pointer"
                                            >
                                                Ver todos
                                            </button>
                                        )
                                    )}
                                </div>

                                {isServiceView ? (
                                    featuredServices.length > 0 ? (
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            {featuredServices.filter(s => !dashboardSearchQuery || s.name.toLowerCase().includes(dashboardSearchQuery.toLowerCase())).map((s, i) => (
                                                <div key={s.id || i} className="rounded-none border border-white/5 bg-[#080f1c]/40 p-4 flex flex-col justify-between space-y-3 hover:border-white/15 transition-all">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-extrabold text-white truncate">{s.name}</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-white/40">
                                                            <span>★ {s.rating || 0}</span>
                                                            <span>•</span>
                                                            <span>{s.likes || 0} likes</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                        <div>
                                                            <p className="text-xs font-black text-[#f5d367]">Bs {Number(s.price).toFixed(2)}</p>
                                                            <p className="text-[9px] text-white/30">Servicio profesional</p>
                                                        </div>
                                                        {wantsService && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setInitialEditServiceId(s.id);
                                                                    setActiveDashboardTab("servicios");
                                                                }}
                                                                className="px-2.5 py-1 bg-white/5 hover:bg-blue-500/15 border border-white/10 hover:border-blue-500/30 text-[10px] font-bold text-white/80 hover:text-blue-300 transition-all rounded-none cursor-pointer"
                                                            >
                                                                Editar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-xs text-white/30 font-bold border border-dashed border-white/5 bg-white/[0.01]">
                                            No hay servicios registrados en tu catálogo
                                        </div>
                                    )
                                ) : (
                                    featuredProducts.length > 0 ? (
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            {featuredProducts.filter(p => !dashboardSearchQuery || p.name.toLowerCase().includes(dashboardSearchQuery.toLowerCase())).map((p, i) => (
                                                <div key={p.id || i} className="rounded-none border border-white/5 bg-[#080f1c]/40 p-4 flex flex-col justify-between space-y-3 hover:border-white/15 transition-all">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-extrabold text-white truncate">{p.name}</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-white/40">
                                                            <span>★ {p.rating || 0}</span>
                                                            <span>•</span>
                                                            <span>{p.likes || 0} likes</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                        <div>
                                                            <p className="text-xs font-black text-[#f5d367]">Bs {Number(p.price).toFixed(2)}</p>
                                                            <p className="text-[9px] text-white/30">Stock: {p.stock || 0}</p>
                                                        </div>
                                                        {wantsStore && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setInitialEditProductId(p.id);
                                                                    setActiveDashboardTab("productos");
                                                                }}
                                                                className="px-2.5 py-1 bg-white/5 hover:bg-[#f5d367]/15 border border-white/10 hover:border-[#f5d367]/30 text-[10px] font-bold text-white/80 hover:text-[#f5d367] transition-all rounded-none cursor-pointer"
                                                            >
                                                                Editar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-xs text-white/30 font-bold border border-dashed border-white/5 bg-white/[0.01]">
                                            No hay productos registrados en tu catálogo
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* B. TAB: PEDIDOS */}
                    {activeDashboardTab === 'pedidos' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <Icon name="list" className="h-5 w-5 text-[#f5d367]" />
                                        <span>{isServiceView ? 'Gestor de Agendas' : 'Gestión de Pedidos'}</span>
                                    </h2>
                                    <p className="text-xs text-white/40 mt-1">
                                        {isServiceView 
                                            ? 'Controla los estados y fechas de todas las reservas de servicios de tu negocio.'
                                            : 'Controla los estados y facturación de todas las ventas de tu negocio.'}
                                    </p>
                                </div>

                                {/* Order status tab filters */}
                                <div className="flex flex-wrap gap-1.5 bg-[#080f1c] p-1 border border-white/5 rounded-none">
                                    {isServiceView ? (
                                        [
                                            { id: "all", label: "Todos" },
                                            { id: "pending", label: "Pendientes" },
                                            { id: "confirmed", label: "Confirmados" },
                                            { id: "completed", label: "Realizados" },
                                            { id: "cancelled", label: "Cancelados" },
                                            { id: "past", label: "Pasados" }
                                        ].map(f => (
                                            <button
                                                key={f.id}
                                                type="button"
                                                onClick={() => setOrderFilterTab(f.id)}
                                                className={`px-3 py-1.5 text-[10px] font-extrabold uppercase transition-all rounded-none ${
                                                    orderFilterTab === f.id
                                                        ? 'bg-blue-500 text-white'
                                                        : 'text-white/45 hover:text-white'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))
                                    ) : (
                                        [
                                            { id: "all", label: "Todos" },
                                            { id: "pending", label: "Pendientes" },
                                            { id: "paid", label: "Pagados" },
                                            { id: "preparing", label: "En preparación" },
                                            { id: "shipped", label: "Enviados" },
                                            { id: "delivered", label: "Entregados" },
                                            { id: "cancelled", label: "Cancelados" }
                                        ].map(f => (
                                            <button
                                                key={f.id}
                                                type="button"
                                                onClick={() => setOrderFilterTab(f.id)}
                                                className={`px-3 py-1.5 text-[10px] font-extrabold uppercase transition-all rounded-none ${
                                                    orderFilterTab === f.id
                                                        ? 'bg-[#f5d367] text-[#120c00]'
                                                        : 'text-white/45 hover:text-white'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Search bar inside Pedidos tab */}
                            <div className="max-w-md">
                                <input
                                    type="text"
                                    placeholder={isServiceView ? "Buscar agenda por cliente o ID..." : "Buscar pedido por cliente o ID..."}
                                    value={dashboardSearchQuery}
                                    onChange={(e) => setDashboardSearchQuery(e.target.value)}
                                    className="w-full bg-[#080f1c] border border-white/10 text-xs text-white rounded-none px-4 py-2.5 focus:outline-none focus:border-[#f5d367] transition-all"
                                />
                            </div>

                            {filteredOrders.length === 0 ? (
                                <div className="rounded-none border border-dashed border-white/10 bg-white/[0.01] p-12 text-center text-sm text-white/40">
                                    No se encontraron {isServiceView ? 'agendas' : 'pedidos'} con el filtro actual.
                                </div>
                            ) : (
                                <div className="rounded-none border border-white/10 bg-[#080f1c]/40 overflow-hidden shadow-xl">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-white/[0.02] border-b border-white/5 text-white/40 uppercase tracking-widest font-extrabold">
                                                    <th className="p-4">{isServiceView ? 'Agenda ID' : 'Pedido ID'}</th>
                                                    <th className="p-4">Cliente</th>
                                                    <th className="p-4">Total</th>
                                                    <th className="p-4">Fecha</th>
                                                    <th className="p-4">{isServiceView ? 'Servicio' : 'Tipo'}</th>
                                                    <th className="p-4">Estado</th>
                                                    <th className="p-4 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {filteredOrders.map(o => (
                                                    <tr key={o.id} className="hover:bg-white/[0.01]">
                                                        <td className="p-4 font-mono font-bold text-[#f5d367]">#{o.id}</td>
                                                        <td className="p-4">
                                                            <p className="font-bold text-white">{o.customer_name || "Cliente"}</p>
                                                            <p className="text-[10px] text-white/30 mt-0.5">{o.customer_email}</p>
                                                        </td>
                                                        <td className="p-4 font-bold text-white">Bs {Number(o.total).toFixed(2)}</td>
                                                        <td className="p-4 text-white/50">{new Date(o.created_at).toLocaleString('es-ES')}</td>
                                                        <td className="p-4">
                                                            <span className="uppercase text-[9px] font-bold text-white/50 border border-white/10 px-2 py-0.5 max-w-[120px] truncate block">
                                                                {isServiceView ? (o.items?.[0]?.name || "Servicio") : (o.order_type === "delivery" ? "Delivery" : "Retiro")}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <select
                                                                value={o.status}
                                                                onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                                                className="bg-[#040912] border border-white/10 text-white text-[10px] font-extrabold uppercase rounded-none p-1.5 focus:outline-none focus:border-[#f5d367]"
                                                            >
                                                                {Object.entries(isServiceView ? SERVICE_STATUS_MAP : STATUS_MAP).map(([sKey, sVal]) => (
                                                                    <option key={sKey} value={sKey} className="bg-[#080f1c]">{sVal.label}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleViewDetails(o)}
                                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold transition-all rounded-none cursor-pointer"
                                                            >
                                                                Ver Detalles
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* C. TAB: PRODUCTOS */}
                    {activeDashboardTab === 'productos' && (
                        <div className="space-y-6 animate-fade-in">
                            <ProductCatalogSection
                                token={token}
                                existingStore={existingStore}
                                categories={categories}
                                subcategories={subcategories}
                                refreshCategories={refreshCategories}
                                initialEditProductId={initialEditProductId}
                                clearInitialEditProductId={() => setInitialEditProductId(null)}
                            />
                        </div>
                    )}

                    {/* D. TAB: SERVICIOS */}
                    {activeDashboardTab === 'servicios' && (
                        <div className="space-y-6 animate-fade-in">
                            <ServiceCatalogSection
                                token={token}
                                existingServiceProfile={existingServiceProfile}
                                categories={categories}
                                initialEditServiceId={initialEditServiceId}
                                clearInitialEditServiceId={() => setInitialEditServiceId(null)}
                            />
                        </div>
                    )}

                    {/* E. TAB: CATEGORÍAS */}
                    {activeDashboardTab === 'categories' && (
                        <div className="space-y-6 animate-fade-in">
                            <VendorCategoriesSection
                                categories={categories}
                                subcategories={subcategories}
                                handleCreateSubcategory={handleCreateSubcategory}
                            />
                        </div>
                    )}

                    {/* F. TAB: CONFIGURACIÓN */}
                    {activeDashboardTab === 'configuracion' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="border-b border-white/10 pb-4">
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Icon name="settings" className="h-5 w-5 text-[#f5d367]" />
                                    <span>{isServiceView ? 'Configuración del Perfil de Servicios' : 'Configuración de la Tienda de Productos'}</span>
                                </h2>
                                <p className="text-xs text-white/40 mt-1">
                                    {isServiceView 
                                        ? 'Administra la información pública, ubicación e identidad visual de tu perfil de servicios profesionales.' 
                                        : 'Administra la información pública, ubicación e identidad de tu tienda de productos.'}
                                </p>
                            </div>

                            <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
                                {/* Left Column: Config Forms */}
                                <form onSubmit={(e) => handleSave(e, isServiceView)} className="space-y-6">
                                    {/* General Card */}
                                    <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
                                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#f5d367]">Configuración General</h3>
                                        {!isServiceView && (
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/5 pb-1">Datos de la Tienda</p>
                                                <Input
                                                    label="Nombre de la Tienda *"
                                                    value={storeForm.name}
                                                    onChange={handleStoreField('name')}
                                                    required
                                                    className="rounded-none"
                                                />
                                                <Input
                                                    label="Descripción de la Tienda"
                                                    value={storeForm.description}
                                                    onChange={handleStoreField('description')}
                                                    className="rounded-none"
                                                />
                                            </div>
                                        )}

                                        {isServiceView && (
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/5 pb-1">Datos del Perfil de Servicios</p>
                                                <Input
                                                    label="Nombre del Perfil *"
                                                    value={serviceProfileForm.name}
                                                    onChange={handleServiceField('name')}
                                                    required
                                                    className="rounded-none"
                                                />
                                                <Input
                                                    label="Descripción del Perfil"
                                                    value={serviceProfileForm.description}
                                                    onChange={handleServiceField('description')}
                                                    className="rounded-none"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Location Card */}
                                    <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
                                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#f5d367]">Ubicación</h3>
                                        
                                        {!isServiceView && (
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/5 pb-1">Ubicación de Tienda</p>
                                                <div className="grid gap-4 sm:grid-cols-3">
                                                    <Select
                                                        label="País"
                                                        value={storeForm.country}
                                                        onChange={handleStoreField('country')}
                                                        options={["Bolivia"]}
                                                        className="rounded-none"
                                                    />
                                                    <Select
                                                        label="Ciudad"
                                                        value={storeForm.city}
                                                        onChange={handleStoreField('city')}
                                                        options={["Santa Cruz", "Tarija", "Beni", "Chuquisaca", "Cochabamba", "La Paz", "Oruro", "Pando", "Potosí"]}
                                                        className="rounded-none"
                                                    />
                                                </div>
                                                <div className="w-full">
                                                    <LeafletMap
                                                        value={storeForm.address}
                                                        onChange={(val) => handleStoreField('address')({ target: { value: val } })}
                                                        label="Dirección y Mapa de la Tienda"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {isServiceView && (
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/5 pb-1">Ubicación de Servicios</p>
                                                <div className="grid gap-4 sm:grid-cols-3">
                                                    <Select
                                                        label="País"
                                                        value={serviceProfileForm.country}
                                                        onChange={handleServiceField('country')}
                                                        options={["Bolivia"]}
                                                        className="rounded-none"
                                                    />
                                                    <Select
                                                        label="Ciudad"
                                                        value={serviceProfileForm.city}
                                                        onChange={handleServiceField('city')}
                                                        options={["Santa Cruz", "Tarija", "Beni", "Chuquisaca", "Cochabamba", "La Paz", "Oruro", "Pando", "Potosí"]}
                                                        className="rounded-none"
                                                    />
                                                </div>
                                                <div className="w-full">
                                                    <LeafletMap
                                                        value={serviceProfileForm.address}
                                                        onChange={(val) => handleServiceField('address')({ target: { value: val } })}
                                                        label="Dirección y Mapa de Servicios"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Visual Identity Card */}
                                    <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
                                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#f5d367]">Identidad Visual</h3>
                                        
                                        {!isServiceView && (
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/5 pb-1">Identidad de Tienda</p>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <Input
                                                        label="Logo de la tienda"
                                                        type="file"
                                                        accept=".png, .jpg, .jpeg"
                                                        onChange={handleLogoChange}
                                                        className="rounded-none"
                                                    />
                                                    <Input
                                                        label="Banner de la tienda"
                                                        type="file"
                                                        accept=".png, .jpg, .jpeg"
                                                        onChange={handleBannerChange}
                                                        className="rounded-none"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <label className="text-xs font-bold text-white/60">Color de fondo:</label>
                                                    <input
                                                        type="color"
                                                        value={storeForm.background_color}
                                                        onChange={handleStoreField('background_color')}
                                                        className="h-10 w-16 cursor-pointer border border-white/10 bg-transparent p-0.5"
                                                    />
                                                    <span className="text-xs text-white/40 font-mono">{storeForm.background_color}</span>
                                                </div>
                                                {(logoPreview || bannerPreview) && (
                                                    <div className="flex gap-4">
                                                        {logoPreview && (
                                                            <div>
                                                                <p className="text-[10px] text-white/45 mb-1">Logo Nuevo</p>
                                                                <img src={logoPreview} alt="Logo preview" className="h-12 w-12 object-cover border border-white/10" />
                                                            </div>
                                                        )}
                                                        {bannerPreview && (
                                                            <div>
                                                                <p className="text-[10px] text-white/45 mb-1">Banner Nuevo</p>
                                                                <img src={bannerPreview} alt="Banner preview" className="h-12 w-24 object-cover border border-white/10" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {isServiceView && (
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/5 pb-1">Identidad de Servicios</p>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <Input
                                                        label="Logo / Imagen Profesional"
                                                        type="file"
                                                        accept=".png, .jpg, .jpeg"
                                                        onChange={handleServiceLogoChange}
                                                        className="rounded-none"
                                                    />
                                                    <Input
                                                        label="Banner de Servicios"
                                                        type="file"
                                                        accept=".png, .jpg, .jpeg"
                                                        onChange={handleServiceBannerChange}
                                                        className="rounded-none"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <label className="text-xs font-bold text-white/60">Color de fondo:</label>
                                                    <input
                                                        type="color"
                                                        value={serviceProfileForm.background_color}
                                                        onChange={handleServiceField('background_color')}
                                                        className="h-10 w-16 cursor-pointer border border-white/10 bg-transparent p-0.5"
                                                    />
                                                    <span className="text-xs text-white/40 font-mono">{serviceProfileForm.background_color}</span>
                                                </div>
                                                {(serviceLogoPreview || serviceBannerPreview) && (
                                                    <div className="flex gap-4">
                                                        {serviceLogoPreview && (
                                                            <div>
                                                                <p className="text-[10px] text-white/45 mb-1">Logo Nuevo</p>
                                                                <img src={serviceLogoPreview} alt="Logo preview" className="h-12 w-12 object-cover border border-white/10" />
                                                            </div>
                                                        )}
                                                        {serviceBannerPreview && (
                                                            <div>
                                                                <p className="text-[10px] text-white/45 mb-1">Banner Nuevo</p>
                                                                <img src={serviceBannerPreview} alt="Banner preview" className="h-12 w-24 object-cover border border-white/10" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {feedbackMessage && (
                                        <div className={`p-4 text-xs font-bold rounded-none ${
                                            feedbackMessage.type === 'success'
                                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                        }`}>
                                            {feedbackMessage.text}
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="submit"
                                            loading={saving}
                                            className="bg-[#f5d367] text-[#120c00] hover:opacity-90 font-bold px-8 rounded-none shadow-[0_4px_15px_rgba(245,211,103,0.2)]"
                                        >
                                            Guardar Configuración
                                        </Button>
                                    </div>
                                </form>

                                {/* Right Column: Sticky Mockup Preview */}
                                <aside className="lg:sticky lg:top-24 space-y-4">
                                    <div className="border border-white/10 bg-white/[0.02] p-5 space-y-5 shadow-2xl relative">
                                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#f5d367]/15 border border-[#f5d367]/30 text-[8px] font-bold uppercase tracking-wider text-[#f5d367] rounded-none">
                                            Vista Previa
                                        </div>
                                        <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                                            Tarjeta Pública del Comercio
                                        </h4>
                                        
                                        {/* Mockup Banner */}
                                        <div 
                                            className="h-28 w-full border border-white/5 bg-cover bg-center relative flex items-end"
                                            style={{ 
                                                backgroundImage: !isServiceView 
                                                    ? (bannerPreview ? `url(${bannerPreview})` : (existingStore?.banner_url ? `url(${getProfileImageUrl(existingStore.banner_url)})` : 'none'))
                                                    : (serviceBannerPreview ? `url(${serviceBannerPreview})` : (existingServiceProfile?.banner_url ? `url(${getProfileImageUrl(existingServiceProfile.banner_url)})` : 'none')),
                                                backgroundColor: !isServiceView 
                                                    ? (storeForm.background_color || '#0a0f1d')
                                                    : (serviceProfileForm.background_color || '#0a0f1d')
                                            }}
                                        >
                                            {/* Mockup Logo Overlay */}
                                            <div className="absolute -bottom-4 left-4 h-12 w-12 border border-white/10 bg-[#080f1c] overflow-hidden rounded-none flex items-center justify-center shadow-md">
                                                {!isServiceView ? (
                                                    logoPreview ? (
                                                        <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                                                    ) : (existingStore?.logo_url ? (
                                                        <img src={getProfileImageUrl(existingStore.logo_url)} alt="Logo" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Icon name="store" className="h-6 w-6 text-white/30" />
                                                    ))
                                                ) : (
                                                    serviceLogoPreview ? (
                                                        <img src={serviceLogoPreview} alt="Logo" className="h-full w-full object-cover" />
                                                    ) : (existingServiceProfile?.logo_url ? (
                                                        <img src={getProfileImageUrl(existingServiceProfile.logo_url)} alt="Logo" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Icon name="wrench" className="h-5 w-5 text-white/30" />
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Mockup Details */}
                                        <div className="pt-4 space-y-3 text-left">
                                            <div>
                                                <h5 className="font-extrabold text-xs text-white truncate">
                                                    {!isServiceView ? (storeForm.name || "Nombre de tu Tienda") : (serviceProfileForm.name || "Nombre del Perfil")}
                                                </h5>
                                                <p className="text-[10px] text-white/40 line-clamp-2 mt-1">
                                                    {!isServiceView ? (storeForm.description || "Descripción comercial de la tienda...") : (serviceProfileForm.description || "Descripción del perfil de servicios profesionales...")}
                                                </p>
                                            </div>

                                            {/* Rating & Location */}
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-white/50 pt-1 border-t border-white/5">
                                                <span className="flex items-center gap-0.5 text-[#f5d367] font-bold">
                                                    ★ 4.8 <span className="text-white/30 font-normal">(12 ratings)</span>
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Icon name="pin" className="h-2.5 w-2.5 text-white/30" />
                                                    <span className="truncate max-w-[140px]">
                                                        {!isServiceView ? `${storeForm.city || "Ciudad"}, ${storeForm.country || "Bolivia"}` : `${serviceProfileForm.city || "Ciudad"}, ${serviceProfileForm.country || "Bolivia"}`}
                                                    </span>
                                                </span>
                                            </div>

                                            {/* Simulated catalog grid inside preview */}
                                            <div className="pt-4 border-t border-white/5 space-y-2">
                                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Catálogo Destacado</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="border border-white/5 bg-white/[0.01] p-1.5 space-y-1">
                                                        <div className="h-10 w-full bg-white/5 flex items-center justify-center">
                                                            <Icon name="market" className="h-4 w-4 text-white/10" />
                                                        </div>
                                                        <p className="text-[8px] text-white/80 font-bold truncate">Artículo Demo A</p>
                                                        <p className="text-[8px] text-[#f5d367] font-black">Bs 120.00</p>
                                                    </div>
                                                    <div className="border border-white/5 bg-white/[0.01] p-1.5 space-y-1">
                                                        <div className="h-10 w-full bg-white/5 flex items-center justify-center">
                                                            <Icon name="wrench" className="h-4 w-4 text-white/10" />
                                                        </div>
                                                        <p className="text-[8px] text-white/80 font-bold truncate">Servicio Demo B</p>
                                                        <p className="text-[8px] text-blue-400 font-black">Bs 250.00</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* 3. ORDER DETAILS DIALOG MODAL */}
            {selectedOrderDetails && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
                    onClick={() => setSelectedOrderDetails(null)}
                >
                    <div 
                        className="rounded-none border border-white/10 bg-[#0d1726] p-6 sm:p-8 shadow-2xl max-w-2xl w-full space-y-6 text-white max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start border-b border-white/10 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>{isServiceView ? 'Agenda' : 'Pedido'} #{selectedOrderDetails.id}</span>
                                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-none ${(isServiceView ? SERVICE_STATUS_MAP : STATUS_MAP)[selectedOrderDetails.status]?.color || 'bg-white/5 text-white'}`}>
                                        {(isServiceView ? SERVICE_STATUS_MAP : STATUS_MAP)[selectedOrderDetails.status]?.label || selectedOrderDetails.status}
                                    </span>
                                </h3>
                                <p className="text-xs text-white/40 mt-1">
                                    Fecha de solicitud: {new Date(selectedOrderDetails.created_at).toLocaleString('es-ES')}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedOrderDetails(null)} 
                                className="text-white/45 hover:text-white text-2xl cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        {/* Customer & Shipping/Booking information */}
                        <div className="grid gap-6 sm:grid-cols-2 text-xs">
                            <div className="space-y-2.5 bg-white/[0.02] border border-white/5 p-4 rounded-none">
                                <p className="font-extrabold text-[#f5d367] uppercase tracking-wider">Información del Cliente</p>
                                <div className="space-y-1">
                                    <p className="font-bold text-white">{selectedOrderDetails.customer_name || "Cliente"}</p>
                                    <p className="text-white/60">{selectedOrderDetails.customer_email}</p>
                                </div>
                            </div>

                            {isServiceView ? (
                                <div className="space-y-2.5 bg-white/[0.02] border border-white/5 p-4 rounded-none">
                                    <p className="font-extrabold text-blue-400 uppercase tracking-wider">Detalles de la Reserva</p>
                                    <div className="space-y-1.5 text-xs text-white/70">
                                        <p className="font-bold text-white">Fecha Agendada: <span className="font-normal text-white/80">{selectedOrderDetails.booking_date || new Date(selectedOrderDetails.created_at).toLocaleDateString('es-ES')}</span></p>
                                        <p className="font-bold text-white">Hora: <span className="font-normal text-white/80">{selectedOrderDetails.booking_time || "10:00"} hrs</span></p>
                                        {selectedOrderDetails.booking_notes && (
                                            <div className="pt-1.5 border-t border-white/5 mt-1.5">
                                                <p className="font-bold text-white mb-0.5">Notas / Indicaciones:</p>
                                                <p className="text-white/60 italic leading-relaxed">"{selectedOrderDetails.booking_notes}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2.5 bg-white/[0.02] border border-white/5 p-4 rounded-none">
                                    <p className="font-extrabold text-[#f5d367] uppercase tracking-wider">Información de Entrega</p>
                                    <div className="space-y-1">
                                        <p className="font-bold text-white">Método: <span className="uppercase text-white/60">{selectedOrderDetails.order_type === "delivery" ? "Envío a domicilio" : "Retiro en local"}</span></p>
                                        {selectedOrderDetails.order_type === "delivery" && (
                                            <p className="text-white/60 leading-relaxed">Dirección: {selectedOrderDetails.delivery_address || "Sin dirección"}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items detailed list */}
                        <div className="space-y-3">
                            <p className="text-xs font-extrabold text-white/50 uppercase tracking-widest border-b border-white/5 pb-2">
                                {isServiceView ? 'Servicios Reservados' : 'Artículos del Pedido'}
                            </p>
                            <div className="divide-y divide-white/5">
                                {(selectedOrderDetails.items || []).map((item, idx) => (
                                    <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-bold text-white">{item.product_name || item.service_name || item.name || "Artículo"}</p>
                                                <p className="text-white/45 text-[10px]">Cantidad: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white">Bs {Number(item.subtotal || item.unit_price * item.quantity).toFixed(2)}</p>
                                            <p className="text-[10px] text-white/45">Bs {Number(item.unit_price).toFixed(2)} c/u</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order breakdown */}
                        <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                            <div className="flex justify-between text-white/50">
                                <span>Subtotal</span>
                                <span>Bs {Number(selectedOrderDetails.subtotal || selectedOrderDetails.total).toFixed(2)}</span>
                            </div>
                            {!isServiceView && (
                                <>
                                    <div className="flex justify-between text-white/50">
                                        <span>Costo de envío</span>
                                        <span>Bs {Number(selectedOrderDetails.shipping_cost || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-white/50">
                                        <span>Descuento</span>
                                        <span className="text-red-400">-Bs {Number(selectedOrderDetails.discount || 0).toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between text-sm font-black border-t border-white/5 pt-2 text-white">
                                <span className="text-[#f5d367]">{isServiceView ? 'Total del Servicio' : 'Total del Pedido'}</span>
                                <span className="text-[#f5d367]">Bs {Number(selectedOrderDetails.total).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Status quick toggle inside modal */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white/50">Estado:</span>
                                <select
                                    value={selectedOrderDetails.status}
                                    onChange={(e) => {
                                        const nextStatus = e.target.value;
                                        handleUpdateStatus(selectedOrderDetails.id, nextStatus);
                                        setSelectedOrderDetails(curr => ({ ...curr, status: nextStatus }));
                                    }}
                                    className="bg-[#040912] border border-white/10 text-white text-[10px] font-extrabold uppercase rounded-none p-1.5 focus:outline-none focus:border-[#f5d367]"
                                >
                                    {Object.entries(isServiceView ? SERVICE_STATUS_MAP : STATUS_MAP).map(([sKey, sVal]) => (
                                        <option key={sKey} value={sKey}>{sVal.label}</option>
                                    ))}
                                </select>
                            </div>

                            <Button 
                                onClick={() => setSelectedOrderDetails(null)} 
                                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-none"
                            >
                                Cerrar detalles
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
