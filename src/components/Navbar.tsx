import React from 'react';
import { Phone, Instagram, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { CLUB_INFO } from '../data/courtsData';

interface NavbarProps {
  activeTab: 'booking' | 'my-bookings' | 'facilities';
  setActiveTab: (tab: 'booking' | 'my-bookings' | 'facilities') => void;
  myBookingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  myBookingsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">
          {/* Brand Logo & Name */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('booking')}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group min-w-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 flex items-center justify-center shadow-md shadow-sky-700/25 group-hover:scale-105 transition-transform duration-200 shrink-0 relative">
              <span className="text-xl sm:text-2xl select-none">🎾</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-lime-400 border-2 border-white rounded-full shadow-xs"></span>
            </div>

            <div className="flex flex-col justify-center min-w-0">
              {/* Line 1: north.tennisclub in one line */}
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-stone-900 group-hover:text-sky-700 transition-colors font-mono dir-ltr">
                  north.tennisclub
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300/70 px-1.5 sm:px-2 py-0.2 rounded-md shrink-0">
                  بابل
                </span>
              </div>

              {/* Line 2: باشگاه تنیس، پدل و زمین ساحلی in a separate line */}
              <p className="text-[10px] sm:text-xs text-stone-600 font-medium mt-0.5 whitespace-nowrap tracking-tight">
                باشگاه تنیس، پدل و زمین ساحلی
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
            <button
              id="nav-tab-booking"
              onClick={() => setActiveTab('booking')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                activeTab === 'booking'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-700/20'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>رزرو و زمان‌های خالی</span>
            </button>

            <button
              id="nav-tab-my-bookings"
              onClick={() => setActiveTab('my-bookings')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 relative ${
                activeTab === 'my-bookings'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-700/20'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>پیگیری رزروهای من</span>
              {myBookingsCount > 0 && (
                <span className="bg-lime-400 text-stone-950 text-xs px-1.5 py-0.2 rounded-full font-bold">
                  {myBookingsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-facilities"
              onClick={() => setActiveTab('facilities')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                activeTab === 'facilities'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-700/20'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>معرفی زمین‌ها و امکانات</span>
            </button>
          </nav>

          {/* Social & Contact Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Instagram Link */}
            <a
              id="header-instagram-btn"
              href={CLUB_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-white/90 hover:bg-white border border-slate-200 hover:border-pink-300 text-stone-700 hover:text-pink-600 transition-all text-xs sm:text-sm shadow-xs"
              title="اینستاگرام north.tennisclub"
            >
              <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
              <span className="hidden sm:inline font-mono dir-ltr font-medium">@north.tennisclub</span>
            </a>

            {/* Direct Phone Call */}
            <a
              id="header-call-btn"
              href={`tel:${CLUB_INFO.phone}`}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300/80 text-sky-900 font-bold text-xs sm:text-sm transition-all shadow-xs"
              title="تماس مستقیم جهت هماهنگی"
            >
              <Phone className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="font-mono dir-ltr tracking-wider text-xs sm:text-sm">{CLUB_INFO.phoneDisplay}</span>
            </a>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200/70 text-xs bg-white/80 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('booking')}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg font-medium transition-colors ${
              activeTab === 'booking' ? 'text-sky-800 font-bold bg-sky-100/90' : 'text-stone-600'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>رزرو زمین</span>
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg font-medium transition-colors ${
              activeTab === 'my-bookings' ? 'text-sky-800 font-bold bg-sky-100/90' : 'text-stone-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>پیگیری رزرو</span>
            {myBookingsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-lime-500 inline-block"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg font-medium transition-colors ${
              activeTab === 'facilities' ? 'text-sky-800 font-bold bg-sky-100/90' : 'text-stone-600'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>امکانات و باشگاه</span>
          </button>
        </div>
      </div>
    </header>
  );
};
