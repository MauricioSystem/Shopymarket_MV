import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  getAllProducts,
  getAllStores,
} from "@/services/marketApi";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { API_BASE_URL } from "@/config/appSettings";
import { ProductVotePanel } from "@/components/RatingActions";
import { getItemLikes, submitItemVote } from "@/utils/ratingStorage";

const API_BASE = API_BASE_URL;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, openCart } = useCart();

  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyMessage, setBuyMessage] = useState(null);
  const [voteStats, setVoteStats] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteMessage, setVoteMessage] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const [productsRes, storesRes] = await Promise.all([
          getAllProducts(null),
          getAllStores(null)
        ]);

        const productsList = Array.isArray(productsRes) ? productsRes : productsRes.data;
        if (productsList) {
          const found = productsList.find(p => Number(p.id) === Number(id));
          if (found) {
            const likesData = getItemLikes(found.id, "product");
            setProduct(found);
            setVoteStats(likesData);
            const storesList = Array.isArray(storesRes) ? storesRes : storesRes.data;
            if (storesList) {
              const s = storesList.find(st => Number(st.id) === Number(found.store_id));
              if (s) setStore(s);
            }
          } else {
            setError("Producto no encontrado.");
          }
        }
      } catch (err) {
        setError("Error al cargar el producto.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  const isOwner = isAuthenticated && user && store && Number(store.admin_user_id) === Number(user.id);

  useEffect(() => {
    if (isOwner && product) {
      navigate("/dashboard/vendor", {
        replace: true,
        state: { activeTab: "products", editProductId: product.id }
      });
    }
  }, [isOwner, product, navigate]);

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setBuyLoading(true);
    setBuyMessage(null);
    try {
      const result = await addToCart(product, quantity);
      if (result.success) {
        setBuyMessage({ type: 'success', text: '¡Producto agregado al carrito!' });
        setTimeout(() => setBuyMessage(null), 3000);
        openCart();
      } else {
        setBuyMessage({ type: 'error', text: result.message || "No se pudo agregar al carrito." });
        setTimeout(() => setBuyMessage(null), 5000);
      }
    } catch (e) {
      setBuyMessage({ type: 'error', text: e.message || "Error inesperado." });
    } finally {
      setBuyLoading(false);
    }
  };

  const handleVote = async (vote) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setVoteLoading(true);
    setVoteMessage(null);

    try {
      const userId = user?.id || user?.email || "logged_in_user";
      const newStats = submitItemVote(product.id, "product", userId, vote === 1 ? "like" : "dislike");
      if (newStats) {
        setVoteStats(newStats);
        setVoteMessage({ type: "success", text: "Voto guardado." });
      }
    } catch (err) {
      setVoteMessage({ type: "error", text: err?.message || "No se pudo guardar el voto." });
    } finally {
      setVoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#c8960c] border-t-transparent rounded-none animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center p-8 bg-white rounded-none shadow-xl max-w-md w-full flex flex-col items-center">
            <Icon name="market" className="h-16 w-16 text-slate-400 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Producto no encontrado</h2>
            <p className="text-slate-500 mt-2">{error}</p>
            <Button onClick={() => navigate(-1)} className="mt-6 bg-[#1a1200] text-white rounded-none">
              Volver Atrás
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = product.image_url ? (product.image_url.startsWith("http") ? product.image_url : `${API_BASE}${product.image_url}`) : null;
  const canVote = isAuthenticated && !isOwner;

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto md:py-10 bg-white md:bg-transparent">
        {/* Izquierda: Multimedia */}
        <div className="relative w-full md:w-1/2 bg-white md:rounded-none p-6 md:p-12 flex items-center justify-center min-h-[400px] md:shadow-2xl">
          {store && (
            <button
              onClick={() => navigate(`/store/${encodeURIComponent(store.name)}`)}
              className="absolute top-6 left-6 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 z-10 bg-white/80 px-3 py-1.5 rounded-none shadow-sm backdrop-blur-sm"
            >
              ← Ir a la tienda
            </button>
          )}
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="max-w-full max-h-[500px] object-contain drop-shadow-xl" />
          ) : (
            <div className="flex flex-col items-center opacity-25 text-slate-800">
              <Icon name="market" className="h-20 w-20" />
              <span className="text-lg mt-3 font-semibold">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Derecha: Info y Checkout */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white md:rounded-none md:shadow-2xl md:border-l border-slate-100">
          <div className="space-y-6 flex-1">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-base text-slate-500 leading-relaxed max-w-lg">
                {product.description || "Este producto no tiene descripción adicional configurada por la tienda."}
              </p>
            </div>

            <div className="py-6 border-y border-slate-100 my-6">
              <p className="text-4xl font-extrabold text-[#c8960c]">
                Bs {Number(product.price || 0).toFixed(2)}
              </p>
              {product.stock !== undefined && (
                <p className="text-sm font-semibold text-slate-500 mt-2">Stock disponible: <span className="text-slate-900">{product.stock} unidades</span></p>
              )}
            </div>

            <ProductVotePanel
              likes={voteStats?.likes || 0}
              dislikes={voteStats?.dislikes || 0}
              userVote={user?.id || user?.email ? voteStats?.userVotes?.[user?.id || user?.email] || 0 : 0}
              canInteract={canVote}
              onVote={handleVote}
              loading={voteLoading}
              message={voteMessage}
            />
            
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center bg-slate-100 rounded-none shrink-0 w-full sm:w-auto justify-between p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className={`w-12 h-12 flex items-center justify-center font-bold text-xl rounded-none transition-colors ${quantity <= 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-white hover:shadow'}`}>-</button>
                  <span className="w-12 text-center text-lg font-bold text-slate-900">{quantity}</span>
                  <button onClick={() => setQuantity(product.stock !== undefined ? Math.min(product.stock, quantity + 1) : quantity + 1)} disabled={product.stock !== undefined && quantity >= product.stock} className={`w-12 h-12 flex items-center justify-center font-bold text-xl rounded-none transition-colors ${product.stock !== undefined && quantity >= product.stock ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-white hover:shadow'}`}>+</button>
                </div>
                
                <Button 
                  onClick={handleBuy}
                  disabled={buyLoading || (product.stock !== undefined && product.stock <= 0)}
                  className="w-full sm:flex-1 bg-[#1a1200] text-[#fff8df] font-bold py-4 rounded-none hover:opacity-90 shadow-xl shadow-black/10 transition-all text-lg truncate"
                >
                  {buyLoading ? 'Agregando...' : 'Agregar al Carrito'}
                </Button>
              </div>

              {buyMessage && (
                <div className={`px-4 py-3 rounded-none text-sm font-semibold text-center ${
                  buyMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {buyMessage.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 pt-4">
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-none">
                  <Icon name="truck" className="h-6 w-6 text-[#c8960c] shrink-0" />
                  <span>Envío local rápido</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-none">
                  <Icon name="check" className="h-6 w-6 text-[#c8960c] shrink-0" />
                  <span>Calidad Garantizada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
