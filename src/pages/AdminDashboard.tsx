import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Plus, 
  Trash2, 
  LogOut,
  Building2,
  Search,
  Edit3,
  X,
  LayoutDashboard,
  Settings,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

export default function AdminDashboard() {
  const { settings: globalSettings, refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [stats, setStats] = useState({ totalRestaurants: 0, totalOrders: 0, totalRevenue: 0 });
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<'add' | 'edit' | null>(null);
  const [currentRes, setCurrentRes] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchRestaurants();
    fetchSettings();
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    setStats(data);
  };

  const fetchRestaurants = async () => {
    const res = await fetch('/api/admin/restaurants');
    const data = await res.json();
    setRestaurants(data);
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    setSettings(data);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('System settings updated successfully');
        refreshSettings();
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('An error occurred while saving settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleOpenEdit = (res: any) => {
    setCurrentRes(res);
    setFormData({ name: res.restaurant_name, email: res.email, password: res.password });
    setShowModal('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = showModal === 'add' ? '/api/admin/restaurants' : `/api/admin/restaurants/${currentRes.restaurant_id}`;
    const method = showModal === 'add' ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      toast.success(showModal === 'add' ? 'Restaurant added' : 'Restaurant updated');
      setShowModal(null);
      setFormData({ name: '', email: '', password: '' });
      fetchRestaurants();
      fetchStats();
    } else {
      toast.error(data.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) return;
    await fetch(`/api/admin/restaurants/${id}`, { method: 'DELETE' });
    toast.success('Restaurant deleted');
    fetchRestaurants();
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white p-8 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2 bg-emerald-500 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight uppercase">{globalSettings.app_name}</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-emerald-400' : ''}`} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="w-full flex items-center gap-3 px-5 py-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl font-medium transition-all"
          >
            <Building2 className="w-5 h-5" /> Restaurants
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-emerald-400' : ''}`} /> Settings
          </button>
        </nav>

        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-5 py-4 text-slate-500 hover:text-red-400 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-auto">
        {activeTab === 'dashboard' ? (
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Overview</h1>
                <p className="text-slate-500 mt-1 font-medium">Global management for {globalSettings.app_name}</p>
              </div>
              <button 
                onClick={() => {
                  setFormData({ name: '', email: '', password: '' });
                  setShowModal('add');
                }}
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-xl shadow-emerald-200"
              >
                <Plus className="w-5 h-5" /> Add New Restaurant
              </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                { label: 'Total Restaurants', value: stats.totalRestaurants, icon: Building2, color: 'blue' },
                { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'purple' },
                { label: 'Total Revenue', value: `${globalSettings.currency_symbol}${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'emerald' }
              ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={stat.label}
                  className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-4 bg-${stat.color}-50 rounded-2xl text-${stat.color}-600`}>
                      <stat.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                      <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Restaurant List */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900">Restaurant Network</h2>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-5">Restaurant Details</th>
                      <th className="px-8 py-5">Contact Info</th>
                      <th className="px-8 py-5">Onboarding Date</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {restaurants.map((res, i) => (
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={res.restaurant_id} 
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                              {res.restaurant_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-lg">{res.restaurant_name}</p>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">ID: #{res.restaurant_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-slate-600 font-medium">{res.email}</p>
                          <p className="text-xs text-slate-400">Password: {res.password}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-slate-500 font-semibold">{new Date(res.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleOpenEdit(res)}
                              className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              title="Edit Restaurant"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(res.restaurant_id)}
                              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete Restaurant"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            <header className="mb-12">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Settings</h1>
              <p className="text-slate-500 mt-1 font-medium">Configure global application parameters and feature flags</p>
            </header>

            <form onSubmit={handleUpdateSettings} className="max-w-4xl">
              <div className="space-y-8">
                {/* Group settings by category */}
                {Array.from(new Set(settings.map(s => s.category))).map(category => (
                  <div key={category} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
                      <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">{category}</h2>
                    </div>
                    <div className="p-8 space-y-6">
                      {settings.filter(s => s.category === category).map(setting => (
                        <div key={setting.key} className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                          <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-900 mb-1">{setting.key.replace(/_/g, ' ').toUpperCase()}</label>
                            <p className="text-xs text-slate-500 font-medium">{setting.description}</p>
                          </div>
                          <div className="w-full md:w-72">
                            {setting.type === 'boolean' ? (
                              <div className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => handleSettingChange(setting.key, setting.value === 'true' ? 'false' : 'true')}
                                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${setting.value === 'true' ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                >
                                  <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${setting.value === 'true' ? 'translate-x-7' : 'translate-x-1'}`}
                                  />
                                </button>
                                <span className="text-sm font-bold text-slate-600">{setting.value === 'true' ? 'Enabled' : 'Disabled'}</span>
                              </div>
                            ) : (
                              <input
                                type={setting.type === 'number' ? 'number' : 'text'}
                                value={setting.value}
                                onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-900 text-sm"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSavingSettings ? 'Saving Changes...' : 'Save All Settings'}
                </button>
              </div>
            </form>
          </>
        )}
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-slate-900">
                  {showModal === 'add' ? 'New Restaurant' : 'Edit Restaurant'}
                </h2>
                <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Restaurant Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900"
                    placeholder="e.g. Gourmet Garden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Owner Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900"
                    placeholder="owner@restaurant.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Access Password</label>
                  <input 
                    type="text" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900"
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setShowModal(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    {showModal === 'add' ? 'Create Account' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
