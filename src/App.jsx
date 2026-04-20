import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseCliente';
import { Instagram, Facebook, MessageSquare, Zap, CheckCircle, XCircle, X, User, ChevronDown } from 'lucide-react';

// ─── SOCIAL LINKS ────────────────────────────────────────────────────────────
const socialLinks = [
  {
    icon: <Instagram size={24} />,
    label: 'Instagram',
    href: 'https://www.instagram.com/yosley9207?igsh=NWx3bHVwbG91MHp4',
    wrapperClass: 'bg-[radial-gradient(circle_at_top_left,_rgba(255,0,128,1),_rgba(255,0,255,0.95),_rgba(128,0,255,1))] shadow-[0_0_40px_rgba(255,0,128,0.4)]',
  },
  {
    icon: <Facebook size={24} />,
    label: 'Facebook',
    href: 'https://facebook.com',
    wrapperClass: 'bg-[radial-gradient(circle_at_top_left,_rgba(0,212,255,1),_rgba(0,150,255,0.95),_rgba(0,100,255,1))] shadow-[0_0_40px_rgba(0,212,255,0.4)]',
  },
  {
    icon: <MessageSquare size={24} />,
    label: 'WhatsApp',
    href: 'https://wa.me/525563584217',
    wrapperClass: 'bg-[radial-gradient(circle_at_top_left,_rgba(0,255,136,1),_rgba(0,255,68,0.95),_rgba(0,200,100,1))] shadow-[0_0_40px_rgba(0,255,136,0.4)]',
  },
];

// ─── TOAST ───────────────────────────────────────────────────────────────────
const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);
  const isSuccess = type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, y: -60, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.92 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed top-6 left-1/2 z-[100] flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl"
      style={{
        transform: 'translateX(-50%)',
        background: isSuccess ? 'rgba(0,255,136,0.08)' : 'rgba(255,60,80,0.08)',
        borderColor: isSuccess ? 'rgba(0,255,136,0.25)' : 'rgba(255,60,80,0.25)',
        backdropFilter: 'blur(20px)',
        boxShadow: isSuccess
          ? '0 0 40px rgba(0,255,136,0.15), 0 10px 40px rgba(0,0,0,0.4)'
          : '0 0 40px rgba(255,60,80,0.15), 0 10px 40px rgba(0,0,0,0.4)',
        minWidth: '300px',
        maxWidth: '90vw',
      }}
    >
      {isSuccess
        ? <CheckCircle size={20} className="text-green-400 shrink-0" />
        : <XCircle size={20} className="text-red-400 shrink-0" />}
      <p className="text-sm font-medium text-slate-200 flex-1">{message}</p>
      <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition">
        <X size={16} />
      </button>
    </motion.div>
  );
};

