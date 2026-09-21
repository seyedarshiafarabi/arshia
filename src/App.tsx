/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Court, TimeSlot, Booking, CourtId } from './types';
import { COURTS, CLUB_INFO } from './data/courtsData';
import { getUpcomingDays } from './utils/dateUtils';
import {
  getStoredBookings,
  saveBookingToStorage,
  cancelBookingInStorage,
  getSlotsForCourtAndDate,
  holdSlots,
  releaseHeldSlots,
} from './utils/storage';
import { formatToman, toPersianDigits } from './utils/dateUtils';
import { Lock, ArrowLeft, Clock, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DateSelector } from './components/DateSelector';
import { CourtFilter } from './components/CourtFilter';
import { CourtScheduleCard } from './components/CourtScheduleCard';
import { BookingModal } from './components/BookingModal';
import { ReceiptModal } from './components/ReceiptModal';
import { MyBookingsView } from './components/MyBookingsView';
import { ClubFacilities } from './components/ClubFacilities';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'booking' | 'my-bookings' | 'facilities'>('booking');
  const days = useMemo(() => getUpcomingDays(10), []);
  const [selectedDate, setSelectedDate] = useState<string>(days[0]?.dateStr || '');
  const [selectedCourtFilter, setSelectedCourtFilter] = useState<CourtId | 'all'>('all');

  // Selected slots by the customer
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  // Booking Modal State
  const [bookingCourt, setBookingCourt] = useState<Court | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);

  // Receipt Modal State
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Stored Bookings list
  const [bookings, setBookings] = useState<Booking[]>([]);
  // Refresh trigger for slot state re-computation
  const [storageVersion, setStorageVersion] = useState<number>(0);

  // Reassurance toast notification when slot is released or cancelled
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!noticeMessage) return;
    const timer = setTimeout(() => {
      setNoticeMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [noticeMessage]);

  // Load bookings on mount and whenever updated
  useEffect(() => {
    setBookings(getStoredBookings());
  }, [storageVersion]);

  // Periodic heartbeat every 3 seconds to keep temporary holds synced across tabs and purge expired holds
  useEffect(() => {
    const interval = setInterval(() => {
      setStorageVersion((v) => v + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Compute slots for each court on the currently selected date
  const courtsSlotsMap = useMemo(() => {
    // depend on storageVersion to reload when bookings or cancellations happen
    void storageVersion;
    const map: Record<CourtId, TimeSlot[]> = {
      clay: getSlotsForCourtAndDate('clay', selectedDate),
      padel: getSlotsForCourtAndDate('padel', selectedDate),
      beach: getSlotsForCourtAndDate('beach', selectedDate),
    };
    return map;
  }, [selectedDate, storageVersion]);

  // Compute available slot counts per day for the DateSelector badges
  const availableCountsByDate = useMemo(() => {
    void storageVersion;
    const counts: Record<string, number> = {};
    days.forEach((day) => {
      let totalFree = 0;
      COURTS.forEach((court) => {
        const slots = getSlotsForCourtAndDate(court.id, day.dateStr);
        totalFree += slots.filter((s) => !s.isBooked && !s.isBlocked && !s.isHeld).length;
      });
      counts[day.dateStr] = totalFree;
    });
    return counts;
  }, [days, storageVersion]);

  // Handle slot click (toggle selection)
  const handleToggleSlot = (slot: TimeSlot) => {
    // If slot is held by someone else or booked, ignore
    if (slot.isBooked || slot.isBlocked || (slot.isHeld && !slot.heldByMe)) {
      return;
    }

    const isAlreadySelected = selectedSlotIds.includes(slot.id);
    if (isAlreadySelected) {
      // User opted out of this slot: release hold in storage immediately
      releaseHeldSlots([slot.id]);
      setSelectedSlotIds((prev) => prev.filter((id) => id !== slot.id));
      setStorageVersion((v) => v + 1);
      setNoticeMessage('سانس انتخابی آزاد شد و رزرو در همان لحظه برداشته شد.');
    } else {
      // User selected slot: hold it for 5 minutes
      holdSlots([slot.id], slot.courtId);
      setSelectedSlotIds((prev) => [...prev, slot.id]);
      setStorageVersion((v) => v + 1);
    }
  };

  // User explicitly cancels all selected slots from the floating bar or court card
  const handleCancelSelection = () => {
    if (selectedSlotIds.length > 0) {
      releaseHeldSlots(selectedSlotIds);
      setSelectedSlotIds([]);
      setStorageVersion((v) => v + 1);
      setNoticeMessage('رزرو سانس با موفقیت لغو و درجا آزاد گردید.');
    }
  };

  // Open booking modal for a specific court and lock slots for 5 minutes
  const handleProceedToBooking = (court: Court) => {
    const courtSlots = (courtsSlotsMap[court.id] || []).filter((s) =>
      selectedSlotIds.includes(s.id)
    );
    if (courtSlots.length === 0) return;

    // Trigger instant 5-minute hold for these slots
    holdSlots(courtSlots.map((s) => s.id), court.id);
    setBookingCourt(court);
    setIsBookingModalOpen(true);
    setStorageVersion((v) => v + 1);
  };

  // Release hold if user cancels or closes modal: releases hold, clears selection, closes modal
  const handleReleaseHold = (slotIds: string[]) => {
    const targetIds = slotIds.length > 0 ? slotIds : selectedSlotIds;
    releaseHeldSlots(targetIds);
    setSelectedSlotIds([]);
    setIsBookingModalOpen(false);
    setBookingCourt(null);
    setStorageVersion((v) => v + 1);
    setNoticeMessage('رزرو سانس‌ها برداشته شد و وضعیت به حالت آزاد بازگشت.');
  };

  // Confirm booking
  const handleConfirmBooking = (
    bookingData: Omit<Booking, 'reservationCode' | 'createdAt' | 'status'>
  ) => {
    // Generate unique code like NTC-7391
    const randomCode = `NTC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...bookingData,
      reservationCode: randomCode,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    saveBookingToStorage(newBooking);
    setConfirmedBooking(newBooking);
    setIsBookingModalOpen(false);
    setSelectedSlotIds([]);
    setStorageVersion((v) => v + 1);
    setIsReceiptModalOpen(true);
  };

  // Cancel booking
  const handleCancelBooking = (reservationCode: string) => {
    cancelBookingInStorage(reservationCode);
    setStorageVersion((v) => v + 1);
  };

  // Active slots for modal
  const activeSelectedSlotsForModal = useMemo(() => {
    if (!bookingCourt) return [];
    const courtSlots = courtsSlotsMap[bookingCourt.id] || [];
    return courtSlots.filter((s) => selectedSlotIds.includes(s.id));
  }, [bookingCourt, courtsSlotsMap, selectedSlotIds]);

  // Courts to show based on filter
  const courtsToDisplay = useMemo(() => {
    if (selectedCourtFilter === 'all') return COURTS;
    return COURTS.filter((c) => c.id === selectedCourtFilter);
  }, [selectedCourtFilter]);

  // Determine primary selected court and slots for floating mobile booking bar
  const primarySelectedCourt = useMemo(() => {
    if (selectedSlotIds.length === 0) return null;
    const firstId = selectedSlotIds[0];
    if (firstId.startsWith('padel')) return COURTS.find((c) => c.id === 'padel') || null;
    if (firstId.startsWith('beach')) return COURTS.find((c) => c.id === 'beach') || null;
    return COURTS.find((c) => c.id === 'clay') || null;
  }, [selectedSlotIds]);

  const selectedSlotsList = useMemo(() => {
    if (!primarySelectedCourt) return [];
    const courtSlots = courtsSlotsMap[primarySelectedCourt.id] || [];
    return courtSlots.filter((s) => selectedSlotIds.includes(s.id));
  }, [primarySelectedCourt, courtsSlotsMap, selectedSlotIds]);

  const totalSelectedPrice = useMemo(() => {
    return selectedSlotsList.reduce((acc, s) => acc + s.price, 0);
  }, [selectedSlotsList]);

  // Live 1-second interval for real-time countdown timer
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Expiry timestamp of the earliest held slot in the current selection
  const holdExpiryTime = useMemo(() => {
    if (selectedSlotsList.length === 0) return 0;
    const heldTimes = selectedSlotsList
      .map((s) => s.heldUntil || 0)
      .filter((t) => t > 0);
    if (heldTimes.length === 0) return 0;
    return Math.min(...heldTimes);
  }, [selectedSlotsList]);

  // Live remaining seconds of the 5-minute hold
  const holdRemainingSeconds = useMemo(() => {
    if (!holdExpiryTime) return 0;
    return Math.max(0, Math.floor((holdExpiryTime - currentTime) / 1000));
  }, [holdExpiryTime, currentTime]);

  // Automatically release and clear selection if hold reaches zero while modal is closed
  useEffect(() => {
    if (
      holdExpiryTime > 0 &&
      holdRemainingSeconds === 0 &&
      selectedSlotIds.length > 0 &&
      !isBookingModalOpen
    ) {
      releaseHeldSlots(selectedSlotIds);
      setSelectedSlotIds([]);
      setStorageVersion((v) => v + 1);
    }
  }, [holdExpiryTime, holdRemainingSeconds, selectedSlotIds, isBookingModalOpen]);

  const holdMinutes = Math.floor(holdRemainingSeconds / 60);
  const holdSecs = holdRemainingSeconds % 60;
  const formattedCountdown = `${toPersianDigits(
    String(holdMinutes).padStart(2, '0')
  )}:${toPersianDigits(String(holdSecs).padStart(2, '0'))}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#fcfcf9] to-sky-50/20 text-stone-900 flex flex-col font-sans relative pb-20 sm:pb-8">
      {/* Ambient background light reflections with Padel Blue and Tennis Yellow */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/3 w-80 h-80 bg-blue-400/8 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Notice Toast Banner */}
      {noticeMessage && (
        <div className="fixed top-20 inset-x-4 max-w-md mx-auto z-50 p-3.5 rounded-2xl bg-stone-900/95 backdrop-blur-md text-white text-xs font-bold shadow-2xl flex items-center justify-between gap-3 border border-white/20 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
          <button
            onClick={() => setNoticeMessage(null)}
            className="p-1 rounded-lg hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'booking' && selectedSlotIds.length > 0) {
            releaseHeldSlots(selectedSlotIds);
            setSelectedSlotIds([]);
            setStorageVersion((v) => v + 1);
          }
          setActiveTab(tab);
        }}
        myBookingsCount={bookings.filter((b) => b.status === 'confirmed').length}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {activeTab === 'booking' && (
          <div>
            {/* Club Hero Banner */}
            <HeroSection />

            {/* Reservation Workspace */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              {/* Date Selector Bar */}
              <DateSelector
                days={days}
                selectedDate={selectedDate}
                onSelectDate={(newDate) => {
                  if (selectedSlotIds.length > 0) {
                    releaseHeldSlots(selectedSlotIds);
                  }
                  setSelectedDate(newDate);
                  setSelectedSlotIds([]);
                  setStorageVersion((v) => v + 1);
                }}
                availableCountsByDate={availableCountsByDate}
              />

              {/* Filter by court type & Fast info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                <CourtFilter
                  selectedCourtId={selectedCourtFilter}
                  onSelectCourt={setSelectedCourtFilter}
                />

                <div className="text-xs text-stone-600 flex items-center gap-2 bg-white/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/80 shadow-xs">
                  <span>ساعات کاری مجموعه:</span>
                  <span className="text-sky-700 font-bold dir-ltr font-mono">
                    08:00 - 24:00
                  </span>
                </div>
              </div>

              {/* Court Cards with time slot grids */}
              <div className="space-y-6">
                {courtsToDisplay.map((court) => {
                  const slots = courtsSlotsMap[court.id] || [];
                  return (
                    <CourtScheduleCard
                      key={court.id}
                      court={court}
                      slots={slots}
                      selectedSlotIds={selectedSlotIds}
                      onToggleSlot={handleToggleSlot}
                      onProceedToBooking={handleProceedToBooking}
                      onCancelSelection={handleCancelSelection}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-bookings' && (
          <MyBookingsView
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onBackToBooking={() => setActiveTab('booking')}
          />
        )}

        {activeTab === 'facilities' && (
          <ClubFacilities
            onGoToBooking={() => setActiveTab('booking')}
          />
        )}
      </main>

      {/* Floating Bottom Bar for Mobile Booking with Live 5-Minute Hold Countdown */}
      {activeTab === 'booking' && selectedSlotsList.length > 0 && primarySelectedCourt && !isBookingModalOpen && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-sky-300/90 p-3 sm:p-4 shadow-2xl ring-1 ring-stone-900/10 animate-fade-in">
          {/* Subtle top progress bar of remaining hold time */}
          {holdRemainingSeconds > 0 && (
            <div className="absolute top-0 inset-x-0 h-1 bg-stone-100/90 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  holdRemainingSeconds <= 60
                    ? 'bg-rose-500 animate-pulse'
                    : holdRemainingSeconds <= 120
                    ? 'bg-amber-500'
                    : 'bg-sky-600'
                }`}
                style={{ width: `${Math.min(100, (holdRemainingSeconds / 300) * 100)}%` }}
              />
            </div>
          )}

          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Left side: Court info, price, and live countdown timer */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-stone-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shrink-0"></span>
                  <span className="truncate">{primarySelectedCourt.nameFa}</span>
                  <span>•</span>
                  <span className="text-sky-800 font-black shrink-0">
                    {toPersianDigits(selectedSlotsList.length)} سانس
                  </span>
                </div>
                <div className="text-stone-900 font-black text-sm sm:text-base">
                  {formatToman(totalSelectedPrice)}
                </div>
              </div>

              {/* Live 5-Minute Hold Countdown Timer Badge */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs shrink-0 transition-colors shadow-xs ${
                  holdRemainingSeconds <= 60
                    ? 'bg-rose-50 border-rose-300 text-rose-900 animate-pulse'
                    : 'bg-amber-50/90 border-amber-300 text-amber-950'
                }`}
                title="زمان باقی‌مانده از قفل ۵ دقیقه‌ای سانس‌ها"
              >
                <Clock
                  className={`w-3.5 h-3.5 shrink-0 ${
                    holdRemainingSeconds <= 60 ? 'text-rose-600' : 'text-amber-700'
                  }`}
                />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-stone-600 font-medium hidden xs:inline">
                    قفل موقت:
                  </span>
                  <span className="font-mono font-black text-xs sm:text-sm tracking-wide">
                    {formattedCountdown}
                  </span>
                  <span className="text-[10px] text-stone-500 font-normal hidden md:inline">
                    ({toPersianDigits(holdRemainingSeconds)} ثانیه)
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Action Buttons with Instant Cancel */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="floating-mobile-cancel-btn"
                type="button"
                onClick={handleCancelSelection}
                className="w-1/3 sm:w-auto min-h-[46px] px-3 sm:px-4 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-stone-200 text-stone-700 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 touch-manipulation active:scale-[0.98]"
                title="انصراف و آزادسازی سانس در همان لحظه"
              >
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>انصراف</span>
              </button>

              <button
                id="floating-mobile-checkout-btn"
                onClick={() => handleProceedToBooking(primarySelectedCourt)}
                className="w-2/3 sm:w-auto min-h-[46px] px-5 sm:px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white font-black text-xs sm:text-sm shadow-md shadow-sky-700/25 flex items-center justify-center gap-2 shrink-0 touch-manipulation transition-all"
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>پرداخت و ثبت نهایی</span>
                <ArrowLeft className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        court={bookingCourt}
        dateStr={selectedDate}
        selectedSlots={activeSelectedSlotsForModal}
        onClose={() => setIsBookingModalOpen(false)}
        onConfirmBooking={handleConfirmBooking}
        onReleaseHold={handleReleaseHold}
      />

      {/* Booking Receipt Voucher Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        booking={confirmedBooking}
        onClose={() => setIsReceiptModalOpen(false)}
        onViewMyBookings={() => {
          setIsReceiptModalOpen(false);
          setActiveTab('my-bookings');
        }}
      />

      {/* Footer */}
      <Footer
        onGoToBooking={() => setActiveTab('booking')}
        onGoToFacilities={() => setActiveTab('facilities')}
        onGoToMyBookings={() => setActiveTab('my-bookings')}
      />
    </div>
  );
}
