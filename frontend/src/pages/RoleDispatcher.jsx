/**
 * RoleDispatcher.jsx
 *
 * Central routing component for authenticated users.
 * Resolves the correct page to render based on capabilities or explicit views.
 */

import { useAuth } from '@/context/AuthContext';

// ─── Page imports ─────────────────────────────────────────────────────────────
import AdminDashboard from './dashboards/admin/AdminDashboard';
import DeliveryDashboard from './dashboards/delivery/DeliveryDashboard';
import StoreSetupPage from './dashboards/vendor/StoreSetupPage';
import VendorPanelPage from './dashboards/vendor/VendorPanelPage';

import MarketPage from './market/MarketPage';
import StoreDetailPage from './market/StoreDetailPage';
import ProfilePage from './profile/ProfilePage';
import EditProfilePage from './profile/EditProfilePage';
import UsersPage from './dashboards/admin/UsersPage';

// ─── View → Component map for explicit navigation ─────────────────────────────
const EXPLICIT_VIEWS = {
    profile: ProfilePage,
    'edit-profile': EditProfilePage,
    users: UsersPage,
    market: MarketPage,
    'vendor-panel': VendorPanelPage,
    'store-setup': StoreSetupPage,
    'store-detail': StoreDetailPage,
};

export default function RoleDispatcher() {
    const { capabilities, currentView } = useAuth();

    // Resolve explicit view first
    const ExplicitView = currentView ? EXPLICIT_VIEWS[currentView] : null;
    if (ExplicitView) return <ExplicitView />;

    // Fall back to capability-based default dashboard
    if (capabilities?.canAccessAdminPanel) {
        return <AdminDashboard />;
    }
    if (capabilities?.canAccessVendorPanel) {
        return <StoreSetupPage />;
    }
    if (capabilities?.canDeliverOrders) {
        return <DeliveryDashboard />;
    }

    return <MarketPage />;
}
