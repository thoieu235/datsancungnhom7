import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, PaymentMethod } from '../../types';
import { formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import {
  DollarSign,
  Banknote,
  CreditCard,
  CheckCircle2,
  X,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare
} from 'lucide-react';

interface ManagerConfirmDepositModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedBooking: Booking) => void;
}

export const ManagerConfirmDepositModal: React.FC<ManagerConfirmDepositModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { confirmDepositByManager } = useApp();

  // BR-02: Tiền cọc hệ thống tự tính mặc định là 30% tổng giá trị booking, User quản lý sân có quyền tùy chỉnh
  const defaultDeposit = Math.round((booking.totalAmount * (booking.depositRate || 30)) / 100);
  const [depositAmount, setDepositAmount] = useState<number>(booking.depositAmount || defaultDeposit);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showZaloPreview, setShowZaloPreview] = useState<boolean>(false);

  if (!isOpen) return null;

  // BR-01: Chỉ cho phép thanh toán/xác nhận cọc đối với booking trạng thái "Chờ thanh toán cọc"
  if (booking.paymentStatus !== 'deposit_pending') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 border border-slate-200 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Không Thể Xác Nhận Cọc</h3>
            <p className="text-xs text-slate-600 mt-1">
              Đơn đặt sân này đang ở trạng thái <strong>"{booking.paymentStatus}"</strong>, chỉ có thể xác nhận thu cọc cho đơn đang ở trạng thái <strong>"Chờ thanh toán cọc"</strong>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const remainingAfterDeposit = Math.max(0, booking.totalAmount - depositAmount);
  const sportMeta = getSportDetails(booking.sport);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const updated = confirmDepositByManager(
        booking.id,
        depositAmount,
        paymentMethod as PaymentMethod,
        note
      );

      setIsSubmitting(false);
      if (updated) {
        onSuccess(updated);
        onClose();
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Xác Nhận Thu Cọc Hộ Khách
                </h3>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  Thu Cọc Tại Quầy
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Mã đơn: <strong className="font-mono text-slate-800">{booking.id}</strong> · Quản lý sân thu trực tiếp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Booking Info Card */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sportMeta.bgLight}`}>
                {sportMeta.label}
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {booking.qrPassCode}
              </span>
            </div>
            <h4 className="font-bold text-base text-white">{booking.courtName}</h4>
            <div className="text-slate-300">
              {formatDateVN(booking.date)} · <strong className="font-mono text-emerald-300">{booking.startTime} - {booking.endTime}</strong> ({booking.durationHours}h)
            </div>
            <div className="text-slate-300 border-t border-slate-800 pt-2 flex justify-between">
              <span>Khách hàng: <strong>{booking.customerName}</strong></span>
              <span className="font-mono text-emerald-400 font-bold">{booking.customerPhone}</span>
            </div>
          </div>

          {/* Amount Calculation & Customization (BR-02) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-slate-700">
              <span>Tổng giá trị ca đặt:</span>
              <strong className="font-mono text-slate-900 text-sm">{formatVND(booking.totalAmount)}</strong>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-900">
                  Số tiền cọc thực tế đã nhận:
                </label>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Đề xuất mặc định: {formatVND(defaultDeposit)} ({booking.depositRate || 30}%)
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={0}
                    max={booking.totalAmount}
                    step={10000}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                    className="w-full pl-9 pr-12 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₫</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDepositAmount(defaultDeposit)}
                  className="px-2.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                  title="Đặt lại mức cọc 30%"
                >
                  30% chuẩn
                </button>
                <button
                  type="button"
                  onClick={() => setDepositAmount(booking.totalAmount)}
                  className="px-2.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                  title="Thu 100% trước"
                >
                  Thu đủ 100%
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-slate-600 pt-1 text-[11px]">
              <span>Số tiền còn lại khách sẽ trả khi check-out (trả sân):</span>
              <strong className="font-mono text-amber-800 text-xs">{formatVND(remainingAfterDeposit)}</strong>
            </div>
          </div>

          {/* Payment Method Selection (A1 step 4: Tiền mặt / Chuyển khoản ngoài) */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900">
              Hình thức nhận tiền cọc <span className="text-red-500">*</span>
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
                  <div className="text-[11px] text-slate-500">Khách đưa trực tiếp tại quầy</div>
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
                  <div className="font-bold">Chuyển Khoản Ngoài</div>
                  <div className="text-[11px] text-slate-500">Khách đã bắn tiền ngoài quầy</div>
                </div>
              </button>
            </div>
          </div>

          {/* Note & BR-03 logging notice */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Ghi chú thu cọc (Lưu vào nhật ký):
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Đã nhận tiền mặt của khách tại quầy, hẹn giờ vào sân..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Zalo ZNS Notification Preview Toggle */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Tự động gửi thông báo Zalo ZNS cho khách hàng</span>
              </div>
              <button
                type="button"
                onClick={() => setShowZaloPreview(!showZaloPreview)}
                className="text-[11px] text-blue-700 hover:underline cursor-pointer"
              >
                {showZaloPreview ? 'Thu gọn' : 'Xem nội dung ZNS'}
              </button>
            </div>

            {showZaloPreview && (
              <div className="p-2.5 bg-white rounded-lg border border-blue-200 text-[11px] text-slate-700 font-mono space-y-1">
                <div className="text-blue-800 font-bold">[Zalo ZNS Official - SportArena]</div>
                <div>Gửi đến SĐT: <strong>{booking.customerPhone}</strong></div>
                <div>Nội dung: "Xác nhận thu cọc thành công đơn {booking.id}! Sân: {booking.courtName}, {booking.startTime}-{booking.endTime} ngày {booking.date}. Đã cọc: {formatVND(depositAmount)} ({paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}). Mã thẻ SportPass: {booking.qrPassCode}."</div>
              </div>
            )}
          </div>

          {/* Logging Notice */}
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Giao dịch thu cọc này sẽ được lưu trữ an toàn vào nhật ký kiểm toán hệ thống (thời gian, tài khoản quản lý, số tiền {formatVND(depositAmount)}, hình thức {paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}).
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đã Thu Tiền Cọc'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
