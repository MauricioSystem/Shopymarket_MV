import React from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export function VendorCategoriesSection({
    categories,
    subcategories,
    handleCreateSubcategory,
}) {
    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-white">🗂️ Categorías de la Plataforma</h2>
                    <p className="text-xs text-white/40 mt-1">Categorías globales disponibles en la plataforma para clasificar tus productos o servicios.</p>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3">
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Existentes ({categories.length})</p>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {categories.map(c => (
                            <div key={c.id} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5 text-xs">
                                <span className="font-medium text-white">{c.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-white">🏷️ Crea tus Categorias Personalizadas</h2>
                    <p className="text-xs text-white/40 mt-1">Crea subcategorías específicas para organizar los productos de tu tienda.</p>
                </div>

                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    const name = form.sub_name.value;
                    const catId = form.sub_cat.value;
                    if (!name || !catId) return;
                    try {
                        await handleCreateSubcategory(name, catId);
                        form.reset();
                    } catch (err) {
                        alert(err.message);
                    }
                }} className="space-y-4">
                    <Input label="Categorías para tu Tienda*" name="sub_name" required placeholder="Ej: Camisas, Zapatos..." />
                    <Select
                        label="Categoría de Busqueda*"
                        name="sub_cat"
                        required
                        options={[
                            { label: 'Selecciona una categoría', value: '' },
                            ...categories.map(c => ({ value: c.id, label: `${c.name} (${c.type === 'product' ? 'Producto' : 'Servicio'})` }))
                        ]}
                    />
                    <Button type="submit" className="bg-blue-500 text-white font-bold text-xs w-full">
                        Crear Subcategoría
                    </Button>
                </form>
            </div>
        </div>
    );
}
