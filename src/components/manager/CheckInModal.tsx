import React from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import {
  CheckCircle2,
  X,
  Phone,
  Calendar,
  Clock,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface CheckInModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  booking,
  onClose,
  onSuccess
}) => {
  const { checkInBooking } = useApp();
  const sportMeta = getSportDetails(booking.sport);

  const handleConfirmCheckIn = () => {
    checkInBooking(booking.id);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Xác Nhận Check-In & Nhận Sân
              </h3>
              <p className="text-[11px] text-slate-500">
                Mã đơn: <strong className="font-mono text-slate-800">{booking.id}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          {/* Booking Card */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sportMeta.bgLight}`}>
                {sportMeta.label}
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
                Vé: {booking.qrPassCode}
              </span>
            </div>
            <h4 className="font-bold text-base text-white">{booking.courtName}</h4>
            <div className="text-slate-300 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDateVN(booking.date)}</span>
              <span>·</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <strong className="font-mono text-emerald-300">{booking.startTime} - {booking.endTime}</strong>
              <span className="text-slate-400">({booking.durationHours}h)</span>
            </div>
            <div className="text-slate-300 border-t border-slate-800 pt-2 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Khách hàng: <strong className="text-white">{booking.customerName}</strong> (<span className="font-mono text-emerald-400 font-bold">{booking.customerPhone}</span>)</span>
            </div>
          </div>

          {/* Deposit & Remaining Balance Summary (No collection here) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền thuê sân:</span>
              <span className="font-mono font-bold text-slate-900">{formatVND(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Tiền cọc đã thanh toán trước ({booking.depositRate}%):</span>
              <span className="font-mono font-bold">{formatVND(booking.depositAmount)}</span>
            </div>
            <div className="flex justify-between text-amber-900 font-bold border-t pt-1.5 border-slate-200">
              <span>Số tiền còn lại sẽ thu khi Check-out:</span>
              <span className="font-mono text-sm">{formatVND(booking.remainingAmount)}</span>
            </div>
          </div>

          {/* Notice: No collection during check-in */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Quy trình nhận sân (Không thu tiền khi check-in)</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Khách hàng vào sân thi đấu ngay. Toàn bộ số tiền còn lại <strong>{formatVND(booking.remainingAmount)}</strong> sẽ được thu tại thời điểm kết thúc ca chơi khi thực hiện <strong>Check-out / Tất toán</strong>.
            </p>
          </div>

          {booking.note && (
            <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600 text-[11px]">
              <span className="font-bold text-slate-700">Ghi chú của khách: </span>
              <span>{booking.note}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs cursor-pointer transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleConfirmCheckIn}
            className="flex-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Xác Nhận Nhận Sân (Bắt Đầu Chơi)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
