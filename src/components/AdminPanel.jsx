import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseCliente';
import { Trash2, LogOut, RefreshCcw } from 'lucide-react';

const AdminPanel = ({ session }) => {
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContactos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contactos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Error cargando clientes:", error);
    else setContactos(data);
    setLoading(false);
  };

  const borrarContacto = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este cliente del sistema?")) {
      const { error } = await supabase.from('contactos').delete().eq('id', id);
      if (error) alert("Error al borrar");
      else fetchContactos();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchContactos(); 
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter">CENTRO DE <span className="text-blue-500">MANDO</span></h1>
            <p className="text-gray-500 text-sm">Sesion activa como: {session.user.email}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={fetchContactos} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all" title="Refrescar"><RefreshCcw size={20} /></button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600/20 text-red-500 px-6 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all font-bold"><LogOut size={18}/> Salir</button>
          </div>
        </header>

        {loading ? (
          <p className="text-center text-blue-500 animate-pulse font-mono uppercase tracking-widest">Escaneando base de datos...</p>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md">
            <table className="w-full text-left">
              <thead className="bg-white/10 text-blue-500 text-[10px] uppercase tracking-[0.2em] font-black">
                <tr>
                  <th className="p-6">Fecha</th>
                  <th className="p-6">Cliente</th>
                  <th className="p-6">Email</th>
                  <th className="p-6">Proyecto / Mensaje</th>
                  <th className="p-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contactos.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6 text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-6 font-bold text-white italic">{c.nombre}</td>
                    <td className="p-6 text-blue-400/70">{c.email}</td>
                    <td className="p-6 text-gray-400 max-w-xs truncate">{c.mensaje}</td>
                    <td className="p-6 text-center">
                      <button onClick={() => borrarContacto(c.id)} className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {contactos.length === 0 && <p className="p-20 text-center text-gray-600 italic">No hay reportes de clientes en el sistema.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
