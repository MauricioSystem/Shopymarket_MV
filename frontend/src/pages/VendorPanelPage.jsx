import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
  createProduct,
  createService,
  createServiceProfile,
  createStore,
  createSubcategory,
  getAllCategories,
  getAllServiceProfiles,
  getAllStores,
  getAllSubcategories,
} from '@/services/marketApi';

const VENDOR_MODES = [
  { value: 'store', label: 'Tienda' },
  { value: 'serviceProfile', label: 'Perfil de servicio' },
  { value: 'service', label: 'Servicio' },
  { value: 'product', label: 'Producto' },
  { value: 'subcategory', label: 'Subcategoría' },
];

const defaultStoreForm = {
  name: '',
  description: '',
  background_color: '#ffffff',
  logo_url: '',
  banner_url: '',
  country: '',
  city: '',
  address: '',
};

const defaultProfileForm = {
  store_id: '',
  name: '',
  description: '',
  background_color: '#ffffff',
  profile_image_url: '',
  banner_url: '',
  country: '',
  city: '',
  address: '',
};

const defaultServiceForm = {
  service_profile_id: '',
  category_id: '',
  name: '',
  description: '',
  price: '',
  estimated_time: '',
  image_url: '',
};

const defaultProductForm = {
  store_id: '',
  category_id: '',
  subcategory_id: '',
  name: '',
  description: '',
  price: '',
  stock: '',
  image_url: '',
};

const defaultSubcategoryForm = {
  category_id: '',
  store_id: '',
  name: '',
};

