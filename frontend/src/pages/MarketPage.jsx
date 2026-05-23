import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { getAllProducts, getAllServices, getAllStores } from '@/services/marketApi';

export default function MarketPage() {
  const { token, user, setCurrentView } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stores, setStores] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const refreshMarket = async () => {
    setError(null);
    setLoading(true);

    try {
      // No pasar token para que la API permita acceso público
      const [storesResult, servicesResult, productsResult] = await Promise.all([
        getAllStores(null),
        getAllServices(null),
        getAllProducts(null),
      ]);

      setStores(Array.isArray(storesResult?.data) ? storesResult.data : []);
      setServices(Array.isArray(servicesResult?.data) ? servicesResult.data : []);
      setProducts(Array.isArray(productsResult?.data) ? productsResult.data : []);
    } catch (fetchError) {
      setError(fetchError?.message || 'No fue posible cargar el mercado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMarket();
  }, []);

  const handleAddToCart = () => {
    if (!token) {
      setShowLoginModal(true);
    } else {
      // Aquí iría la lógica para agregar al carrito
      console.log('Agregar al carrito');
    }
  };

  const stats = useMemo(
    () => [
      { label: 'Tiendas', value: stores.length },
      { label: 'Productos', value: products.length },
      { label: 'Servicios', value: services.length },
    ],
    [stores.length, products.length, services.length],
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Mercado Shopy</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Explora productos, tiendas y servicios disponibles.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Usa esta página para probar tus endpoints de tienda y servicios, y revisar el catálogo actual.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setCurrentView('dashboard')}>
              Volver al dashboard
            </Button>
            <Button onClick={refreshMarket}>Actualizar datos</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-10">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Tiendas</h2>
                <p className="mt-1 text-sm text-slate-600">Todas las tiendas públicas creadas en la plataforma.</p>
              </div>
              <Button variant="ghost" onClick={refreshMarket}>Refrescar</Button>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                Cargando tiendas...
              </div>
            ) : stores.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-600">
                No hay tiendas registradas aún. Crea una tienda en el backend o recarga los datos.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {stores.map((store) => (
                  <article key={store.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-600">{store.name || 'Tienda sin nombre'}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{store.description || 'Descripción no disponible.'}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{store.city || 'Ciudad desconocida'}</span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{store.status || 'estado desconocido'}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Productos</h2>
                  <p className="mt-1 text-sm text-slate-600">Revisa el catálogo de productos disponibles.</p>
                </div>
                <Button variant="ghost" onClick={refreshMarket}>Recargar</Button>
              </div>

              {loading ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                  Cargando productos...
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-600">
                  No se encontraron productos. Agrega productos desde el backend para verlos aquí.
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <article key={product.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="h-12 w-12 rounded-3xl bg-slate-200 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">{product.name || 'Producto sin nombre'}</p>
                            <p className="mt-1 text-sm text-slate-600 truncate">{product.description || 'Sin descripción disponible.'}</p>
                          </div>
                        </div>
                        <Button
                          variant={token ? 'primary' : 'secondary'}
                          onClick={handleAddToCart}
                          className="shrink-0 whitespace-nowrap text-xs py-1.5 px-3"
                        >
                          {token ? '🛒' : '🔐'}
                        </Button>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Precio: ${product.price ?? '0'}</span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Stock: {product.stock ?? 0}</span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Estado: {product.status || 'desconocido'}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Servicios</h2>
                  <p className="mt-1 text-sm text-slate-600">Revisa los servicios que están disponibles para contacto o compra.</p>
                </div>
                <Button variant="ghost" onClick={refreshMarket}>Recargar</Button>
              </div>

              {loading ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                  Cargando servicios...
                </div>
              ) : services.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-600">
                  No hay servicios disponibles. Registra servicios desde el backend para mostrarlos aquí.
                </div>
              ) : (
                <div className="grid gap-4">
                  {services.map((service) => (
                    <article key={service.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-900">{service.name || 'Servicio sin nombre'}</p>
                      <p className="mt-2 text-sm text-slate-600">{service.description || 'Sin descripción disponible.'}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Precio: ${service.price ?? '0'}</span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Tiempo: {service.estimated_time || 'No disponible'}</span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Estado: {service.status || 'desconocido'}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
