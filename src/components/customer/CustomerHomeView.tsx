import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Court, SportType } from '../../types';
import { SportFilterBar } from './SportFilterBar';
import { TimeGridSchedule } from './TimeGridSchedule';
import { VisualCourtCardsView } from './VisualCourtCardsView';
import { BookingModal } from './BookingModal';
import { QrCode, LayoutGrid, Clock, Sparkles } from 'lucide-react';

interface CustomerHomeViewProps {
  onGoToHistory: () => void;
  onGoToPricing: () => void;
}

export const CustomerHomeView: React.FC<CustomerHomeViewProps> = ({
  onGoToHistory,
  onGoToPricing
}) => {
  const { courts, selectedSport, setSelectedSport, settings } = useApp();
  const [selectedSlot, setSelectedSlot] = useState<{ court: Court; startTime: string; endTime: string } | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Đặt Sân Thể Thao Trực Tuyến
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Xem hình ảnh thực tế, thông số mặt sân và bảng giá chi tiết của 6 sân bóng đá, 4 sân cầu lông và 4 sân pickleball. Cọc 30% qua VietQR để giữ chỗ ngay.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onGoToHistory}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-2"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Vé đã đặt</span>
          </button>
          <button
            onClick={onGoToPricing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Bảng giá sân
          </button>
        </div>
      </div>

      {/* Sport Selector & Date Stepper */}
      <SportFilterBar />

      {/* View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="text-xs text-slate-600">
          {viewMode === 'cards' ? (
            <span>Hiển thị <strong>ảnh thực tế &amp; chi tiết bảng giá</strong> từng sân:</span>
          ) : (
            <span>Hiển thị <strong>ma trận lịch 14 sân theo giờ</strong> (06:00 - 22:00):</span>
          )}
        </div>

        {/* Segmented control */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
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
            <span>Hình ảnh &amp; Giá sân</span>
          </button>

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
        </div>
      </div>

      {/* Main Content based on View Mode */}
      {viewMode === 'cards' ? (
        <VisualCourtCardsView
          onSelectSlot={(court, startTime, endTime) => {
            setSelectedSlot({ court, startTime, endTime });
          }}
        />
      ) : (
        <TimeGridSchedule
          onSelectSlot={(court, startTime, endTime) => {
            setSelectedSlot({ court, startTime, endTime });
          }}
          onViewBookingDetails={(booking) => {
            alert(`Khung giờ này đã được đặt. Vui lòng chọn ô màu xanh còn trống hoặc gọi hotline ${settings.hotline}.`);
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
          onSuccess={() => {
            setSelectedSlot(null);
            onGoToHistory();
          }}
        />
      )}
    </div>
  );
};
