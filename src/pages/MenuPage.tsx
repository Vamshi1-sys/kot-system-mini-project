import { useState, useEffect } from 'react';
import StripeCheckout from '../components/StripeCheckout';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  X, 
  ArrowRight,
  Utensils,
  Search,
  Star,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

export default function MenuPage() {
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurant_id');
  const tableNumber = searchParams.get('table');
  const navigate = useNavigate();

  const [menu, setMenu] = useState<any[]>([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    if (!restaurantId) {
      navigate('/');
      return;
    }
    fetchMenu();
  }, [restaurantId]);

  const fetchMenu = async () => {
    const res = await fetch(`/api/menu?restaurant_id=${restaurantId}`);
    const data = await res.json();
    setMenu(data.menu);
    setRestaurantName(data.restaurantName);
  };

  const addToCart = (item: any) => {
    const existing = cart.find(i => i.menu_id === item.menu_id);
    if (existing) {
      setCart(cart.map(i => i.menu_id === item.menu_id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.item_name} added to cart`, {
      icon: '🛒',
      style: {
        borderRadius: '16px',
        background: '#334155',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(i => {
      if (i.menu_id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return newQty === 0 ? null : { ...i, quantity: newQty };
      }
      return i;
    }).filter(Boolean));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = total * (parseFloat(settings.tax_percentage) / 100);
  const finalTotal = total + taxAmount;

  const [showPayment, setShowPayment] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const handlePaymentSuccess = async (paymentIntentId) => {
    setProcessingOrder(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: restaurantId,
        table_number: tableNumber || 0,
        items: cart.map(i => ({ item_name: i.item_name, quantity: i.quantity, price: i.price })),
        total_price: finalTotal,
        paymentIntentId
      })
    });
    const data = await res.json();
    setProcessingOrder(false);
    if (data.success) {
      toast.success('Order placed! Redirecting...', { duration: 3000 });
      setShowCart(false);
      setShowPayment(false);
      setCart([]);
      navigate(`/order-status/${data.orderId}`);
    } else {
      toast.error(data.error || 'Order failed');
    }
  };

  const filteredMenu = menu.filter(item => 
    (category === 'All' || item.category === category) &&
    item.item_name.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ['All', ...Array.from(new Set(menu.map(i => i.category)))];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Premium Header */}
      <header className="bg-white px-6 pt-8 pb-6 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{restaurantName}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                <Star className="w-3 h-3 fill-current" /> 4.8 Rating
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Utensils className="w-3.5 h-3.5" />
                Table {tableNumber || 'N/A'}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowCart(true)}
            className="relative p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-4 border-white">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Search & Categories */}
        <div className="space-y-6">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search for your favorite dishes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${category === cat ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="px-6 py-10">
        <div className="grid grid-cols-1 gap-8">
          {filteredMenu.map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={item.menu_id}
              className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex gap-6 group hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img src={item.image} className="w-28 h-28 rounded-[24px] object-cover shadow-sm group-hover:scale-105 transition-transform" />
                <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                  {item.category}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{item.item_name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                    <Info className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Chef's Special</span>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-black text-emerald-600">{settings.currency_symbol}{item.price}</p>
                  <button 
                    onClick={() => addToCart(item)}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Floating Cart Summary */}
      <AnimatePresence>
        {cart.length > 0 && !showCart && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-6 right-6 z-40"
          >
            <button 
              onClick={() => setShowCart(true)}
              className="w-full bg-slate-900 text-white p-5 rounded-[28px] shadow-2xl flex justify-between items-center border border-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Your Selection</p>
                  <p className="text-lg font-black">{cart.reduce((s, i) => s + i.quantity, 0)} Items • {settings.currency_symbol}{finalTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest text-emerald-400">
                View Cart <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[48px] z-50 max-h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Order</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Table {tableNumber}</p>
                </div>
                <button onClick={() => setShowCart(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8">
                {cart.map(item => (
                  <div key={item.menu_id} className="flex justify-between items-center">
                    <div className="flex gap-5">
                      <img src={item.image} className="w-20 h-20 rounded-[20px] object-cover shadow-sm" />
                      <div className="flex flex-col justify-center">
                        <h4 className="font-black text-slate-900 text-lg leading-tight">{item.item_name}</h4>
                        <p className="text-emerald-600 font-black text-sm mt-1">{settings.currency_symbol}{item.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <button onClick={() => updateQuantity(item.menu_id, -1)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
                        <Minus className="w-4 h-4 text-slate-600" />
                      </button>
                      <span className="font-black w-8 text-center text-slate-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menu_id, 1)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
                        <Plus className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-10 bg-slate-50 border-t border-slate-100 space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                    <span className="text-lg font-black text-slate-900">{settings.currency_symbol}{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tax ({settings.tax_percentage}%)</span>
                    <span className="text-lg font-black text-slate-900">{settings.currency_symbol}{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-slate-400 font-black uppercase tracking-widest text-xs">Total Payable</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">{settings.currency_symbol}{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                {showPayment ? (
                  <div className="w-full">
                    <StripeCheckout amount={Math.round(finalTotal * 100)} onPaymentSuccess={handlePaymentSuccess} />
                    <button onClick={() => setShowPayment(false)} className="mt-4 w-full py-3 bg-slate-200 text-slate-700 rounded-2xl font-bold">Cancel Payment</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full py-6 bg-emerald-600 text-white rounded-[28px] font-black text-xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 flex items-center justify-center gap-3 group"
                    disabled={processingOrder}
                  >
                    {processingOrder ? 'Processing...' : (<><span>Pay & Place Order</span> <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" /></>)}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
