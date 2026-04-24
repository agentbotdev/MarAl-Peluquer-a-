import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X, User } from 'lucide-react';
import { useAppointments } from '../store/appointments';
import { SERVICES } from '../data/services';
import { Professional } from '../types';

export default function AdminCalendar() {
  const { appointments, cancelAppointment } = useAppointments();
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const changeDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const HOURS = Array.from({ length: 23 }, (_, i) => {
    const h = Math.floor(9 + i / 2);
    const m = (i % 2) * 30;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  });

  const timeToPixels = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const minutesSince9 = (h - 9) * 60 + m;
    return (minutesSince9 / 30) * 40;
  };

  const dayAppointments = appointments.filter(a => a.id && a.date === currentDate); // Basic guard

  const renderColumn = (prof: Professional, color: string, bg: string, label: string, initial: string) => (
    <div className="flex-1 relative border-l border-white/5 min-w-[300px]">
      <div className={`sticky top-0 z-20 ${bg} p-4 border-b border-white/10 flex items-center gap-3`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${color}`}>
          {initial}
        </div>
        <span className="font-bold text-white uppercase tracking-widest text-sm">{label}</span>
      </div>
      
      <div className="relative" style={{ height: HOURS.length * 40 }}>
        {dayAppointments.filter(a => a.professional === prof).map(app => {
          const service = SERVICES.find(s => s.id === app.serviceId);
          const top = timeToPixels(app.startTime);
          const duration = service?.duration || 30;
          const height = (duration / 30) * 40;

          return (
            <motion.div
              key={app.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute left-2 right-2 rounded-lg p-3 border-l-4 shadow-xl z-10 overflow-hidden flex flex-col justify-between group transition-all hover:brightness-110 ${
                prof === 'norma' ? 'bg-pink-900/40 border-pink-500' : 'bg-blue-900/40 border-blue-500'
              }`}
              style={{ top, height }}
            >
              <button 
                onClick={() => cancelAppointment(app.id)}
                className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full"
              >
                <X size={12} className="text-white" />
              </button>
              <div className="space-y-1">
                <p className="text-white font-bold text-xs truncate uppercase">{app.clientName}</p>
                <p className="text-white/60 text-[10px] truncate">{service?.name}</p>
              </div>
              <p className="text-[10px] font-mono text-white/40">{app.startTime} - {app.endTime}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  // Current time line
  const nowTop = timeToPixels(`${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`);
  const isToday = currentDate === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#080808] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-2xl letter-spacing-tight">CASA RICCIO</span>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50 font-bold tracking-tighter">ADMIN</span>
        </div>
        
        <div className="flex items-center gap-6 bg-white/5 p-1 rounded-full px-4">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={18} /></button>
          <div className="text-center min-w-[140px]">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{currentDate === new Date().toISOString().split('T')[0] ? 'Hoy' : ''}</p>
            <p className="font-bold text-sm">{new Date(currentDate + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={18} /></button>
        </div>

        <div className="flex gap-4">
          <a href="#" className="text-xs text-white/40 hover:text-white transition-colors">Volver a la Web</a>
        </div>
      </header>

      {/* Grid */}
      <div className="flex-grow overflow-auto flex">
        {/* Time Labels */}
        <div className="w-16 sticky left-0 z-30 bg-[#050505] border-r border-white/5 flex flex-col">
          <div className="h-[73px] border-b border-white/10"></div> {/* Match header height */}
          <div className="relative">
            {HOURS.map(h => (
              <div key={h} className="h-10 flex items-start justify-center pr-2 pt-0.5">
                <span className="text-[10px] text-white/30 font-mono">{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Professionals columns */}
        <div className="flex-grow flex relative">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {HOURS.map((_, i) => (
              <div key={i} className="h-10 border-b border-white/5"></div>
            ))}
          </div>

          {/* Time Line */}
          {isToday && nowTop > 0 && nowTop < (HOURS.length * 40) && (
            <div className="absolute left-0 right-0 z-40 border-t-2 border-red-500/50 flex items-center" style={{ top: nowTop }}>
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
            </div>
          )}

          {renderColumn('norma', 'bg-pink-500', 'bg-[#080808]', 'Norma', 'N')}
          {renderColumn('mario', 'bg-blue-500', 'bg-[#080808]', 'Mario', 'M')}
        </div>
      </div>
    </div>
  );
}
