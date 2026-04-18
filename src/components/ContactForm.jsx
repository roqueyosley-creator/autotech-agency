import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gnygsxggeogmjvvhsmgw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdueWdzeGdnZW9nbWp2dmhzbWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NjkyMDYsImV4cCI6MjA5MTI0NTIwNn0.Zr7QHzzsOXTPbQ-P4HDpgv0O2UQw6zKX1Nsd8LXgFTU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      // 2. ENVIAR A SUPABASE (Asegúrate que la tabla se llame 'prospectos')
      const { error } = await supabase
        .from('prospectos')
        .insert([
          { 
            nombre_cliente: data.nombre, 
            email_contacto: data.email, 
            mensaje: data.mensaje 
          }
        ]);

      if (error) throw error;

      setSuccess(true);
      e.target.reset();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Hubo un error al enviar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-gray-900 rounded-2xl shadow-2xl border border-blue-500/20">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Contáctanos</h2>
      
      {success ? (
        <div className="text-green-400 text-center p-4 bg-green-900/20 rounded-lg border border-green-500/30">
          ¡Mensaje enviado con éxito! Revisa tu correo.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
            <input 
              name="nombre" 
              placeholder="Ej. Juan Pérez" 
              required 
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Correo Electrónico</label>
            <input 
              name="email" 
              type="email" 
              placeholder="juan@ejemplo.com" 
              required 
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Mensaje</label>
            <textarea 
              name="mensaje" 
              placeholder="Cuéntanos sobre tu proyecto..." 
              required
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 h-32 outline-none transition-all"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Enviar Solicitud'}
          </button>
        </form>
      )}
    </div>
  );
}