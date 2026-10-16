import React from 'react';
import { Court, Booking } from '../../types';
import { formatVND, formatDateVN } from '../../utils/formatters';
import { AlertTriangle, Phone, RefreshCw, X, ShieldAlert } from 'lucide-react';

interface MaintenanceAlertModalProps {
  court: Court;
  affectedBookings: Booking[];
  onClose: () => void;
  onInitiateChangeCourt: (booking: Booking) => void;
}

export const MaintenanceAlertModal: React.FC<MaintenanceAlertModalProps> = ({
  court,
  affectedBookings,
  onClose,
  onInitiateChangeCourt
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-red-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Warning Header */}
        <div className="px-6 py-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-red-800 text-white">
                  {court.courtCode || `SÂN-${court.courtNumber}`}
                </span>
                <h3 className="font-bold text-red-950 text-sm">
                  Cảnh Báo: Sân Đang Chuyển Sang Bảo Trì
                </h3>
              </div>
              <p className="text-[11px] text-red-700 mt-0.5">
                {court.name} hiện có <strong>{affectedBookings.length} ca đặt</strong> cần xử lý đổi sân cho khách
              </p>
              {(court.maintenanceStart || court.maintenanceEnd || court.maintenanceReason) && (
                <div className="mt-1 text-[10px] text-red-900 bg-red-100/70 px-2 py-0.5 rounded border border-red-200 inline-block font-mono">
                  {court.maintenanceStart && <span>{court.maintenanceStart.replace('T', ' ')} → {court.maintenanceEnd?.replace('T', ' ')}</span>}
                  {court.maintenanceReason && <span className="font-sans ml-1">({court.maintenanceReason})</span>}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
            <strong>Hướng dẫn xử lý:</strong> Sân đã được cập nhật sang trạng thái bảo trì. Vui lòng liên hệ với các khách hàng dưới đây theo số điện thoại để thông báo và bấm nút <strong>"Đổi Sân Khác"</strong> để chuyển lịch của họ sang sân trống cùng loại.
          </div>

          <div className="space-y-2 pt-1">
            {affectedBookings.map(b => (
              <div
                key={b.id}
                className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-amber-300 transition-colors shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {b.id}
                    </span>
                    <strong className="text-slate-900">{b.customerName}</strong>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Đã cọc {formatVND(b.depositAmount)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg text-[11px]">
                  <div>
                    <span>Thời gian: <strong>{formatDateVN(b.date)}</strong> · </span>
                    <strong className="font-mono text-emerald-800">{b.startTime} - {b.endTime}</strong>
                  </div>

                  <a
                    href={`tel:${b.customerPhone}`}
                    className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Gọi {b.customerPhone}</span>
                  </a>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      onInitiateChangeCourt(b);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Đổi Sang Sân Khác Cho Khách Này</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
          >
            Đã Hiểu &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
