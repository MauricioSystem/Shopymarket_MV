import { useCapabilities } from "@/hooks/useCapabilities";

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

const TagIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.92.92 2.412.92 3.331 0l6.57-6.57c.92-.92.92-2.412 0-3.331L13.5 3.659c-.42-.422-.994-.659-1.591-.659Zm0 0H9m0 0a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
  </svg>
);

const iconMap = {
  home: HomeIcon,
  users: UsersIcon,
  store: StoreIcon,
  cart: CartIcon,
  truck: TruckIcon,
  tag: TagIcon,
};

export default function Sidebar({ items, active, onSelect }) {
  const capabilities = useCapabilities();

  // Filter items using capabilities
  const visibleItems = items.filter((item) => {
    if (!item.requiredCapability) return true;
    return capabilities[item.requiredCapability];
  });

  return (
    <aside className="hidden md:flex md:w-64 flex-col justify-between border-r border-white/5 bg-[#040912] p-4 shrink-0 h-full select-none">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2 py-1">
          <LogoIcon className="h-8 w-8 text-[#f5d367]" />
          <span className="font-bold text-base tracking-wider text-white">ShopyMarket MV</span>
        </div>

        <nav className="flex flex-col gap-1">
          {visibleItems.map((item, idx) => {
            const IconComponent = iconMap[item.icon] || HomeIcon;
            const isActive = active === item.id;

            // Render section header before certain items to keep design
            const showHeader = item.id === "usuarios";

            return (
              <div key={item.id}>
                {showHeader && (
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/30 px-4 mt-5 mb-2">
                    Gestión
                  </p>
                )}
                <button
                  onClick={() => onSelect(item.id, item.roleFilter)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left w-full ${
                    isActive
                      ? "border border-[#f5d367]/40 text-[#f5d367] bg-[#f5d367]/5 shadow-[0_0_12px_rgba(245,211,103,0.15)]"
                      : "text-white/60 hover:text-white/90 hover:bg-white/[0.02]"
                  }`}
                >
                  <IconComponent className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              </div>
            );
          })}
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
  );
}
