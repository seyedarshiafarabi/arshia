import { Booking, TimeSlot, CourtId, HeldSlot } from '../types';
import { COURTS, generateDaySlots } from '../data/courtsData';

const BOOKINGS_STORAGE_KEY = 'north_tennis_bookings_v1';
const SLOTS_OVERRIDE_KEY = 'north_tennis_slots_override_v1';
const HELD_SLOTS_STORAGE_KEY = 'north_tennis_held_slots_v1';
const SESSION_ID_KEY = 'north_tennis_session_id_v1';

export const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface SlotOverride {
  isBooked?: boolean;
  reservationCode?: string;
  isBlocked?: boolean;
}

// Get or generate a persistent unique session ID for current browser client
export function getOrCreateSessionId(): string {
  try {
    let sid = localStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = 'usr_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return 'temp_usr_' + Date.now();
  }
}

// Retrieve currently active held slots, purging expired ones
export function getHeldSlots(): HeldSlot[] {
  try {
    const raw = localStorage.getItem(HELD_SLOTS_STORAGE_KEY);
    if (!raw) return [];
    const list: HeldSlot[] = JSON.parse(raw);
    const now = Date.now();

    // Keep only unexpired holds
    const active = list.filter((h) => h.heldUntil > now);
    if (active.length !== list.length) {
      localStorage.setItem(HELD_SLOTS_STORAGE_KEY, JSON.stringify(active));
    }
    return active;
  } catch {
    return [];
  }
}

// Hold slots for 5 minutes during the checkout/payment step
export function holdSlots(slotIds: string[], courtId: CourtId): HeldSlot[] {
  try {
    const active = getHeldSlots();
    const sessionId = getOrCreateSessionId();
    const heldUntil = Date.now() + HOLD_DURATION_MS;

    const remaining = active.filter((h) => !slotIds.includes(h.slotId));
    const newHolds: HeldSlot[] = slotIds.map((slotId) => ({
      slotId,
      courtId,
      heldUntil,
      heldBySessionId: sessionId,
    }));

    const updated = [...remaining, ...newHolds];
    localStorage.setItem(HELD_SLOTS_STORAGE_KEY, JSON.stringify(updated));
    return newHolds;
  } catch (err) {
    console.error('Failed to hold slots', err);
    return [];
  }
}

// Release held slots (e.g. user cancels or modal is closed)
export function releaseHeldSlots(slotIds: string[]): void {
  try {
    if (!slotIds || slotIds.length === 0) return;
    const active = getHeldSlots();
    const updated = active.filter((h) => !slotIds.includes(h.slotId));
    localStorage.setItem(HELD_SLOTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to release held slots', err);
  }
}

// Release all slots held by the current session
export function releaseAllMyHeldSlots(): void {
  try {
    const active = getHeldSlots();
    const sessionId = getOrCreateSessionId();
    const updated = active.filter((h) => h.heldBySessionId !== sessionId);
    localStorage.setItem(HELD_SLOTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to release all held slots', err);
  }
}

export function getStoredBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load bookings from storage', err);
    return [];
  }
}

export function saveBookingToStorage(booking: Booking): void {
  try {
    const current = getStoredBookings();
    const updated = [booking, ...current];
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));

    // Release from holds
    releaseHeldSlots(booking.slotIds);

    // Also update slot overrides
    const overrides = getStoredSlotOverrides();
    booking.slotIds.forEach((slotId) => {
      overrides[slotId] = {
        isBooked: true,
        reservationCode: booking.reservationCode,
      };
    });
    localStorage.setItem(SLOTS_OVERRIDE_KEY, JSON.stringify(overrides));
  } catch (err) {
    console.error('Failed to save booking', err);
  }
}

export function cancelBookingInStorage(reservationCode: string): boolean {
  try {
    const current = getStoredBookings();
    const target = current.find((b) => b.reservationCode === reservationCode);
    if (!target) return false;

    // Mark booking as cancelled
    const updated = current.map((b) =>
      b.reservationCode === reservationCode ? { ...b, status: 'cancelled' as const } : b
    );
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));

    // Release slots in overrides
    const overrides = getStoredSlotOverrides();
    target.slotIds.forEach((slotId) => {
      delete overrides[slotId];
    });
    localStorage.setItem(SLOTS_OVERRIDE_KEY, JSON.stringify(overrides));
    return true;
  } catch (err) {
    console.error('Failed to cancel booking', err);
    return false;
  }
}

export function getStoredSlotOverrides(): Record<string, SlotOverride> {
  try {
    const raw = localStorage.getItem(SLOTS_OVERRIDE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Get full slots for a court on a specific date, merging seed, user overrides, and 5-min holds
export function getSlotsForCourtAndDate(courtId: CourtId, dateStr: string): TimeSlot[] {
  const court = COURTS.find((c) => c.id === courtId);
  if (!court) return [];

  const baseSlots = generateDaySlots(court, dateStr);
  const overrides = getStoredSlotOverrides();
  const heldSlots = getHeldSlots();
  const sessionId = getOrCreateSessionId();

  return baseSlots.map((slot) => {
    const override = overrides[slot.id];
    const hold = heldSlots.find((h) => h.slotId === slot.id);

    const isBooked = override?.isBooked !== undefined ? override.isBooked : slot.isBooked;
    const isHeld = !isBooked && !!hold && hold.heldUntil > Date.now();
    const heldByMe = isHeld ? hold?.heldBySessionId === sessionId : false;

    return {
      ...slot,
      isBooked,
      isHeld,
      heldUntil: hold?.heldUntil,
      heldByMe,
      reservationCode: override?.reservationCode || slot.reservationCode,
      isBlocked: override?.isBlocked || false,
    };
  });
}