function VendorPanelPage() {
  const { token, logout, setCurrentView } = useAuth();
  const [mode, setMode] = useState('store');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stores, setStores] = useState([]);
  const [serviceProfiles, setServiceProfiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [storeForm, setStoreForm] = useState(defaultStoreForm);
  const [profileForm, setProfileForm] = useState(defaultProfileForm);
  const [serviceForm, setServiceForm] = useState(defaultServiceForm);
  const [productForm, setProductForm] = useState(defaultProductForm);
  const [subcategoryForm, setSubcategoryForm] = useState(defaultSubcategoryForm);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [storesResult, profilesResult, categoriesResult, subcategoriesResult] = await Promise.all([
        getAllStores(token),
        getAllServiceProfiles(token),
        getAllCategories(token),
        getAllSubcategories(token),
      ]);

      setStores(Array.isArray(storesResult?.data) ? storesResult.data : []);
      setServiceProfiles(Array.isArray(profilesResult?.data) ? profilesResult.data : []);
      setCategories(Array.isArray(categoriesResult?.data) ? categoriesResult.data : []);
      setSubcategories(Array.isArray(subcategoriesResult?.data) ? subcategoriesResult.data : []);
    } catch (fetchError) {
      setError(fetchError?.message || 'No se pudieron cargar los datos del panel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const availableSubcategories = useMemo(
    () => subcategories.filter((subcategory) => subcategory.category_id === Number(productForm.category_id)),
    [subcategories, productForm.category_id],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setActionLoading(true);

    try {
      let result = null;

      if (mode === 'store') {
        result = await createStore(token, {
          ...storeForm,
          status: 'active',
        });
        setStoreForm(defaultStoreForm);
      } else if (mode === 'serviceProfile') {
        result = await createServiceProfile(token, {
          ...profileForm,
          status: 'active',
          store_id: profileForm.store_id || null,
        });
        setProfileForm(defaultProfileForm);
      } else if (mode === 'service') {
        result = await createService(token, {
          ...serviceForm,
          price: Number(serviceForm.price),
          status: 'active',
        });
        setServiceForm(defaultServiceForm);
      } else if (mode === 'product') {
        result = await createProduct(token, {
          ...productForm,
          price: Number(productForm.price),
          stock: Number(productForm.stock || 0),
          subcategory_id: productForm.subcategory_id || null,
          status: 'active',
        });
        setProductForm(defaultProductForm);
      } else if (mode === 'subcategory') {
        result = await createSubcategory(token, {
          ...subcategoryForm,
          status: 'active',
        });
        setSubcategoryForm(defaultSubcategoryForm);
      }

      if (result) {
        setSuccess('Recurso creado con éxito.');
        await loadData();
      }
    } catch (submitError) {
      setError(submitError?.message || 'Error al crear el recurso.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Panel de vendedor</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Crea tu tienda, servicios y catálogo</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Usa este panel para crear recursos desde el frontend. Si el backend requiere permisos adicionales, verás el error en pantalla.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setCurrentView('dashboard')}>
              Volver al dashboard
            </Button>
            <Button onClick={loadData}>Actualizar datos</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Crear</p>
            <div className="mt-4 space-y-3">
              {VENDOR_MODES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setMode(item.value);
                    setSuccess(null);
                    setError(null);
                  }}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${mode === item.value ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold">Estado del panel</p>
              <p className="mt-3">Tiendas: {stores.length}</p>
              <p className="mt-1">Perfiles: {serviceProfiles.length}</p>
              <p className="mt-1">Categorías: {categories.length}</p>
              <p className="mt-1">Subcategorías: {subcategories.length}</p>
            </div>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Formulario</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Crear {VENDOR_MODES.find((item) => item.value === mode)?.label || 'recurso'}</h2>
              </div>
            </div>

            {loading ? (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                Cargando datos de soporte...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {error ? (
                  <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
                ) : null}
                {success ? (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>
                ) : null}

                {mode === 'store' && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Input label="Nombre de la tienda" name="name" value={storeForm.name} onChange={(event) => setStoreForm((current) => ({ ...current, name: event.target.value }))} required />
                    <Input label="País" name="country" value={storeForm.country} onChange={(event) => setStoreForm((current) => ({ ...current, country: event.target.value }))} />
                    <Input label="Ciudad" name="city" value={storeForm.city} onChange={(event) => setStoreForm((current) => ({ ...current, city: event.target.value }))} />
                    <Input label="Dirección" name="address" value={storeForm.address} onChange={(event) => setStoreForm((current) => ({ ...current, address: event.target.value }))} />
                    <Input label="Descripción" name="description" value={storeForm.description} onChange={(event) => setStoreForm((current) => ({ ...current, description: event.target.value }))} />
                    <Input label="Color de fondo" name="background_color" type="color" value={storeForm.background_color} onChange={(event) => setStoreForm((current) => ({ ...current, background_color: event.target.value }))} />
                    <Input label="URL de logo" name="logo_url" value={storeForm.logo_url} onChange={(event) => setStoreForm((current) => ({ ...current, logo_url: event.target.value }))} />
                    <Input label="URL de banner" name="banner_url" value={storeForm.banner_url} onChange={(event) => setStoreForm((current) => ({ ...current, banner_url: event.target.value }))} />
                  </div>
                )}

                {mode === 'serviceProfile' && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Select
                      label="Tienda asociada (opcional)"
                      name="store_id"
                      value={profileForm.store_id}
                      onChange={(event) => setProfileForm((current) => ({ ...current, store_id: event.target.value }))}
                      options={[{ label: 'Sin tienda', value: '' }, ...stores.map((store) => ({ value: store.id, label: store.name || `Tienda ${store.id}` }))]}
                    />
                    <Input label="Nombre del perfil" name="name" value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} required />
                    <Input label="Descripción" name="description" value={profileForm.description} onChange={(event) => setProfileForm((current) => ({ ...current, description: event.target.value }))} />
                    <Input label="Color de fondo" name="background_color" type="color" value={profileForm.background_color} onChange={(event) => setProfileForm((current) => ({ ...current, background_color: event.target.value }))} />
                    <Input label="URL de imagen" name="profile_image_url" value={profileForm.profile_image_url} onChange={(event) => setProfileForm((current) => ({ ...current, profile_image_url: event.target.value }))} />
                    <Input label="URL de banner" name="banner_url" value={profileForm.banner_url} onChange={(event) => setProfileForm((current) => ({ ...current, banner_url: event.target.value }))} />
                    <Input label="País" name="country" value={profileForm.country} onChange={(event) => setProfileForm((current) => ({ ...current, country: event.target.value }))} />
                    <Input label="Ciudad" name="city" value={profileForm.city} onChange={(event) => setProfileForm((current) => ({ ...current, city: event.target.value }))} />
                    <Input label="Dirección" name="address" value={profileForm.address} onChange={(event) => setProfileForm((current) => ({ ...current, address: event.target.value }))} />
                  </div>
                )}

                {mode === 'service' && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Select
                      label="Perfil de servicio"
                      name="service_profile_id"
                      value={serviceForm.service_profile_id}
                      onChange={(event) => setServiceForm((current) => ({ ...current, service_profile_id: event.target.value }))}
                      options={[{ label: 'Selecciona un perfil', value: '' }, ...serviceProfiles.map((profile) => ({ value: profile.id, label: profile.name || `Perfil ${profile.id}` }))]}
                      required
                    />
                    <Select
                      label="Categoría"
                      name="category_id"
                      value={serviceForm.category_id}
                      onChange={(event) => setServiceForm((current) => ({ ...current, category_id: event.target.value }))}
                      options={[{ label: 'Selecciona una categoría', value: '' }, ...categories.map((category) => ({ value: category.id, label: category.name || `Categoría ${category.id}` }))]}
                      required
                    />
                    <Input label="Nombre del servicio" name="name" value={serviceForm.name} onChange={(event) => setServiceForm((current) => ({ ...current, name: event.target.value }))} required />
                    <Input label="Precio" name="price" type="number" step="0.01" value={serviceForm.price} onChange={(event) => setServiceForm((current) => ({ ...current, price: event.target.value }))} required prefix="$" />
                    <Input label="Tiempo estimado" name="estimated_time" value={serviceForm.estimated_time} onChange={(event) => setServiceForm((current) => ({ ...current, estimated_time: event.target.value }))} />
                    <Input label="URL de imagen" name="image_url" value={serviceForm.image_url} onChange={(event) => setServiceForm((current) => ({ ...current, image_url: event.target.value }))} />
                    <Input label="Descripción" name="description" value={serviceForm.description} onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))} />
                  </div>
                )}

                {mode === 'product' && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Select
                      label="Tienda"
                      name="store_id"
                      value={productForm.store_id}
                      onChange={(event) => setProductForm((current) => ({ ...current, store_id: event.target.value }))}
                      options={[{ label: 'Selecciona una tienda', value: '' }, ...stores.map((store) => ({ value: store.id, label: store.name || `Tienda ${store.id}` }))]}
                      required
                    />
                    <Select
                      label="Categoría"
                      name="category_id"
                      value={productForm.category_id}
                      onChange={(event) => setProductForm((current) => ({ ...current, category_id: event.target.value, subcategory_id: '' }))}
                      options={[{ label: 'Selecciona una categoría', value: '' }, ...categories.map((category) => ({ value: category.id, label: category.name || `Categoría ${category.id}` }))]}
                      required
                    />
                    <Select
                      label="Subcategoría (opcional)"
                      name="subcategory_id"
                      value={productForm.subcategory_id}
                      onChange={(event) => setProductForm((current) => ({ ...current, subcategory_id: event.target.value }))}
                      options={[{ label: 'Selecciona una subcategoría', value: '' }, ...availableSubcategories.map((item) => ({ value: item.id, label: item.name || `Subcategoría ${item.id}` }))]}
                    />
                    <Input label="Nombre del producto" name="name" value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} required />
                    <Input label="Precio" name="price" type="number" step="0.01" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} required prefix="$" />
                    <Input label="Stock" name="stock" type="number" value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))} />
                    <Input label="URL de imagen" name="image_url" value={productForm.image_url} onChange={(event) => setProductForm((current) => ({ ...current, image_url: event.target.value }))} />
                    <Input label="Descripción" name="description" value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} />
                  </div>
                )}

                {mode === 'subcategory' && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Select
                      label="Categoría"
                      name="category_id"
                      value={subcategoryForm.category_id}
                      onChange={(event) => setSubcategoryForm((current) => ({ ...current, category_id: event.target.value }))}
                      options={[{ label: 'Selecciona una categoría', value: '' }, ...categories.map((category) => ({ value: category.id, label: category.name || `Categoría ${category.id}` }))]}
                      required
                    />
                    <Select
                      label="Tienda (opcional)"
                      name="store_id"
                      value={subcategoryForm.store_id}
                      onChange={(event) => setSubcategoryForm((current) => ({ ...current, store_id: event.target.value }))}
                      options={[{ label: 'Sin tienda', value: '' }, ...stores.map((store) => ({ value: store.id, label: store.name || `Tienda ${store.id}` }))]}
                    />
                    <Input label="Nombre de la subcategoría" name="name" value={subcategoryForm.name} onChange={(event) => setSubcategoryForm((current) => ({ ...current, name: event.target.value }))} required />
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">Selecciona el recurso que quieras crear y envía el formulario.</p>
                  <Button type="submit" loading={actionLoading}>
                    Crear {VENDOR_MODES.find((item) => item.value === mode)?.label || 'recurso'}
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default VendorPanelPage;
