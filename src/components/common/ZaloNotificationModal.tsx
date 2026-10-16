import React from 'react';
import { X, MessageSquare, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { formatDateVN, formatVND } from '../../utils/formatters';

interface ZaloNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientPhone: string;
  bookingId: string;
  courtName: string;
  dateTime: string;
  depositAmount: number;
  remainingAmount: number;
  qrPassCode: string;
  paymentMethod: string;
}

export const ZaloNotificationModal: React.FC<ZaloNotificationModalProps> = ({
  isOpen,
  onClose,
  recipientPhone,
  bookingId,
  courtName,
  dateTime,
  depositAmount,
  remainingAmount,
  qrPassCode,
  paymentMethod
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full border border-blue-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Zalo Top Bar */}
        <div className="bg-[#0068FF] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white text-[#0068FF] font-black text-xs flex items-center justify-center shadow-xs">
              Zalo
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span>Zalo ZNS Official</span>
                <span className="w-3.5 h-3.5 rounded-full bg-white text-[#0068FF] flex items-center justify-center text-[9px] font-black">✓</span>
              </div>
              <div className="text-[10px] text-blue-100">SportArena Service Message</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Content */}
        <div className="p-5 space-y-4 text-xs bg-slate-50/60">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>XÁC NHẬN ĐẶT SÂN THÀNH CÔNG (UC01)</span>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              Kính gửi Quý khách có SĐT <strong>{recipientPhone}</strong>, hệ thống SportArena đã xác nhận nhận tiền cọc thành công cho đơn đặt sân của bạn!
            </p>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đặt sân:</span>
                <strong className="font-mono text-slate-900">{bookingId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sân thể thao:</span>
                <strong className="text-slate-900">{courtName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian:</span>
                <strong className="text-slate-900">{dateTime}</strong>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Tiền cọc đã nhận:</span>
                <strong className="font-mono">{formatVND(depositAmount)}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Hình thức:</span>
                <span>{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-amber-800">
                <span>Số tiền còn lại khi nhận sân:</span>
                <strong className="font-mono">{formatVND(remainingAmount)}</strong>
              </div>
            </div>

            {/* QR Pass Voucher Code */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Mã Thẻ SportPass Check-in
              </span>
              <div className="font-mono font-black text-emerald-900 text-sm tracking-wider">
                {qrPassCode}
              </div>
              <p className="text-[10px] text-emerald-700">
                Xuất trình mã này tại quầy lễ tân để nhận sân nhanh chóng
              </p>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Tin nhắn Zalo Notification Service được gửi tự động</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#0068FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Đã Nhận Thông Báo
          </button>
        </div>
      </div>
    </div>
  );
};
