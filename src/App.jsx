import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Home from './Home';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Inicializar sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escuchar cambios en la autenticación (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Limpiar suscripción al desmontar
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Si hay sesión activa, renderizar exclusivamente AdminPanel
  if (session) {
    return <AdminPanel />;
  }

  // Si no hay sesión, renderizar Landing Page (Home) con branding de fondo
  return (
    <div className="relative z-0 min-h-screen bg-[#020202]">
      {/* Marcador de Agua (Branding de Fondo) */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
        <h1 className="text-[25vw] font-black italic opacity-[0.03] text-white">
          AUTOTECH
        </h1>
      </div>
      
      {/* Contenido Principal */}
      <div className="relative z-10">
        <Home />
      </div>
    </div>
  );
}

export default App;