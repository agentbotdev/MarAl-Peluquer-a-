/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Instagram, 
  Menu, 
  X, 
  Scissors, 
  Star, 
  ChevronRight, 
  User,
} from 'lucide-react';
import { useAppointments } from './store/appointments';
import { SERVICES } from './data/services';
import { Appointment } from './types';
import AdminCalendar from './components/AdminCalendar';

// --- Visual-only Constants ---
const TESTIMONIALS = [
  { id: '1', name: 'LAURA M.', text: '"Norma es una genia, me dejó el cabello hermoso. ¡Ya reservé para el mes que viene!"', stars: 5, initial: 'L' },
  { id: '2', name: 'SEBASTIÁN G.', text: '"Mario me hizo el mejor corte que tuve en años. Muy recomendable."', stars: 5, initial: 'S' },
  { id: '3', name: 'VALERIA T.', text: '"El ambiente es súper cálido y cómodo. Siempre salgo feliz."', stars: 5, initial: 'V' },
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin');
  const { addAppointment, hasConflict } = useAppointments();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    serviceId: '',
    time: '',
    name: '',
    phone: '',
  });

  useEffect(() => {
    const handleHash = () => setIsAdmin(window.location.hash === '#admin');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const selectedService = SERVICES.find(s => s.id === formData.serviceId);

  const calculateEndTime = (start: string, duration: number) => {
    const [h, m] = start.split(':').map(Number);
    const date = new Date();
    date.setHours(h, (m || 0) + duration);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !formData.time || !formData.name) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const endTime = calculateEndTime(formData.time, selectedService.duration);
    
    if (hasConflict(selectedService.professional, selectedDate, formData.time, endTime)) {
      alert("Lo sentimos, ese horario ya está ocupado. Por favor elige otro.");
      return;
    }

    const newApp: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      serviceId: selectedService.id,
      professional: selectedService.professional,
      clientName: formData.name,
      clientPhone: formData.phone,
      date: selectedDate,
      startTime: formData.time,
      endTime
    };

    addAppointment(newApp);

    const professionalNumber = selectedService.professional === 'mario' ? '5491163579889' : '5491149714692';
    const message = `¡Hola MarAl! Quisiera agendar un turno.\n\n👤 Cliente: ${formData.name}\n💇 Servicio: ${selectedService.name}\n🤝 Atiende: ${selectedService.professional === 'norma' ? 'Norma' : 'Mario'}\n📅 Fecha: ${selectedDate}\n⏰ Hora: ${formData.time} hs\n\n¿Me confirman disponibilidad? Gracias!`;
    window.open(`https://wa.me/${professionalNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isAdmin) {
    return <AdminCalendar />;
  }

  const getTimeSlots = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = date.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    
    // Check if it's a holiday (approximate based on user input '10 a 16')
    // For now, we'll treat Sundays as holidays or closed? 
    // The user said: "Feriados 10 a 16", "Lunes 12 a 19", "Martes a sabados 10 a 20"
    
    let start = 10;
    let end = 20;

    if (dayOfWeek === 1) { // Monday
      start = 12;
      end = 19;
    } else if (dayOfWeek === 0) { // Sunday (treating as holiday/closed based on context)
      start = 10;
      end = 16;
    } else { // Tuesday to Saturday
      start = 10;
      end = 20;
    }

    const slots = [];
    for (let h = start; h < end; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    // Add the final slot if it ends exactly at the hour
    if (dayOfWeek === 1 && end === 19) {
      // Monday ends at 19:00
    } else if (dayOfWeek === 0 && end === 16) {
      // Sunday ends at 16:00
    } else {
      // Normal days end at 20:00
    }
    
    return slots;
  };

  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="min-h-screen font-sans">
      {/* --- Sticky Header --- */}
      <header className="sticky top-0 z-50 bg-brand text-white px-6 py-3 shadow-lg flex justify-between items-center">
        <h1 className="font-script text-3xl tracking-wide">MarAl</h1>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1">
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-brand text-white overflow-hidden flex flex-col items-center gap-4 py-4 border-t border-white/10"
          >
            <a href="#inicio" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:opacity-80">Inicio</a>
            <a href="#reservar" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:opacity-80">Reservar</a>
            <a href="#servicios" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:opacity-80">Servicios</a>
            <a href="#contacto" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:opacity-80">Contacto</a>
          </motion.nav>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* --- Hero Section --- */}
        <motion.section 
          id="inicio"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-huge p-12 relative overflow-hidden shadow-sm"
        >
          <div className="absolute top-8 right-8 w-24 h-24 bg-brand-soft rounded-full -mr-4 -mt-4" />
          <div className="relative z-10 space-y-6">
            <h2 className="font-serif text-5xl leading-tight text-gray-900 md:text-6xl max-w-lg">
              Tu belleza,<br />en buenas manos
            </h2>
            <div className="space-y-1 text-gray-500 font-medium tracking-wide">
              <p>Peluquería unisex · Norma & Mario</p>
              <p>Tu barrio de siempre.</p>
            </div>
            <a href="#reservar" className="inline-flex bg-brand text-white px-8 py-3 rounded-2xl font-medium items-center gap-2 hover:brightness-110 transition-all">
              Reservar turno <ChevronRight size={18} />
            </a>
          </div>
        </motion.section>

        {/* --- Quick Links --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div 
              onClick={() => window.open('https://wa.me/5491149714692?text=Hola%20Norma!%20Quisiera%20consultar%20por%20un%20turno.', '_blank')}
              className="bg-white rounded-[2rem] p-6 flex items-center gap-4 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="bg-emerald-50 p-3 rounded-full text-emerald-500">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Whatsapp Norma</p>
                <p className="text-gray-700 font-semibold">+54 9 11 4971-4692</p>
              </div>
            </div>
            
            <div 
              onClick={() => window.open('https://wa.me/5491163579889?text=Hola%20Mario!%20Quisiera%20consultar%20por%20un%20turno.', '_blank')}
              className="bg-white rounded-[2rem] p-6 flex items-center gap-4 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="bg-emerald-50 p-3 rounded-full text-emerald-500">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Whatsapp Mario</p>
                <p className="text-gray-700 font-semibold">+54 9 11 6357-9889</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-6 flex items-center gap-4 shadow-sm">
            <div className="bg-red-50 p-3 rounded-full text-red-400">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ubicación</p>
              <p className="text-gray-700 font-semibold uppercase">Monroe 2449, CABA</p>
            </div>
          </div>
        </section>

        {/* --- Booking Form --- */}
        <motion.section 
          id="reservar"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-huge p-8 md:p-12 shadow-sm space-y-8"
        >
          <h3 className="font-serif text-3xl text-gray-900">Reserva tu turno</h3>

          {/* 1. Service Selection first (determines professional) */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">1. Seleccioná el servicio</h4>
            <select 
              value={formData.serviceId}
              onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600 focus:ring-2 focus:ring-brand focus:outline-none appearance-none"
            >
              <option value="">Elegí un servicio...</option>
              <optgroup label="Atiende Norma">
                {SERVICES.filter(s => s.professional === 'norma').map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>)}
              </optgroup>
              <optgroup label="Atiende Mario">
                {SERVICES.filter(s => s.professional === 'mario').map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>)}
              </optgroup>
            </select>
            {selectedService && (
              <p className="text-xs text-gray-400">Atendido por: <span className="font-bold text-brand uppercase">{selectedService.professional}</span></p>
            )}
          </div>

          {/* 2. Calendar */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">2. Seleccioná el día</h4>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 overflow-x-auto">
              <div className="grid grid-cols-7 min-w-[300px] gap-2 mb-4 text-center">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, idx) => (
                  <span key={`cal-day-${day}-${idx}`} className="text-[10px] text-gray-300 font-bold">{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 min-w-[300px] gap-1 text-center">
                {calendarDays.map(dateStr => {
                  const day = new Date(dateStr + 'T12:00:00').getDate();
                  const isActive = selectedDate === dateStr;
                  return (
                    <button 
                      key={`date-${dateStr}`}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-10 text-sm font-medium rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Time */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">3. Horario</h4>
            <select 
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600 focus:ring-2 focus:ring-brand focus:outline-none appearance-none"
            >
              <option value="">Elegí horario...</option>
              {getTimeSlots(selectedDate).map(t => (
                <option key={`time-opt-${t}`} value={t}>{t} hs</option>
              ))}
            </select>
          </div>

          {/* 4. User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">4. Tus datos</h4>
              <input 
                type="text" 
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600 focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-transparent hidden md:block">Placeholder</h4>
              <input 
                type="text" 
                placeholder="WhatsApp (ej: 1123456789)"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600 focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>

          <button 
            onClick={handleBooking}
            className="w-full bg-whatsapp text-gray-700 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-sm"
          >
            <Phone size={20} /> Agendar Turno por WhatsApp
          </button>
        </motion.section>

        {/* --- Services List --- */}
        <section id="servicios" className="space-y-8">
          <div className="text-center space-y-4">
            <h3 className="font-serif text-5xl text-gray-900">Nuestros servicios</h3>
            <div className="w-24 h-1 bg-gold mx-auto rounded-full opacity-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.slice(0, 18).map((s) => (
              <motion.div 
                key={`serv-card-${s.id}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-huge shadow-sm flex flex-col group border border-gray-50 hover:border-brand/10 transition-all overflow-hidden"
              >
                {s.image && (
                  <div className="h-48 w-full overflow-hidden bg-gray-100 relative">
                    <img 
                      src={s.image} 
                      alt={s.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop';
                      }}
                    />
                  </div>
                )}
                <div className="p-8 flex flex-col justify-between flex-grow">
                  <div className="space-y-4">
                    <div className="bg-brand-soft w-10 h-10 rounded-xl flex items-center justify-center text-brand">
                      <Scissors size={20} />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl text-gray-900">{s.name}</h4>
                      <p className="text-gray-400 text-sm">{s.duration} minutos</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- About Section --- */}
        <section className="space-y-8">
          <h3 className="font-serif text-5xl text-gray-900">Conocenos</h3>
          <p className="text-gray-500 max-w-2xl leading-relaxed">
            MarAl es una peluquería de barrio donde cada cliente es tratado con dedicación. <span className="text-brand font-medium">Norma y Mario</span> llevan años transformando looks y generando sonrisas en nuestra comunidad en Monroe.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-huge p-12 text-center shadow-sm space-y-4">
              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-brand font-serif text-4xl mx-auto shadow-inner">N</div>
              <div>
                <h4 className="text-gold font-bold text-lg">Norma</h4>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">COLORISTA</p>
              </div>
            </div>
            <div className="bg-white rounded-huge p-12 text-center shadow-sm space-y-4">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 font-serif text-4xl mx-auto shadow-inner">M</div>
              <div>
                <h4 className="text-blue-500 font-bold text-lg">Mario</h4>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">ESTILISTA</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Portfolio Section --- */}
        <section className="space-y-8">
          <div className="space-y-1">
            <h3 className="font-serif text-4xl text-gray-900">Nuestros trabajos</h3>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Arte y estilo capturados en cada detalle.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SERVICES.filter(s => s.image).slice(0, 9).map((item, idx) => (
              <div 
                key={`port-${item.id}-${idx}`} 
                className="aspect-[3/4] rounded-huge flex items-center justify-center group cursor-pointer overflow-hidden relative shadow-sm bg-gray-100"
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 text-center">
                  <span className="font-serif text-2xl font-bold text-white drop-shadow-lg">
                    {item.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Testimonials --- */}
        <section className="py-12 bg-white/50 rounded-huge px-6">
          <h3 className="font-serif italic text-3xl text-center text-gray-800 mb-12">"Lo que dicen de nosotros"</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={`test-${t.id}`} className="bg-white rounded-huge p-8 shadow-sm space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex text-gold">
                    {Array.from({ length: t.stars }).map((_, i) => <Star key={`star-${t.id}-${i}`} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-700 italic text-sm leading-relaxed">{t.text}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-soft text-brand text-xs font-bold flex items-center justify-center">
                    {t.initial}
                  </div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-900">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Contact & Footer --- */}
        <footer id="contacto" className="space-y-8 pb-20">
          <div className="bg-white rounded-huge p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-12 border border-gray-100">
            <div className="space-y-8">
              <h3 className="font-serif text-5xl text-gray-900">Contactanos</h3>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 p-2 rounded-full text-emerald-500"><Phone size={20} /></div>
                    <p className="text-gray-600 font-medium">Norma: +54 9 11 4971-4692</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 p-2 rounded-full text-emerald-500"><Phone size={20} /></div>
                    <p className="text-gray-600 font-medium">Mario: +54 9 11 6357-9889</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-pink-50 p-2 rounded-full text-brand"><Instagram size={20} /></div>
                  <p className="text-gray-600 font-medium">@maral.peluqueria</p>
                </div>
              </div>
            </div>
            <div className="bg-pink-50/30 rounded-3xl p-8 space-y-4 flex flex-col justify-center items-center text-center">
              <Clock size={32} className="text-brand mb-2" />
              <div>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">HORARIO DE ATENCIÓN</p>
                <p className="text-gray-800 font-serif text-lg">Lunes a Sábado</p>
                <p className="text-brand font-bold text-2xl">12:00 - 20:00 hs</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <button 
              onClick={() => window.open('https://wa.me/5491149714692?text=Hola%20Norma!%20Quisiera%20consultar.', '_blank')}
              className="w-full bg-[#1cbd5e] text-white py-12 rounded-huge font-bold flex flex-col items-center justify-center gap-3 shadow-lg hover:brightness-95 transition-all"
            >
              <Phone size={32} />
              <div className="text-center">
                <span className="block text-2xl">Norma</span>
                <span className="text-xs opacity-80 font-bold uppercase tracking-widest text-white/80">WHATSAPP</span>
              </div>
            </button>
            <button 
              onClick={() => window.open('https://wa.me/5491163579889?text=Hola%20Mario!%20Quisiera%20consultar.', '_blank')}
              className="w-full bg-[#1cbd5e] text-white py-12 rounded-huge font-bold flex flex-col items-center justify-center gap-3 shadow-lg hover:brightness-95 transition-all"
            >
              <Phone size={32} />
              <div className="text-center">
                <span className="block text-2xl">Mario</span>
                <span className="text-xs opacity-80 font-bold uppercase tracking-widest text-white/80">WHATSAPP</span>
              </div>
            </button>
          </div>
          <div className="flex flex-col items-center gap-4">
            <a href="#admin" className="text-xs text-gray-300 hover:text-brand font-bold tracking-widest transition-colors uppercase">Panel Administrativo</a>
          </div>
        </footer>
      </main>

      <footer className="bg-brand py-8 text-center">
        <h1 className="font-script text-4xl text-white opacity-80">MarAl</h1>
      </footer>
    </div>
  );
}
