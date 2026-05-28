import React from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export function SubcategoryForm({ subcategoryForm, setSubcategoryForm, categories, stores }) {
  return (
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
      <Input
        label="Nombre de la subcategoría"
        name="name"
        value={subcategoryForm.name}
        onChange={(event) => setSubcategoryForm((current) => ({ ...current, name: event.target.value }))}
        required
      />
    </div>
  );
}
