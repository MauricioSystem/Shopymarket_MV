import React from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { createCategory, createSubcategory } from '@/services/marketApi';

export function ProductForm({
  token,
  productForm,
  setProductForm,
  stores,
  categories,
  availableSubcategories,
  inlineCatOpen,
  setInlineCatOpen,
  inlineCatName,
  setInlineCatName,
  inlineSubOpen,
  setInlineSubOpen,
  inlineSubName,
  setInlineSubName,
  setProductImageFile,
  loadData,
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Select
        label="Tienda"
        name="store_id"
        value={productForm.store_id}
        onChange={(event) => setProductForm((current) => ({ ...current, store_id: event.target.value }))}
        options={[{ label: 'Selecciona una tienda', value: '' }, ...stores.map((store) => ({ value: store.id, label: store.name || `Tienda ${store.id}` }))]}
        required
      />
      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select
              label="Categoría"
              name="category_id"
              value={productForm.category_id}
              onChange={(event) => setProductForm((current) => ({ ...current, category_id: event.target.value, subcategory_id: '' }))}
              options={[{ label: 'Selecciona una categoría', value: '' }, ...categories.filter(c => c && c.type === 'product').map((category) => ({ value: category.id, label: category.name || `Categoría ${category.id}` }))]}
              required
            />
          </div>
          <button
            type="button"
            onClick={() => setInlineCatOpen(prev => !prev)}
            className="h-10 px-3 bg-slate-900 border border-slate-200 text-[#0f172a] hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
          >
            + Crear
          </button>
        </div>
        {inlineCatOpen && (
          <div className="p-3 border border-slate-200 rounded-xl space-y-2 mt-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Nueva Categoría de Producto</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: Deportes, Juguetes..."
                value={inlineCatName}
                onChange={(e) => setInlineCatName(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!inlineCatName) return;
                  try {
                    const newCat = await createCategory(token, { name: inlineCatName, type: 'product' });
                    const savedCat = newCat?.data || newCat;
                    if (savedCat) {
                      setProductForm(p => ({ ...p, category_id: savedCat.id }));
                      await loadData();
                    }
                    setInlineCatName('');
                    setInlineCatOpen(false);
                  } catch (err) {
                    alert(err.message);
                  }
                }}
                className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:opacity-90"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setInlineCatOpen(false)}
                className="border border-slate-200 text-slate-500 font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-slate-50"
              >
                X
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select
              label="Subcategoría (opcional)"
              name="subcategory_id"
              value={productForm.subcategory_id}
              onChange={(event) => setProductForm((current) => ({ ...current, subcategory_id: event.target.value }))}
              options={[{ label: 'Selecciona una subcategoría', value: '' }, ...availableSubcategories.map((item) => ({ value: item.id, label: item.name || `Subcategoría ${item.id}` }))]}
            />
          </div>
          <button
            type="button"
            disabled={!productForm.category_id}
            onClick={() => setInlineSubOpen(prev => !prev)}
            className="h-10 px-3 bg-slate-900 border border-slate-200 text-[#0f172a] hover:bg-slate-50 text-xs font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            + Crear
          </button>
        </div>
        {inlineSubOpen && (
          <div className="p-3 border border-slate-200 rounded-xl space-y-2 mt-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Nueva Subcategoría</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: Calzado, Camisetas..."
                value={inlineSubName}
                onChange={(e) => setInlineSubName(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!inlineSubName || !productForm.category_id) return;
                  try {
                    const payload = {
                      name: inlineSubName,
                      category_id: Number(productForm.category_id),
                      status: 'active'
                    };
                    if (productForm.store_id) {
                      payload.store_id = productForm.store_id;
                    }
                    const newSub = await createSubcategory(token, payload);
                    const savedSub = newSub?.data || newSub;
                    if (savedSub) {
                      setProductForm(p => ({ ...p, subcategory_id: savedSub.id }));
                      await loadData();
                    }
                    setInlineSubName('');
                    setInlineSubOpen(false);
                  } catch (err) {
                    alert(err.message);
                  }
                }}
                className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:opacity-90"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setInlineSubOpen(false)}
                className="border border-slate-200 text-slate-500 font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-slate-50"
              >
                X
              </button>
            </div>
          </div>
        )}
      </div>

      <Input
        label="Imagen del producto *"
        name="image"
        type="file"
        accept=".png, .jpg, .jpeg"
        onChange={(event) => setProductImageFile(event.target.files[0])}
        required
      />
      <Input
        label="Nombre del producto"
        name="name"
        value={productForm.name}
        onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
        required
      />
      <Input
        label="Precio"
        name="price"
        type="number"
        step="0.01"
        value={productForm.price}
        onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
        required
        prefix="$"
      />
      <Input
        label="Stock"
        name="stock"
        type="number"
        value={productForm.stock}
        onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
      />
      <Input
        label="URL de imagen"
        name="image_url"
        value={productForm.image_url}
        onChange={(event) => setProductForm((current) => ({ ...current, image_url: event.target.value }))}
      />
      <Input
        label="Descripción"
        name="description"
        value={productForm.description}
        onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
      />
    </div>
  );
}
