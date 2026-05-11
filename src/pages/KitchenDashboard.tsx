import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Utensils, 
  LogOut,
  Timer,
  Hash,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const restaurantId = localStorage.getItem('restaurantId');

  useEffect(() => {
    if (!restaurantId) {
      navigate('/restaurant/login');
      return;
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/restaurant/orders?restaurant_id=${restaurantId}`);
      const data = await res.json();
      // Filter out completed orders for the kitchen view
      setOrders(data.orders.filter((o: any) => o.status !== 'Completed'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`Order #${orderId} marked as ${status}`, {
        icon: status === 'Preparing' ? '👨‍🍳' : '✅',
        style: { borderRadius: '16px', background: '#0F172A', color: '#fff' }
      });
      fetchOrders();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('restaurantId');
    localStorage.removeItem('restaurantName');
    navigate('/restaurant/login');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Kitchen Header */}
      <header className="bg-slate-900 text-white px-8 py-6 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
              <ChefHat className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Kitchen Display System</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live Kitchen Hub
                </span>
                <div className="w-1 h-1 bg-slate-700 rounded-full" />
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  {orders.length} Active Orders
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-3 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-slate-700"
          >
            <LogOut className="w-4 h-4" /> Exit Kitchen
          </button>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Syncing with server...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-32 h-32 bg-white rounded-[48px] flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">All Caught Up!</h2>
            <p className="text-slate-400 font-bold max-w-xs">No active orders in the queue. Take a breather!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {orders.map((order) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={order.order_id}
                  className={`bg-white rounded-[40px] shadow-xl border-2 transition-all flex flex-col overflow-hidden ${order.status === 'Preparing' ? 'border-blue-500 shadow-blue-100' : 'border-white shadow-slate-200/50'}`}
                >
                  {/* Order Card Header */}
                  <div className={`p-8 ${order.status === 'Preparing' ? 'bg-blue-50' : 'bg-slate-50'} border-b border-slate-100 flex justify-between items-start`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">Order #{order.order_id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm border border-slate-100">
                          <Utensils className="w-3 h-3" /> Table {order.table_number}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <Timer className="w-3.5 h-3.5" /> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${order.status === 'Preparing' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {order.status}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-8 flex-1 space-y-6">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-900 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            {item.quantity}x
                          </div>
                          <span className="font-black text-slate-900 text-lg tracking-tight">{item.item_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-1 gap-3">
                    {order.status === 'Pending' ? (
                      <button 
                        onClick={() => updateStatus(order.order_id, 'Preparing')}
                        className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-3 group"
                      >
                        Start Preparing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateStatus(order.order_id, 'Completed')}
                        className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 group"
                      >
                        Order Ready <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