// ─── WELCOME SCREEN ───────────────────────────────────────────────────────────
const WelcomeScreen = ({ onEnter }) => {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.9 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ambient orbs */}
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, #00d4ff44, transparent)' }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-8 px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-semibold">
            Experiencia Digital Premium
          </span>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src="/Logo.jpeg.png"
            alt="AutoTech Agency"
            className="h-32 w-32 rounded-3xl object-cover shadow-2xl"
            style={{ boxShadow: '0 0 60px rgba(0,212,255,0.25), 0 0 120px rgba(0,212,255,0.1)' }}
          />
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="space-y-2"
        >
          <h1
            className="text-5xl font-extrabold uppercase tracking-[0.2em] sm:text-6xl md:text-7xl"
            style={{
              background: 'linear-gradient(135deg, #c0c0c0 0%, #ffffff 40%, #a0a0a0 70%, #e0e0e0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(200,200,220,0.25))',
            }}
          >
            AutoTech
          </h1>
          <p
            className="text-xl font-light uppercase tracking-[0.5em] sm:text-2xl"
            style={{
              background: 'linear-gradient(90deg, #00d4ff, #ff0080)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Agency
          </p>
        </motion.div>

        {/* Welcome message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="max-w-lg text-base leading-7 text-slate-400 sm:text-lg"
        >
          Bienvenido a la agencia de diseño digital especializada en la industria automotriz de lujo.
          Donde la velocidad se fusiona con la elegancia.
        </motion.p>

        {/* Enter Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          onClick={onEnter}
          whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(0,212,255,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="group relative mt-2 overflow-hidden rounded-full px-10 py-4 text-sm font-bold uppercase tracking-[0.3em] text-slate-950 transition-all duration-300"
          style={{
            background: 'linear-gradient(90deg, #00d4ff 0%, #00a8cc 50%, #ff0080 100%)',
            boxShadow: '0 0 30px rgba(0,212,255,0.2)',
          }}
        >
          <span
            className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
          />
          <span className="relative">Entrar al sitio</span>
        </motion.button>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="flex flex-col items-center gap-1 text-slate-600"
        >
          <span className="text-xs uppercase tracking-widest">o presiona scroll</span>
          <ChevronDown size={16} className="animate-bounce" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3 sm:px-10"
      style={{
        background: scrolled ? 'rgba(5,5,5,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'all 0.4s ease',
      }}
    >
      <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
        <img src="/Logo.jpeg.png" alt="AutoTech Agency Logo" className="h-10 w-auto rounded-lg shadow-lg" />
        <span
          className="text-base font-extrabold uppercase tracking-widest"
          style={{
            background: 'linear-gradient(135deg, #c0c0c0 0%, #ffffff 50%, #a8a8a8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AutoTech Agency
        </span>
      </motion.div>

      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="hidden sm:flex items-center gap-2 rounded-full border border-white/15 bg-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-100 transition duration-300 hover:border-cyan-400/40 hover:bg-white/10"
        >
          <User size={14} />
          Iniciar Sesión
        </motion.button>
        <motion.button
          onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest text-slate-950 transition duration-300"
          style={{ background: 'linear-gradient(90deg, #00d4ff, #ff0080)', boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}
        >
          Contáctanos
        </motion.button>
      </div>
    </motion.nav>
  );
};

// ─── ANIMATED BACKGROUND ──────────────────────────────────────────────────────
const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let width, height;
    const beams = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      speed: 0.4 + Math.random() * 0.6,
      width: 1 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.4,
      color: ['#00d4ff', '#ff0080', '#c0c0c0', '#00ffaa'][Math.floor(Math.random() * 4)],
      angle: -0.15 + Math.random() * 0.3,
      length: 120 + Math.random() * 180,
      delay: i * 60,
      frame: 0,
    }));
    const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const GRID = 48;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255,255,255,0.035)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += GRID) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
      for (let y = 0; y < height; y += GRID) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      for (let x = 0; x < width; x += GRID)
        for (let y = 0; y < height; y += GRID) { ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill(); }
      beams.forEach((beam) => {
        beam.frame++;
        if (beam.frame < beam.delay) return;
        const progress = ((beam.frame - beam.delay) * beam.speed) % (height + beam.length + 400);
        const bx = beam.x + Math.sin(beam.angle) * progress;
        const by = -beam.length + progress;
        const grad = ctx.createLinearGradient(bx, by, bx + beam.angle * beam.length, by + beam.length);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.4, beam.color + Math.floor(beam.opacity * 255).toString(16).padStart(2, '0'));
        grad.addColorStop(1, 'transparent');
        ctx.save(); ctx.strokeStyle = grad; ctx.lineWidth = beam.width;
        ctx.shadowBlur = 12; ctx.shadowColor = beam.color;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + beam.angle * beam.length, by + beam.length); ctx.stroke();
        ctx.restore();
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState(null);

  // Entrar también con scroll
  useEffect(() => {
    if (!showWelcome) return;
    const onWheel = () => setShowWelcome(false);
    window.addEventListener('wheel', onWheel, { once: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [showWelcome]);

  const showToast = (type, message) => setToast({ type, message });
  const closeToast = () => setToast(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const N8N_URL = 'https://yoyistudio.app.n8n.cloud/webhook/contacto-autotechwidget';
    try {
      await supabase.from('contactos').insert([formData]);
      await fetch(N8N_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      showToast('success', '🚀 ¡Mensaje enviado! Te contactaremos pronto.');
      setFormData({ nombre: '', email: '', mensaje: '' });
    } catch (error) {
      console.error(error);
      showToast('error', 'Error al enviar. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* ── Welcome Screen ── */}
      <AnimatePresence>
        {showWelcome && <WelcomeScreen onEnter={() => setShowWelcome(false)} />}
      </AnimatePresence>

      {/* ── Main Site ── */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: showWelcome ? 0 : 1 }}
        transition={{ duration: 0.9, delay: 0.1 }}
        className="relative min-h-screen overflow-hidden bg-[#050505] text-slate-100"
      >
        {/* Toast */}
        <AnimatePresence>
          {toast && <Toast type={toast.type} message={toast.message} onClose={closeToast} />}
        </AnimatePresence>

        <Navbar />
        <AnimatedBackground />

        {/* Watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <img
            src="/Logo.jpeg.png"
            alt=""
            className="scale-[2.5] opacity-[0.07] select-none"
            style={{ maxWidth: '1200px', filter: 'brightness(1.3)' }}
          />
        </div>

        {/* Ambient orbs */}
        <div className="absolute -left-32 top-10 h-[500px] w-[500px] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-pink-900/10 blur-[100px] pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-slate-700/10 blur-[100px] pointer-events-none" />

        {/* ══════════════════════════════════════════════
            1. HERO — pantalla completa
        ══════════════════════════════════════════════ */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-12 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-col items-center gap-6 text-center max-w-4xl mx-auto"
          >
            {/* Logo */}
            <motion.img
              src="/logo.jpeg"
              alt="AutoTech Agency"
              className="h-28 w-28 rounded-3xl object-cover"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                filter: 'drop-shadow(0 0 24px rgba(0,212,255,0.45)) brightness(1.1)',
                mixBlendMode: 'screen',
              }}
            />

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-semibold">
                Agencia Digital Automotriz
              </span>
            </motion.div>

            {/* Heading */}
            <h1
              className="text-5xl font-extrabold italic leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
              style={{
                background: 'linear-gradient(135deg, #c0c0c0 0%, #ffffff 40%, #a8a8a8 70%, #e8e8e8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(200,200,220,0.2))',
              }}
            >
              Diseño digital de alto rendimiento para talleres de lujo.
            </h1>

            {/* Subheading */}
            <p className="max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
              Fusionamos la estética futurista con la fuerza técnica de la industria automotriz para crear
              experiencias web que se sienten pulidas, veloces y confiables.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <motion.button
                onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0,212,255,0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-slate-950 transition duration-300"
                style={{ background: 'linear-gradient(90deg, #00d4ff, #ff0080)' }}
              >
                Iniciar diagnóstico
              </motion.button>
              <motion.a
                href="https://wa.me/525563584217"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-slate-200 transition duration-300 hover:bg-white/10"
              >
                WhatsApp
              </motion.a>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown size={18} className="animate-bounce" />
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════
            2. FORMULARIO DE CONTACTO
        ══════════════════════════════════════════════ */}
        <section className="relative mx-auto max-w-3xl px-6 pb-16 sm:px-8 lg:px-10">
          <motion.div
            id="contacto"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/8 blur-3xl pointer-events-none" />
            <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-pink-500/8 blur-3xl pointer-events-none" />

            <div className="mb-8 space-y-3 relative">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-semibold">Contacto Premium</p>
              <h2 className="text-3xl font-extrabold text-[#e0e0e0] sm:text-4xl">
                Hablemos de tu próximo proyecto
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Déjanos tu información y nuestro equipo te entregará una propuesta alineada a tu identidad automotriz.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative">
              {[
                { label: 'Propietario / Empresa', name: 'nombre', type: 'text', placeholder: 'Nombre completo' },
                { label: 'Correo electrónico', name: 'email', type: 'email', placeholder: 'correo@ejemplo.com' },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {field.label}
                  </label>
                  <input
                    required
                    type={field.type}
                    value={formData[field.name]}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full rounded-2xl px-5 py-3.5 text-slate-200 placeholder-slate-600 outline-none transition duration-300 focus:ring-1 focus:ring-cyan-500/30 text-sm"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
              ))}

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Mensaje
                </label>
                <textarea
                  required
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  placeholder="Cuéntanos sobre tu proyecto o servicio automotriz..."
                  rows={4}
                  className="w-full rounded-2xl px-5 py-3.5 text-slate-200 placeholder-slate-600 outline-none transition duration-300 focus:ring-1 focus:ring-cyan-500/30 resize-none text-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={enviando}
                whileHover={{ scale: 1.03, boxShadow: '0 0 50px rgba(0,212,255,0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest text-slate-950 transition duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: 'linear-gradient(90deg, #00d4ff 0%, #00a8cc 50%, #ff0080 100%)',
                  boxShadow: '0 0 30px rgba(0,212,255,0.2)',
                }}
              >
                <Zap size={18} />
                {enviando ? 'Sincronizando...' : 'Iniciar diagnóstico'}
              </motion.button>
            </form>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════
            3. FOOTER — WhatsApp + Redes
        ══════════════════════════════════════════════ */}
        <footer className="relative mx-auto max-w-7xl px-6 pb-16 sm:px-8 lg:px-10">
          <div className="border-t border-white/10 pt-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center gap-6"
            >
              {/* WhatsApp button */}
              <a
                href="https://wa.me/525563584217"
                target="_blank"
                rel="noopener noreferrer"
                className="animate-pulse inline-flex w-full max-w-2xl items-center justify-center gap-3 rounded-3xl bg-[#25D366] px-8 py-5 text-center text-base font-extrabold uppercase tracking-[0.24em] text-black shadow-[0_0_40px_rgba(37,211,102,0.35)] transition duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(37,211,102,0.45)]"
              >
                <MessageSquare size={20} />
                Hablar con un experto
              </a>

              {/* Social icons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {socialLinks.map((item, i) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4, scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    className={`flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 ${item.wrapperClass} shadow-lg transition duration-300`}
                  >
                    {item.icon}
                  </motion.a>
                ))}
              </div>

              <p className="text-xs text-slate-700 uppercase tracking-widest mt-2">
                © {new Date().getFullYear()} AutoTech Agency · Todos los derechos reservados
              </p>
            </motion.div>
          </div>
        </footer>
      </motion.main>
    </>
  );
};

export default App;
