import React from 'react';
import { useApp } from '../../context/AppContext';
import { Court, Booking } from '../../types';
import { TIME_SLOTS, formatVND, getSportDetails } from '../../utils/formatters';
import { Clock, CheckCircle2, AlertCircle, Wrench, Sparkles, User, Info } from 'lucide-react';

interface TimeGridScheduleProps {
  onSelectSlot: (court: Court, startTime: string, endTime: string) => void;
  onViewBookingDetails?: (booking: Booking) => void;
}

export const TimeGridSchedule: React.FC<TimeGridScheduleProps> = ({
  onSelectSlot,
  onViewBookingDetails
}) => {
  const { courts, bookings, selectedSport, selectedDate, role } = useApp();

  const filteredCourts = courts.filter(c => c.sport === selectedSport);
  const sportMeta = getSportDetails(selectedSport);

  // Helper to determine slot status for a given court and time
  const getSlotState = (court: Court, slotTime: string) => {
    if (court.status === 'maintenance') {
      return { type: 'maintenance' as const, booking: null };
    }

    const slotStartMin = parseInt(slotTime.split(':')[0]) * 60 + parseInt(slotTime.split(':')[1]);
    const slotEndMin = slotStartMin + 60; // 1-hour block slot

    // Find any booking on this date and court overlapping this slot
    const activeBooking = bookings.find(b => {
      if (b.courtId !== court.id || b.date !== selectedDate) return false;
      if (b.checkInStatus === 'cancelled' || b.paymentStatus === 'cancelled') return false;

      const [bStartH, bStartM] = b.startTime.split(':').map(Number);
      const [bEndH, bEndM] = b.endTime.split(':').map(Number);
      const bStartMin = bStartH * 60 + bStartM;
      const bEndMin = bEndH * 60 + bEndM;

      return (
        (slotStartMin >= bStartMin && slotStartMin < bEndMin) ||
        (slotEndMin > bStartMin && slotEndMin <= bEndMin) ||
        (slotStartMin <= bStartMin && slotEndMin >= bEndMin)
      );
    });

    if (activeBooking) {
      if (activeBooking.checkInStatus === 'checked_in') {
        return { type: 'in_use' as const, booking: activeBooking };
      }
      return { type: 'booked' as const, booking: activeBooking };
    }

    return { type: 'available' as const, booking: null };
  };

  const getNextHour = (time: string) => {
    const [h] = time.split(':').map(Number);
    const nextH = h + 1;
    return `${nextH.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar with Status Legend */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Lịch sân {sportMeta.label} ({filteredCourts.length} sân)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhấp vào ô trống để đặt · Giờ cao điểm từ 17:00 và cuối tuần
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300"></span>
            <span className="text-slate-600">Trống (Đặt ngay)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-400"></span>
            <span className="text-slate-600">Đã cọc 30%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400"></span>
            <span className="text-slate-600">Đang chơi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300"></span>
            <span className="text-slate-600">Bảo trì</span>
          </div>
        </div>
      </div>

      {/* Grid container with responsive horizontal scroll */}
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          {/* Table Header (Hours) */}
          <div className="grid grid-cols-[180px_repeat(16,1fr)] border-b border-slate-200 bg-slate-100/70 text-xs font-semibold text-slate-700 sticky top-0 z-10">
            <div className="p-3 border-r border-slate-200 text-slate-900 flex items-center">
              <span>Tên Sân / Giờ</span>
            </div>
            {TIME_SLOTS.slice(0, 16).map(slot => {
              const hourNum = parseInt(slot.split(':')[0]);
              const isPeak = hourNum >= 17;
              return (
                <div
                  key={slot}
                  className={`p-2.5 text-center border-r border-slate-200 flex flex-col items-center justify-center ${
                    isPeak ? 'bg-amber-50/50 text-amber-900' : ''
                  }`}
                >
                  <span className="font-mono">{slot}</span>
                  {isPeak && (
                    <span className="text-[10px] text-amber-700 font-bold uppercase scale-90">Peak</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Table Body (Courts & Slots) */}
          <div className="divide-y divide-slate-100">
            {filteredCourts.map(court => (
              <div
                key={court.id}
                className="grid grid-cols-[180px_repeat(16,1fr)] hover:bg-slate-50/50 transition-colors"
              >
                {/* Court Info Column */}
                <div className="p-3 border-r border-slate-200 flex flex-col justify-center bg-white">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-sm text-slate-900 truncate" title={court.name}>
                      {court.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {court.surface}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-700 font-medium mt-1">
                    {formatVND(court.pricePerHour)}/h
                  </div>
                </div>

                {/* Slots Columns */}
                {TIME_SLOTS.slice(0, 16).map(slotTime => {
                  const { type, booking } = getSlotState(court, slotTime);
                  const isPeak = parseInt(slotTime.split(':')[0]) >= 17;
                  const price = isPeak ? court.peakPricePerHour : court.pricePerHour;
                  const nextHour = getNextHour(slotTime);

                  if (type === 'maintenance') {
                    return (
                      <div
                        key={slotTime}
                        className="p-1 border-r border-slate-100 bg-slate-100/80 flex items-center justify-center"
                        title="Sân đang bảo trì thiết bị"
                      >
                        <div className="text-[11px] text-slate-400 flex flex-col items-center">
                          <Wrench className="w-3.5 h-3.5" />
                          <span className="text-[9px] uppercase tracking-wider font-semibold">Bảo trì</span>
                        </div>
                      </div>
                    );
                  }

                  if (type === 'in_use' && booking) {
                    return (
                      <div
                        key={slotTime}
                        onClick={() => onViewBookingDetails && onViewBookingDetails(booking)}
                        className="p-1 border-r border-slate-100 bg-amber-100/90 hover:bg-amber-200/90 transition-colors cursor-pointer group flex items-center justify-center"
                        title={`Đang chơi: ${booking.customerName} (${booking.startTime} - ${booking.endTime})`}
                      >
                        <div className="text-center p-1">
                          <span className="block text-[10px] font-bold text-amber-950 truncate max-w-[55px]">
                            {role === 'manager' ? booking.customerName : 'Đang chơi'}
                          </span>
                          <span className="text-[9px] text-amber-800 font-mono block">
                            {booking.startTime}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (type === 'booked' && booking) {
                    return (
                      <div
                        key={slotTime}
                        onClick={() => onViewBookingDetails && onViewBookingDetails(booking)}
                        className="p-1 border-r border-slate-100 bg-blue-100/80 hover:bg-blue-200/90 transition-colors cursor-pointer group flex items-center justify-center"
                        title={`Đã cọc 30%: ${booking.customerName} (${booking.startTime} - ${booking.endTime})`}
                      >
                        <div className="text-center p-1">
                          <span className="block text-[10px] font-bold text-blue-950 truncate max-w-[55px]">
                            {role === 'manager' ? booking.customerName : 'Đã cọc'}
                          </span>
                          <span className="text-[9px] text-blue-800 font-mono block">
                            {booking.startTime}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Available Slot
                  return (
                    <div
                      key={slotTime}
                      onClick={() => onSelectSlot(court, slotTime, nextHour)}
                      className="p-1 border-r border-slate-100 hover:bg-emerald-50 transition-all cursor-pointer group flex items-center justify-center"
                      title={`Bấm để đặt: ${court.name} lúc ${slotTime} - ${nextHour} (${formatVND(price)})`}
                    >
                      <button className="w-full h-11 rounded-lg border border-dashed border-emerald-200/80 group-hover:border-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all flex flex-col items-center justify-center p-0.5 cursor-pointer">
                        <span className="text-[10px] font-semibold text-emerald-700 group-hover:text-white leading-tight">
                          Trống
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 group-hover:text-emerald-100 leading-tight">
                          {Math.round(price / 1000)}k
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Helpful hint footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <span>
          Cọc 30% online giữ chỗ, 70% còn lại trả tại quầy khi nhận sân.
        </span>
        <span className="text-slate-500">
          Đổi sân / dời giờ liên hệ hotline quản lý trước 2 tiếng.
        </span>
      </div>
    </div>
  );
};
