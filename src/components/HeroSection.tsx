import React from 'react';
import { Sparkles, Clock, Coffee, Award, ShieldAlert } from 'lucide-react';
import { CLUB_INFO } from '../data/courtsData';
import { WeatherWidget } from './WeatherWidget';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-8 border-b border-slate-200/80 bg-gradient-to-b from-white/90 via-[#fcfcf9] to-transparent">
      {/* Subtle ambient lighting with Padel Blue and Tennis Ball Volt Yellow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Glass Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-sky-900 text-xs font-semibold mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-mono font-bold text-sky-800">north.tennisclub</span>
            <span className="text-stone-400">•</span>
            <span>مجموعه تخصصی تنیس، پدل و ساحلی در بابل</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight mb-3">
            رزرو آنلاین زمین‌های{' '}
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-amber-500 bg-clip-text text-transparent">
              تنیس، پدل و ساحلی
            </span>
          </h1>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl mx-auto font-normal">
            ساعات خالی زمین خاک رس، زمین پدل شیشه‌ای و زمین ساحلی را مشاهده نموده و سانس مورد نظر خود را به سادگی رزرو فرمایید.
          </p>

          {/* Key Advantages Glass Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs text-stone-800 mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>خاک سرخ کلاسیک</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>پدل شیشه‌ای ۱۰ میل</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-lime-500"></span>
              <span>تنیس و والیبال ساحلی</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs font-medium">
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
              <span>کافه و بوفه</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs font-medium">
              <Award className="w-3.5 h-3.5 text-sky-600" />
              <span>مربیگری و اجاره راکت</span>
            </div>
          </div>

          {/* Weather Widget for Babol Outdoor Court Play */}
          <WeatherWidget />
        </div>
      </div>
    </section>
  );
};
