import React from 'react';
import { CLUB_INFO } from '../data/courtsData';
import { Instagram, Phone, MapPin, Clock } from 'lucide-react';

interface FooterProps {
  onGoToBooking: () => void;
  onGoToFacilities: () => void;
  onGoToMyBookings: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onGoToBooking,
  onGoToFacilities,
  onGoToMyBookings,
}) => {
  return (
    <footer className="bg-white/75 backdrop-blur-xl border-t border-stone-200/80 text-stone-600 py-12 mt-16 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-stone-200/70">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white text-lg shadow-xs">
                🎾
              </div>
              <span className="font-mono font-black text-lg text-stone-900 tracking-tight">
                {CLUB_INFO.name}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-md font-normal">
              مجموعه ورزشی <strong className="font-mono dir-ltr text-sky-700">{CLUB_INFO.name}</strong>؛ باشگاه تنیس، پدل و زمین ساحلی بابل با سه زمین استاندارد، روشنایی حرفه‌ای شبانه، کافه و بوفه اختصاصی.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={CLUB_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-medium transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span className="font-mono dir-ltr font-bold">{CLUB_INFO.instagram}</span>
              </a>
              <span className="text-stone-300">•</span>
              <a
                href={`tel:${CLUB_INFO.phone}`}
                className="flex items-center gap-1.5 text-xs text-sky-700 hover:text-sky-800 font-medium transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="font-mono dir-ltr font-bold">{CLUB_INFO.phoneDisplay}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
              دسترسی سریع
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onGoToBooking}
                  className="text-stone-600 hover:text-sky-700 font-medium transition-colors"
                >
                  جدول زمان‌های خالی و رزرو
                </button>
              </li>
              <li>
                <button
                  onClick={onGoToMyBookings}
                  className="text-stone-600 hover:text-sky-700 font-medium transition-colors"
                >
                  پیگیری یا لغو رزرو
                </button>
              </li>
              <li>
                <button
                  onClick={onGoToFacilities}
                  className="text-stone-600 hover:text-sky-700 font-medium transition-colors"
                >
                  امکانات باشگاه (خاک رس، پدل، ساحلی)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Address */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
              ساعات کاری و مکان
            </h4>
            <div className="text-xs space-y-2 text-stone-600 font-normal">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{CLUB_INFO.workingHours}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{CLUB_INFO.locationFa}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 font-normal">
          <p>© تمامی حقوق برای مجموعه ورزشی <span className="font-mono dir-ltr font-bold text-stone-700">north.tennisclub</span> محفوظ است.</p>
          <p className="text-[11px] text-stone-500">
            رزرو آسان و سریع زمین ورزشی با نگهداشت ۵ دقیقه‌ای سانس
          </p>
        </div>
      </div>
    </footer>
  );
};
