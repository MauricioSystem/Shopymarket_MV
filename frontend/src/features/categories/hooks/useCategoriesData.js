import { useState, useCallback } from "react";
import { getAllCategories, createCategory, deleteCategory, updateCategory } from "@/services/marketApi";

export function useCategoriesData(token) {
  const [categories, setCategories] = useState([]);
  const [loadState, setLoadState] = useState("idle"); // idle, loading, error, done
  const [errorMsg, setErrorMsg] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setLoadState("loading");
    setErrorMsg("");
    try {
      const result = await getAllCategories(token);
      setCategories(Array.isArray(result?.data) ? result.data : []);
      setLoadState("done");
    } catch (err) {
      setErrorMsg(err.message || "Error al cargar categorías");
      setLoadState("error");
    }
  }, [token]);

  const addCategory = useCallback(async (payload) => {
    setCategorySubmitting(true);
    setCategoryError("");
    try {
      await createCategory(token, payload);
      const result = await getAllCategories(token);
      setCategories(Array.isArray(result?.data) ? result.data : []);
      return true;
    } catch (err) {
      setCategoryError(err.message || "Error al crear la categoría");
      throw new Error(err.message || "Error al crear la categoría");
    } finally {
      setCategorySubmitting(false);
    }
  }, [token]);

  const editCategory = useCallback(async (catId, payload) => {
    setCategorySubmitting(true);
    setCategoryError("");
    try {
      await updateCategory(token, catId, payload);
      const result = await getAllCategories(token);
      setCategories(Array.isArray(result?.data) ? result.data : []);
      return true;
    } catch (err) {
      setCategoryError(err.message || "Error al modificar la categoría");
      throw new Error(err.message || "Error al modificar la categoría");
    } finally {
      setCategorySubmitting(false);
    }
  }, [token]);

  const removeCategory = useCallback(async (catId) => {
    try {
      await deleteCategory(token, catId);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      return true;
    } catch (err) {
      throw new Error(err.message || "Error al eliminar la categoría");
    }
  }, [token]);

  return {
    categories,
    loadState,
    errorMsg,
    categorySubmitting,
    categoryError,
    setCategoryError,
    fetchCategories,
    addCategory,
    removeCategory,
    editCategory,
  };
}
