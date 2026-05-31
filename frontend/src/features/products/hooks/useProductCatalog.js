import { useCallback, useState } from 'react';
import {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    createSubcategory,
} from '@/services/marketApi';
import { API_BASE_URL } from "@/config/appSettings";

const API_BASE = API_BASE_URL;

const defaultProductForm = {
    name: '',
    description: '',
    price: '',
    stock: '0',
    image_url: '',
    category_id: '',
    subcategory_id: ''
};

export function useProductCatalog({ token, existingStore, refreshCategories }) {
    const [storeProducts, setStoreProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [savingProduct, setSavingProduct] = useState(false);
    const [errorProduct, setErrorProduct] = useState(null);

    const [productForm, setProductForm] = useState(defaultProductForm);
    const [addingProduct, setAddingProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [productImageFile, setProductImageFile] = useState(null);
    const [productImagePreview, setProductImagePreview] = useState(null);

    const loadStoreProducts = useCallback(async (storeId) => {
        if (!storeId) return;
        setLoadingProducts(true);
        try {
            const res = await getAllProducts(token);
            const allProds = Array.isArray(res?.data) ? res.data : [];
            setStoreProducts(allProds.filter(p => p && Number(p.store_id) === Number(storeId) && p.status !== 'inactive'));
        } catch (err) {
            console.error("Error loading products:", err);
        } finally {
            setLoadingProducts(false);
        }
    }, [token]);

    const handleProductImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductImageFile(file);
            setProductImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreateSubcategory = async (name, categoryId) => {
        if (!name || !categoryId) return;
        try {
            const payload = {
                name,
                category_id: Number(categoryId),
                status: 'active'
            };
            if (existingStore?.id) {
                payload.store_id = existingStore.id;
            }
            const result = await createSubcategory(token, payload);
            if (refreshCategories) {
                await refreshCategories();
            }
            return result?.data || result;
        } catch (err) {
            throw new Error(err?.message || 'Error al crear la subcategoría');
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        if (!existingStore?.id) return;
        if (!productImageFile) {
            setErrorProduct('La imagen del producto es obligatoria.');
            return;
        }
        setSavingProduct(true);
        setErrorProduct(null);
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
            formData.append('store_id', existingStore.id);
            formData.append('status', 'active');
            formData.append('image', productImageFile);

            await createProduct(token, formData);
            setProductForm(defaultProductForm);
            setProductImageFile(null);
            setProductImagePreview(null);
            setAddingProduct(false);
            await loadStoreProducts(existingStore.id);
        } catch (err) {
            setErrorProduct(err?.message || 'Error al guardar el producto.');
        } finally {
            setSavingProduct(false);
        }
    };

    const handleEditProductClick = (p) => {
        setEditingProduct(p);
        setProductForm({
            name: p.name || '',
            description: p.description || '',
            price: String(p.price || ''),
            stock: String(p.stock || '0'),
            image_url: p.image_url || '',
            category_id: String(p.category_id || ''),
            subcategory_id: String(p.subcategory_id || '')
        });
        setProductImageFile(null);
        setProductImagePreview(p.image_url ? (p.image_url.startsWith('http') ? p.image_url : `${API_BASE}${p.image_url}`) : null);
        setErrorProduct(null);
        setAddingProduct(false);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        if (!existingStore?.id || !editingProduct?.id) return;
        setSavingProduct(true);
        setErrorProduct(null);
        try {
            const formData = new FormData();
            formData.append('name', productForm.name);
            formData.append('description', productForm.description || '');
            formData.append('price', Number(productForm.price));
            formData.append('stock', Number(productForm.stock || 0));
            if (productForm.category_id) {
                formData.append('category_id', productForm.category_id);
            }
            formData.append('subcategory_id', productForm.subcategory_id || '');
            formData.append('store_id', existingStore.id);
            formData.append('status', 'active');

            if (productImageFile) {
                formData.append('image', productImageFile);
            } else if (productForm.image_url) {
                formData.append('image_url', productForm.image_url);
            }

            await updateProduct(token, editingProduct.id, formData);
            setProductForm(defaultProductForm);
            setProductImageFile(null);
            setProductImagePreview(null);
            setEditingProduct(null);
            await loadStoreProducts(existingStore.id);
        } catch (err) {
            setErrorProduct(err?.message || 'Error al actualizar el producto.');
        } finally {
            setSavingProduct(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto permanentemente de tu catálogo?')) return;
        try {
            await deleteProduct(token, productId);
            if (existingStore?.id) {
                await loadStoreProducts(existingStore.id);
            }
        } catch (err) {
            alert(err?.message || 'Error al eliminar el producto.');
        }
    };

    return {
        storeProducts,
        loadingProducts,
        savingProduct,
        errorProduct,
        productForm,
        setProductForm,
        addingProduct,
        setAddingProduct,
        editingProduct,
        setEditingProduct,
        productImageFile,
        productImagePreview,
        setProductImagePreview,
        setProductImageFile,
        setErrorProduct,
        loadStoreProducts,
        handleProductImageChange,
        handleCreateSubcategory,
        handleCreateProduct,
        handleEditProductClick,
        handleUpdateProduct,
        handleDeleteProduct,
    };
}
