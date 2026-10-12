import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { formatVND, formatDateVN } from '../../utils/formatters';
import { CheckCircle2, DollarSign, X, AlertCircle, QrCode } from 'lucide-react';

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

  const [collectPaymentNow, setCollectPaymentNow] = useState(booking.remainingAmount > 0);
  const [extraFee, setExtraFee] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vietqr'>('cash');

  const totalToCollect = booking.remainingAmount + extraFee;

  const handleConfirmCheckIn = () => {
    checkInBooking(booking.id, collectPaymentNow);
    alert(`Đã hoàn tất check-in cho khách ${booking.customerName} tại ${booking.courtName}!`);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Xác Nhận Check-In & Nhận Sân ({booking.id})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Booking Card */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-emerald-400 font-mono text-[11px]">
              <span>Mã vé: {booking.qrPassCode}</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">{booking.id}</span>
            </div>
            <h4 className="font-bold text-base text-white">{booking.courtName}</h4>
            <div className="text-slate-300">
              {formatDateVN(booking.date)} · <strong className="font-mono text-emerald-300">{booking.startTime} - {booking.endTime}</strong>
            </div>
            <div className="text-slate-400">
              Khách hàng: <strong className="text-white">{booking.customerName}</strong> ({booking.customerPhone})
            </div>
          </div>

          {/* Deposit & Remaining Balance */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền thuê sân:</span>
              <span className="font-mono font-bold text-slate-900">{formatVND(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Tiền cọc đã nhận ({booking.depositRate}%):</span>
              <span className="font-mono">{formatVND(booking.depositAmount)}</span>
            </div>
            <div className="flex justify-between text-amber-800 font-bold border-t pt-1.5 border-slate-200">
              <span>Số tiền còn lại cần thu:</span>
              <span className="font-mono text-sm">{formatVND(booking.remainingAmount)}</span>
            </div>
          </div>

          {/* Extra fee (water / balls / rackets) */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Phụ thu thêm (nước uống / thuê vợt / bóng thi đấu):
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0"
                value={extraFee || ''}
                onChange={(e) => setExtraFee(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-slate-500 self-center">VNĐ</span>
            </div>
          </div>

          {/* Payment collection method */}
          {booking.remainingAmount > 0 && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-950">
                <input
                  type="checkbox"
                  checked={collectPaymentNow}
                  onChange={(e) => setCollectPaymentNow(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Thu nốt {formatVND(totalToCollect)} ngay bây giờ</span>
              </label>

              {collectPaymentNow && (
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex-1 py-1 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      paymentMethod === 'cash' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700'
                    }`}
                  >
                    Tiền mặt tại quầy
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('vietqr')}
                    className={`flex-1 py-1 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      paymentMethod === 'vietqr' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700'
                    }`}
                  >
                    Chuyển khoản VietQR
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmCheckIn}
              className="flex-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Check-In Khách</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
