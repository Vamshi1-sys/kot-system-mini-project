import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  ArrowLeft,
  ShoppingBag,
  RefreshCcw,
  Utensils
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

export default function OrderStatus() {
  const { settings } = useSettings();
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-slate-400 uppercase tracking-widest">Tracking Order...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-red-400 uppercase tracking-widest">Order Not Found</div>;

  const steps = [
    { status: 'Pending', icon: Clock, label: 'Order Received', color: 'amber', desc: 'We have received your order and sent it to the kitchen.' },
    { status: 'Preparing', icon: ChefHat, label: 'In the Kitchen', color: 'blue', desc: 'Our chefs are currently preparing your delicious meal.' },
    { status: 'Completed', icon: CheckCircle2, label: 'Ready to Serve', color: 'emerald', desc: 'Your order is ready! Enjoy your meal.' }
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 py-12 lg:py-24 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-10 transition-colors font-bold text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 lg:p-12 rounded-[48px] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center"
        >
          <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ShoppingBag className="w-10 h-10 text-emerald-600" />
          </div>
          
          <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Order #{order.order_id}</h1>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <Utensils className="w-3.5 h-3.5" /> Table {order.table_number}
              </div>
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
              <div className="text-emerald-600 text-xs font-black uppercase tracking-widest">
                {settings.currency_symbol}{order.total_price}
              </div>
            </div>
          </div>

          <div className="space-y-12 relative">
            {/* Progress Line */}
            <div className="absolute left-[31px] top-6 bottom-6 w-1 bg-slate-50 -z-0 rounded-full" />
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.status} className="flex items-start gap-8 relative z-10">
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-700 shrink-0 ${isActive ? `bg-${step.color}-500 text-white shadow-xl shadow-${step.color}-100` : 'bg-white border-4 border-slate-50 text-slate-200'}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="text-left pt-1">
                    <p className={`text-xl font-black transition-colors ${isActive ? 'text-slate-900' : 'text-slate-200'}`}>{step.label}</p>
                    <p className={`text-sm mt-1 leading-relaxed transition-colors ${isActive ? 'text-slate-500 font-medium' : 'text-slate-200'}`}>
                      {step.desc}
                    </p>
                    {isCurrent && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mt-4"
                      >
                        <RefreshCcw className="w-3 h-3 animate-spin" /> Live Updates
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <ChefHat className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 font-bold text-left leading-relaxed">
              Our team is working hard to ensure your dining experience is perfect.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
