import React from 'react';
import { CourtId } from '../types';
import { COURTS } from '../data/courtsData';
import { Layers } from 'lucide-react';

interface CourtFilterProps {
  selectedCourtId: CourtId | 'all';
  onSelectCourt: (courtId: CourtId | 'all') => void;
}

export const CourtFilter: React.FC<CourtFilterProps> = ({
  selectedCourtId,
  onSelectCourt,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        id="filter-all-courts"
        onClick={() => onSelectCourt('all')}
        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 border shadow-xs ${
          selectedCourtId === 'all'
            ? 'bg-stone-900 text-white border-stone-900 shadow-md shadow-stone-900/15'
            : 'bg-white/80 hover:bg-white text-stone-700 border-stone-200/80 hover:border-stone-300 hover:text-stone-900'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>همه زمین‌ها</span>
      </button>

      {COURTS.map((court) => {
        const isSelected = selectedCourtId === court.id;
        let icon = '🎾';
        if (court.id === 'padel') icon = '🔷';
        if (court.id === 'beach') icon = '🏖️';

        return (
          <button
            key={court.id}
            id={`filter-court-${court.id}`}
            onClick={() => onSelectCourt(court.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border shadow-xs ${
              isSelected
                ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20 ring-2 ring-lime-400/50'
                : 'bg-white/80 hover:bg-white text-stone-700 border-slate-200 hover:border-sky-300 hover:text-stone-900'
            }`}
          >
            <span>{icon}</span>
            <span>{court.nameFa}</span>
          </button>
        );
      })}
    </div>
  );
};
