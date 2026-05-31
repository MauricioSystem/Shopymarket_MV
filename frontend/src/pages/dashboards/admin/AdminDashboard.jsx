import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName, getProfileImageUrl } from "@/utils/userCapabilities";
import Sidebar from "@/components/Sidebar";
import { ADMIN_SIDEBAR_ITEMS } from "@/config/sidebar.config";
import StoreSetupPage from "../vendor/StoreSetupPage";

import ResumenView from "@/features/admin/components/ResumenView";
import UsersSection from "@/features/users/components/UsersSection";
import StoresSection from "@/features/stores/components/StoresSection";
import CategoriesSection from "@/features/categories/components/CategoriesSection";

import { getAllUsers } from "@/services/usersApi";
import { getAllStores } from "@/services/marketApi";

function getInitials(user) {
  const name = getDisplayName(user);
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
}

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  
  const [activeNav, setActiveNav] = useState("resumen");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedVendorUser, setSelectedVendorUser] = useState(null);

  // Cached data for stats computation
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    if (!token) return;
    const fetchInitialData = async () => {
      try {
        const [usersRes, storesRes] = await Promise.all([
          getAllUsers(token),
          getAllStores(token),
        ]);
        setUsers(usersRes?.data || []);
        setStores(storesRes?.data || []);
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      }
    };
    fetchInitialData();
  }, [token]);

  const stats = useMemo(() => {
    const activeUsers = users.filter(
      (u) =>
        u.status !== "deleted" &&
        u.roles?.[0]?.name !== "super_admin" &&
        u.roles?.[0]?.name !== "administrator"
    );
    const counts = { total: activeUsers.length, admin: 0, cliente: 0, repartidor: 0, stores: stores.length };
    activeUsers.forEach((u) => {
      const role = u.roles?.[0]?.name;
      if (role === "admin") counts.admin++;
      else if (role === "cliente") counts.cliente++;
      else if (role === "repartidor") counts.repartidor++;
    });
    return counts;
  }, [users, stores]);

  const handleSidebarSelect = (id, filter) => {
    setActiveNav(id);
    if (filter) {
      setRoleFilter(filter);
    }
  };

  const getHeaderTitle = () => {
    switch (activeNav) {
      case "categorias":
        return {
          title: "Gestión de Categorías",
          subtitle: "Crea y gestiona las categorías globales de la plataforma.",
        };
      case "tiendas":
        return {
          title: "Gestión de Tiendas y Servicios",
          subtitle: "Aprueba, activa, desactiva y gestiona las tiendas y servicios de la plataforma.",
        };
      case "resumen":
        return {
          title: "Resumen general",
          subtitle: "Supervisa la actividad y el rendimiento de tu plataforma en tiempo real.",
        };
      default:
        return {
          title: "Gestión de Usuarios",
          subtitle: "Explora, filtra y administra las cuentas de la plataforma.",
        };
    }
  };

  const { title, subtitle } = getHeaderTitle();

  if (selectedVendorUser) {
    return (
      <StoreSetupPage
        token={token}
        overrideUser={selectedVendorUser}
        onBack={() => setSelectedVendorUser(null)}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#03070f] text-white">
      <Sidebar
        items={ADMIN_SIDEBAR_ITEMS}
        active={activeNav}
        onSelect={handleSidebarSelect}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#03070f] relative overflow-hidden h-full">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#f5d367]/5 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-white/2 blur-[100px] rounded-full pointer-events-none translate-x-1/3" />

        <header className="flex h-16 items-center justify-between border-b border-white/5 px-8 shrink-0 relative z-20 bg-[#040912]/40 backdrop-blur-md">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#f5d367]">
              PANEL DE CONTROL
            </p>
            <p className="text-xs text-white/60 mt-0.5">Administrador</p>
          </div>

          <div className="relative flex-1 max-w-md mx-8 hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder-white/30 outline-none focus:border-[#f5d367]/40 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-white">{getDisplayName(user)}</p>
                {Number(user?.id) !== 1 && (
                  <p className="text-[0.65rem] text-white/40 mt-0.5">ID #{user?.id}</p>
                )}
              </div>
              <div className="h-9 w-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-xs font-bold text-[#f5d367] overflow-hidden">
                {user?.profile_image_url ? (
                  <img src={getProfileImageUrl(user.profile_image_url)} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  getInitials(user)
                )}
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white p-2.5 transition-all cursor-pointer"
              title="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="mb-8">
            <p className="text-xs font-bold text-[#f5d367] tracking-wider uppercase">
              Bienvenido, Administrador
            </p>
            <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-white/50">
              {subtitle}
            </p>
          </div>

          <div className={activeNav === "resumen" ? "block" : "hidden"}>
            <ResumenView stats={stats} />
          </div>
          
          <div className={activeNav === "categorias" ? "block" : "hidden"}>
            <CategoriesSection token={token} search={search} />
          </div>

          <div className={activeNav === "tiendas" ? "block" : "hidden"}>
            <StoresSection
              token={token}
              search={search}
              onEditStoreAndProducts={setSelectedVendorUser}
              onStoresChange={setStores}
            />
          </div>

          <div className={!["resumen", "categorias", "tiendas"].includes(activeNav) ? "block" : "hidden"}>
            <UsersSection
              token={token}
              search={search}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              onUsersChange={setUsers}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
