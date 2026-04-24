export type Professional = 'norma' | 'mario';

export interface Service {
  id: string;
  name: string;
  duration: 30 | 60 | 120; // minutos
  professional: Professional;
  price?: number;
  image?: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  professional: Professional;
  clientName: string;
  clientPhone: string;
  date: string; // ISO YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}
