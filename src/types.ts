export type CourtId = 'clay' | 'padel' | 'beach';

export interface Court {
  id: CourtId;
  name: string;
  nameFa: string;
  subtitleFa: string;
  descriptionFa: string;
  surface: string;
  badge: string;
  badgeColor: string;
  dayPrice: number; // in Tomans
  nightPrice: number; // in Tomans (with floodlights)
  features: string[];
  dimensions: string;
}

export interface TimeSlot {
  id: string; // unique: courtId_YYYY-MM-DD_HH-mm
  courtId: CourtId;
  dateStr: string; // YYYY-MM-DD
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "09:30" or "09:00"
  price: number;
  isNight: boolean; // under floodlights
  isBooked: boolean;
  isHeld?: boolean; // temporary 5-minute hold during checkout
  heldUntil?: number; // epoch ms when hold expires
  heldByMe?: boolean; // whether current user session is holding it
  reservationCode?: string;
  isBlocked?: boolean; // blocked for maintenance or club internal use
}

export interface HeldSlot {
  slotId: string;
  courtId: CourtId;
  heldUntil: number; // timestamp in ms (now + 5 mins)
  heldBySessionId: string;
}

export interface Booking {
  reservationCode: string;
  courtId: CourtId;
  courtName: string;
  dateStr: string;
  dateLabelFa: string;
  slotIds: string[];
  timeRange: string; // e.g. "18:00 - 19:30"
  customerName: string;
  customerPhone: string;
  notes?: string;
  needsRacket: boolean;
  needsCoach: boolean;
  totalPrice: number;
  paymentStatus: 'paid' | 'pending';
  transactionRef?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface DayOption {
  dateStr: string; // YYYY-MM-DD
  dayNameFa: string; // e.g. "امروز", "فردا", "دوشنبه"
  dayNumberFa: string; // e.g. "۲"
  monthNameFa: string; // e.g. "مهر"
  isToday: boolean;
}
