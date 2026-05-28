import { useEffect, useMemo, useState } from 'react';
import {
  createProduct,
  createService,
  createServiceProfile,
  createStore,
  createSubcategory,
  createCategory,
  getAllCategories,
  getAllServiceProfiles,
  getAllStores,
  getAllSubcategories,
} from '@/services/marketApi';

const defaultStoreForm = {
  name: '',
  description: '',
  background_color: '#ffffff',
  logo_url: '',
  banner_url: '',
  country: 'Bolivia',
  city: 'Santa Cruz',
  address: '',
};

const defaultProfileForm = {
  store_id: '',
  name: '',
  description: '',
  background_color: '#ffffff',
  profile_image_url: '',
  banner_url: '',
  country: 'Bolivia',
  city: 'Santa Cruz',
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

export function useVendorPanel({ token }) {
  const [mode, setMode] = useState('store');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [stores, setStores] = useState([]);
  const [serviceProfiles, setServiceProfiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Forms states
  const [storeForm, setStoreForm] = useState(defaultStoreForm);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [profileForm, setProfileForm] = useState(defaultProfileForm);
  const [serviceLogoFile, setServiceLogoFile] = useState(null);
  const [serviceBannerFile, setServiceBannerFile] = useState(null);

  const [serviceForm, setServiceForm] = useState(defaultServiceForm);
  const [productForm, setProductForm] = useState(defaultProductForm);
  const [productImageFile, setProductImageFile] = useState(null);
  const [subcategoryForm, setSubcategoryForm] = useState(defaultSubcategoryForm);

  // Inline creation states
  const [inlineCatOpen, setInlineCatOpen] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [inlineSubOpen, setInlineSubOpen] = useState(false);
  const [inlineSubName, setInlineSubName] = useState('');
  const [inlineServCatOpen, setInlineServCatOpen] = useState(false);
  const [inlineServCatName, setInlineServCatName] = useState('');

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
    () => subcategories.filter((subcategory) => subcategory && subcategory.category_id === Number(productForm.category_id)),
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
        const formData = new FormData();
        formData.append('name', storeForm.name);
        formData.append('description', storeForm.description || '');
        formData.append('background_color', storeForm.background_color);
        formData.append('country', storeForm.country || 'Bolivia');
        formData.append('city', storeForm.city || 'Santa Cruz');
        formData.append('address', storeForm.address || '');
        formData.append('status', 'active');
        if (logoFile) {
          formData.append('logo', logoFile);
        }
        if (bannerFile) {
          formData.append('banner', bannerFile);
        }

        result = await createStore(token, formData);
        setStoreForm(defaultStoreForm);
        setLogoFile(null);
        setBannerFile(null);
      } else if (mode === 'serviceProfile') {
        const formData = new FormData();
        formData.append('name', profileForm.name);
        formData.append('description', profileForm.description || '');
        formData.append('background_color', profileForm.background_color);
        formData.append('country', profileForm.country || 'Bolivia');
        formData.append('city', profileForm.city || 'Santa Cruz');
        formData.append('address', profileForm.address || '');
        formData.append('status', 'active');
        if (profileForm.store_id) {
          formData.append('store_id', profileForm.store_id);
        }
        if (serviceLogoFile) {
          formData.append('logo', serviceLogoFile);
        }
        if (serviceBannerFile) {
          formData.append('banner', serviceBannerFile);
        }

        result = await createServiceProfile(token, formData);
        setProfileForm(defaultProfileForm);
        setServiceLogoFile(null);
        setServiceBannerFile(null);
      } else if (mode === 'service') {
        result = await createService(token, {
          ...serviceForm,
          price: Number(serviceForm.price),
          status: 'active',
        });
        setServiceForm(defaultServiceForm);
      } else if (mode === 'product') {
        if (!productImageFile) {
          throw new Error('La imagen del producto es obligatoria.');
        }
        const formData = new FormData();
        formData.append('store_id', productForm.store_id);
        formData.append('category_id', productForm.category_id);
        if (productForm.subcategory_id) {
          formData.append('subcategory_id', productForm.subcategory_id);
        }
        formData.append('name', productForm.name);
        formData.append('description', productForm.description || '');
        formData.append('price', Number(productForm.price));
        formData.append('stock', Number(productForm.stock || 0));
        formData.append('status', 'active');
        formData.append('image', productImageFile);

        result = await createProduct(token, formData);
        setProductForm(defaultProductForm);
        setProductImageFile(null);
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

  return {
    mode,
    setMode,
    loading,
    actionLoading,
    error,
    setError,
    success,
    setSuccess,
    stores,
    serviceProfiles,
    categories,
    subcategories,
    storeForm,
    setStoreForm,
    logoFile,
    setLogoFile,
    bannerFile,
    setBannerFile,
    profileForm,
    setProfileForm,
    serviceLogoFile,
    setServiceLogoFile,
    serviceBannerFile,
    setServiceBannerFile,
    serviceForm,
    setServiceForm,
    productForm,
    setProductForm,
    productImageFile,
    setProductImageFile,
    subcategoryForm,
    setSubcategoryForm,
    inlineCatOpen,
    setInlineCatOpen,
    inlineCatName,
    setInlineCatName,
    inlineSubOpen,
    setInlineSubOpen,
    inlineSubName,
    setInlineSubName,
    inlineServCatOpen,
    setInlineServCatOpen,
    inlineServCatName,
    setInlineServCatName,
    availableSubcategories,
    loadData,
    handleSubmit,
  };
}
