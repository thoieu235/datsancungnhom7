import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { formatVND, formatDateVN } from '../../utils/formatters';
import { QrCodeSvg } from '../common/QrCodeSvg';
import {
  CheckCircle2,
  DollarSign,
  X,
  AlertCircle,
  QrCode,
  Banknote,
  CreditCard,
  Copy,
  CheckCircle
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
  const { checkInBooking, settings } = useApp();

  const [collectPaymentNow, setCollectPaymentNow] = useState(booking.remainingAmount > 0);
  const [extraFee, setExtraFee] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const totalToCollect = booking.remainingAmount + extraFee;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmCheckIn = () => {
    checkInBooking(booking.id, collectPaymentNow, paymentMethod);
    alert(`Đã hoàn tất check-in cho khách ${booking.customerName} tại ${booking.courtName}! (${collectPaymentNow ? (paymentMethod === 'cash' ? 'Đã thu tiền mặt' : 'Đã thu chuyển khoản') : 'Chưa thu tiền'})`);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Xác Nhận Check-In & Nhận Sân ({booking.id})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
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
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950">
                <input
                  type="checkbox"
                  checked={collectPaymentNow}
                  onChange={(e) => setCollectPaymentNow(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Thu nốt {formatVND(totalToCollect)} khi check-in</span>
              </label>

              {collectPaymentNow && (
                <div className="space-y-3 pt-1 border-t border-amber-200">
                  <div className="text-[11px] font-semibold text-amber-900">
                    Chọn phương thức thanh toán:
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-colors ${
                        paymentMethod === 'cash'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Tiền Mặt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-colors ${
                        paymentMethod === 'bank_transfer'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Chuyển Khoản</span>
                    </button>
                  </div>

                  {paymentMethod === 'bank_transfer' && (
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                      <div className="flex flex-col items-center">
                        <QrCodeSvg
                          value={`vietqr://transfer?bank=${settings.bankName}&acc=${settings.bankAccount}&amount=${totalToCollect}&desc=THANHTOAN_${booking.customerPhone}`}
                          size={120}
                          label="VietQR 24/7"
                        />
                        <span className="text-[10px] text-slate-400 mt-1">Khách quét mã chuyển khoản</span>
                      </div>
                      <div className="text-[10px] text-slate-600 space-y-1">
                        <div>STK: <strong className="font-mono text-slate-900">{settings.bankAccount}</strong> ({settings.bankName})</div>
                        <div>Chủ TK: <strong className="text-slate-900">{settings.bankAccountName}</strong></div>
                        <div className="font-bold text-emerald-700">Số tiền: {formatVND(totalToCollect)}</div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="text-[11px] text-emerald-800 bg-white p-2 rounded-lg border border-amber-200 font-medium">
                      ✓ Đã nhận đủ {formatVND(totalToCollect)} tiền mặt từ khách hàng tại quầy lễ tân.
                    </div>
                  )}
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
              <span>Xác Nhận Check-In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
