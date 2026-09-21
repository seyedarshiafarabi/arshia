import React from 'react';
import { Court, TimeSlot } from '../types';
import { formatToman, toPersianDigits } from '../utils/dateUtils';
import { Moon, Sun, Check, Lock, Info, CheckCircle2, X } from 'lucide-react';

interface CourtScheduleCardProps {
  court: Court;
  slots: TimeSlot[];
  selectedSlotIds: string[];
  onToggleSlot: (slot: TimeSlot) => void;
  onProceedToBooking: (court: Court) => void;
  onCancelSelection?: () => void;
}

export const CourtScheduleCard: React.FC<CourtScheduleCardProps> = ({
  court,
  slots,
  selectedSlotIds,
  onToggleSlot,
  onProceedToBooking,
  onCancelSelection,
}) => {
  // Count available and booked
  const availableSlots = slots.filter((s) => !s.isBooked && !s.isBlocked && !s.isHeld);
  const selectedSlotsForThisCourt = slots.filter((s) =>
    selectedSlotIds.includes(s.id)
  );

  let courtBadgeIcon = '🎾';
  let bannerColor = 'border-amber-200/80 hover:border-amber-300';
  let tagColor = 'bg-amber-50 text-amber-900 border-amber-200';

  if (court.id === 'padel') {
    courtBadgeIcon = '🔷';
    bannerColor = 'border-blue-200/80 hover:border-blue-300';
    tagColor = 'bg-blue-50 text-blue-900 border-blue-200';
  } else if (court.id === 'beach') {
    courtBadgeIcon = '🏖️';
    bannerColor = 'border-emerald-200/80 hover:border-emerald-300';
    tagColor = 'bg-emerald-50 text-emerald-900 border-emerald-200';
  }

  return (
    <div
      id={`court-card-${court.id}`}
      className={`rounded-3xl border ${bannerColor} bg-white/80 backdrop-blur-xl p-4 sm:p-6 shadow-lg shadow-stone-200/50 transition-all duration-200 ring-1 ring-stone-900/5`}
    >
      {/* Card Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-stone-200/70">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5 flex-wrap">
            <span className="text-xl sm:text-2xl">{courtBadgeIcon}</span>
            <h3 className="text-lg sm:text-xl font-black text-stone-900">
              {court.nameFa}
            </h3>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tagColor}`}>
              {court.badge}
            </span>
            <span className="text-xs text-stone-500 font-medium dir-ltr">
              ({court.name})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl font-normal">
            {court.descriptionFa}
          </p>
        </div>

        {/* Pricing Info Badges */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 shrink-0 bg-stone-50/90 p-2 sm:p-2.5 rounded-2xl border border-stone-200/80 text-xs shadow-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1">
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <div className="text-[10px] text-stone-500 font-medium">سانس روز</div>
              <div className="font-extrabold text-stone-900">{formatToman(court.dayPrice)}</div>
            </div>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1">
            <Moon className="w-4 h-4 text-cyan-600 shrink-0" />
            <div>
              <div className="text-[10px] text-stone-500 font-medium">سانس شب (پروژکتور)</div>
              <div className="font-extrabold text-stone-900">{formatToman(court.nightPrice)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Surface and features micro list */}
      <div className="py-2.5 sm:py-3 flex flex-wrap items-center gap-y-1.5 gap-x-3 sm:gap-x-4 text-xs text-stone-600 border-b border-stone-200/60 mb-3 sm:mb-4">
        <span>
          <strong className="text-stone-800">پوشش:</strong> {court.surface}
        </span>
        <span className="text-stone-300">•</span>
        <span>
          <strong className="text-stone-800">ابعاد:</strong> {court.dimensions}
        </span>
        <span className="text-stone-300">•</span>
        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {availableSlots.length > 0
              ? `${toPersianDigits(availableSlots.length)} سانس برای رزرو خالی است`
              : 'کلیه سانس‌های این روز رزرو شده است'}
          </span>
        </div>
      </div>

      {/* Slots Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs text-stone-600">
          <span className="font-black text-stone-900">انتخاب ساعت سانس:</span>
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>آزاد</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>قفل موقت (۵ دقیقه)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300"></span>
              <span>رزرو شده</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
              <span>انتخاب شما</span>
            </span>
          </div>
        </div>

        {/* Time Slots Grid - Optimized for mobile touch screens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
          {slots.map((slot) => {
            const isSelected = selectedSlotIds.includes(slot.id);
            const isBooked = slot.isBooked || slot.isBlocked;
            const isHeldByOther = slot.isHeld && !slot.heldByMe;
            const isHeldByMe = slot.isHeld && slot.heldByMe;

            // State 1: Booked Permanently
            if (isBooked) {
              return (
                <div
                  key={slot.id}
                  id={`slot-${slot.id}`}
                  className="p-2.5 sm:p-3 rounded-2xl bg-stone-100/70 border border-stone-200/80 opacity-70 flex flex-col justify-between cursor-not-allowed select-none min-h-[64px]"
                  title="این سانس قبلاً رزرو شده است"
                >
                  <div className="flex items-center justify-between mb-1.5 text-stone-500 text-xs">
                    <span className="dir-ltr font-bold text-stone-600">
                      {toPersianDigits(slot.startTime)} - {toPersianDigits(slot.endTime)}
                    </span>
                    <Lock className="w-3 h-3 text-stone-400" />
                  </div>
                  <div className="text-[11px] font-bold text-stone-500 bg-stone-200/70 border border-stone-300/60 px-2 py-0.5 rounded-lg text-center">
                    رزرو شده
                  </div>
                </div>
              );
            }

            // State 2: Temporary 5-minute Hold by another user
            if (isHeldByOther) {
              return (
                <div
                  key={slot.id}
                  id={`slot-${slot.id}`}
                  className="p-2.5 sm:p-3 rounded-2xl bg-amber-50/80 border border-amber-300/80 text-amber-950 flex flex-col justify-between cursor-not-allowed select-none min-h-[64px] shadow-xs"
                  title="کاربر دیگری در مرحله ثبت مشخصات و پرداخت این سانس است (قفل ۵ دقیقه‌ای)"
                >
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="dir-ltr font-bold text-amber-950">
                      {toPersianDigits(slot.startTime)} - {toPersianDigits(slot.endTime)}
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  </div>
                  <div className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300/70 px-1.5 py-0.5 rounded-lg text-center flex items-center justify-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>قفل موقت (۵ دقیقه)</span>
                  </div>
                </div>
              );
            }

            // State 3: Available or Selected
            return (
              <button
                key={slot.id}
                id={`slot-${slot.id}`}
                type="button"
                onClick={() => onToggleSlot(slot)}
                className={`p-2.5 sm:p-3 rounded-2xl border text-right transition-all duration-150 relative group flex flex-col justify-between min-h-[66px] touch-manipulation active:scale-[0.97] ${
                  isSelected || isHeldByMe
                    ? 'bg-gradient-to-b from-sky-600 to-blue-700 text-white border-sky-500 shadow-md shadow-sky-600/30 ring-2 ring-lime-400/80 scale-[1.02]'
                    : 'bg-white/95 hover:bg-sky-50/40 text-stone-900 border-slate-200 hover:border-sky-400 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Header with time and lighting icon */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    className={`text-xs sm:text-sm font-black dir-ltr ${
                      isSelected || isHeldByMe ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {toPersianDigits(slot.startTime)} - {toPersianDigits(slot.endTime)}
                  </span>
                  {slot.isNight ? (
                    <span title="سانس زیر نور پروژکتور">
                      <Moon
                        className={`w-3.5 h-3.5 ${
                          isSelected || isHeldByMe ? 'text-cyan-200' : 'text-cyan-600'
                        }`}
                      />
                    </span>
                  ) : (
                    <span title="سانس روز">
                      <Sun
                        className={`w-3.5 h-3.5 ${
                          isSelected || isHeldByMe ? 'text-amber-200' : 'text-amber-500'
                        }`}
                      />
                    </span>
                  )}
                </div>

                {/* Price and status */}
                <div className="flex items-center justify-between w-full mt-1">
                  <span
                    className={`text-[11px] font-bold ${
                      isSelected || isHeldByMe ? 'text-sky-100' : 'text-stone-700 group-hover:text-sky-700'
                    }`}
                  >
                    {formatToman(slot.price)}
                  </span>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-lg font-black transition-colors ${
                      isSelected || isHeldByMe
                        ? 'bg-lime-400 text-stone-950 shadow-xs'
                        : 'bg-sky-50 text-sky-800 border border-sky-200 group-hover:bg-sky-600 group-hover:text-white'
                    }`}
                  >
                    {isSelected || isHeldByMe ? '✓ انتخاب شد' : 'رزرو'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selection Bottom Bar for this court */}
      {selectedSlotsForThisCourt.length > 0 && (
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white border border-sky-500/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-sky-700/25">
          <div>
            <div className="text-xs text-sky-100 font-semibold mb-0.5">
              {toPersianDigits(selectedSlotsForThisCourt.length)} سانس از این زمین انتخاب شده است:
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>مجموع هزینه:</span>
              <span className="text-white font-black text-lg drop-shadow-xs">
                {formatToman(
                  selectedSlotsForThisCourt.reduce((acc, s) => acc + s.price, 0)
                )}
              </span>
              <span className="text-amber-200 text-xs font-semibold bg-sky-800/80 px-2 py-0.5 rounded-lg border border-lime-400/40">
                🔒 قفل موقت ۵ دقیقه‌ای در مرحله بعد
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onCancelSelection && (
              <button
                type="button"
                onClick={onCancelSelection}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-white/15 hover:bg-rose-600/90 text-white font-bold text-xs sm:text-sm transition-all border border-white/25 flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.98]"
                title="انصراف و آزادسازی سانس در همان لحظه"
              >
                <X className="w-4 h-4" />
                <span>انصراف</span>
              </button>
            )}

            <button
              id={`proceed-booking-${court.id}`}
              onClick={() => onProceedToBooking(court)}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-stone-950 font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>ورود به مرحله پرداخت و ثبت</span>
              <Check className="w-4 h-4 stroke-[3] text-stone-950" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
