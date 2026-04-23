import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Instagram, Facebook, MessageSquare, User } from 'lucide-react';
import Login from './components/Login';

const Home = () => {
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
    <div className="relative min-h-screen bg-[#020202] text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-purple-900/10 animate-pulse"></div>
      </div>


      <nav className="relative z-20 flex justify-end p-6">
        <button onClick={() => setShowLogin(true)} className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full bg-white/5 hover:bg-white/10 transition-all text-sm font-medium cursor-pointer">
          <User size={16} /> Acceso Staff
        </button>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-32">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black italic mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            DIAGNOSTICO <span className="text-blue-500">WEB</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto font-light">
            Potencia automotriz aplicada al desarrollo de software.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl mb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input required className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl focus:border-blue-500 outline-none" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
              <input required type="email" className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl focus:border-blue-500 outline-none" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <textarea required className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl focus:border-blue-500 outline-none h-32" placeholder="Detalles del proyecto..." value={formData.mensaje} onChange={(e) => setFormData({...formData, mensaje: e.target.value})} />
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl uppercase tracking-widest">Enviar a revision</button>
            {status && <p className="text-center text-blue-400 font-mono text-xs">{status}</p>}
          </form>
        </div>

        <a href="https://wa.me/525563584217" target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-black font-black py-8 rounded-[2rem] flex items-center justify-center gap-4 mb-12">
          <MessageSquare size={32} />
          <span className="text-2xl tracking-tighter">HABLAR CON UN EXPERTO</span>
        </a>

        <footer className="flex justify-center items-center gap-8 pt-10 border-t border-white/5">
          <SocialLink icon={<Instagram size={28}/>} href="https://www.instagram.com/yosley9207?igsh=NWx3bHVwbG91MHp4" label="Instagram" />
          <SocialLink icon={<Facebook size={28}/>} href="https://facebook.com" label="Facebook" />
          <SocialLink icon={<MessageSquare size={28}/>} href="https://wa.me/525563584217" label="WhatsApp" />
        </footer>
      </main>
    </div>
  );
};

const SocialLink = ({ icon, href, label }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" title={label} className="text-gray-500 hover:text-blue-400 transition-all transform hover:scale-125">
    {icon}
  </a>
);

export default Home;
