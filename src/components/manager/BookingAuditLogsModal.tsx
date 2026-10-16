import React from 'react';
import { Booking } from '../../types';
import { formatDateVN, formatVND } from '../../utils/formatters';
import { X, ShieldCheck, Clock, FileText, User, DollarSign, CheckCircle2 } from 'lucide-react';

interface BookingAuditLogsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingAuditLogsModal: React.FC<BookingAuditLogsModalProps> = ({
  booking,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const logs = booking.auditLogs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Lịch Sử Giao Dịch & Nhật Ký Thao Tác
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Đơn {booking.id} · {booking.courtName} · Khách: {booking.customerName} ({booking.customerPhone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Booking Summary */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>Tổng tiền thuê sân:</span>
              <span className="text-white font-bold">{formatVND(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Đã cọc ({booking.depositRate}%):</span>
              <span className="font-bold">{formatVND(booking.depositAmount)}</span>
            </div>
            <div className="flex justify-between text-amber-300">
              <span>Còn lại chưa thu:</span>
              <span className="font-bold">{formatVND(booking.remainingAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1 mt-1">
              <span>Trạng thái:</span>
              <span className="text-white uppercase font-bold">{booking.paymentStatus}</span>
            </div>
          </div>

          {/* Audit Logs List */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Lịch Sử Thao Tác Hệ Thống ({logs.length} bản ghi)</span>
            </h4>

            {logs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 border border-dashed rounded-xl">
                Chưa có bản ghi nhật ký nào.
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {logs.map((log, idx) => (
                  <div key={log.id || idx} className="relative">
                    <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600"></span>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">
                          {log.actorName} ({log.actorRole === 'manager' ? 'Chủ sân' : log.actorRole === 'customer' ? 'Khách hàng' : 'Hệ thống'})
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(log.timestamp).toLocaleString('vi-VN')}
                        </span>
                      </div>

                      <div className="text-slate-700 text-xs font-medium">
                        {log.note || log.action}
                      </div>

                      {(log.amount || log.paymentMethod) && (
                        <div className="flex items-center gap-3 text-[11px] text-emerald-800 pt-1 font-mono">
                          {log.amount && <span>Số tiền: <strong>{formatVND(log.amount)}</strong></span>}
                          {log.paymentMethod && <span>Phương thức: <strong>{log.paymentMethod}</strong></span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Finalized Invoice Details if present (BR-03) */}
          {booking.invoice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-emerald-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Hóa đơn đã khóa (Mã: {booking.invoice.invoiceId})</span>
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full font-mono">
                  KHÓA VĨNH VIỄN
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Xuất lúc: {new Date(booking.invoice.issuedAt).toLocaleString('vi-VN')} · Thu ngân: {booking.invoice.collectedBy}
              </p>
              <div className="font-mono text-[11px] text-slate-800 pt-1 border-t border-emerald-200 space-y-1">
                <div className="flex justify-between">
                  <span>Tiền sân:</span>
                  <strong>{formatVND(booking.invoice.courtFee)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Dịch vụ ({booking.invoice.services.length} mục):</span>
                  <strong>{formatVND(booking.invoice.servicesFee)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Đã cọc:</span>
                  <strong>- {formatVND(booking.invoice.depositPaid)}</strong>
                </div>
                <div className="flex justify-between font-bold text-emerald-900 text-xs border-t border-emerald-200 pt-1">
                  <span>Đã thu tiền còn lại:</span>
                  <span>{formatVND(booking.invoice.remainingPaid)} ({booking.invoice.paymentMethod === 'cash' ? 'Tiền mặt' : 'VietQR'})</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
