import { useState, useCallback } from "react";
import {
  getAllStores,
  getAllServiceProfiles,
  updateMyStore,
  updateServiceProfile,
  deleteStore,
  deleteServiceProfile,
} from "@/services/marketApi";

export function useStoresData(token) {
  const [stores, setStores] = useState([]);
  const [serviceProfiles, setServiceProfiles] = useState([]);
  const [loadState, setLoadState] = useState("idle"); // idle, loading, error, done
  const [errorMsg, setErrorMsg] = useState("");

  const fetchStoresAndProfiles = useCallback(async () => {
    if (!token) return;
    setLoadState("loading");
    setErrorMsg("");
    try {
      const [storesResult, serviceProfilesResult] = await Promise.all([
        getAllStores(token),
        getAllServiceProfiles(token),
      ]);
      setStores(Array.isArray(storesResult?.data) ? storesResult.data : []);
      setServiceProfiles(Array.isArray(serviceProfilesResult?.data) ? serviceProfilesResult.data : []);
      setLoadState("done");
    } catch (err) {
      setErrorMsg(err.message || "Error al cargar comercios");
      setLoadState("error");
    }
  }, [token]);

  const toggleStoreStatus = useCallback(async (biz) => {
    let newStatus = "active";
    if (biz.status === "active") {
      newStatus = "inactive";
    } else if (biz.status === "pending" || biz.status === "inactive") {
      newStatus = "active";
    }

    try {
      const promises = [];
      if (biz.rawStore) {
        promises.push(updateMyStore(token, biz.rawStore.id, { status: newStatus }));
      }
      if (biz.rawProfile) {
        promises.push(updateServiceProfile(token, biz.rawProfile.id, { status: newStatus }));
      }
      await Promise.all(promises);

      // Refresh data
      const [storesResult, serviceProfilesResult] = await Promise.all([
        getAllStores(token),
        getAllServiceProfiles(token),
      ]);
      setStores(Array.isArray(storesResult?.data) ? storesResult.data : []);
      setServiceProfiles(Array.isArray(serviceProfilesResult?.data) ? serviceProfilesResult.data : []);
      return true;
    } catch (err) {
      throw new Error(err.message || "Error al actualizar el estado del comercio");
    }
  }, [token]);

  const removeBusiness = useCallback(async (biz) => {
    try {
      const promises = [];
      if (biz.rawStore) {
        promises.push(deleteStore(token, biz.rawStore.id));
      }
      if (biz.rawProfile) {
        promises.push(deleteServiceProfile(token, biz.rawProfile.id));
      }
      await Promise.all(promises);

      // Refresh data
      const [storesResult, serviceProfilesResult] = await Promise.all([
        getAllStores(token),
        getAllServiceProfiles(token),
      ]);
      setStores(Array.isArray(storesResult?.data) ? storesResult.data : []);
      setServiceProfiles(Array.isArray(serviceProfilesResult?.data) ? serviceProfilesResult.data : []);
      return true;
    } catch (err) {
      throw new Error(err.message || "Error al eliminar el comercio");
    }
  }, [token]);

  return {
    stores,
    serviceProfiles,
    loadState,
    errorMsg,
    fetchStoresAndProfiles,
    toggleStoreStatus,
    removeBusiness,
  };
}
