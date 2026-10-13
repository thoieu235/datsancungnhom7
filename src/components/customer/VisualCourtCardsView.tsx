import React, { useState } from 'react';
import { Court } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDateVN, getSportDetails, TIME_SLOTS } from '../../utils/formatters';
import { CourtVisualBadge } from '../common/CourtVisualBadge';
import { CourtDetailModal } from './CourtDetailModal';
import { Eye, Calendar, Clock, DollarSign, Check, Wrench, ArrowRight } from 'lucide-react';

interface VisualCourtCardsViewProps {
  onSelectSlot: (court: Court, startTime: string, endTime: string) => void;
}

export const VisualCourtCardsView: React.FC<VisualCourtCardsViewProps> = ({
  onSelectSlot
}) => {
  const { courts, selectedSport, selectedDate, bookings } = useApp();
  const [inspectingCourt, setInspectingCourt] = useState<Court | null>(null);

  const filteredCourts = courts.filter(c => c.sport === selectedSport);
  const sportMeta = getSportDetails(selectedSport);

  // Check how many free slots this court has on selectedDate
  const getCourtAvailability = (court: Court) => {
    if (court.status === 'maintenance') return { freeCount: 0, firstFreeSlot: null as string | null, freeSlots: [] as string[] };

    const courtBookings = bookings.filter(
      b => b.courtId === court.id && b.date === selectedDate && b.checkInStatus !== 'cancelled' && b.paymentStatus !== 'cancelled'
    );

    const freeSlots: string[] = [];
    TIME_SLOTS.slice(0, 16).forEach(slotTime => {
      const [slotH] = slotTime.split(':').map(Number);
      const isBooked = courtBookings.some(b => {
        const [bStartH] = b.startTime.split(':').map(Number);
        const [bEndH] = b.endTime.split(':').map(Number);
        return slotH >= bStartH && slotH < bEndH;
      });
      if (!isBooked) freeSlots.push(slotTime);
    });

    return {
      freeCount: freeSlots.length,
      firstFreeSlot: freeSlots[0] || null,
      freeSlots
    };
  };

  const getNextHour = (time: string) => {
    const [h] = time.split(':').map(Number);
    return `${(h + 1).toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Danh Sách Sân {sportMeta.label} ({filteredCourts.length} Sân)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem hình ảnh thực tế, thông số mặt sân và bảng giá chi tiết từng sân
          </p>
        </div>
      </div>

      {/* Grid of Visual Court Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourts.map(court => {
          const { freeCount, firstFreeSlot, freeSlots } = getCourtAvailability(court);

          return (
            <div
              key={court.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Visual Image / Pitch Rendering Banner */}
                <div className="relative">
                  <CourtVisualBadge court={court} height="h-44" />
                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    {court.status === 'maintenance' ? (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-600/90 text-white backdrop-blur-md flex items-center gap-1 shadow-xs">
                        <Wrench className="w-3 h-3" />
                        <span>Bảo trì</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-600/90 text-white backdrop-blur-md flex items-center gap-1 shadow-xs">
                        <span>Còn {freeCount} ca trống</span>
                      </span>
                    )}
                  </div>

                  {/* Zoom / View Detail Button Overlay */}
                  <button
                    onClick={() => setInspectingCourt(court)}
                    className="absolute top-3 right-3 z-20 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-md transition-colors cursor-pointer"
                    title="Xem ảnh phóng to & chi tiết sân"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Court Meta & Title */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold ${sportMeta.colorClass === 'emerald' ? 'text-emerald-700' : sportMeta.colorClass === 'blue' ? 'text-blue-700' : 'text-amber-700'} uppercase tracking-wider`}>
                        {court.surface}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">#{court.courtNumber}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-0.5 group-hover:text-emerald-700 transition-colors">
                      {court.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {court.description}
                    </p>
                  </div>

                  {/* Pricing Matrix on Card */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Giờ thường (06-17h):</span>
                      <strong className="font-mono text-slate-900 text-sm">{formatVND(court.pricePerHour)}/h</strong>
                    </div>

                    <div className="text-right border-l border-slate-200 pl-3">
                      <span className="text-amber-700 text-[10px] font-semibold block">Giờ vàng (&gt;17h & T7-CN):</span>
                      <strong className="font-mono text-emerald-700 text-sm">{formatVND(court.peakPricePerHour)}/h</strong>
                    </div>
                  </div>

                  {/* Free slots preview pills */}
                  {court.status === 'active' && freeSlots.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500">Ca giờ trống hôm nay:</span>
                      <div className="flex flex-wrap gap-1">
                        {freeSlots.slice(0, 4).map(slot => (
                          <button
                            key={slot}
                            onClick={() => onSelectSlot(court, slot, getNextHour(slot))}
                            className="px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer border border-emerald-200"
                            title={`Bấm để đặt nhanh lúc ${slot}`}
                          >
                            {slot}
                          </button>
                        ))}
                        {freeSlots.length > 4 && (
                          <button
                            onClick={() => setInspectingCourt(court)}
                            className="px-2 py-0.5 text-[10px] rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            +{freeSlots.length - 4} ca khác
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingCourt(court)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Xem ảnh & giá</span>
                </button>

                {court.status === 'active' && firstFreeSlot ? (
                  <button
                    type="button"
                    onClick={() => onSelectSlot(court, firstFreeSlot, getNextHour(firstFreeSlot))}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Đặt sân</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-2 px-3 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed text-center"
                  >
                    {court.status === 'maintenance' ? 'Đang bảo trì' : 'Đã kín lịch'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {inspectingCourt && (
        <CourtDetailModal
          court={inspectingCourt}
          onClose={() => setInspectingCourt(null)}
          onBookSlot={(c, start, end) => {
            setInspectingCourt(null);
            onSelectSlot(c, start, end);
          }}
        />
      )}
    </div>
  );
};
