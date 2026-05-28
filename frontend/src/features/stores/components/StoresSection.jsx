import React, { useEffect, useState, useMemo } from "react";
import { useStoresData } from "../hooks/useStoresData";
import { getAllUsers } from "@/services/usersApi";
import { getDisplayName } from "@/utils/userCapabilities";

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StoresSection({ token, search, onEditStoreAndProducts, onStoresChange }) {
  const {
    stores,
    serviceProfiles,
    loadState,
    errorMsg,
    fetchStoresAndProfiles,
    toggleStoreStatus,
    removeBusiness,
  } = useStoresData(token);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchStoresAndProfiles();
  }, [fetchStoresAndProfiles]);

  // Report changes back to parent if needed for stats
  useEffect(() => {
    if (stores && onStoresChange) {
      onStoresChange(stores);
    }
  }, [stores, onStoresChange]);

  useEffect(() => {
    if (token) {
      getAllUsers(token)
        .then((res) => setUsers(res.data || []))
        .catch(() => {});
    }
  }, [token]);

  const displayBusinesses = useMemo(() => {
    const list = [];
    
    // Process stores
    stores.forEach((s) => {
      // Find owner user
      const owner = users.find((u) => Number(u.id) === Number(s.admin_user_id));
      // Check if there is a service profile linked to this store or owner
      const hasService = serviceProfiles.some(
        (p) => Number(p.store_id) === Number(s.id) || Number(p.admin_user_id) === Number(s.admin_user_id)
      );
      
      list.push({
        id: `store-${s.id}`,
        dbId: s.id,
        name: s.name || "Sin nombre",
        type: hasService ? "hybrid" : "product",
        ownerName: owner ? getDisplayName(owner) : "Desconocido",
        ownerEmail: owner ? owner.email : "—",
        ownerUser: owner,
        city: s.city || "—",
        country: s.country || "",
        status: s.status || "active",
        created_at: s.created_at,
        rawStore: s,
        rawProfile: serviceProfiles.find(
          (p) => Number(p.store_id) === Number(s.id) || Number(p.admin_user_id) === Number(s.admin_user_id)
        ),
      });
    });

    // Process service profiles that are NOT linked to a store
    serviceProfiles.forEach((p) => {
      const alreadyListed = list.some(
        (item) => Number(item.rawStore?.admin_user_id) === Number(p.admin_user_id)
      );
      if (!alreadyListed) {
        const owner = users.find((u) => Number(u.id) === Number(p.admin_user_id));
        list.push({
          id: `profile-${p.id}`,
          dbId: p.id,
          name: p.name || "Sin nombre",
          type: "service",
          ownerName: owner ? getDisplayName(owner) : "Desconocido",
          ownerEmail: owner ? owner.email : "—",
          ownerUser: owner,
          city: p.city || "—",
          country: p.country || "",
          status: p.status || "active",
          created_at: p.created_at,
          rawStore: null,
          rawProfile: p,
        });
      }
    });

    // Apply search filter if any
    if (search.trim()) {
      const q = search.toLowerCase();
      return list.filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.ownerName?.toLowerCase().includes(q) ||
          b.ownerEmail?.toLowerCase().includes(q) ||
          b.city?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [stores, serviceProfiles, users, search]);

  const handleToggleStatus = async (biz) => {
    try {
      await toggleStoreStatus(biz);
    } catch (err) {
      alert(err.message || "Error al cambiar estado");
    }
  };

  const handleDelete = async (biz) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar permanentemente el comercio "${biz.name}"? Esta acción borrará la tienda, sus productos/servicios y no se puede deshacer.`
      )
    ) {
      return;
    }
    try {
      await removeBusiness(biz);
    } catch (err) {
      alert(err.message || "Error al eliminar");
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#080f1c]/40 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          Tiendas y Comercios Registrados
          <span className="text-xs font-semibold text-white/30 bg-white/5 rounded-full px-2.5 py-0.5">
            ({displayBusinesses.length})
          </span>
        </h2>
      </div>

      {loadState === "loading" && (
        <div className="flex items-center justify-center gap-3 py-24 opacity-40">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#f5d367]" />
          <span className="text-sm font-semibold">Cargando comercios…</span>
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
                  Negocio
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Propietario
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Registro
                </th>
                <th className="px-6 py-3 text-right text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.02]">
              {displayBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-sm text-white/40">
                    No hay tiendas registradas aún.
                  </td>
                </tr>
              ) : (
                displayBusinesses.map((biz) => {
                  let statusColor = "border-white/10 bg-white/5 text-white/60";
                  let statusLabel = "Desconocido";
                  if (biz.status === "active") {
                    statusColor = "border-green-500/30 bg-green-500/5 text-green-400";
                    statusLabel = "Activo";
                  } else if (biz.status === "inactive") {
                    statusColor = "border-red-500/30 bg-red-500/5 text-red-400";
                    statusLabel = "Inactivo";
                  } else if (biz.status === "pending") {
                    statusColor = "border-yellow-500/30 bg-yellow-500/5 text-yellow-400";
                    statusLabel = "Pendiente";
                  }

                  return (
                    <tr key={biz.id} className="hover:bg-white/[0.01] transition-colors duration-150">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white truncate max-w-[200px]">{biz.name}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${
                            biz.type === "product"
                              ? "border-[#f5d367]/30 bg-[#f5d367]/5 text-[#f5d367]"
                              : biz.type === "service"
                              ? "border-blue-500/30 bg-blue-500/5 text-blue-400"
                              : "border-purple-500/30 bg-purple-500/5 text-purple-400"
                          }`}
                        >
                          {biz.type === "product" && "🛍️ Producto"}
                          {biz.type === "service" && "🔧 Servicio"}
                          {biz.type === "hybrid" && "🏪 Híbrido"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{biz.ownerName}</p>
                          <p className="text-[0.68rem] text-white/40 truncate">{biz.ownerEmail}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-white/60">
                        {[biz.city, biz.country].filter(Boolean).join(", ") || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-white/50">{formatDate(biz.created_at)}</td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {biz.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(biz)}
                              className="rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                              title="Aprobar Tienda"
                            >
                              ✔️ Aprobar
                            </button>
                          )}
                          {biz.status === "active" && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(biz)}
                              className="rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                              title="Desactivar Tienda"
                            >
                              ❌ Desactivar
                            </button>
                          )}
                          {biz.status === "inactive" && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(biz)}
                              className="rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                              title="Activar Tienda"
                            >
                              ✔️ Activar
                            </button>
                          )}

                          {biz.ownerUser && onEditStoreAndProducts && (
                            <button
                              type="button"
                              onClick={() => onEditStoreAndProducts(biz.ownerUser)}
                              className="text-white/40 hover:text-[#f5d367] p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer border border-white/5"
                              title="Editar Tienda/Productos"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.08a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(biz)}
                            className="text-white/40 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer border border-white/5"
                            title="Eliminar comercio"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
