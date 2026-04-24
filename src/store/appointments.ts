import { useState, useEffect, useCallback } from 'react';
import { Appointment, Professional } from '../types';

const STORAGE_KEY = 'casa-riccio-appointments';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAppointments(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading appointments", e);
      }
    }
  }, []);

  // Save to LocalStorage
  const save = (newApps: Appointment[]) => {
    setAppointments(newApps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newApps));
  };

  const addAppointment = (app: Appointment) => {
    save([...appointments, app]);
  };

  const cancelAppointment = (id: string) => {
    save(appointments.filter(a => a.id !== id));
  };

  const hasConflict = useCallback((professional: Professional, date: string, startTime: string, endTime: string) => {
    return appointments.some(app => {
      if (app.professional !== professional || app.date !== date) return false;
      
      const appStart = app.startTime;
      const appEnd = app.endTime;

      // Overlap logic: (StartA < EndB) && (EndA > StartB)
      return (startTime < appEnd) && (endTime > appStart);
    });
  }, [appointments]);

  return { appointments, addAppointment, cancelAppointment, hasConflict };
}
