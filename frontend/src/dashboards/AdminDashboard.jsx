import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllUsers, createUser, updateUserProfile, deleteUser } from "@/services/usersApi";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "@/services/marketApi";
import { getDisplayName, filterAdminUsers, getProfileImageUrl } from "@/utils/userCapabilities";
import { normalizeFrontendRole, getRoleLabel, AUTH_ROLES } from "@/utils/authRoles";


function getInitials(user) {
  const name = getDisplayName(user);
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getInitialsFromName(first, last) {
  const f = first?.[0] || "";
  const l = last?.[0] || "";
  return [f, l].filter(Boolean).join("").toUpperCase() || "?";
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const LogoIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className={className} fill="currentColor">
    <path d="M4 22h14M2 32h20M6 42h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M22 20h22v18H22z" />
    <path d="M44 26l8 4v8h-8z" />
    <path d="M45 28l4 2v4h-4z" className="text-[#040912] fill-current" />
    <circle cx="28" cy="42" r="5" />
    <circle cx="28" cy="42" r="2" className="text-[#040912] fill-current" />
    <circle cx="44" cy="42" r="5" />
    <circle cx="44" cy="42" r="2" className="text-[#040912] fill-current" />
  </svg>
);

const HomeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 21c-2.243 0-4.32-.647-6.073-1.757v-.13c0-2.257 1.83-4.086 4.087-4.086h2.217c2.257 0 4.087 1.83 4.087 4.086v.117Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.086 9.75a3.375 3.375 0 1 0 0-6.75 3.375 3.375 0 0 0 0 6.75ZM21 9.75a2.625 2.625 0 1 0 0-5.25 2.625 2.625 0 0 0 0 5.25Z" />
  </svg>
);

const StoreIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.5a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
  </svg>
);

const CartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
);

const TruckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125a1.125 1.125 0 0 0 1.125-1.125V9.75M8.25 18.75V14.25m0 0H12m.75 1.5h2.25m-.75-3.75h3L17.25 9.75h-3.75M19.5 14.25h1.125A1.125 1.125 0 0 0 22 13.125V9.75m-9-3.75h.008v.008H13V6Zm3.75 0h.008v.008H16.75V6ZM13 9.75h.008v.008H13V9.75Zm3.75 0h.008v.008H16.75V9.75Z" />
  </svg>
);

