import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import { ChangeCourtModal } from './ChangeCourtModal';
import { CheckInModal } from './CheckInModal';
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  DollarSign,
  Calendar,
  Phone,
  LogOut,
  QrCode
} from 'lucide-react';

export const ManagerBookingsTable: React.FC = () => {
  const {
    bookings,
    cancelBooking,
    checkOutBooking,
    collectRemainingPayment
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBookingForChange, setSelectedBookingForChange] = useState<Booking | null>(null);
  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter(b => {
    // Search
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone.includes(searchTerm) ||
      b.courtName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Sport
    if (sportFilter !== 'all' && b.sport !== sportFilter) return false;

    // Status
    if (statusFilter === 'unpaid_remaining' && (b.remainingAmount === 0 || b.paymentStatus === 'cancelled')) return false;
    if (statusFilter === 'checked_in' && b.checkInStatus !== 'checked_in') return false;
    if (statusFilter === 'not_checked_in' && (b.checkInStatus !== 'not_checked_in' || b.paymentStatus === 'cancelled')) return false;
    if (statusFilter === 'cancelled' && b.paymentStatus !== 'cancelled') return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Danh Sách Đơn Đặt Sân
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý ca đặt, đổi sân và kiểm tra tiền cọc
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl font-mono">
              Tổng số: {filteredBookings.length} đơn
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Mã đơn, Tên khách, SĐT, Tên sân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>

          <div>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">Tất cả môn (Bóng đá, Cầu lông, Pickleball)</option>
              <option value="football">⚽ Bóng Đá (6 sân)</option>
              <option value="badminton">🏸 Cầu Lông (4 sân)</option>
              <option value="pickleball">🎾 Pickleball (4 sân)</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="not_checked_in">Chờ nhận sân (Đã cọc 30%)</option>
              <option value="checked_in">Đang chơi trên sân</option>
              <option value="unpaid_remaining">Còn tiền chưa thu tại quầy</option>
              <option value="cancelled">Đã hủy đơn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mã / Ngày Giờ</th>
                <th className="p-3.5">Sân & Môn</th>
                <th className="p-3.5">Khách Hàng</th>
                <th className="p-3.5 text-right">Tổng Tiền</th>
                <th className="p-3.5 text-right">Tiền Đã Cọc</th>
                <th className="p-3.5 text-right">Còn Lại Cần Thu</th>
                <th className="p-3.5 text-center">Trạng Thái Sân</th>
                <th className="p-3.5 text-center">Thao Tác Quản Lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Không tìm thấy đơn đặt sân nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => {
                  const sportMeta = getSportDetails(b.sport);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Code & Date */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-900 block">{b.id}</span>
                        <span className="text-[11px] text-slate-500">{formatDateVN(b.date)}</span>
                        <span className="font-mono text-emerald-800 text-[11px] block">{b.startTime} - {b.endTime}</span>
                      </td>

                      {/* Court & Sport */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{b.courtName}</span>
                        <span className="text-[11px] text-slate-500">{sportMeta.label} ({b.durationHours}h)</span>
                      </td>

                      {/* Customer */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{b.customerName}</span>
                        <span className="font-mono text-[11px] text-slate-600 block">{b.customerPhone}</span>
                        {b.note && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[150px] block" title={b.note}>
                            {b.note}
                          </span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        {formatVND(b.totalAmount)}
                      </td>

                      {/* Deposit */}
                      <td className="p-3.5 text-right font-mono text-emerald-700 font-bold">
                        <div>{formatVND(b.depositAmount)}</div>
                        <span className="text-[10px] text-slate-400 font-normal">({b.depositRate}%)</span>
                      </td>

                      {/* Remaining */}
                      <td className="p-3.5 text-right font-mono">
                        {b.remainingAmount > 0 && b.paymentStatus !== 'cancelled' ? (
                          <div className="font-bold text-amber-700">
                            {formatVND(b.remainingAmount)}
                            <button
                              onClick={() => {
                                if (confirm(`Xác nhận đã thu đủ ${formatVND(b.remainingAmount)} cho đơn ${b.id}?`)) {
                                  collectRemainingPayment(b.id);
                                }
                              }}
                              className="block text-[10px] text-emerald-700 underline font-normal mt-0.5 ml-auto cursor-pointer"
                            >
                              Thu tiền ngay
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Đã đủ (0 ₫)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        {b.paymentStatus === 'cancelled' ? (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            Đã hủy
                          </span>
                        ) : b.checkInStatus === 'checked_in' ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Đang chơi
                          </span>
                        ) : b.checkInStatus === 'checked_out' ? (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            Đã trả sân
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Đã cọc · Chờ chơi
                          </span>
                        )}
                      </td>

                      {/* Operations */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Check-in */}
                          {b.checkInStatus === 'not_checked_in' && b.paymentStatus !== 'cancelled' && (
                            <button
                              onClick={() => setSelectedBookingForCheckIn(b)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                              title="Check-in và thu nốt tiền"
                            >
                              Check-in
                            </button>
                          )}

                          {/* Check-out */}
                          {b.checkInStatus === 'checked_in' && (
                            <button
                              onClick={() => {
                                if (confirm(`Xác nhận khách đã hoàn tất ca thi đấu cho đơn ${b.id}?`)) {
                                  checkOutBooking(b.id);
                                }
                              }}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                              title="Check-out kết thúc ca"
                            >
                              Trả sân
                            </button>
                          )}

                          {/* Đổi Sân */}
                          {b.paymentStatus !== 'cancelled' && b.checkInStatus !== 'checked_out' && (
                            <button
                              onClick={() => setSelectedBookingForChange(b)}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                              title="Đổi sân hoặc dời giờ cho khách"
                            >
                              Đổi sân
                            </button>
                          )}

                          {/* Hủy đơn */}
                          {b.paymentStatus !== 'cancelled' && (
                            <button
                              onClick={() => {
                                const reason = prompt(`Nhập lý do khách yêu cầu hủy đơn ${b.id}:`);
                                if (reason !== null) {
                                  cancelBooking(b.id, reason);
                                }
                              }}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Hủy đơn đặt sân"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Court Modal */}
      {selectedBookingForChange && (
        <ChangeCourtModal
          booking={selectedBookingForChange}
          onClose={() => setSelectedBookingForChange(null)}
          onSuccess={() => setSelectedBookingForChange(null)}
        />
      )}

      {/* Check In Modal */}
      {selectedBookingForCheckIn && (
        <CheckInModal
          booking={selectedBookingForCheckIn}
          onClose={() => setSelectedBookingForCheckIn(null)}
          onSuccess={() => setSelectedBookingForCheckIn(null)}
        />
      )}
    </div>
  );
};
