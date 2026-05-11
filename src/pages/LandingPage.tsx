import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Utensils, QrCode, LayoutDashboard, CheckCircle, ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function LandingPage() {
  const { settings } = useSettings();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-100">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">{settings.app_name}</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/restaurant/login" className="hidden sm:block text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">
            Restaurant Login
          </Link>
          <Link to="/admin/login" className="px-6 py-3 text-sm font-bold bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            Super Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-6 pt-24 pb-32 lg:pt-32 lg:pb-48 relative overflow-hidden">
          {/* Background Accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
          </div>

          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-8"
            >
              <Star className="w-3 h-3 fill-current" /> Trusted by 500+ Restaurants
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]"
            >
              Modernize Your <br />
              <span className="text-emerald-600">Dining Experience.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
            >
              The ultimate QR-based ordering system for modern restaurants. Increase table turnover, reduce errors, and delight your guests.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link to="/restaurant/login" className="px-10 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-lg hover:bg-emerald-700 shadow-2xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 group">
                Get Started Now <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-[24px] font-black text-lg hover:bg-slate-50 transition-all">
                Watch Demo
              </button>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">Everything you need to scale.</h2>
              <p className="text-slate-500 font-medium text-lg">Powerful tools designed for high-performance kitchens.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: 'QR Ordering', 
                  desc: 'Contactless ordering directly from the table. No app downloads required.',
                  icon: QrCode,
                  color: 'emerald'
                },
                { 
                  title: 'Live KOT System', 
                  desc: 'Real-time kitchen order tickets with instant status updates for customers.',
                  icon: Zap,
                  color: 'blue'
                },
                { 
                  title: 'SaaS Platform', 
                  desc: 'Manage multiple restaurant branches from a single, powerful super admin panel.',
                  icon: ShieldCheck,
                  color: 'purple'
                }
              ].map((feature, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={feature.title}
                  className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className={`w-16 h-16 bg-${feature.color}-50 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-32 bg-slate-900 text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1">
              <h2 className="text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[0.9]">Built for <br /><span className="text-emerald-400">Scale.</span></h2>
              <p className="text-slate-400 text-xl font-medium mb-12 leading-relaxed">Our infrastructure handles thousands of orders per second, ensuring your kitchen never misses a beat.</p>
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h4 className="text-4xl font-black text-white mb-2">99.9%</h4>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Uptime Guarantee</p>
                </div>
                <div>
                  <h4 className="text-4xl font-black text-white mb-2">250ms</h4>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Order Sync Speed</p>
                </div>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 w-full aspect-square rounded-[60px] shadow-2xl flex items-center justify-center rotate-3 group hover:rotate-0 transition-transform duration-700">
                <LayoutDashboard className="w-40 h-40 text-white opacity-20 absolute" />
                <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 w-3/4">
                  <div className="h-4 w-1/2 bg-white/20 rounded-full mb-4" />
                  <div className="h-4 w-3/4 bg-white/20 rounded-full mb-8" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-12 bg-white/20 rounded-2xl" />
                    <div className="h-12 bg-white/20 rounded-2xl" />
                    <div className="h-12 bg-white/20 rounded-2xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-8 py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-600 rounded-xl">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">{settings.app_name}</span>
            </div>
            <p className="text-slate-500 font-medium max-w-sm leading-relaxed">Empowering the next generation of restaurant owners with cutting-edge technology and seamless experiences.</p>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Product</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Kitchen Display</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">QR Generator</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
              <li><a href="#" className="hover:text-emerald-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026 {settings.app_name}. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Zap className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Star className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