function RoleBadge({ roleName }) {
  const norm = normalizeFrontendRole(roleName);
  const label = getRoleLabel(roleName);

  let border = "border-white/10";
  let bg = "bg-white/5";
  let text = "text-white/60";

  if (norm === AUTH_ROLES.ADMINISTRATOR || norm === AUTH_ROLES.DELIVERY) {
    border = "border-[#f5d367]/30";
    bg = "bg-[#f5d367]/5";
    text = "text-[#f5d367]";
  } else if (norm === AUTH_ROLES.VENDOR) {
    border = "border-blue-500/30";
    bg = "bg-blue-500/5";
    text = "text-blue-400";
  } else if (norm === AUTH_ROLES.CUSTOMER) {
    border = "border-green-500/30";
    bg = "bg-green-500/5";
    text = "text-green-400";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[0.68rem] font-semibold tracking-wide ${bg} ${border} ${text}`}
    >
      {label}
    </span>
  );
}

function MetricCard({ label, value, icon: Icon }) {
  return (
    <div className="relative overflow-hidden bg-[#080f1c]/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-[#f5d367]/20 group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/40">{label}</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-white tabular-nums">{value}</p>
        </div>
        <div className="border border-[#f5d367]/20 bg-[#f5d367]/5 rounded-xl p-2.5 text-[#f5d367] shadow-[0_0_12px_rgba(245,211,103,0.06)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-10 w-full overflow-hidden pointer-events-none opacity-80">
        <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5d367" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f5d367" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,30 Q30,22 60,32 T120,18 T180,28 T200,20 L200,40 L0,40 Z"
            fill={`url(#grad-${label})`}
          />
          <path
            d="M0,30 Q30,22 60,32 T120,18 T180,28 T200,20"
            fill="none"
            stroke="#f5d367"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { token, user, logout, setCurrentView } = useAuth();
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadState, setLoadState] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeNav, setActiveNav] = useState("resumen");

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  // User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingUser, setEditingUser] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formErrorMsg, setFormErrorMsg] = useState("");

  const initialFormState = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "Bolivia",
    city: "Santa Cruz",
    address: "",
    role_id: "3",
  };
  const [formData, setFormData] = useState(initialFormState);

  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleOpenAddCategoryModal = () => {
    setCategoryForm({ name: "", description: "" });
    setCategoryError("");
    setIsCategoryModalOpen(true);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setCategoryError("El nombre de la categoría es obligatorio.");
      return;
    }

    setCategorySubmitting(true);
    setCategoryError("");

    try {
      await createCategory(token, {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
      });

      const result = await getAllCategories(token);
      setCategories(Array.isArray(result?.data) ? result.data : []);
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: "", description: "" });
    } catch (err) {
      setCategoryError(err.message || "Error al crear la categoría");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setEditingUser(null);
    setModalMode("add");
    setValidationErrors({});
    setFormErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    let rawPhone = u.phone || "";
    if (rawPhone.startsWith("+591")) {
      rawPhone = rawPhone.substring(4);
    }

    setFormData({
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      email: u.email || "",
      password: "",
      confirmPassword: "",
      phone: rawPhone,
      country: u.country || "Bolivia",
      city: u.city || "Santa Cruz",
      address: u.address || "",
      role_id: String(u.roles?.[0]?.id || "3"),
    });
    setEditingUser(u);
    setModalMode("edit");
    setValidationErrors({});
    setFormErrorMsg("");
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) {
      errors.first_name = "El nombre es obligatorio.";
    }
    if (!formData.last_name.trim()) {
      errors.last_name = "El apellido es obligatorio.";
    }

    const phoneTrim = formData.phone.trim();
    if (!phoneTrim) {
      errors.phone = "El teléfono es obligatorio.";
    } else if (!/^\d{8}$/.test(phoneTrim)) {
      errors.phone = "El teléfono debe tener exactamente 8 dígitos.";
    }

    if (!formData.country.trim()) {
      errors.country = "El país es obligatorio.";
    }
    if (!formData.city.trim()) {
      errors.city = "La ciudad es obligatoria.";
    }
    if (!formData.address.trim()) {
      errors.address = "La dirección es obligatoria.";
    }

    const emailValue = formData.email.trim().toLowerCase();
    if (!emailValue) {
      errors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      errors.email = "El formato de correo no es válido.";
    } else if (modalMode === "add") {
      const domain = emailValue.split("@")[1];
      if (domain !== "gmail.com" && domain !== "googlemail.com") {
        errors.email = "El correo debe ser de Gmail (@gmail.com o @googlemail.com).";
      }
    } else if (modalMode === "edit" && editingUser) {
      if (emailValue !== editingUser.email.toLowerCase()) {
        const domain = emailValue.split("@")[1];
        if (domain !== "gmail.com" && domain !== "googlemail.com") {
          errors.email = "El correo debe ser de Gmail (@gmail.com o @googlemail.com).";
        }
      }
    }

    if (modalMode === "add") {
      if (!formData.password) {
        errors.password = "La contraseña es obligatoria.";
      } else if (formData.password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres.";
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = "La confirmación de contraseña es obligatoria.";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden.";
      }
    } else {
      if (formData.password) {
        if (formData.password.length < 6) {
          errors.password = "La contraseña debe tener al menos 6 caracteres.";
        }
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = "Las contraseñas no coinciden.";
        }
      }
    }

    return errors;
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setModalSubmitting(true);
    setFormErrorMsg("");

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: `+591${formData.phone.trim()}`,
      country: formData.country.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    if (modalMode === "add") {
      payload.email = formData.email.trim().toLowerCase();
      payload.role_id = parseInt(formData.role_id, 10);
    } else {
      if (formData.email.trim().toLowerCase() !== editingUser.email.toLowerCase()) {
        payload.email = formData.email.trim().toLowerCase();
      }
    }

    try {
      if (modalMode === "add") {
        await createUser(token, payload);
      } else {
        await updateUserProfile(token, editingUser.id, payload);
      }

      const result = await getAllUsers(token);
      setUsers(result.data || []);
      setIsModalOpen(false);
    } catch (err) {
      setFormErrorMsg(err.message || "Error al procesar la solicitud");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleOpenDeleteConfirm = (u) => {
    setUserToDelete(u);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteSubmitting(true);
    try {
      await deleteUser(token, userToDelete.id);
      const result = await getAllUsers(token);
      setUsers(result.data || []);
      setUserToDelete(null);
    } catch (err) {
      alert(err.message || "Error al eliminar usuario");
    } finally {
      setDeleteSubmitting(false);
    }
  };


  useEffect(() => {
    if (!token) return;

    const fetchUsersAndCategories = async () => {
      setLoadState("loading");
      try {
        const [usersResult, categoriesResult] = await Promise.all([
          getAllUsers(token),
          getAllCategories(token),
        ]);
        setUsers(usersResult.data || []);
        setCategories(Array.isArray(categoriesResult?.data) ? categoriesResult.data : []);
        setLoadState("done");
      } catch (err) {
        setErrorMsg(err.message || "Error al cargar datos");
        setLoadState("error");
      }
    };

    fetchUsersAndCategories();
  }, [token]);

  useEffect(() => {
    if (roleFilter === "admin") setActiveNav("vendedores");
    else if (roleFilter === "cliente") setActiveNav("clientes");
    else if (roleFilter === "repartidor") setActiveNav("repartidores");
    else if (roleFilter === "all" && activeNav !== "resumen" && activeNav !== "usuarios") {
      setActiveNav("resumen");
    }
  }, [roleFilter]);

  const displayUsers = useMemo(() => {
    return filterAdminUsers(users);
  }, [users]);

  const stats = useMemo(() => {
    const counts = { total: displayUsers.length, admin: 0, cliente: 0, repartidor: 0 };
    displayUsers.forEach((u) => {
      const role = u.roles?.[0]?.name;
      if (role === "admin") counts.admin++;
      else if (role === "cliente") counts.cliente++;
      else if (role === "repartidor") counts.repartidor++;
    });
    return counts;
  }, [displayUsers]);

  const filtered = useMemo(() => {
    let list = displayUsers;

    if (roleFilter !== "all") {
      list = list.filter((u) => u.roles?.[0]?.name === roleFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.first_name?.toLowerCase().includes(q) ||
          u.last_name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q) ||
          u.country?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [displayUsers, search, roleFilter]);

  const roleFilters = [
    { value: "all", label: "Todos" },
    { value: "admin", label: "Vendedores" },
    { value: "cliente", label: "Clientes" },
    { value: "repartidor", label: "Repartidores" },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#03070f] text-white">
      <aside className="hidden md:flex md:w-64 flex-col justify-between border-r border-white/5 bg-[#040912] p-4 shrink-0 h-full select-none">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <LogoIcon className="h-8 w-8 text-[#f5d367]" />
            <span className="font-bold text-base tracking-wider text-white">ShopyMarket MV</span>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => {
                setActiveNav("resumen");
                setRoleFilter("all");
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left w-full ${activeNav === "resumen"
                ? "border border-[#f5d367]/40 text-[#f5d367] bg-[#f5d367]/5 shadow-[0_0_12px_rgba(245,211,103,0.15)]"
                : "text-white/60 hover:text-white/90 hover:bg-white/[0.02]"
                }`}
            >
              <HomeIcon className="h-5 w-5 shrink-0" />
              <span>Resumen</span>
            </button>

            <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/30 px-4 mt-5 mb-2">
              Gestión
            </p>

            <button
              onClick={() => {
                setActiveNav("usuarios");
                setRoleFilter("all");
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left w-full ${activeNav === "usuarios"
                ? "border border-[#f5d367]/40 text-[#f5d367] bg-[#f5d367]/5 shadow-[0_0_12px_rgba(245,211,103,0.15)]"
                : "text-white/60 hover:text-white/90 hover:bg-white/[0.02]"
                }`}
            >
              <UsersIcon className="h-5 w-5 shrink-0" />
              <span>Usuarios</span>
            </button>

            <button
              onClick={() => {
                setActiveNav("vendedores");
                setRoleFilter("admin");
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left w-full ${activeNav === "vendedores"
                ? "border border-[#f5d367]/40 text-[#f5d367] bg-[#f5d367]/5 shadow-[0_0_12px_rgba(245,211,103,0.15)]"
                : "text-white/60 hover:text-white/90 hover:bg-white/[0.02]"
                }`}
            >
              <StoreIcon className="h-5 w-5 shrink-0" />
              <span>Vendedores</span>
            </button>

            <button
              onClick={() => {
                setActiveNav("clientes");
                setRoleFilter("cliente");
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left w-full ${activeNav === "clientes"
                ? "border border-[#f5d367]/40 text-[#f5d367] bg-[#f5d367]/5 shadow-[0_0_12px_rgba(245,211,103,0.15)]"
                : "text-white/60 hover:text-white/90 hover:bg-white/[0.02]"
                }`}
            >
              <CartIcon className="h-5 w-5 shrink-0" />
              <span>Clientes</span>
            </button>

            <button
              onClick={() => {
                setActiveNav("repartidores");
                setRoleFilter("repartidor");
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left w-full ${activeNav === "repartidores"
                ? "border border-[#f5d367]/40 text-[#f5d367] bg-[#f5d367]/5 shadow-[0_0_12px_rgba(245,211,103,0.15)]"
                : "text-white/60 hover:text-white/90 hover:bg-white/[0.02]"
                }`}
            >
              <TruckIcon className="h-5 w-5 shrink-0" />
              <span>Repartidores</span>
            </button>

            <button
              onClick={() => {
                setActiveNav("categorias");
                setRoleFilter("all");
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left w-full ${activeNav === "categorias"
                ? "border border-[#f5d367]/40 text-[#f5d367] bg-[#f5d367]/5 shadow-[0_0_12px_rgba(245,211,103,0.15)]"
                : "text-white/60 hover:text-white/90 hover:bg-white/[0.02]"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.92.92 2.412.92 3.331 0l6.57-6.57c.92-.92.92-2.412 0-3.331L13.5 3.659c-.42-.422-.994-.659-1.591-.659Zm0 0H9m0 0a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
              </svg>
              <span>Categorías</span>
            </button>
          </nav>
        </div>

        <div className="border border-white/5 bg-white/[0.01] rounded-xl p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg border border-[#f5d367]/20 bg-[#f5d367]/5 flex items-center justify-center text-[#f5d367] shrink-0">
            <LogoIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">ShopyMarket MV</p>
            <p className="text-[0.65rem] text-white/40 mt-0.5">Versión 1.0.0</p>
          </div>
        </div>
      </aside>

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
              placeholder="Buscar en el panel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#080f1c]/60 border border-white/5 text-white placeholder-white/30 text-xs rounded-full pl-10 pr-12 py-2.5 outline-none focus:border-[#f5d367]/40 focus:ring-1 focus:ring-[#f5d367]/15 transition-all font-medium"
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              <span className="text-[0.65rem] font-medium text-white/30 border border-white/10 rounded px-1.5 py-0.5 bg-white/5">
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              onClick={() => setCurrentView("profile")}
              className="hidden sm:flex flex-col items-end cursor-pointer group select-none"
            >
              <p className="text-xs font-bold text-white group-hover:text-[#f5d367] transition-colors">
                {user ? [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || "Administrador" : "Administrador"}
              </p>
              <p className="text-[0.68rem] text-white/40 mt-0.5">{user?.email || "root@root.com"}</p>
            </div>
            <div
              onClick={() => setCurrentView("profile")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f5d367]/20 bg-[#f5d367]/5 text-xs font-bold text-[#f5d367] overflow-hidden shrink-0 cursor-pointer hover:border-[#f5d367]/40 transition-colors"
            >
              {user?.profile_image_url ? (
                <img
                  src={getProfileImageUrl(user.profile_image_url)}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "";
                  }}
                />
              ) : (
                getInitials(user)
              )}
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-[#f5d367] text-[#120c00] hover:bg-[#ffeb99] transition-colors px-5 py-2 text-xs font-bold shadow-[0_4px_16px_rgba(245,211,103,0.15)]"
            >
              Salir
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="mb-8">
            <p className="text-xs font-bold text-[#f5d367] tracking-wider uppercase">
              Bienvenido, Administrador
            </p>
            <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {activeNav === "categorias" ? "Gestión de Categorías" : "Resumen general"}
            </h1>
            <p className="mt-2 text-sm text-white/50">
              {activeNav === "categorias" 
                ? "Crea y gestiona las categorías globales de la plataforma."
                : "Supervisa la actividad y el rendimiento de tu plataforma en tiempo real."}
            </p>
          </div>

          {activeNav !== "categorias" && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <MetricCard
                  label="TOTAL USUARIOS"
                  value={stats.total}
                  icon={UsersIcon}
                />
                <MetricCard
                  label="VENDEDORES"
                  value={stats.admin}
                  icon={StoreIcon}
                />
                <MetricCard
                  label="CLIENTES"
                  value={stats.cliente}
                  icon={CartIcon}
                />
                <MetricCard
                  label="REPARTIDORES"
                  value={stats.repartidor}
                  icon={TruckIcon}
                />
              </div>
            </>
          )}

          {activeNav === "categorias" ? (
            // Categories Section
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#080f1c]/40 backdrop-blur-md shadow-2xl">
              <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Categorías Globales
                  <span className="text-xs font-semibold text-white/30 bg-white/5 rounded-full px-2.5 py-0.5">
                    ({categories.length})
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

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                        Creado
                      </th>
                      <th className="px-6 py-3 text-right text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                        ⋮
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.02]">
                    {categories.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-20 text-center text-sm text-white/40"
                        >
                          No hay categorías registradas aún.
                        </td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr
                          key={cat.id}
                          className="hover:bg-white/[0.01] transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-white">{cat.name}</p>
                          </td>

                          <td className="px-6 py-4 text-white/60">
                            <p className="truncate">{cat.description || "—"}</p>
                          </td>

                          <td className="px-6 py-4 text-white/50">
                            {formatDate(cat.created_at)}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
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
            </div>
          ) : (
            // Users Section
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#080f1c]/40 backdrop-blur-md shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Registro de usuarios
                <span className="text-xs font-semibold text-white/30 bg-white/5 rounded-full px-2.5 py-0.5">
                  ({filtered.length})
                </span>
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 rounded-full border border-white/5 bg-white/[0.02] p-1">
                  {roleFilters.map((f) => {
                    const isActive = roleFilter === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setRoleFilter(f.value)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-300 ${isActive
                          ? "border border-[#f5d367] text-[#f5d367] bg-[#f5d367]/10 shadow-[0_0_12px_rgba(245,211,103,0.15)]"
                          : "text-white/60 hover:text-white"
                          }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="rounded-full border border-[#f5d367] bg-[#f5d367]/10 px-4 py-2 text-xs font-bold text-[#f5d367] hover:bg-[#f5d367]/20 hover:text-white transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(245,211,103,0.1)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Agregar usuario
                </button>
              </div>
            </div>

            {loadState === "loading" && (
              <div className="flex items-center justify-center gap-3 py-24 opacity-40">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#f5d367]" />
                <span className="text-sm font-semibold">Cargando usuarios…</span>
              </div>
            )}

            {loadState === "error" && (
              <div className="flex flex-col items-center justify-center gap-2 py-24">
                <p className="text-2xl">⚠️</p>
                <p className="text-sm text-red-400 font-semibold">{errorMsg}</p>
                <p className="text-xs opacity-40">
                  Verifica que el backend esté corriendo y tu sesión sea válida.
                </p>
              </div>
            )}

            {loadState === "done" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                        Correo
                      </th>
                      <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                        Rol
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
                        ⋮
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.02]">
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-20 text-center text-sm text-white/40"
                        >
                          {search || roleFilter !== "all"
                            ? "No hay usuarios que coincidan con tu búsqueda."
                            : "No hay usuarios registrados aún."}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((u) => {
                        const primaryRole = u.roles?.[0]?.name;
                        const location =
                          [u.city, u.country].filter(Boolean).join(", ") || "—";
                        const fullName = getDisplayName(u);

                        return (
                          <tr
                            key={u.id}
                            className="hover:bg-white/[0.01] transition-colors duration-150"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[0.7rem] font-bold text-[#f5d367]">
                                  {getInitialsFromName(u.first_name, u.last_name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-sm text-white">
                                    {fullName}
                                  </p>
                                  <p className="text-[0.68rem] text-white/40 mt-0.5">
                                    ID #{u.id}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-white/70">
                              <span className="truncate">{u.email}</span>
                            </td>

                            <td className="px-6 py-4">
                              <RoleBadge roleName={primaryRole} />
                            </td>

                            <td className="px-6 py-4 text-white/60">
                              {location}
                            </td>

                            <td className="px-6 py-4">
                              <span className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-pulse" />
                                <span className="text-[#10b981] font-semibold text-xs">Activo</span>
                              </span>
                            </td>

                            <td className="px-6 py-4 text-white/50">
                              {formatDate(u.created_at)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(u)}
                                  className="text-white/40 hover:text-[#f5d367] p-1.5 rounded-lg hover:bg-white/5 transition-all"
                                  title="Editar usuario"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.08a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeleteConfirm(u)}
                                  className="text-white/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                                  title="Eliminar usuario"
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
          )}
        </div>
      </main>

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#03070f]/80 backdrop-blur-md"
            onClick={() => !categorySubmitting && setIsCategoryModalOpen(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#080f1c] shadow-2xl transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h3 className="text-lg font-bold text-white">
                Agregar Nueva Categoría
              </h3>
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

            <form onSubmit={handleSubmitCategory} className="flex-1 p-6 space-y-4">
              <div>
                <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Nombre de categoría *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                  placeholder="Ej. Electrónica"
                  disabled={categorySubmitting}
                />
              </div>

              <div>
                <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Descripción</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#03070f]/80 backdrop-blur-md"
            onClick={() => !modalSubmitting && setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#080f1c] shadow-2xl transition-all duration-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h3 className="text-lg font-bold text-white">
                {modalMode === "add" ? "Agregar nuevo usuario" : "Editar usuario"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
                disabled={modalSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formErrorMsg && (
              <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 text-xs font-semibold text-red-400">
                {formErrorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitModal} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, first_name: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, first_name: "" }));
                    }}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                    placeholder="Ej. Juan"
                  />
                  {validationErrors.first_name && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Apellido</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, last_name: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, last_name: "" }));
                    }}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                    placeholder="Ej. Pérez"
                  />
                  {validationErrors.last_name && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, email: "" }));
                    }}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                    placeholder="usuario@gmail.com"
                  />
                  {validationErrors.email && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Teléfono</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/40 select-none font-mono">
                      +591
                    </span>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                        setFormData(prev => ({ ...prev, phone: val }));
                        setValidationErrors(prev => ({ ...prev, phone: "" }));
                      }}
                      className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 pr-4 pl-16 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all font-mono"
                      placeholder="77777777"
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">País</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-[#f5d367] transition-all"
                  >
                    <option value="Bolivia">Bolivia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Ciudad</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-[#f5d367] transition-all"
                  >
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Tarija">Tarija</option>
                    <option value="Beni">Beni</option>
                    <option value="Chuquisaca">Chuquisaca</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="La Paz">La Paz</option>
                    <option value="Oruro">Oruro</option>
                    <option value="Pando">Pando</option>
                    <option value="Potosí">Potosí</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, address: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, address: "" }));
                    }}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                    placeholder="Ej. Calle Av. Las Americas #123"
                  />
                  {validationErrors.address && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                    Contraseña {modalMode === "edit" && "(Opcional)"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, password: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, password: "" }));
                    }}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                    placeholder="••••••••"
                  />
                  {validationErrors.password && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                    Confirmar contraseña {modalMode === "edit" && "(Opcional)"}
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, confirmPassword: "" }));
                    }}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                    placeholder="••••••••"
                  />
                  {validationErrors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Rol asignado</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, role_id: e.target.value }))}
                    disabled={modalMode === "edit"}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-[#f5d367] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="3">Cliente</option>
                    <option value="2">Vendedor</option>
                    <option value="4">Delivery</option>
                  </select>
                  {modalMode === "edit" && (
                    <p className="text-white/40 text-[0.7rem] mt-1.5 font-medium">
                      * El cambio de roles en edición está deshabilitado temporalmente.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalSubmitting}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="rounded-full bg-[#f5d367] text-[#120c00] hover:bg-[#ffeb99] transition-colors px-6 py-2.5 text-xs font-bold shadow-[0_4px_16px_rgba(245,211,103,0.15)] flex items-center gap-2 disabled:opacity-50"
                >
                  {modalSubmitting && (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  )}
                  {modalMode === "add" ? "Agregar usuario" : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#03070f]/80 backdrop-blur-md"
            onClick={() => !deleteSubmitting && setUserToDelete(null)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#080f1c] shadow-2xl p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar usuario?</h3>
            <p className="text-sm text-white/60 mb-6">
              ¿Estás seguro de que deseas eliminar a <strong className="text-white">{getDisplayName(userToDelete)}</strong>? Esta acción no se puede deshacer y el usuario perderá acceso al sistema.
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={deleteSubmitting}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteSubmitting}
                className="rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors px-6 py-2.5 text-xs font-bold shadow-[0_4px_16px_rgba(239,68,68,0.2)] flex items-center gap-2 disabled:opacity-50"
              >
                {deleteSubmitting && (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
