import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, PaymentMethod } from '../../types';
import { formatVND, formatDateVN } from '../../utils/formatters';
import { QrCodeSvg } from '../common/QrCodeSvg';
import {
  DollarSign,
  CreditCard,
  Banknote,
  CheckCircle2,
  X,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CollectPaymentModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: 'cash' | 'bank_transfer', amount: number) => void;
}

export const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { collectRemainingPayment, settings } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [extraFee, setExtraFee] = useState<number>(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalAmountToCollect = booking.remainingAmount + extraFee;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = () => {
    collectRemainingPayment(booking.id, paymentMethod);
    onSuccess(paymentMethod, totalAmountToCollect);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Thu Tiền Còn Lại ({booking.id})
              </h3>
              <span className="text-[11px] text-slate-500">
                Thanh toán số tiền còn lại sau khi cọc
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Booking Summary Box */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-emerald-400 font-mono text-[11px]">
              <span>Mã đơn: {booking.id}</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-white">{booking.qrPassCode}</span>
            </div>
            <h4 className="font-bold text-base text-white">{booking.courtName}</h4>
            <div className="text-slate-300">
              {formatDateVN(booking.date)} · <strong className="font-mono text-emerald-300">{booking.startTime} - {booking.endTime}</strong>
            </div>
            <div className="text-slate-400">
              Khách hàng: <strong className="text-white">{booking.customerName}</strong> ({booking.customerPhone})
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền thuê sân:</span>
              <span className="font-mono font-bold text-slate-900">{formatVND(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Tiền cọc đã nhận ({booking.depositRate}%):</span>
              <span className="font-mono">{formatVND(booking.depositAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Số tiền còn lại theo lịch:</span>
              <span className="font-mono font-semibold">{formatVND(booking.remainingAmount)}</span>
            </div>

            {/* Extra Fee Input */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
              <label className="text-slate-600 font-medium whitespace-nowrap">
                Phụ thu thêm (nước uống, vợt, cầu...):
              </label>
              <div className="flex items-center gap-1.5 w-36">
                <input
                  type="number"
                  step={5000}
                  min={0}
                  placeholder="0"
                  value={extraFee || ''}
                  onChange={(e) => setExtraFee(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1 text-xs font-mono font-bold text-right rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-slate-500 text-[11px]">₫</span>
              </div>
            </div>

            {/* Total to collect */}
            <div className="flex justify-between text-amber-900 font-black text-sm border-t border-slate-200 pt-2">
              <span>Tổng số tiền cần thu ngay:</span>
              <span className="font-mono text-base text-emerald-700">{formatVND(totalAmountToCollect)}</span>
            </div>
          </div>

          {/* User Request: Cho phép chọn phương thức thanh toán: Tiền mặt hoặc Chuyển khoản */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900">
              Phương Thức Thanh Toán Số Tiền Còn Lại <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  paymentMethod === 'cash' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Tiền Mặt</div>
                  <div className="text-[11px] text-slate-500">Thu tiền trực tiếp tại quầy</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  paymentMethod === 'bank_transfer' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Chuyển Khoản</div>
                  <div className="text-[11px] text-slate-500">Quét mã VietQR 24/7</div>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Details based on Method */}
          {paymentMethod === 'cash' ? (
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1 text-slate-700">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Thanh toán tiền mặt tại quầy</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Thu ngân nhận trực tiếp số tiền <strong>{formatVND(totalAmountToCollect)}</strong> từ khách hàng {booking.customerName}. Hệ thống sẽ cập nhật trạng thái đơn thành Đã thanh toán 100%.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="text-center">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  Mã VietQR Cho Khách Quét Thanh Toán
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="shrink-0 flex flex-col items-center">
                  <QrCodeSvg
                    value={`vietqr://transfer?bank=${settings.bankName}&acc=${settings.bankAccount}&amount=${totalAmountToCollect}&desc=THANHTOAN_${booking.customerPhone}`}
                    size={140}
                    label="VietQR 24/7"
                  />
                  <span className="text-[10px] text-slate-400 mt-1">Quét mã để chuyển khoản</span>
                </div>

                <div className="flex-1 space-y-2 w-full text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">Ngân hàng:</span>
                    <strong className="text-slate-900">{settings.bankName}</strong>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Số tài khoản:</span>
                      <strong className="font-mono text-slate-900 text-xs">{settings.bankAccount}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.bankAccount, 'acc')}
                      className="p-1 text-slate-500 hover:text-emerald-700 cursor-pointer"
                    >
                      {copiedField === 'acc' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">Chủ tài khoản:</span>
                    <strong className="text-slate-900">{settings.bankAccountName}</strong>
                  </div>

                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-800 text-[10px] block">Số tiền:</span>
                      <strong className="font-mono text-emerald-800 text-xs">{formatVND(totalAmountToCollect)}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(totalAmountToCollect.toString(), 'amount')}
                      className="p-1 text-emerald-700 cursor-pointer"
                    >
                      {copiedField === 'amount' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Xác Nhận Đã Thu Đủ Tiền ({paymentMethod === 'cash' ? 'Tiền Mặt' : 'Chuyển Khoản'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
