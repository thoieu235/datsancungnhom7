import React from 'react';
import { Booking, BookingInvoice } from '../../types';
import { formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import { QrCodeSvg } from './QrCodeSvg';
import {
  FileText,
  X,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface WebInvoiceModalProps {
  invoice: BookingInvoice;
  booking?: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export const WebInvoiceModal: React.FC<WebInvoiceModalProps> = ({
  invoice,
  booking,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const sportMeta = booking ? getSportDetails(booking.sport) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Hóa Đơn Thanh Toán Dịch Vụ Sân
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  ĐÃ THANH TOÁN · PAID
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Mã HĐ: <strong className="font-mono text-slate-800">{invoice.invoiceId}</strong> · Mã đơn: <strong className="font-mono text-emerald-700">{invoice.bookingId}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="Đóng hóa đơn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs font-sans print:p-2">
          {/* Status banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  Tất Toán Hoàn Tất (Invoice: Paid)
                </h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Đơn đặt sân đã hoàn tất Check-out và được lưu vào lịch sử giao dịch khách hàng.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg">
              ĐÃ THU ĐỦ
            </span>
          </div>

          {/* Web Invoice Printable Box */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 font-mono text-[11px] text-slate-700">
            {/* Facility Header */}
            <div className="border-b border-slate-200 pb-3 text-center space-y-1">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight font-sans">
                SPORTARENA COMPLEX
              </h2>
              <p className="text-[11px] text-slate-500 font-sans">
                Tổ hợp thể thao tiêu chuẩn quốc tế · Sân Bóng Đá, Cầu Lông, Pickleball
              </p>
              <div className="flex justify-center items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                <span>HĐ: {invoice.invoiceId}</span>
                <span>·</span>
                <span>Ngày lập: {new Date(invoice.issuedAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>

            {/* Customer & Court Information */}
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200 font-sans text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Khách hàng:</span>
                <strong className="text-slate-900 block font-bold">
                  {booking ? booking.customerName : 'Khách hàng'}
                </strong>
                <span className="text-[11px] font-mono text-emerald-800 font-bold block mt-0.5">
                  SĐT: {booking ? booking.customerPhone : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Sân thi đấu:</span>
                <strong className="text-slate-900 block font-bold">
                  {booking ? booking.courtName : 'Sân thi đấu'}
                </strong>
                {booking && (
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    {formatDateVN(booking.date)} · {booking.startTime} - {booking.endTime}
                  </span>
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>1. Tiền thuê sân:</span>
                <span className="font-bold text-slate-900">{formatVND(invoice.courtFee)}</span>
              </div>

              {invoice.services && invoice.services.length > 0 && (
                <div className="space-y-1.5 pl-3 border-l-2 border-emerald-300 py-1">
                  <div className="text-[11px] text-slate-500 font-semibold font-sans">
                    2. Dịch vụ phát sinh tại sân ({invoice.services.length} mục):
                  </div>
                  {invoice.services.map((srv, idx) => (
                    <div key={srv.id || idx} className="flex justify-between text-[11px] text-slate-600">
                      <span>• {srv.name} (x{srv.quantity})</span>
                      <span>{formatVND(srv.price * srv.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs font-semibold text-slate-800 pt-1 border-t border-slate-200/60">
                    <span>Tổng tiền dịch vụ:</span>
                    <span>{formatVND(invoice.servicesFee)}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-slate-800 font-bold">
                <span>TỔNG GIÁ TRỊ ĐƠN (Total Amount):</span>
                <span className="text-slate-900">{formatVND(invoice.totalCollected)}</span>
              </div>

              <div className="flex justify-between items-center text-emerald-700">
                <span>Tiền cọc đã thanh toán trước:</span>
                <span>- {formatVND(invoice.depositPaid)}</span>
              </div>

              <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                <span>ĐÃ THANH TOÁN TẤT TOÁN TẠI QUẦY:</span>
                <span className="text-emerald-700">{formatVND(invoice.remainingPaid)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-sans">
                <div>
                  <span>Hình thức: </span>
                  <strong className="text-slate-800">
                    {invoice.paymentMethod === 'cash' ? 'Tiền mặt tại quầy' : 'Chuyển khoản VietQR'}
                  </strong>
                </div>
                <div>
                  <span>Người xác nhận: </span>
                  <strong className="text-slate-800">{invoice.collectedBy}</strong>
                </div>
              </div>

              {/* Discrepancy Note (if any) */}
              {invoice.discrepancyNote && (
                <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 font-sans mt-2">
                  <span className="font-bold">Ghi chú điều chỉnh: </span>
                  <span>{invoice.discrepancyNote}</span>
                </div>
              )}
            </div>

            {/* QR verification code */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-[10px] text-slate-400 font-sans">
                <span className="block font-bold text-slate-600">Xác thực điện tử nội bộ</span>
                <span>Hóa đơn hợp lệ theo quy chế sân bãi</span>
              </div>
              <div className="bg-white p-1 rounded border border-slate-200">
                <QrCodeSvg value={`INVOICE:${invoice.invoiceId}|BOOKING:${invoice.bookingId}|TOTAL:${invoice.totalCollected}`} size={50} label="" />
              </div>
            </div>
          </div>

          {/* Invoice status footnote */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Xác thực hóa đơn:</strong>
              <span>
                Hóa đơn điện tử nội bộ đã được xác thực thanh toán thành công và lưu trữ an toàn trên hệ thống.
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>In Hóa Đơn Web (Ctrl + P)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
