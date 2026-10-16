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
        <table className="w-full border-separate border-spacing-0 table-fixed text-xs min-w-[1390px]">
          {/* Column definitions for strict mathematical alignment across all rows */}
          <colgroup>
            <col className="w-[190px] min-w-[190px] max-w-[190px]" style={{ width: '190px' }} />
            {TIME_SLOTS.slice(0, 16).map(slot => (
              <col key={slot} className="w-[75px] min-w-[75px] max-w-[75px]" style={{ width: '75px' }} />
            ))}
          </colgroup>

          {/* Table Header (Row 1: Hours) */}
          <thead>
            <tr className="bg-slate-100 text-xs font-semibold text-slate-700 sticky top-0 z-20">
              <th className="w-[190px] min-w-[190px] max-w-[190px] h-12 p-3 text-left border-b border-r border-slate-200 bg-slate-100 sticky left-0 z-30 shadow-[1px_0_0_0_#cbd5e1] box-border">
                <span className="font-bold text-xs text-slate-900 block truncate">Tên Sân / Giờ</span>
              </th>
              {TIME_SLOTS.slice(0, 16).map(slot => {
                const hourNum = parseInt(slot.split(':')[0]);
                const isPeak = hourNum >= 17;
                return (
                  <th
                    key={slot}
                    className={`w-[75px] min-w-[75px] max-w-[75px] h-12 p-1.5 text-center border-b border-r border-slate-200 font-mono box-border ${
                      isPeak ? 'bg-amber-100/80 text-amber-950 font-bold' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="font-bold text-[11px] block leading-tight">{slot}</span>
                    {isPeak ? (
                      <span className="text-[9px] text-amber-800 font-bold uppercase block mt-0.5 tracking-tight">
                        Peak
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-normal block mt-0.5">
                        Thường
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body (Courts & Slots) */}
          <tbody>
            {filteredCourts.map(court => (
              <tr
                key={court.id}
                className="hover:bg-slate-50/60 transition-colors"
              >
                {/* Court Info Column (Sticky Left) */}
                <td className="w-[190px] min-w-[190px] max-w-[190px] h-[58px] p-2 border-b border-r border-slate-200 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#cbd5e1] align-middle box-border">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {court.courtCode && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-900 text-white shrink-0">
                        {court.courtCode}
                      </span>
                    )}
                    <span className="font-bold text-xs text-slate-900 truncate" title={court.name}>
                      {court.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-0.5">
                    <span className="text-slate-500 truncate max-w-[95px]">{court.surface}</span>
                    <span className="font-mono text-emerald-700 font-bold shrink-0">{formatVND(court.pricePerHour)}/h</span>
                  </div>
                </td>

                {/* Slots Columns */}
                {TIME_SLOTS.slice(0, 16).map(slotTime => {
                  const { type, booking } = getSlotState(court, slotTime);
                  const isPeak = parseInt(slotTime.split(':')[0]) >= 17;
                  const price = isPeak ? court.peakPricePerHour : court.pricePerHour;
                  const nextHour = getNextHour(slotTime);

                  if (type === 'maintenance') {
                    const maintTooltip = court.maintenanceReason
                      ? `Bảo trì: ${court.maintenanceReason} (${court.maintenanceStart ? court.maintenanceStart.replace('T', ' ') : ''} đến ${court.maintenanceEnd ? court.maintenanceEnd.replace('T', ' ') : ''})`
                      : 'Sân đang bảo trì thiết bị';

                    return (
                      <td
                        key={slotTime}
                        className="w-[75px] min-w-[75px] max-w-[75px] h-[58px] p-1 border-b border-r border-slate-200 bg-slate-100/80 text-center align-middle box-border"
                        title={maintTooltip}
                      >
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <Wrench className="w-3.5 h-3.5" />
                          <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">Bảo trì</span>
                        </div>
                      </td>
                    );
                  }

                  if (type === 'in_use' && booking) {
                    return (
                      <td
                        key={slotTime}
                        onClick={() => onViewBookingDetails && onViewBookingDetails(booking)}
                        className="w-[75px] min-w-[75px] max-w-[75px] h-[58px] p-1 border-b border-r border-slate-200 bg-amber-100/90 hover:bg-amber-200/90 transition-colors cursor-pointer text-center align-middle box-border"
                        title={`Đang chơi: ${booking.customerName} (${booking.startTime} - ${booking.endTime})`}
                      >
                        <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
                          <span className="block text-[10px] font-bold text-amber-950 truncate w-full text-center">
                            {role === 'manager' ? booking.customerName : 'Đang chơi'}
                          </span>
                          <span className="text-[9px] text-amber-800 font-mono block mt-0.5 font-semibold">
                            {booking.startTime}
                          </span>
                        </div>
                      </td>
                    );
                  }

                  if (type === 'booked' && booking) {
                    return (
                      <td
                        key={slotTime}
                        onClick={() => onViewBookingDetails && onViewBookingDetails(booking)}
                        className="w-[75px] min-w-[75px] max-w-[75px] h-[58px] p-1 border-b border-r border-slate-200 bg-blue-100/80 hover:bg-blue-200/90 transition-colors cursor-pointer text-center align-middle box-border"
                        title={`Đã cọc 30%: ${booking.customerName} (${booking.startTime} - ${booking.endTime})`}
                      >
                        <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
                          <span className="block text-[10px] font-bold text-blue-950 truncate w-full text-center">
                            {role === 'manager' ? booking.customerName : 'Đã cọc'}
                          </span>
                          <span className="text-[9px] text-blue-800 font-mono block mt-0.5 font-semibold">
                            {booking.startTime}
                          </span>
                        </div>
                      </td>
                    );
                  }

                  // Available Slot
                  return (
                    <td
                      key={slotTime}
                      onClick={() => onSelectSlot(court, slotTime, nextHour)}
                      className="w-[75px] min-w-[75px] max-w-[75px] h-[58px] p-1 border-b border-r border-slate-200 hover:bg-emerald-50 transition-all cursor-pointer align-middle box-border"
                      title={`Bấm để đặt: ${court.name} lúc ${slotTime} - ${nextHour} (${formatVND(price)})`}
                    >
                      <button className="w-full h-full rounded-lg border border-dashed border-emerald-300 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex flex-col items-center justify-center p-0.5 cursor-pointer">
                        <span className="text-[10px] font-semibold text-emerald-700 hover:text-white leading-tight">
                          Trống
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 hover:text-emerald-100 leading-tight">
                          {Math.round(price / 1000)}k
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Helpful hint footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <span>
          Cọc 30% online giữ chỗ, số tiền còn lại thanh toán tại quầy khi kết thúc ca chơi (check-out).
        </span>
        <span className="text-slate-500">
          Đổi sân / dời giờ liên hệ hotline quản lý trước 2 tiếng.
        </span>
      </div>
    </div>
  );
};
