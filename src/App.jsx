import React, { useState } from 'react';
import { Wrench, Monitor, Zap, ShieldCheck } from 'lucide-react';
import { supabase } from './supabaseCliente.js';

function App() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // URL de tu n8n que acabas de copiar
    const N8N_WEBHOOK_URL = 'https://yoyistudio.app.n8n.cloud/webhook/a83ae6ba-c7b8-4b8b-9e77-f9b667ceae10';

    try {
      // 1. Guardar en Supabase
      const { error } = await supabase
        .from('contactos')
        .insert([formData]);

      if (error) throw error;

      // 2. Disparar el flujo de n8n (Telegram + Gmail)
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // Esto es VITAL
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          mensaje: formData.mensaje
        })
      });

      alert("¡Contacto recibido! El equipo de AutoTech Agency te avisará por Telegram.");
      setFormData({ nombre: '', email: '', mensaje: '' });

    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black italic">
            AUTOTECH<span className="text-blue-500">AGENCY</span>
          </h1>
          <a href="#contacto" className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-bold">
            Contacto
          </a>
        </div>
      </nav>

      {/* HEADER */}
      <header className="pt-40 pb-20 px-6 text-center">
        <h2 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight">
          Software &{' '}
          <span className="bg-linear-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
            Performance
          </span>
        </h2>

        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-12">
          Desarrollo web y diagnóstico automotriz avanzado.
        </p>
      </header>

      {/* SERVICIOS */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 group cursor-default">
          <Wrench className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-xl mb-2">Diagnóstico</h4>
          <p className="text-gray-400 text-sm">Escaneo y reprogramación de módulos con equipo original.</p>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
          <Monitor className="text-blue-500 mb-4" />
          <h4 className="font-bold">Web Engine</h4>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
          <Zap className="text-blue-500 mb-4" />
          <h4 className="font-bold">Bots n8n</h4>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
          <ShieldCheck className="text-blue-500 mb-4" />
          <h4 className="font-bold">Seguridad</h4>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-24 px-6">
        <div className="max-w-xl mx-auto bg-gray-900/50 p-10 rounded-[2.5rem] border border-white/10">
          <h3 className="text-3xl font-bold mb-8 text-center">
            Inicia tu Proyecto
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Nombre"
              className="w-full p-4 bg-black border border-white/10 rounded-xl focus:border-blue-500 outline-none"
            />

            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="w-full p-4 bg-black border border-white/10 rounded-xl focus:border-blue-500 outline-none"
            />

            <textarea
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              required
              placeholder="Idea del proyecto..."
              rows="4"
              className="w-full p-4 bg-black border border-white/10 rounded-xl focus:border-blue-500 outline-none"
            />

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
            >
              ENVIAR
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}

export default App;