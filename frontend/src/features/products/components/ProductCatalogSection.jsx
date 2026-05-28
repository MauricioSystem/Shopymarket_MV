import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useProductCatalog } from '../hooks/useProductCatalog';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

function FieldGroup({ children }) {
    return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function ProductCatalogSection({
    token,
    existingStore,
    categories,
    subcategories,
    refreshCategories,
}) {
    const {
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
    } = useProductCatalog({ token, existingStore, refreshCategories });

    const [inlineSubOpen, setInlineSubOpen] = useState(false);
    const [inlineSubName, setInlineSubName] = useState('');

    useEffect(() => {
        if (existingStore?.id) {
            loadStoreProducts(existingStore.id);
        }
    }, [existingStore?.id, loadStoreProducts]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">📦 Gestión de Productos</h2>
                    <p className="text-xs text-white/40 mt-1">Crea y visualiza los artículos físicos o digitales de tu tienda.</p>
                </div>
                {!addingProduct && !editingProduct && (
                    <Button
                        onClick={() => {
                            setAddingProduct(true);
                            setEditingProduct(null);
                            setProductForm({
                                name: '',
                                description: '',
                                price: '',
                                stock: '0',
                                image_url: '',
                                category_id: '',
                                subcategory_id: ''
                            });
                            setProductImageFile(null);
                            setProductImagePreview(null);
                            setErrorProduct(null);
                        }}
                        className="bg-[#f5d367] text-[#120c00] font-bold text-xs py-2 px-5 hover:opacity-90 shadow-[0_4px_15px_rgba(245,211,103,0.2)]"
                    >
                        + Agregar Producto
                    </Button>
                )}
            </div>

            {(addingProduct || editingProduct) && (
                <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="rounded-2xl border border-[#f5d367]/20 bg-white/[0.03] p-6 space-y-5">
                    <div className="border-b border-white/5 pb-2">
                        <h3 className="text-sm font-bold text-[#f5d367] uppercase tracking-wider">
                            {editingProduct ? 'Editar producto' : 'Agregar nuevo producto'}
                        </h3>
                    </div>

                    <FieldGroup>
                        <Input
                            label="Nombre del producto *"
                            name="p_name"
                            value={productForm.name}
                            onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                            required
                        />
                        <Input
                            label="Precio (Bs) *"
                            name="p_price"
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))}
                            required
                        />
                        <Input
                            label="Stock *"
                            name="p_stock"
                            type="number"
                            value={productForm.stock}
                            onChange={(e) => setProductForm(p => ({ ...p, stock: e.target.value }))}
                            required
                        />
                        <div className="space-y-2">
                            <Select
                                label="Categoría *"
                                name="p_category"
                                value={productForm.category_id}
                                onChange={(e) => setProductForm(p => ({ ...p, category_id: e.target.value, subcategory_id: '' }))}
                                options={[
                                    { label: 'Selecciona una categoría', value: '' },
                                    ...categories.filter(c => c.type === 'product').map(c => ({ value: c.id, label: c.name }))
                                ]}
                                required
                            />
                            {categories.filter(c => c.type === 'product').length === 0 && (
                                <p className="text-xs text-amber-400/70">⚠️ El administrador aún no ha creado categorías de productos. Puedes guardar tu producto sin categoría por ahora.</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <Select
                                        label="Subcategoría (opcional)"
                                        name="p_subcategory"
                                        value={productForm.subcategory_id}
                                        onChange={(e) => setProductForm(p => ({ ...p, subcategory_id: e.target.value }))}
                                        options={[
                                            { label: 'Selecciona una subcategoría', value: '' },
                                            ...subcategories.filter(s => Number(s.category_id) === Number(productForm.category_id)).map(s => ({ value: s.id, label: s.name }))
                                        ]}
                                    />
                                </div>
                                <button
                                    type="button"
                                    disabled={!productForm.category_id}
                                    onClick={() => setInlineSubOpen(prev => !prev)}
                                    className="h-10 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl text-[#f5d367] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    + Crear
                                </button>
                            </div>
                            {inlineSubOpen && (
                                <div className="p-3 bg-white/5 border border-[#f5d367]/20 rounded-xl space-y-2 mt-2">
                                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#f5d367]">Nueva Subcategoría</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Ej: Calzado, Camisetas..."
                                            value={inlineSubName}
                                            onChange={(e) => setInlineSubName(e.target.value)}
                                            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!inlineSubName || !productForm.category_id) return;
                                                try {
                                                    const newSub = await handleCreateSubcategory(inlineSubName, productForm.category_id);
                                                    if (newSub) {
                                                        setProductForm(p => ({ ...p, subcategory_id: newSub.id }));
                                                    }
                                                    setInlineSubName('');
                                                    setInlineSubOpen(false);
                                                } catch (err) {
                                                    alert(err.message);
                                                }
                                            }}
                                            className="bg-[#f5d367] text-[#120c00] font-bold text-xs px-3 py-1.5 rounded-xl hover:opacity-90"
                                        >
                                            Guardar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInlineSubOpen(false)}
                                            className="bg-white/10 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-white/15"
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Input
                            label={editingProduct ? "Imagen del producto" : "Imagen del producto *"}
                            name="p_image"
                            type="file"
                            accept=".png, .jpg, .jpeg"
                            onChange={handleProductImageChange}
                            required={!editingProduct}
                            helperText={editingProduct ? "Dejar vacío para conservar la imagen actual. Formatos: PNG, JPG o JPEG. Máx: 5MB" : "Formatos permitidos: PNG, JPG o JPEG. Máx: 5MB"}
                        />
                    </FieldGroup>

                    {productImagePreview && (
                        <div className="mt-2">
                            <p className="text-xs text-white/40 mb-1">Previsualización de la imagen:</p>
                            <img src={productImagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-white/10" />
                        </div>
                    )}

                    <Input
                        label="Descripción del producto"
                        name="p_desc"
                        value={productForm.description}
                        onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                    />

                    {errorProduct && (
                        <div className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                            ⚠️ {errorProduct}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end pt-2">
                        <Button type="button" variant="secondary" onClick={() => {
                            setAddingProduct(false);
                            setEditingProduct(null);
                            setProductForm({
                                name: '',
                                description: '',
                                price: '',
                                stock: '0',
                                image_url: '',
                                category_id: '',
                                subcategory_id: ''
                            });
                            setProductImageFile(null);
                            setProductImagePreview(null);
                            setErrorProduct(null);
                        }}>
                            Cancelar
                        </Button>
                        <Button type="submit" loading={savingProduct} className="bg-[#f5d367] text-[#120c00] font-bold px-6">
                            {editingProduct ? 'Guardar cambios' : 'Agregar al catálogo'}
                        </Button>
                    </div>
                </form>
            )}

            {loadingProducts ? (
                <div className="text-sm text-white/40 text-center py-10 animate-pulse">Cargando productos del catálogo...</div>
            ) : storeProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center text-sm text-white/40">
                    🛍️ Aún no has publicado ningún producto en tu catálogo.
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {storeProducts.map(p => {
                        const pImg = p.image_url ? (p.image_url.startsWith('http') ? p.image_url : `${API_BASE}${p.image_url}`) : null;
                        return (
                            <div key={p.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 flex flex-col justify-between space-y-3 hover:border-white/10 transition-colors">
                                <div className="h-36 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center relative">
                                    {pImg ? (
                                        <img src={pImg} alt={p.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl opacity-20">🛍️</span>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm text-white truncate">{p.name}</p>
                                        <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{p.description || 'Sin descripción'}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                                        <p className="text-sm font-extrabold text-[#f5d367]">Bs {Number(p.price).toFixed(2)}</p>
                                        <p className="text-[0.65rem] text-white/30">Stock: {p.stock}</p>
                                    </div>
                                    <div className="flex gap-2 pt-3 mt-3 border-t border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => handleEditProductClick(p)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-[#f5d367]/10 text-xs font-bold text-white/80 hover:text-[#f5d367] border border-white/5 hover:border-[#f5d367]/20 transition-all cursor-pointer"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteProduct(p.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-xs font-bold text-red-400/80 hover:text-red-400 border border-red-500/5 hover:border-red-500/20 transition-all cursor-pointer"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
