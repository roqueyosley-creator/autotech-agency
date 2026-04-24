import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from './supabaseClient';
import { Instagram, Facebook, MessageSquare, User, Zap, Shield, Smartphone } from 'lucide-react';
import { useWindowSize } from './hooks/useWindowSize';
import Login from './components/Login';

const Home = () => {
  const { isMobile } = useWindowSize();
  const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' });
  const [status, setStatus] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sincronizando...');
    
    try {
      const { error } = await supabase.from('contactos').insert([formData]);
      if (error) throw error;

      await fetch('https://yoyistudio.app.n8n.cloud/webhook/contacto-autotechwidget', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      setStatus('!Datos recibidos en el taller!');
      setFormData({ nombre: '', email: '', mensaje: '' });
    } catch (err) {
      setStatus('Falla de conexion');
      console.error(err);
    }
  };

  if (showLogin) {
    return <Login onBack={() => setShowLogin(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-[#020202] text-white overflow-x-hidden selection:bg-blue-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:30px_30px] sm:bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-purple-900/10 animate-pulse"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <nav className="relative z-20 flex justify-end p-4 sm:p-8 pt-safe">
        <button onClick={() => setShowLogin(true)} className="flex items-center gap-2 px-6 py-2.5 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer group">
          <User size={14} className="group-hover:text-blue-400 transition-colors" /> Acceso Staff
        </button>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-6 sm:pt-12 pb-32">
        <div className="text-center mb-12 sm:mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block mb-6 px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full"
          >
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Next Gen Automotive Intelligence</span>
          </motion.div>
          
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black italic mb-6 leading-[0.9] bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent uppercase tracking-tighter">
            DIAGNOSTICO <br/> <span className="text-blue-500">WEB PRO</span>
          </h1>
          <p className="text-zinc-500 text-base sm:text-xl md:text-2xl max-w-2xl mx-auto font-medium italic">
            "Potencia automotriz aplicada al desarrollo de software de alto rendimiento."
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
            <FeatureCard icon={<Zap size={20}/>} title="Real-Time" desc="Sincronización instantánea con hardware OBD" />
            <FeatureCard icon={<Shield size={20}/>} title="Secure" desc="Encriptación militar en cada diagnóstico" />
            <FeatureCard icon={<Smartphone size={20}/>} title="Cloud" desc="Reportes accesibles desde cualquier lugar" />
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl mb-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap size={120} className="text-blue-500" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-black uppercase italic mb-8 tracking-tighter">Enviar Reporte / Consulta</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required className="w-full bg-black/60 border border-white/5 p-5 rounded-2xl focus:border-blue-500 outline-none text-sm transition-all" placeholder="Nombre completo" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                <input required type="email" className="w-full bg-black/60 border border-white/5 p-5 rounded-2xl focus:border-blue-500 outline-none text-sm transition-all" placeholder="Email corporativo" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <textarea required className="w-full bg-black/60 border border-white/5 p-5 rounded-3xl focus:border-blue-500 outline-none h-40 text-sm transition-all" placeholder="Detalles técnicos del requerimiento..." value={formData.mensaje} onChange={(e) => setFormData({...formData, mensaje: e.target.value})} />
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl uppercase tracking-[0.3em] text-xs shadow-2xl shadow-blue-600/30 transition-all active:scale-95 italic">
                Enviar a Revisión Técnica
              </button>
              {status && <p className="text-center text-blue-400 font-black text-[10px] uppercase tracking-widest animate-pulse">{status}</p>}
            </form>
          </div>
        </div>

        <a href="https://wa.me/525563584217" target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-black font-black py-6 sm:py-8 rounded-[2rem] sm:rounded-[3rem] flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-16 group transition-all">
          <div className="flex items-center gap-4">
            <MessageSquare size={isMobile ? 24 : 32} />
            <span className="text-xl sm:text-2xl tracking-tighter uppercase italic">Hablar con un Experto</span>
          </div>
          <span className="text-[10px] opacity-60 uppercase font-black tracking-widest sm:ml-4">Soporte Técnico 24/7</span>
        </a>

        <footer className="pt-16 border-t border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="text-center sm:text-left">
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-2">Developed by AutoTech Agency</p>
                <p className="text-[8px] text-zinc-800 font-mono">© 2024 NEXT-GEN DIAGNOSTIC SYSTEMS</p>
            </div>
            <div className="flex justify-center items-center gap-8">
              <SocialLink icon={<Instagram size={24}/>} href="https://www.instagram.com/yosley9207?igsh=NWx3bHVwbG91MHp4" label="Instagram" />
              <SocialLink icon={<Facebook size={24}/>} href="https://facebook.com" label="Facebook" />
              <SocialLink icon={<MessageSquare size={24}/>} href="https://wa.me/525563584217" label="WhatsApp" />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all group">
        <div className="mb-4 text-blue-500">{icon}</div>
        <h3 className="text-xs font-black uppercase tracking-widest mb-2 italic">{title}</h3>
        <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase">{desc}</p>
    </div>
);

const SocialLink = ({ icon, href, label }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" title={label} className="text-zinc-600 hover:text-blue-400 transition-all transform hover:scale-125">
    {icon}
  </a>
);

export default Home;
