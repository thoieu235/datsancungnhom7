import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, Court } from '../../types';
import { formatVND, formatDateVN, getSportDetails, TIME_SLOTS } from '../../utils/formatters';
import { RefreshCw, X, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface ChangeCourtModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangeCourtModal: React.FC<ChangeCourtModalProps> = ({
  booking,
  onClose,
  onSuccess
}) => {
  const { courts, changeCourtBooking } = useApp();

  const [newCourtId, setNewCourtId] = useState(booking.courtId);
  const [newDate, setNewDate] = useState(booking.date);
  const [newStartTime, setNewStartTime] = useState(booking.startTime);
  const [newEndTime, setNewEndTime] = useState(booking.endTime);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter available courts of same or different sport
  const currentCourt = courts.find(c => c.id === booking.courtId);
  const selectedNewCourt = courts.find(c => c.id === newCourtId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const success = changeCourtBooking(booking.id, newCourtId, newDate, newStartTime, newEndTime);
    if (!success) {
      setErrorMsg('Không thể đổi sang sân hoặc giờ này do bị trùng lịch với đơn đặt khác hoặc sân đang bận!');
      return;
    }

    alert(`Đã đổi thành công đơn ${booking.id} sang ${selectedNewCourt?.name} (${newDate} ${newStartTime}-${newEndTime})!`);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 bg-amber-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Đổi Sân & Dời Giờ Cho Khách ({booking.id})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current booking info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 font-semibold block">Thông tin lịch hiện tại:</span>
            <div className="font-bold text-slate-900">{booking.courtName}</div>
            <div className="text-slate-600 font-medium">
              {formatDateVN(booking.date)} · <span className="font-mono">{booking.startTime} - {booking.endTime}</span>
            </div>
            <div className="text-slate-600">
              Khách: <strong>{booking.customerName}</strong> ({booking.customerPhone}) · Đã cọc: <strong className="text-emerald-700">{formatVND(booking.depositAmount)}</strong>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* New Court Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn Sân Muốn Đổi Sang (Trong 14 Sân)
            </label>
            <select
              value={newCourtId}
              onChange={(e) => setNewCourtId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <optgroup label="⚽ Sân Bóng Đá (6 Sân)">
                {courts.filter(c => c.sport === 'football').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.status === 'maintenance' ? 'Đang bảo trì' : 'Hoạt động'})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏸 Sân Cầu Lông (4 Sân)">
                {courts.filter(c => c.sport === 'badminton').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.status === 'maintenance' ? 'Đang bảo trì' : 'Hoạt động'})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🎾 Sân Pickleball (4 Sân)">
                {courts.filter(c => c.sport === 'pickleball').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.status === 'maintenance' ? 'Đang bảo trì' : 'Hoạt động'})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* New Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ngày Thi Đấu Mới
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* New Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giờ Bắt Đầu Mới
              </label>
              <input
                type="time"
                required
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giờ Kết Thúc Mới
              </label>
              <input
                type="time"
                required
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>Ghi chú vận hành:</strong> Tiền cọc cũ ({formatVND(booking.depositAmount)}) sẽ được tự động bảo lưu và chuyển sang lịch đặt mới này.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-2 py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Xác Nhận Đổi Sân Cho Khách</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
