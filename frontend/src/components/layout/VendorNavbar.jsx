import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getDisplayName, getProfileImageUrl } from '@/utils/userCapabilities';
import BrandMark from '@/components/ui/BrandMark';

export default function VendorNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const initial = user?.first_name?.[0]?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-50 h-[87px] border-b border-white/5 bg-[#080f1c]/90 backdrop-blur-xl">
      <div className="relative flex h-full w-full items-center px-6 lg:px-8 justify-between">
        
        {/* Left - Clickable Brand Logo (navigates back to vendor dashboard) */}
        <div className="z-10">
          <button
            type="button"
            onClick={() => navigate('/dashboard/vendor')}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#f5d367] rounded-none transition-opacity hover:opacity-95"
            aria-label="Ir al panel de vendedor"
          >
            <BrandMark compact tone="light" />
          </button>
        </div>

        {/* Right - Profile and actions */}
        <div className="flex items-center gap-4 z-10">
          <button
            type="button"
            onClick={handleProfile}
            className="hidden sm:flex flex-col items-end cursor-pointer group select-none text-right"
          >
            <span className="text-xs font-bold text-white/90 group-hover:text-[#f5d367] transition-colors">
              {getDisplayName(user)}
            </span>
            <span className="text-[9px] text-[#f5d367] uppercase tracking-wider font-semibold">
              admi
            </span>
          </button>

          {/* Profile Picture */}
          <div
            onClick={handleProfile}
            className="h-8 w-8 rounded-none border border-white/10 bg-[#0d1726] flex items-center justify-center text-xs font-bold text-[#f5d367] overflow-hidden shrink-0 cursor-pointer hover:border-[#f5d367]/40 transition-colors"
          >
            {user?.profile_image_url ? (
              <img
                src={getProfileImageUrl(user.profile_image_url)}
                alt="Avatar"
                className="h-full w-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              initial
            )}
          </div>

          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-bold text-white/40 hover:text-red-400 transition-colors"
          >
            Salir
          </button>
        </div>

      </div>
    </header>
  );
}
