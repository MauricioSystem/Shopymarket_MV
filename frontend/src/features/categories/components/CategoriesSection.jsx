import React, { useEffect, useState, useMemo } from "react";
import { useCategoriesData } from "../hooks/useCategoriesData";

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CategoriesSection({ token, search, onCategoriesChange }) {
  const {
    categories,
    loadState,
    errorMsg,
    categorySubmitting,
    categoryError,
    setCategoryError,
    fetchCategories,
    addCategory,
    removeCategory,
  } = useCategoriesData(token);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", type: "product", description: "" });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Report changes back to parent if needed for stats
  useEffect(() => {
    if (categories && onCategoriesChange) {
      onCategoriesChange(categories);
    }
  }, [categories, onCategoriesChange]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const handleOpenAddCategoryModal = () => {
    setCategoryForm({ name: "", type: "product", description: "" });
    setCategoryError("");
    setIsCategoryModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setCategoryError("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      await addCategory({
        name: categoryForm.name.trim(),
        type: categoryForm.type,
        description: categoryForm.description.trim(),
      });
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: "", type: "product", description: "" });
    } catch (err) {
      // Error handled by hook state
    }
  };

  const handleDelete = async (catId) => {
    if (
      !window.confirm(
        "¿Eliminar esta categoría? Los productos que la usen quedarán sin categoría."
      )
    ) {
      return;
    }
    try {
      await removeCategory(catId);
    } catch (err) {
      alert(err.message || "Error al eliminar la categoría");
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#080f1c]/40 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          Categorías Globales
          <span className="text-xs font-semibold text-white/30 bg-white/5 rounded-full px-2.5 py-0.5">
            ({filteredCategories.length})
          </span>
        </h2>

        <button
          type="button"
          onClick={handleOpenAddCategoryModal}
          className="rounded-full border border-[#f5d367] bg-[#f5d367]/10 px-4 py-2 text-xs font-bold text-[#f5d367] hover:bg-[#f5d367]/20 hover:text-white transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(245,211,103,0.1)] w-fit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar Categoría
        </button>
      </div>

      {loadState === "loading" && (
        <div className="flex items-center justify-center gap-3 py-24 opacity-40">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#f5d367]" />
          <span className="text-sm font-semibold">Cargando categorías…</span>
        </div>
      )}

      {loadState === "error" && (
        <div className="flex flex-col items-center justify-center gap-2 py-24">
          <p className="text-2xl">⚠️</p>
          <p className="text-sm text-red-400 font-semibold">{errorMsg}</p>
        </div>
      )}

      {loadState === "done" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Creado
                </th>
                <th className="px-6 py-3 text-right text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.02]">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-sm text-white/40">
                    No hay categorías registradas aún.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.01] transition-colors duration-150">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{cat.name}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${
                          cat.type === "product"
                            ? "border-[#f5d367]/30 bg-[#f5d367]/5 text-[#f5d367]"
                            : "border-blue-500/30 bg-blue-500/5 text-blue-400"
                        }`}
                      >
                        {cat.type === "product" ? "🛍️ Producto" : "🔧 Servicio"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-white/60">
                      <p className="truncate">{cat.description || "—"}</p>
                    </td>

                    <td className="px-6 py-4 text-white/50">{formatDate(cat.created_at)}</td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          className="text-white/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                          title="Eliminar categoría"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-[#03070f]/80 backdrop-blur-md"
            onClick={() => !categorySubmitting && setIsCategoryModalOpen(false)}
          />

          <div className="relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-[#080f1c] shadow-2xl transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Agregar Nueva Categoría</h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
                disabled={categorySubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {categoryError && (
              <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 text-xs font-semibold text-red-400">
                {categoryError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
              <div>
                <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                  Nombre de categoría *
                </label>
                <input
                  type="text"
                  name="category_name"
                  autoComplete="off"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                  placeholder="Ej. Electrónica"
                  disabled={categorySubmitting}
                />
              </div>

              <div>
                <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                  Tipo de Categoría *
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCategoryForm((prev) => ({ ...prev, type: "product" }))}
                    className={`flex-1 rounded-2xl py-3 px-4 text-sm font-bold border transition-all ${
                      categoryForm.type === "product"
                        ? "border-[#f5d367] bg-[#f5d367]/10 text-[#f5d367]"
                        : "border-white/10 bg-[#040912]/80 text-white/50 hover:border-white/20"
                    }`}
                  >
                    🛍️ Producto
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryForm((prev) => ({ ...prev, type: "service" }))}
                    className={`flex-1 rounded-2xl py-3 px-4 text-sm font-bold border transition-all ${
                      categoryForm.type === "service"
                        ? "border-blue-400 bg-blue-500/10 text-blue-400"
                        : "border-white/10 bg-[#040912]/80 text-white/50 hover:border-white/20"
                    }`}
                  >
                    🔧 Servicio
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                  Descripción
                </label>
                <textarea
                  name="category_description"
                  autoComplete="off"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all resize-none"
                  placeholder="Descripción opcional..."
                  rows={3}
                  disabled={categorySubmitting}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  disabled={categorySubmitting}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={categorySubmitting}
                  className="rounded-full bg-[#f5d367] text-[#120c00] hover:bg-[#ffeb99] transition-colors px-6 py-2.5 text-xs font-bold shadow-[0_4px_16px_rgba(245,211,103,0.15)] flex items-center gap-2 disabled:opacity-50"
                >
                  {categorySubmitting && (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  )}
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
