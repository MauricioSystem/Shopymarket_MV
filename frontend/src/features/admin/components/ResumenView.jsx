import React from "react";

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

export default function ResumenView({ stats }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
      <MetricCard
        label="TOTAL USUARIOS"
        value={stats.total}
        icon={UsersIcon}
      />
      <MetricCard
        label="VENDEDORES"
        value={stats.admin}
        icon={UsersIcon}
      />
      <MetricCard
        label="TIENDAS / SERVICIOS"
        value={stats.stores}
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
      <MetricCard
        label="ELIMINADAS"
        value={stats.deleted || 0}
        icon={UsersIcon}
      />
    </div>
  );
}
