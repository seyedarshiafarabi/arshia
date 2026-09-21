import React from 'react';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { DayOption } from '../types';
import { toPersianDigits } from '../utils/dateUtils';

interface DateSelectorProps {
  days: DayOption[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  availableCountsByDate: Record<string, number>;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  days,
  selectedDate,
  onSelectDate,
  availableCountsByDate,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full bg-white/75 backdrop-blur-xl p-3.5 sm:p-4 rounded-3xl border border-white/90 shadow-lg shadow-stone-200/50 ring-1 ring-stone-900/5">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-extrabold text-stone-900">انتخاب تاریخ رزرو</span>
          <span className="text-xs text-stone-500 font-normal">
            (سانس‌های خالی تا ۱۰ روز آینده)
          </span>
        </div>

        {/* Scroll Buttons for smaller screens */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('right')}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-700 transition-colors shadow-xs"
            title="روزهای قبل"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('left')}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-700 transition-colors shadow-xs"
            title="روزهای بعد"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel of Days */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {days.map((day) => {
          const isSelected = day.dateStr === selectedDate;
          const availableCount = availableCountsByDate[day.dateStr] ?? 0;

          return (
            <button
              key={day.dateStr}
              id={`date-btn-${day.dateStr}`}
              onClick={() => onSelectDate(day.dateStr)}
              className={`flex-shrink-0 snap-start flex flex-col items-center justify-between min-w-[92px] sm:min-w-[105px] py-2.5 px-3 rounded-2xl border transition-all duration-150 ${
                isSelected
                  ? 'bg-gradient-to-b from-sky-600 to-blue-700 text-white border-sky-500 shadow-md shadow-sky-600/30 ring-2 ring-lime-400/60'
                  : 'bg-white/90 hover:bg-white text-stone-800 border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md'
              }`}
            >
              {/* Day title */}
              <span
                className={`text-xs font-semibold mb-1 ${
                  isSelected ? 'text-sky-100' : 'text-stone-500'
                }`}
              >
                {day.dayNameFa}
              </span>

              {/* Day number & month */}
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="text-lg font-black tracking-tight">
                  {toPersianDigits(day.dayNumberFa)}
                </span>
                <span
                  className={`text-xs ${
                    isSelected ? 'text-sky-100' : 'text-stone-500'
                  }`}
                >
                  {day.monthNameFa}
                </span>
              </div>

              {/* Available count badge */}
              <div
                className={`mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isSelected
                    ? 'bg-lime-400 text-stone-950 shadow-xs'
                    : availableCount > 0
                    ? 'bg-sky-50 text-sky-800 border border-sky-200'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                {availableCount > 0
                  ? `${toPersianDigits(availableCount)} سانس آزاد`
                  : 'تکمیل'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
