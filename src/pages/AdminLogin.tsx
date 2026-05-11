import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Lock, Mail, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

export default function AdminLogin() {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Access Granted. Welcome, Administrator.', {
          style: { borderRadius: '16px', background: '#0F172A', color: '#fff' }
        });
        navigate('/admin/dashboard');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-slate-200 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-10 transition-colors font-bold text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Portal
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 relative"
        >
          <div className="flex flex-col items-center mb-10">
            <div className="p-4 bg-slate-900 rounded-3xl shadow-xl shadow-slate-200 mb-6">
              <Shield className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Admin</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Secure Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrator Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-300 absolute left-5 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-bold text-slate-900"
                  placeholder={`admin@${settings.app_name.toLowerCase().replace(/\s+/g, '')}.com`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-300 absolute left-5 top-1/2 -translate-y-1/2" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-bold text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black text-lg hover:bg-slate-800 transition-all disabled:opacity-50 shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group"
            >
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
              {!loading && <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
          
          <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Demo Access</span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold">
              Email: <span className="text-slate-600">admin@{settings.app_name.toLowerCase().replace(/\s+/g, '')}.com</span><br />
              Pass: <span className="text-slate-600">admin123</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
