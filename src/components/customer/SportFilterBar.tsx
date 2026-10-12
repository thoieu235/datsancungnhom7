import React from 'react';
import { useApp } from '../../context/AppContext';
import { SportType } from '../../types';
import { getSportDetails, formatDateVN } from '../../utils/formatters';
import { Calendar, ChevronLeft, ChevronRight, Activity, Zap, ShieldAlert } from 'lucide-react';

interface SportFilterBarProps {
  showAllOption?: boolean;
}

export const SportFilterBar: React.FC<SportFilterBarProps> = ({ showAllOption = false }) => {
  const { selectedSport, setSelectedSport, selectedDate, setSelectedDate, courts } = useApp();

  const footballCount = courts.filter(c => c.sport === 'football').length;
  const badmintonCount = courts.filter(c => c.sport === 'badminton').length;
  const pickleballCount = courts.filter(c => c.sport === 'pickleball').length;

  // Quick date jump
  const handleDateShift = (days: number) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const setDateToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const setDateTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Sport Segmented Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSelectedSport('football')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedSport === 'football'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>⚽ Bóng Đá</span>
            <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
              selectedSport === 'football' ? 'bg-emerald-700/80 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {footballCount} sân
            </span>
          </button>

          <button
            onClick={() => setSelectedSport('badminton')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedSport === 'badminton'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>🏸 Cầu Lông</span>
            <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
              selectedSport === 'badminton' ? 'bg-blue-700/80 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {badmintonCount} sân
            </span>
          </button>

          <button
            onClick={() => setSelectedSport('pickleball')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedSport === 'pickleball'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>🎾 Pickleball</span>
            <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
              selectedSport === 'pickleball' ? 'bg-amber-700/80 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {pickleballCount} sân
            </span>
          </button>
        </div>

        {/* Date Selector & Day Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Buttons: Hôm nay, Ngày mai */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={setDateToday}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isToday ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={setDateTomorrow}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !isToday && selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ngày mai
            </button>
          </div>

          {/* Stepper & Date Picker */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <button
              onClick={() => handleDateShift(-1)}
              className="p-1 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
              title="Ngày trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => handleDateShift(1)}
              className="p-1 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
              title="Ngày sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-medium text-slate-500 hidden sm:block">
            {formatDateVN(selectedDate)}
          </div>
        </div>
      </div>
    </div>
  );
};
