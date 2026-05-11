import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import RestaurantLogin from './pages/RestaurantLogin';
import RestaurantDashboard from './pages/RestaurantDashboard';
import MenuPage from './pages/MenuPage';
import OrderStatus from './pages/OrderStatus';
import KitchenDashboard from './pages/KitchenDashboard';
import { Toaster } from 'react-hot-toast';
import { useSettings } from './context/SettingsContext';
import { ShieldAlert } from 'lucide-react';

function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSettings();
  
  if (loading) return null;
  
  if (settings.maintenance_mode === 'true' && !window.location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <ShieldAlert className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 tracking-tight">System Maintenance</h1>
          <p className="text-slate-400 font-medium leading-relaxed mb-8">
            {settings.app_name} is currently undergoing scheduled maintenance to improve our services. We'll be back online shortly.
          </p>
          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Support Contact</p>
            <p className="text-emerald-400 font-bold mt-1">{settings.support_email}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <MaintenanceWrapper>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/restaurant/login" element={<RestaurantLogin />} />
            <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/order-status/:orderId" element={<OrderStatus />} />
            <Route path="/kitchen/:restaurantId" element={<KitchenDashboard />} />
          </Routes>
        </MaintenanceWrapper>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}
