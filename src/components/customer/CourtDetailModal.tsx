import React, { useState } from 'react';
import { Court, Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDateVN, getSportDetails, TIME_SLOTS } from '../../utils/formatters';
import { CourtVisualBadge } from '../common/CourtVisualBadge';
import { X, Check, Clock, Calendar, ShieldCheck, DollarSign, Wrench, Sparkles, MapPin } from 'lucide-react';

interface CourtDetailModalProps {
  court: Court;
  onClose: () => void;
  onBookSlot: (court: Court, startTime: string, endTime: string) => void;
}

export const CourtDetailModal: React.FC<CourtDetailModalProps> = ({
  court,
  onClose,
  onBookSlot
}) => {
  const { selectedDate, bookings } = useApp();
  const sportMeta = getSportDetails(court.sport);

  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('18:00');

  // Find busy slots for this court on selected date
  const isSlotBooked = (slotTime: string) => {
    const slotStartMin = parseInt(slotTime.split(':')[0]) * 60 + parseInt(slotTime.split(':')[1]);
    const slotEndMin = slotStartMin + 60;

    return bookings.some(b => {
      if (b.courtId !== court.id || b.date !== selectedDate) return false;
      if (b.checkInStatus === 'cancelled' || b.paymentStatus === 'cancelled') return false;

      const [bStartH, bStartM] = b.startTime.split(':').map(Number);
      const [bEndH, bEndM] = b.endTime.split(':').map(Number);
      const bStartMin = bStartH * 60 + bStartM;
      const bEndMin = bEndH * 60 + bEndM;

      return (
        (slotStartMin >= bStartMin && slotStartMin < bEndMin) ||
        (slotEndMin > bStartMin && slotEndMin <= bEndMin)
      );
    });
  };

  const getNextHour = (time: string) => {
    const [h] = time.split(':').map(Number);
    return `${(h + 1).toString().padStart(2, '0')}:00`;
  };

  const handleStartBooking = () => {
    if (court.status === 'maintenance') {
      alert('Sân này hiện đang bảo trì, vui lòng chọn sân khác!');
      return;
    }
    const nextH = getNextHour(selectedSlotTime);
    onBookSlot(court, selectedSlotTime, nextH);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${sportMeta.bgLight}`}>
                {sportMeta.label}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Sân #{court.courtNumber}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mt-0.5">{court.name}</h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Visual Court Rendering / Photo */}
          <div>
            <span className="font-semibold text-slate-700 block mb-2">Hình ảnh & Sơ đồ mặt sân thực tế:</span>
            <CourtVisualBadge court={court} height="h-56" />
          </div>

          {/* Description & Technical Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">Thông tin & Đặc tính kỹ thuật:</span>
              <p className="text-slate-600 leading-relaxed">{court.description}</p>
              <div className="pt-2 border-t border-slate-200/60 space-y-1 text-slate-500">
                <div>Bề mặt sân: <strong className="text-slate-800">{court.surface}</strong></div>
                <div>Chiếu sáng: <strong className="text-slate-800">{court.lighting}</strong></div>
                <div>Tình trạng: <strong className={court.status === 'active' ? 'text-emerald-700' : 'text-red-600'}>{court.status === 'active' ? 'Hoạt động tốt' : 'Đang bảo trì'}</strong></div>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-xs text-white">Bảng Giá Thuê Chi Tiết</span>
                <span className="text-[10px] text-emerald-400 font-mono">Cọc 30% giữ chỗ</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-slate-300 block font-medium">Giờ tiêu chuẩn:</span>
                    <span className="text-[10px] text-slate-400">06:00 - 17:00 ngày thường</span>
                  </div>
                  <strong className="font-mono text-white text-sm">{formatVND(court.pricePerHour)}/h</strong>
                </div>

                <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                  <div>
                    <span className="text-amber-300 block font-medium">Giờ cao điểm (Peak):</span>
                    <span className="text-[10px] text-slate-400">Sau 17:00 & Thứ 7, Chủ Nhật</span>
                  </div>
                  <strong className="font-mono text-emerald-400 text-sm">{formatVND(court.peakPricePerHour)}/h</strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                💡 Khách đặt cọc 30% online qua VietQR, 70% còn lại trả tại quầy lễ tân khi nhận sân.
              </div>
            </div>
          </div>

          {/* Amenities checklist */}
          <div>
            <span className="font-bold text-slate-900 block mb-2">Tiện ích đi kèm miễn phí:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {court.amenities.map(a => (
                <div key={a} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Slot Booking Selector on this Court */}
          {court.status === 'active' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 text-xs block">
                    Chọn Khung Giờ Đặt Sân Này ({formatDateVN(selectedDate)})
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Bấm chọn giờ còn trống và tiến hành đặt cọc giữ chỗ:
                  </span>
                </div>
              </div>

              {/* Slots buttons grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
                {TIME_SLOTS.slice(0, 16).map(slotTime => {
                  const booked = isSlotBooked(slotTime);
                  const isSelected = selectedSlotTime === slotTime;
                  const isPeak = parseInt(slotTime.split(':')[0]) >= 17;

                  if (booked) {
                    return (
                      <button
                        key={slotTime}
                        disabled
                        className="py-1.5 px-1 rounded-lg text-[11px] font-mono font-medium bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        title="Khung giờ này đã có khách đặt"
                      >
                        {slotTime}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={slotTime}
                      type="button"
                      onClick={() => setSelectedSlotTime(slotTime)}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : isPeak
                          ? 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      {slotTime}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-600">
                  Đã chọn ca: <strong className="font-mono text-emerald-800">{selectedSlotTime} - {getNextHour(selectedSlotTime)}</strong>
                </span>

                <button
                  type="button"
                  onClick={handleStartBooking}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Đặt Sân Này Ngay ➔
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
