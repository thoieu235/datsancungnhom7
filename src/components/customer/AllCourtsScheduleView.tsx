import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Court, Booking } from '../../types';
import { SportFilterBar } from './SportFilterBar';
import { TimeGridSchedule } from './TimeGridSchedule';
import { VisualCourtCardsView } from './VisualCourtCardsView';
import { BookingModal } from './BookingModal';
import { LayoutGrid, Clock } from 'lucide-react';

export const AllCourtsScheduleView: React.FC = () => {
  const { courts, settings } = useApp();
  const [selectedSlot, setSelectedSlot] = useState<{ court: Court; startTime: string; endTime: string } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid');

  return (
    <div className="space-y-6">
      {/* Sport Selector & Date Picker */}
      <SportFilterBar />

      {/* View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="text-xs text-slate-600">
          Chế độ xem: <strong>{viewMode === 'grid' ? 'Ma trận giờ toàn bộ 14 sân' : 'Hình ảnh & giá chi tiết từng sân'}</strong>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Ma trận giờ</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Hình ảnh &amp; Giá</span>
          </button>
        </div>
      </div>

      {/* Main Matrix or Cards */}
      {viewMode === 'grid' ? (
        <TimeGridSchedule
          onSelectSlot={(court, startTime, endTime) => {
            setSelectedSlot({ court, startTime, endTime });
          }}
          onViewBookingDetails={(booking) => {
            alert(`Khung giờ này đã được đặt. Vui lòng chọn ô màu xanh còn trống hoặc gọi hotline ${settings.hotline}.`);
          }}
        />
      ) : (
        <VisualCourtCardsView
          onSelectSlot={(court, startTime, endTime) => {
            setSelectedSlot({ court, startTime, endTime });
          }}
        />
      )}

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingModal
          court={selectedSlot.court}
          initialStartTime={selectedSlot.startTime}
          initialEndTime={selectedSlot.endTime}
          onClose={() => setSelectedSlot(null)}
          onSuccess={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};
