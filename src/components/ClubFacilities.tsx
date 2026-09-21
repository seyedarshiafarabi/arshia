import React from 'react';
import { COURTS, CLUB_INFO } from '../data/courtsData';
import { formatToman } from '../utils/dateUtils';
import { Coffee, Award, Sparkles, Moon, Phone, Instagram, MapPin, Check, ArrowLeft } from 'lucide-react';

interface ClubFacilitiesProps {
  onGoToBooking: () => void;
}

export const ClubFacilities: React.FC<ClubFacilitiesProps> = ({ onGoToBooking }) => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-sky-800 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 shadow-xs">
          معرفی مجموعه ورزشی
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-3 mb-3">
          امکانات و ویژگی‌های <span className="font-mono dir-ltr">{CLUB_INFO.name}</span>
        </h2>
        <p className="text-stone-600 text-sm leading-relaxed font-normal">
          مجموعه ورزشی <strong className="font-mono dir-ltr text-sky-700">north.tennisclub</strong> یکی از مدرن‌ترین مراکز ورزشی مازندران در حومه بابل است که ورزش‌های راکتی، زمین تنیس خاکی، پدل استاندارد شیشه‌ای و زمین ساحلی را در محیطی سرسبز گرد هم آورده است.
        </p>
      </div>

      {/* The 3 Court Types Detail */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COURTS.map((court) => {
          let badgeColor = 'border-amber-200 bg-amber-50 text-amber-900';
          let icon = '🎾';
          if (court.id === 'padel') {
            badgeColor = 'border-sky-200 bg-sky-50 text-sky-900';
            icon = '🔷';
          } else if (court.id === 'beach') {
            badgeColor = 'border-lime-300 bg-lime-50 text-lime-950';
            icon = '🏖️';
          }

          return (
            <div
              key={court.id}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/90 p-6 flex flex-col justify-between hover:shadow-xl transition-all shadow-lg shadow-stone-200/50 ring-1 ring-stone-900/5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                    {court.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-stone-900 mb-1">
                  {court.nameFa}
                </h3>
                <p className="text-xs text-stone-500 font-medium mb-3">
                  {court.subtitleFa}
                </p>

                <p className="text-xs text-stone-600 leading-relaxed mb-4 font-normal">
                  {court.descriptionFa}
                </p>

                {/* Features list */}
                <div className="space-y-2 mb-6">
                  {court.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-stone-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price footer */}
              <div className="pt-4 border-t border-stone-200/70">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-500">نرخ سانس روز:</span>
                  <span className="font-extrabold text-stone-900">{formatToman(court.dayPrice)}</span>
                </div>
                <div className="flex justify-between text-xs mb-3">
                  <span className="text-stone-500">نرخ سانس شب (پروژکتور):</span>
                  <span className="font-extrabold text-cyan-700">{formatToman(court.nightPrice)}</span>
                </div>

                <button
                  onClick={onGoToBooking}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-sky-600 hover:text-white text-stone-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>مشاهده سانس‌های خالی</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Amenities & Services Section */}
      <div className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white/90 p-6 sm:p-8 shadow-lg shadow-stone-200/50 ring-1 ring-stone-900/5">
        <h3 className="text-xl font-black text-stone-900 mb-6 text-center">
          ☕ امکانات رفاهی و خدمات باشگاه
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mb-3">
              <Coffee className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-stone-900 text-sm mb-1">کافه و بوفه اختصاصی</h4>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              فضایی دنج برای استراحت بازیکنان و همراهان، ارائه انواع نوشیدنی‌های گرم و سرد، اسپرسو، آبمیوه طبیعی و اسنک‌های مقوی.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-stone-900 text-sm mb-1">آموزش و مربیگری</h4>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              امکان رزرو جلسه با مربیان مجرب و دارای مدرک فدراسیون برای آموزش تنیس و پدل از سطح مقدماتی تا پیشرفته.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-stone-900 text-sm mb-1">تأمین و اجاره تجهیزات</h4>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              در صورت نداشتن راکت، امکان اجاره راکت‌های باکیفیت تنیس، پدل و توپ‌های استاندارد در محل باشگاه فراهم است.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 border border-cyan-200 text-cyan-700 flex items-center justify-center mb-3">
              <Moon className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-stone-900 text-sm mb-1">روشنایی شبانه حرفه‌ای</h4>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              پروژکتورهای مدرن LED با نور یکنواخت و ضدخیرگی، امکان بازی مهیج زیر نور تا ساعت ۲۴:۰۰ بامداد را فراهم می‌آورد.
            </p>
          </div>
        </div>
      </div>

      {/* Reservation guide and contact info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 flex flex-col justify-between shadow-lg shadow-stone-200/50 ring-1 ring-stone-900/5">
          <div>
            <h4 className="font-black text-base text-stone-900 mb-3 flex items-center gap-2">
              <span>💰 نحوه و شرایط رزرو زمین</span>
            </h4>
            <ul className="text-xs text-stone-600 space-y-2 leading-relaxed font-normal">
              <li>
                • نرخ اجاره بسته به نوع زمین (خاک رس، پدل یا ساحلی) و زمان سانس (روز یا زیر نور پروژکتور) بین ۴۰۰ تا ۶۵۰ هزار تومان است.
              </li>
              <li>
                • رزرو کاملاً آنلاین، سریع و بدون نیاز به عضویت بوده و تنها با وارد کردن نام و شماره موبایل انجام می‌شود.
              </li>
              <li>
                • بلافاصله پس از انتخاب سانس، تایم انتخابی به مدت ۵ دقیقه برای شما رزرو موقت می‌شود.
              </li>
              <li>
                • جهت هماهنگی تورنمنت‌ها، رزروهای هفتگی ثابت، یا برگزاری رویدادهای گروهی می‌توانید با تلفن باشگاه تماس حاصل فرمایید.
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200/70">
            <button
              onClick={onGoToBooking}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm transition-all shadow-md shadow-sky-600/20"
            >
              هم‌اکنون سانس مورد نظر خود را رزرو کنید
            </button>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 space-y-4 shadow-lg shadow-stone-200/50 ring-1 ring-stone-900/5">
          <h4 className="font-black text-base text-stone-900 mb-1">
            📍 آدرس و راه‌های ارتباطی با باشگاه
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200/80 shadow-xs">
              <MapPin className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block mb-0.5">موقعیت مکانی:</strong>
                <span className="text-stone-600">{CLUB_INFO.locationFa}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200/80 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-600" />
                <span className="text-stone-700 font-medium">تلفن هماهنگی و رزرو:</span>
              </div>
              <a
                href={`tel:${CLUB_INFO.phone}`}
                className="font-bold text-sky-700 font-mono dir-ltr hover:underline"
              >
                {CLUB_INFO.phoneDisplay}
              </a>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200/80 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-pink-500" />
                <span className="text-stone-700 font-medium">صفحه اینستاگرام رسمی:</span>
              </div>
              <a
                href={CLUB_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-pink-600 font-mono dir-ltr hover:underline"
              >
                {CLUB_INFO.instagram}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
