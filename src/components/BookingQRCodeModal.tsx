import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Booking } from '../types';
import { CLUB_INFO } from '../data/courtsData';
import {
  X,
  QrCode,
  Copy,
  Check,
  Download,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Share2,
  Sparkles,
} from 'lucide-react';

interface BookingQRCodeModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingQRCodeModal: React.FC<BookingQRCodeModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !booking) {
      setQrDataUrl('');
      return;
    }

    setIsGenerating(true);

    // Generate QR Code containing the reservation code (can also include structured payload)
    // Most check-in barcode scanners in clubs expect the exact code string
    const qrPayload = booking.reservationCode;

    QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#1c1917', // stone-900 for high optical contrast
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('QR code generation failed:', err);
        setIsGenerating(false);
      });
  }, [isOpen, booking]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(booking.reservationCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR-${booking.reservationCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-l from-stone-900 via-stone-850 to-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 id="qr-modal-title" className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>QR کد ورود سریع به باشگاه</span>
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                مخصوص گیت ورودی و تأیید پذیرش در {CLUB_INFO.nameFa}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            title="بستن پنجره"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* QR Code Container */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/70 flex flex-col items-center justify-center text-center">
            <div className="relative p-3 bg-white rounded-2xl shadow-md border border-stone-200/90 flex items-center justify-center">
              {isGenerating ? (
                <div className="w-52 h-52 flex flex-col items-center justify-center text-stone-400 gap-2">
                  <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">در حال تولید بارکد...</span>
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for booking ${booking.reservationCode}`}
                  className="w-52 h-52 object-contain rounded-lg"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-stone-400 text-xs">
                  خطا در ایجاد بارکد
                </div>
              )}
            </div>

            {/* Reservation Code Pill */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">کد رزرو اختصاصی:</span>
              <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-sky-50 border border-sky-200/80">
                <span className="font-mono text-sm font-black text-sky-900 tracking-wider dir-ltr">
                  {booking.reservationCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 text-sky-700 hover:text-sky-900 rounded-md transition-colors"
                  title="کپی کردن کد"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
            {isCopied && (
              <span className="text-[11px] text-emerald-600 font-medium mt-1 animate-fade-in">
                کد رزرو در کلیپ‌بورد کپی شد
              </span>
            )}
          </div>

          {/* Booking Summary Card */}
          <div className="rounded-2xl border border-stone-200/80 p-3.5 space-y-2.5 text-xs bg-white">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {booking.courtId === 'clay' ? '🎾' : booking.courtId === 'padel' ? '🔷' : '🏖️'}
                </span>
                <strong className="text-stone-900 font-bold">{booking.courtName}</strong>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                <ShieldCheck className="w-3 h-3" />
                <span>تأیید شده</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-stone-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{booking.dateLabelFa}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="font-mono dir-ltr font-semibold">{booking.timeRange}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-stone-600">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>به نام: <strong className="text-stone-800">{booking.customerName}</strong></span>
              </div>
              <span className="font-mono dir-ltr text-stone-600">{booking.customerPhone}</span>
            </div>
          </div>

          {/* Quick Check-in Instructions */}
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              این QR کد را هنگام مراجعه به پذیرش باشگاه نشان دهید تا احراز هویت و دسترسی به زمین در چند ثانیه انجام پذیرد. نیازی به پرینت کاغذی نیست.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-white hover:bg-stone-100 active:scale-[0.98] border border-stone-300 text-stone-800 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 touch-manipulation disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>ذخیره تصویر QR</span>
          </button>

          <a
            href={`https://wa.me/989115846090?text=${encodeURIComponent(
              `سلام، کد ورود به زمین برای رزرو ${booking.reservationCode} - ${booking.courtName} - ${booking.customerName}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 touch-manipulation"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>اشتراک در واتساپ</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-colors touch-manipulation"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
