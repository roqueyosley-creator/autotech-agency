import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, Mail, ChevronLeft, Zap } from 'lucide-react';

const Login = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales incorrectas. Verifica el acceso.");
    } else {
      alert("¡Acceso concedido, Comandante!");
      window.location.href = "/admin";
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#020202]">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al Taller
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-blue-600/20 text-blue-500 mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter italic">ACCESO <span className="text-blue-500">STAFF</span></h2>
          <p className="text-gray-500 text-sm mt-2 font-light">Area restringida para administradores de AutoTech.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold ml-1">Identificacion</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input 
                type="email"
                required
                className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-xl focus:border-blue-500 outline-none transition-all text-white"
                placeholder="correo@autotech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold ml-1">Clave de Seguridad</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input 
                type="password"
                required
                className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-xl focus:border-blue-500 outline-none transition-all text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-mono text-center">{error}</p>}

          <button 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {loading ? "Verificando..." : <><Zap size={18} fill="currentColor" /> Desbloquear Panel</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
