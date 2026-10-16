import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import { QrCodeSvg } from '../common/QrCodeSvg';
import {
  X,
  CreditCard,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  XCircle,
  MessageSquare
} from 'lucide-react';

interface CustomerPayDepositModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export const CustomerPayDepositModal: React.FC<CustomerPayDepositModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { payDepositByCustomer, cancelDepositPending, settings } = useApp();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessingWebhook, setIsProcessingWebhook] = useState(false);
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(() => {
    if (!booking.depositExpiresAt) return 600;
    const diff = new Date(booking.depositExpiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  // Countdown timer for 10 minutes (UC01 E2)
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      if (!booking.depositExpiresAt) {
        setTimeRemainingSec(prev => Math.max(0, prev - 1));
      } else {
        const diff = new Date(booking.depositExpiresAt).getTime() - Date.now();
        const sec = Math.max(0, Math.floor(diff / 1000));
        setTimeRemainingSec(sec);
        if (sec <= 0) {
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, booking.depositExpiresAt]);

  if (!isOpen) return null;

  const isExpired = timeRemainingSec <= 0;
  const minutes = Math.floor(timeRemainingSec / 60);
  const seconds = timeRemainingSec % 60;
  const countdownFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // UC01 main flow steps 5 & 6: simulate bank webhook reception
  const handleSimulateWebhook = () => {
    setIsProcessingWebhook(true);
    setTimeout(() => {
      const updated = payDepositByCustomer(booking.id, 'vietqr');
      setIsProcessingWebhook(false);
      if (updated) {
        onSuccess(updated.id);
        onClose();
      }
    }, 700);
  };

  // UC01 E1: Khách hủy giao dịch trên màn hình QR
  const handleCancelTransaction = () => {
    if (confirm('Bạn có chắc chắn muốn hủy giao dịch thanh toán cọc và hủy giữ chỗ sân này?')) {
      cancelDepositPending(booking.id, 'Khách hàng tự hủy giao dịch trên màn hình QR');
      onClose();
    }
  };

  const sportMeta = getSportDetails(booking.sport);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Thanh Toán Tiền Cọc Trực Tuyến
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  Cổng Thanh Toán VietQR
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Đơn {booking.id} · Quét mã VietQR 24/7 để xác nhận giữ chỗ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* E2 Countdown Timer Notice */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            isExpired
              ? 'bg-red-50 border-red-200 text-red-900'
              : timeRemainingSec <= 180
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-bold text-xs">
                  {isExpired ? 'Đã hết thời gian giữ chỗ' : 'Thời hạn hoàn tất thanh toán cọc:'}
                </span>
                <p className="text-[10px] opacity-80">
                  {isExpired
                    ? 'Đơn đặt đã bị hủy tự động và giải phóng lịch sân.'
                    : 'Nếu quá 10 phút, hệ thống sẽ tự động hủy đơn và giải phóng lịch sân.'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-base font-extrabold block">
                {countdownFormatted}
              </span>
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sportMeta.bgLight}`}>
                {sportMeta.label}
              </span>
              <span className="font-mono text-emerald-400 font-bold">{booking.id}</span>
            </div>
            <h4 className="font-bold text-base text-white">{booking.courtName}</h4>
            <div className="text-slate-300">
              {formatDateVN(booking.date)} · <strong className="font-mono text-emerald-300">{booking.startTime} - {booking.endTime}</strong> ({booking.durationHours}h)
            </div>
            <div className="text-slate-300 flex justify-between border-t border-slate-800 pt-1.5">
              <span>Tổng tiền thuê: <strong>{formatVND(booking.totalAmount)}</strong></span>
              <span>Cần cọc trước: <strong className="font-mono text-emerald-400">{formatVND(booking.depositAmount)} ({booking.depositRate}%)</strong></span>
            </div>
          </div>

          {/* Dynamic VietQR Display (UC01 step 4) */}
          {!isExpired ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="text-center">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
                  Mã QR Thanh Toán Động (Tự Động Điền Tiền Cọc & Nội Dung)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="shrink-0 flex flex-col items-center">
                  <QrCodeSvg
                    value={`vietqr://transfer?bank=${settings.bankName}&acc=${settings.bankAccount}&amount=${booking.depositAmount}&desc=DATSAN_${booking.customerPhone}`}
                    size={150}
                    label="VietQR 24/7"
                  />
                  <span className="text-[10px] text-slate-400 mt-1">Mở app ngân hàng quét mã</span>
                </div>

                <div className="flex-1 space-y-2 w-full text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">Ngân hàng thụ hưởng:</span>
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

                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-800 text-[10px] block">Số tiền cọc:</span>
                      <strong className="font-mono text-emerald-800 text-sm font-bold">{formatVND(booking.depositAmount)}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(booking.depositAmount.toString(), 'amount')}
                      className="p-1 text-emerald-700 cursor-pointer"
                    >
                      {copiedField === 'amount' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Nội dung chuyển khoản:</span>
                      <strong className="font-mono text-slate-900 text-xs">DATSAN {booking.customerPhone}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(`DATSAN ${booking.customerPhone}`, 'desc')}
                      className="p-1 text-slate-500 hover:text-emerald-700 cursor-pointer"
                    >
                      {copiedField === 'desc' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Webhook trigger button (UC01 step 6) */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <button
                  type="button"
                  onClick={handleSimulateWebhook}
                  disabled={isProcessingWebhook}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessingWebhook ? 'animate-spin' : ''}`} />
                  <span>
                    {isProcessingWebhook
                      ? 'Đang kiểm tra giao dịch chuyển khoản...'
                      : 'Tôi Đã Quét QR & Chuyển Khoản Thành Công'}
                  </span>
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  Hệ thống tự động kích hoạt cập nhật trạng thái "Đã đặt cọc" và gửi thông báo Zalo ZNS
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center space-y-2">
              <XCircle className="w-10 h-10 text-red-500 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Đơn Đặt Sân Đã Hết Hạn Giữ Chỗ</h4>
              <p className="text-xs text-slate-600">
                Do quá 10 phút chưa thanh toán cọc, đơn đặt sân đã được hủy tự động để người khác có thể đặt sân. Vui lòng tạo đơn đặt mới.
              </p>
            </div>
          )}

          {/* E1: Customer cancel transaction */}
          {!isExpired && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleCancelTransaction}
                className="text-xs text-red-600 hover:text-red-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Hủy giao dịch thanh toán cọc</span>
              </button>
              <span className="text-[11px] text-slate-400">
                Thẻ SportPass sẽ được cấp sau khi nhận cọc
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
