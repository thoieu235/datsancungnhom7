import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Court, SportType } from '../../types';
import { SportFilterBar } from './SportFilterBar';
import { TimeGridSchedule } from './TimeGridSchedule';
import { BookingModal } from './BookingModal';
import { QrCode, ArrowRight } from 'lucide-react';

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

  const footballCount = courts.filter(c => c.sport === 'football').length;
  const badmintonCount = courts.filter(c => c.sport === 'badminton').length;
  const pickleballCount = courts.filter(c => c.sport === 'pickleball').length;

  return (
    <div className="space-y-6">
      {/* Clean, Direct Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Đặt Sân Thể Thao Trực Tuyến
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Xem lịch trống thời gian thực của 6 sân bóng đá, 4 sân cầu lông và 4 sân pickleball. Đặt cọc 30% qua VietQR để giữ chỗ ngay.
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

      {/* Main Schedule Matrix */}
      <div id="schedule-matrix" className="space-y-4">
        <SportFilterBar />

        <TimeGridSchedule
          onSelectSlot={(court, startTime, endTime) => {
            setSelectedSlot({ court, startTime, endTime });
          }}
          onViewBookingDetails={(booking) => {
            alert(`Khung giờ này đã được đặt. Vui lòng chọn ô màu xanh còn trống hoặc gọi hotline ${settings.hotline}.`);
          }}
        />
      </div>

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
