import React, { useState } from 'react';
import { Booking } from '../types';
import { formatToman, toPersianDigits } from '../utils/dateUtils';
import { CLUB_INFO } from '../data/courtsData';
import { CheckCircle2, Copy, Check, Share2, Instagram, Phone, MapPin, X, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onViewMyBookings: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  booking,
  onClose,
  onViewMyBookings,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !booking) return null;

  const voucherText = `
🎾 رسید رزرو زمین در north.tennisclub
📌 شناسه رزرو: ${booking.reservationCode}
👤 رزرو کننده: ${booking.customerName}
📞 شماره تماس: ${booking.customerPhone}
🏟️ زمین: ${booking.courtName}
📅 تاریخ: ${booking.dateLabelFa}
⏰ ساعت سانس: ${booking.timeRange}
💰 مبلغ پرداخت شده: ${formatToman(booking.totalPrice)}
${booking.needsRacket ? '🎾 کرایه راکت: بله\n' : ''}${booking.needsCoach ? '🏅 درخواست مربی: بله\n' : ''}
📍 آدرس: ${CLUB_INFO.locationFa}
📞 هماهنگی و پشتیبانی: ${CLUB_INFO.phoneDisplay}
📷 اینستاگرام: ${CLUB_INFO.instagram}
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(voucherText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `سلام، من سانس زمین در north.tennisclub رزرو کردم.\nکد رزرو: ${booking.reservationCode}\nزمین: ${booking.courtName}\nتاریخ: ${booking.dateLabelFa}\nساعت: ${booking.timeRange}\nنام: ${booking.customerName}`
  );
  const whatsappUrl = `https://wa.me/989115846090?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-stone-900/40 backdrop-blur-md animate-fade-in">
      <div
        id="receipt-modal-card"
        className="w-full max-w-md bg-white/95 backdrop-blur-2xl border border-white rounded-3xl shadow-2xl overflow-hidden my-auto ring-1 ring-stone-900/10"
      >
        {/* Receipt Header Badge */}
        <div className="bg-gradient-to-b from-sky-50 to-white p-6 text-center border-b border-stone-200/80 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-xl bg-white/80 hover:bg-stone-100 text-stone-600 transition-colors border border-stone-200 shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-sky-100 border border-sky-200 text-sky-700 mx-auto flex items-center justify-center mb-3 shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h3 className="text-xl font-black text-stone-900 mb-1">
            رزرو با موفقیت ثبت شد!
          </h3>
          <p className="text-xs text-stone-600 font-medium">
            سانس درخواستی شما در سیستم <span className="font-mono dir-ltr font-bold text-sky-800">{CLUB_INFO.name}</span> رزرو گردید.
          </p>

          {/* Reservation Code Highlight */}
          <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-stone-50 border border-sky-200/80 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">کد رهگیری رزرو:</span>
            <span className="text-lg font-mono font-black text-sky-700 tracking-wider">
              {booking.reservationCode}
            </span>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4">
          <div className="bg-stone-50/90 rounded-2xl p-4 border border-stone-200/80 space-y-2.5 text-xs sm:text-sm shadow-xs">
            <div className="flex justify-between py-1 border-b border-stone-200/70">
              <span className="text-stone-500">زمین انتخابی:</span>
              <span className="font-bold text-stone-900">{booking.courtName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-stone-200/70">
              <span className="text-stone-500">تاریخ:</span>
              <span className="font-bold text-stone-900">{booking.dateLabelFa}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-stone-200/70">
              <span className="text-stone-500">ساعت سانس:</span>
              <span className="font-bold text-sky-700 font-mono dir-ltr">
                {booking.timeRange}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-stone-200/70">
              <span className="text-stone-500">نام رزروکننده:</span>
              <span className="font-bold text-stone-900">{booking.customerName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-stone-200/70">
              <span className="text-stone-500">شماره همراه:</span>
              <span className="text-stone-900 font-bold dir-ltr">{toPersianDigits(booking.customerPhone)}</span>
            </div>

            {booking.transactionRef && (
              <div className="flex justify-between py-1 border-b border-stone-200/70">
                <span className="text-stone-500">کد رهگیری شاپرک:</span>
                <span className="font-mono text-sky-800 font-bold dir-ltr text-xs bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  {booking.transactionRef}
                </span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-stone-200/70">
              <span className="text-stone-500">وضعیت پرداخت:</span>
              <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 text-xs flex items-center gap-1">
                <Check className="w-3 h-3 text-sky-600" />
                <span>پرداخت شده آنلاین (شاپرک)</span>
              </span>
            </div>

            {(booking.needsRacket || booking.needsCoach) && (
              <div className="flex justify-between py-1 border-b border-stone-200/70">
                <span className="text-stone-500">خدمات جانبی:</span>
                <span className="font-bold text-amber-800">
                  {[
                    booking.needsRacket ? 'کرایه راکت' : '',
                    booking.needsCoach ? 'مربی' : '',
                  ]
                    .filter(Boolean)
                    .join(' + ')}
                </span>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <span className="text-stone-700 font-bold">مبلغ پرداخت شده:</span>
              <span className="font-black text-sky-800 text-base">
                {formatToman(booking.totalPrice)}
              </span>
            </div>
          </div>

          {/* Quick Action Share & Coordination */}
          <div className="space-y-2">
            <a
              id="whatsapp-confirmation-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
            >
              <Share2 className="w-4 h-4" />
              <span>ارسال مشخصات رزرو به واتساپ باشگاه</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="copy-voucher-btn"
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-stone-200/80 shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-sky-600" />
                    <span className="text-sky-700">کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-500" />
                    <span>کپی فاکتور</span>
                  </>
                )}
              </button>

              <a
                id="instagram-direct-btn"
                href={CLUB_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-stone-200/80 shadow-xs"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>دایرکت اینستاگرام</span>
              </a>
            </div>
          </div>

          {/* Babol Club Note */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2 shadow-xs">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong className="text-stone-800">آدرس:</strong> {CLUB_INFO.locationFa} — لطفاً ۱۰ دقیقه قبل از شروع سانس در باشگاه حضور داشته باشید.
            </span>
          </div>

          {/* Bottom Button */}
          <button
            id="view-my-bookings-btn"
            onClick={onViewMyBookings}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4 text-sky-200" />
            <span>مشاهده در رزروهای من و دریافت QR کد ورود</span>
          </button>
        </div>
      </div>
    </div>
  );
};
