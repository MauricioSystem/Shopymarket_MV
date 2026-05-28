import { useState, useCallback } from "react";
import { getAllUsers, createUser, updateUserProfile, deleteUser } from "@/services/usersApi";

export function useUsersData(token) {
  const [users, setUsers] = useState([]);
  const [loadState, setLoadState] = useState("idle"); // idle, loading, error, done
  const [errorMsg, setErrorMsg] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoadState("loading");
    setErrorMsg("");
    try {
      const result = await getAllUsers(token);
      setUsers(result.data || []);
      setLoadState("done");
    } catch (err) {
      setErrorMsg(err.message || "Error al cargar usuarios");
      setLoadState("error");
    }
  }, [token]);

  const addUser = useCallback(async (payload) => {
    setModalSubmitting(true);
    try {
      await createUser(token, payload);
      const result = await getAllUsers(token);
      setUsers(result.data || []);
      return true;
    } catch (err) {
      throw new Error(err.message || "Error al crear usuario");
    } finally {
      setModalSubmitting(false);
    }
  }, [token]);

  const updateUser = useCallback(async (userId, payload) => {
    setModalSubmitting(true);
    try {
      await updateUserProfile(token, userId, payload);
      const result = await getAllUsers(token);
      setUsers(result.data || []);
      return true;
    } catch (err) {
      throw new Error(err.message || "Error al actualizar usuario");
    } finally {
      setModalSubmitting(false);
    }
  }, [token]);

  const removeUser = useCallback(async (userId) => {
    setDeleteSubmitting(true);
    try {
      await deleteUser(token, userId);
      const result = await getAllUsers(token);
      setUsers(result.data || []);
      return true;
    } catch (err) {
      throw new Error(err.message || "Error al eliminar usuario");
    } finally {
      setDeleteSubmitting(false);
    }
  }, [token]);

  return {
    users,
    setUsers,
    loadState,
    errorMsg,
    modalSubmitting,
    deleteSubmitting,
    fetchUsers,
    addUser,
    updateUser,
    removeUser,
  };
}
