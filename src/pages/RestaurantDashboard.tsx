import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  QrCode, 
  ChefHat, 
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Download,
  ExternalLink,
  Edit3,
  X,
  ToggleLeft as Toggle,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { apiUrl } from '../lib/api';

export default function RestaurantDashboard() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ ordersToday: 0, activeOrders: 0, completedOrders: 0 });
  const [menu, setMenu] = useState<any[]>([]);
  const [showMenuModal, setShowMenuModal] = useState<'add' | 'edit' | null>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Main Course', availability: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState('1');
  const [qrResult, setQrResult] = useState<{ qrDataUrl: string, url: string } | null>(null);
  
  const restaurantId = localStorage.getItem('restaurantId');
  const restaurantName = localStorage.getItem('restaurantName');
  const navigate = useNavigate();

  useEffect(() => {
    if (!restaurantId) {
      navigate('/restaurant/login');
      return;
    }
    fetchStats();
    fetchMenu();
  }, [restaurantId]);

  const fetchStats = async () => {
    const res = await fetch(apiUrl(`/api/restaurant/${restaurantId}/stats`));
    const data = await res.json();
    setStats(data);
  };

  const fetchMenu = async () => {
    const res = await fetch(apiUrl(`/api/restaurant/${restaurantId}/menu`));
    const data = await res.json();
    setMenu(data);
  };

  const handleOpenEdit = (item: any) => {
    setCurrentItem(item);
    setFormData({ 
      name: item.item_name, 
      price: item.price.toString(), 
      category: item.category, 
      availability: !!item.availability 
    });
    setImagePreview(item.image || null);
    setImageFile(null);
    setShowMenuModal('edit');
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = showMenuModal === 'add' ? apiUrl(`/api/restaurant/${restaurantId}/menu`) : apiUrl(`/api/menu/${currentItem.menu_id}`);
    const method = showMenuModal === 'add' ? 'POST' : 'PATCH';

    const body = new FormData();
    body.append('name', formData.name);
    body.append('price', formData.price);
    body.append('category', formData.category);
    body.append('availability', String(formData.availability));
    if (imageFile) {
      body.append('image', imageFile);
    }

    const res = await fetch(url, { method, body });
    const data = await res.json();
    if (data.success) {
      toast.success(showMenuModal === 'add' ? 'Item added' : 'Item updated');
      setShowMenuModal(null);
      setFormData({ name: '', price: '', category: 'Main Course', availability: true });
      setImageFile(null);
      setImagePreview(null);
      fetchMenu();
    }
  };

  const handleDeleteMenu = async (id: number) => {
    if (!confirm('Delete this item?')) return;
    await fetch(apiUrl(`/api/menu/${id}`), { method: 'DELETE' });
    toast.success('Item removed');
    fetchMenu();
  };

  const generateQR = async () => {
    const res = await fetch(apiUrl(`/api/restaurant/${restaurantId}/qr?table=${tableNumber}`));
    const data = await res.json();
    setQrResult(data);
    toast.success(`QR Code generated for Table ${tableNumber}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-8 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2.5 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-100">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 uppercase">Kitchen Hub</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'menu', icon: UtensilsCrossed, label: 'Menu Items' },
            ...(settings.enable_qr_ordering === 'true' ? [{ id: 'qr', icon: QrCode, label: 'QR Generator' }] : [])
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
          <button 
            onClick={() => navigate(`/kitchen/${restaurantId}`)}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            <ChefHat className="w-5 h-5" /> Kitchen Display
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-4 text-slate-400 hover:text-red-500 transition-colors font-bold"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{restaurantName}</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage your kitchen operations</p>
          </div>
          {activeTab === 'menu' && (
            <button 
              onClick={() => {
                setFormData({ name: '', price: '', category: 'Main Course', availability: true });
                setShowMenuModal('add');
              }}
              className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-xl shadow-emerald-200"
            >
              <Plus className="w-5 h-5" /> Add Food Item
            </button>
          )}
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Orders Today', value: stats.ordersToday, icon: ShoppingBag, color: 'blue' },
                { label: 'Active Orders', value: stats.activeOrders, icon: Clock, color: 'amber' },
                { label: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle2, color: 'emerald' }
              ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={stat.label}
                  className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm"
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

            {/* Quick Actions */}
            <div className={`grid grid-cols-1 ${settings.enable_qr_ordering === 'true' ? 'md:grid-cols-2' : ''} gap-8`}>
              <div className="bg-slate-900 text-white p-10 rounded-[40px] flex flex-col justify-between h-64 relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-3">Kitchen View</h3>
                  <p className="text-slate-400 font-medium max-w-[240px]">Monitor and manage live incoming orders from your tables in real-time.</p>
                </div>
                <button 
                  onClick={() => navigate(`/kitchen/${restaurantId}`)}
                  className="relative z-10 w-fit px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm hover:scale-105 transition-all"
                >
                  Open Kitchen Display
                </button>
                <ChefHat className="absolute -right-12 -bottom-12 w-56 h-56 text-slate-800 opacity-50 group-hover:scale-110 transition-transform duration-700" />
              </div>
              {settings.enable_qr_ordering === 'true' && (
                <div className="bg-emerald-600 text-white p-10 rounded-[40px] flex flex-col justify-between h-64 relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-3">QR Generator</h3>
                    <p className="text-emerald-100 font-medium max-w-[240px]">Generate unique QR codes for each table to enable instant digital ordering.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('qr')}
                    className="relative z-10 w-fit px-8 py-3 bg-white text-emerald-600 rounded-2xl font-black text-sm hover:scale-105 transition-all"
                  >
                    Generate QR Codes
                  </button>
                  <QrCode className="absolute -right-12 -bottom-12 w-56 h-56 text-emerald-500 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h2 className="text-2xl font-black text-slate-900">Menu Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-8 py-5">Dish Details</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5">Price</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {menu.map((item) => (
                    <tr key={item.menu_id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <img src={item.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                          <span className="font-bold text-slate-900 text-lg">{item.item_name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900 text-xl">{settings.currency_symbol}{item.price}</td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.availability ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {item.availability ? 'Available' : 'Sold Out'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteMenu(item.menu_id)}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-sm text-center">
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Table QR Generator</h2>
                <p className="text-slate-500 font-medium">Create custom ordering links for your restaurant tables</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-12 max-w-lg mx-auto">
                <div className="flex-1 text-left">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Table Number</label>
                  <input 
                    type="number" 
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900"
                    min="1"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={generateQR}
                    className="w-full sm:w-auto px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                  >
                    Generate QR
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {qrResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center p-10 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200"
                  >
                    <div className="bg-white p-6 rounded-[32px] shadow-xl mb-8">
                      <img src={qrResult.qrDataUrl} alt={`QR code for table ${tableNumber}`} className="w-64 h-64" />
                    </div>
                    <div className="w-full space-y-6">
                      <div className="space-y-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Digital Menu Link (Table {tableNumber})</p>
                        <code className="block p-4 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 break-all font-mono">
                          {qrResult.url}
                        </code>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a 
                          href={qrResult.qrDataUrl} 
                          download={`Table-${tableNumber}-QR.png`}
                          className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                        >
                          <Download className="w-5 h-5" /> Download Image
                        </a>
                        <a 
                          href={qrResult.url} 
                          target="_blank"
                          className="flex items-center justify-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                        >
                          <ExternalLink className="w-5 h-5" /> Test Ordering
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Menu Item Modal */}
      <AnimatePresence>
        {showMenuModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenuModal(null)}
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
                  {showMenuModal === 'add' ? 'New Dish' : 'Edit Dish'}
                </h2>
                <button onClick={() => setShowMenuModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleMenuSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Dish Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900"
                    placeholder="e.g. Truffle Pasta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Dish Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => setImagePreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      } else {
                        setImagePreview(null);
                      }
                    }}
                    className="w-full px-6 py-2 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-4 w-32 h-32 object-cover rounded-2xl border border-slate-200" />
                  )}
                {/* removed extra closing div here */}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Price ({settings.currency_symbol})</label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900"
                      placeholder="499"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900 appearance-none"
                    >
                      <option>Main Course</option>
                      <option>Starters</option>
                      <option>Desserts</option>
                      <option>Beverages</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-900">Availability</p>
                    <p className="text-xs text-slate-500 font-medium">Show this item on the digital menu</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, availability: !formData.availability })}
                    className={`w-14 h-8 rounded-full transition-all relative ${formData.availability ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.availability ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setShowMenuModal(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    {showMenuModal === 'add' ? 'Add to Menu' : 'Save Changes'}
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
