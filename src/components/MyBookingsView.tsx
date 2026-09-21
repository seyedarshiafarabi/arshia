import React, { useState } from 'react';
import { Booking } from '../types';
import { formatToman, toPersianDigits } from '../utils/dateUtils';
import { CLUB_INFO } from '../data/courtsData';
import {
  ShieldCheck,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  XCircle,
  CheckCircle,
  ArrowRight,
  Share2,
  QrCode,
} from 'lucide-react';
import { BookingQRCodeModal } from './BookingQRCodeModal';

interface MyBookingsViewProps {
  bookings: Booking[];
  onCancelBooking: (reservationCode: string) => void;
  onBackToBooking: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  onCancelBooking,
  onBackToBooking,
}) => {
  const [phoneFilter, setPhoneFilter] = useState('');
  const [cancellingCode, setCancellingCode] = useState<string | null>(null);
  const [selectedBookingForQR, setSelectedBookingForQR] = useState<Booking | null>(null);

  const filteredBookings = phoneFilter.trim()
    ? bookings.filter(
        (b) =>
          b.customerPhone.includes(phoneFilter.trim()) ||
          b.reservationCode.toLowerCase().includes(phoneFilter.trim().toLowerCase())
      )
    : bookings;

  const handleConfirmCancel = (code: string) => {
    onCancelBooking(code);
    setCancellingCode(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200/70">
        <div>
          <button
            onClick={onBackToBooking}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-sky-700 transition-colors mb-2 font-medium"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به تقویم رزرو</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-sky-600" />
            <span>پیگیری و مدیریت رزروهای من</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
            مشاهده وضعیت رزروها، کد پیگیری و امکان لغو سانس در صورت انصراف
          </p>
        </div>

        {/* Search input */}
        <div className="w-full sm:w-72 relative">
          <input
            id="search-booking-phone"
            type="text"
            placeholder="جستجو با شماره موبایل یا کد رهگیری..."
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value)}
            className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-white/90 border border-stone-200/90 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-sky-600 shadow-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/75 backdrop-blur-xl rounded-3xl border border-white/90 shadow-lg shadow-stone-200/50 ring-1 ring-stone-900/5">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-800 mb-1">
            {phoneFilter ? 'رزروی با این مشخصات یافت نشد' : 'هنوز رزروی ثبت نکرده‌اید'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mb-5 font-normal">
            {phoneFilter
              ? 'شماره موبایل یا کد رهگیری وارد شده با سوابق سیستم همخوانی ندارد.'
              : 'برای ثبت سانس جدید و انتخاب زمین‌های خاک رس، پدل یا ساحلی، به بخش رزرو مراجعه فرمایید.'}
          </p>
          <button
            onClick={onBackToBooking}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-md shadow-sky-600/20"
          >
            مشاهده و رزرو زمان‌های خالی زمین‌ها
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isCancelled = b.status === 'cancelled';

            return (
              <div
                key={b.reservationCode}
                id={`booking-item-${b.reservationCode}`}
                className={`rounded-3xl border p-5 transition-all ring-1 ring-stone-900/5 ${
                  isCancelled
                    ? 'bg-stone-50/70 border-stone-200/70 opacity-60'
                    : 'bg-white/85 backdrop-blur-xl border-white/90 shadow-lg shadow-stone-200/40 hover:shadow-xl'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/70">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">
                      {b.courtId === 'clay' ? '🎾' : b.courtId === 'padel' ? '🔷' : '🏖️'}
                    </span>
                    <div>
                      <h4 className="font-black text-base text-stone-900">
                        {b.courtName}
                      </h4>
                      <span className="text-xs text-stone-500">
                        کد رزرو:{' '}
                        <strong className="text-sky-700 font-mono dir-ltr font-bold">
                          {b.reservationCode}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCancelled ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>لغو شده</span>
                      </span>
                    ) : (
                      <>
                        <button
                          id={`show-qr-header-btn-${b.reservationCode}`}
                          type="button"
                          onClick={() => setSelectedBookingForQR(b)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-xl transition-all shadow-xs active:scale-[0.98] touch-manipulation"
                          title="مشاهده و اسکن QR کد ورود به باشگاه"
                        >
                          <QrCode className="w-3.5 h-3.5 text-sky-600" />
                          <span>QR ورود</span>
                        </button>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>تأیید شده</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 text-xs">
                  <div className="flex items-center gap-2 text-stone-700 font-medium">
                    <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{b.dateLabelFa}</span>
                  </div>

                  <div className="flex items-center gap-2 text-stone-700 font-medium">
                    <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                    <span className="font-mono dir-ltr font-semibold">{b.timeRange}</span>
                  </div>

                  <div className="text-stone-700">
                    <span className="text-stone-500">مبلغ:</span>{' '}
                    <strong className="text-sky-800 font-black">
                      {formatToman(b.totalPrice)}
                    </strong>
                  </div>
                </div>

                {/* Customer name and notes */}
                <div className="text-xs text-stone-500 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-200/60">
                  <div>
                    <span>رزرو به نام: </span>
                    <strong className="text-stone-800 font-bold">{b.customerName}</strong>
                    <span className="mx-2">•</span>
                    <span>شماره تماس: </span>
                    <strong className="text-stone-800 font-mono dir-ltr font-bold">{b.customerPhone}</strong>
                  </div>

                  {!isCancelled && (
                    <div className="flex items-center flex-wrap gap-2">
                      <button
                        id={`show-qr-action-btn-${b.reservationCode}`}
                        type="button"
                        onClick={() => setSelectedBookingForQR(b)}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shadow-sky-600/20 touch-manipulation"
                      >
                        <QrCode className="w-3.5 h-3.5 text-sky-200" />
                        <span>نمایش QR کد ورود</span>
                      </button>

                      <a
                        href={`https://wa.me/989115846090?text=${encodeURIComponent(
                          `سلام، پیگیری رزرو در north.tennisclub کد: ${b.reservationCode} - نام: ${b.customerName}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs flex items-center gap-1.5 transition-colors border border-stone-200/80 shadow-xs"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ارسال به واتساپ</span>
                      </a>

                      {cancellingCode === b.reservationCode ? (
                        <div className="flex items-center gap-2">
                          <span className="text-rose-600 text-xs font-bold">مطمئنید؟</span>
                          <button
                            onClick={() => handleConfirmCancel(b.reservationCode)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            بله، لغو کن
                          </button>
                          <button
                            onClick={() => setCancellingCode(null)}
                            className="px-2 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-medium"
                          >
                            انصراف
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCancellingCode(b.reservationCode)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs transition-colors font-medium shadow-xs"
                        >
                          لغو این رزرو
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Check-in QR Code Modal */}
      <BookingQRCodeModal
        booking={selectedBookingForQR}
        isOpen={!!selectedBookingForQR}
        onClose={() => setSelectedBookingForQR(null)}
      />
    </div>
  );
};
