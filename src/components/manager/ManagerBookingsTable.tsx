import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import { ChangeCourtModal } from './ChangeCourtModal';
import { CheckInModal } from './CheckInModal';
import { CollectPaymentModal } from './CollectPaymentModal';
import { ManagerConfirmDepositModal } from './ManagerConfirmDepositModal';
import { BookingAuditLogsModal } from './BookingAuditLogsModal';
import { ZaloNotificationModal } from '../common/ZaloNotificationModal';
import { WebInvoiceModal } from '../common/WebInvoiceModal';
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
  QrCode,
  Banknote,
  CreditCard,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Clock,
  FileText,
  AlertTriangle,
  MessageSquare
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals
  const [selectedBookingForChange, setSelectedBookingForChange] = useState<Booking | null>(null);
  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<Booking | null>(null);
  const [selectedBookingForCollect, setSelectedBookingForCollect] = useState<Booking | null>(null);
  const [selectedBookingForDeposit, setSelectedBookingForDeposit] = useState<Booking | null>(null);
  const [selectedBookingForAudit, setSelectedBookingForAudit] = useState<Booking | null>(null);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);
  const [zaloNotificationData, setZaloNotificationData] = useState<any | null>(null);

  const [toastNotification, setToastNotification] = useState<string | null>(null);

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Live timer tick for deposit countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDepositRemainingSeconds = (expiresAt?: string): number => {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  };

  const formatCountdown = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

    // Status filter
    if (statusFilter === 'deposit_pending' && b.paymentStatus !== 'deposit_pending') return false;
    if (statusFilter === 'deposited' && (b.paymentStatus !== 'deposited' || b.checkInStatus !== 'not_checked_in')) return false;
    if (statusFilter === 'checked_in' && b.checkInStatus !== 'checked_in') return false;
    if (statusFilter === 'unpaid_remaining' && (b.remainingAmount === 0 || b.paymentStatus === 'cancelled')) return false;
    if (statusFilter === 'fully_paid' && (b.paymentStatus !== 'fully_paid' || b.checkInStatus !== 'checked_out')) return false;
    if (statusFilter === 'cancelled' && b.paymentStatus !== 'cancelled') return false;

    return true;
  });

  // Pagination calculation
  const totalItems = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastNotification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs">Thao tác thành công!</h4>
              <p className="text-xs font-medium mt-0.5">{toastNotification}</p>
            </div>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="p-1.5 hover:bg-black/5 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Danh Sách & Quản Lý Đặt Sân</h2>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
              Tích hợp UC01 & UC02
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Xác nhận cọc hộ (UC01 · A1), kiểm tra mã vé SportPass, thu tiền còn lại (UC02) và xem nhật ký audit log
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Mã đơn, Tên, SĐT, Sân..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 w-56 sm:w-64"
            />
          </div>

          {/* Sport Filter */}
          <div>
            <select
              value={sportFilter}
              onChange={(e) => {
                setSportFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">Tất cả môn thể thao</option>
              <option value="football">⚽ Bóng Đá (6 sân)</option>
              <option value="badminton">🏸 Cầu Lông (4 sân)</option>
              <option value="pickleball">🎾 Pickleball (4 sân)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="deposit_pending">⏳ Chờ thanh toán cọc</option>
              <option value="deposited">✓ Đã đặt cọc (Chờ nhận sân)</option>
              <option value="checked_in">🏃 Đang chơi (Chờ thanh toán nốt)</option>
              <option value="unpaid_remaining">💵 Còn tiền chưa thu tại quầy</option>
              <option value="fully_paid">🏁 Đã hoàn thành (Khóa hóa đơn)</option>
              <option value="cancelled">✕ Đã hủy đơn</option>
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
                <th className="p-3.5">Khách Hàng (SĐT chính)</th>
                <th className="p-3.5 text-right">Tổng Tiền</th>
                <th className="p-3.5 text-right">Tiền Đã Cọc</th>
                <th className="p-3.5 text-right">Tiền Còn Lại</th>
                <th className="p-3.5 text-center">Trạng Thái</th>
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
                paginatedBookings.map(b => {
                  const sportMeta = getSportDetails(b.sport);
                  const isDepositPending = b.paymentStatus === 'deposit_pending';
                  const remainingSec = getDepositRemainingSeconds(b.depositExpiresAt);

                  return (
                    <tr key={b.id} className={`hover:bg-slate-50/70 transition-colors ${isDepositPending ? 'bg-amber-50/30' : ''}`}>
                      {/* Code & Date */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 block">{b.id}</span>
                          {b.zaloNotification?.sent && (
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black" title="Đã gửi Zalo ZNS">
                              Z
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">{formatDateVN(b.date)}</span>
                        <span className="font-mono text-emerald-800 text-[11px] block">{b.startTime} - {b.endTime}</span>
                      </td>

                      {/* Court & Sport */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{b.courtName}</span>
                        <span className="text-[11px] text-slate-500">{sportMeta.label} ({b.durationHours}h)</span>
                      </td>

                      {/* Customer (Phone is Primary Identifier) */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-mono font-extrabold text-slate-900 text-xs">{b.customerPhone}</span>
                        </div>
                        <span className="text-slate-600 font-medium block text-[11px] mt-0.5">{b.customerName}</span>
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

                      {/* Deposit (UC01) */}
                      <td className="p-3.5 text-right font-mono">
                        {isDepositPending ? (
                          <div className="space-y-1">
                            <span className="text-amber-800 font-bold block text-[11px]">Chưa nộp cọc</span>
                            <span className="text-[10px] text-slate-500 block">Đề xuất 30%: {formatVND(b.depositAmount)}</span>
                            {/* UC01 A1: Quản lý sân xác nhận cọc hộ khách */}
                            <button
                              type="button"
                              onClick={() => setSelectedBookingForDeposit(b)}
                              className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold shadow-2xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                              title="Xác nhận đã nhận cọc tại quầy"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>Thu cọc tại quầy</span>
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="text-emerald-700 font-bold">{formatVND(b.depositAmount)}</div>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-normal">({b.depositRate}%)</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                b.paymentMethod === 'cash'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                              }`}>
                                {b.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Remaining (UC02) */}
                      <td className="p-3.5 text-right font-mono">
                        {b.remainingAmount > 0 && b.paymentStatus !== 'cancelled' ? (
                          <div className="font-bold text-amber-700 space-y-1">
                            <div>{formatVND(b.remainingAmount)}</div>
                            {/* UC-17: Thu tiền còn lại (Tất toán) & xuất Web Invoice */}
                            <button
                              type="button"
                              onClick={() => setSelectedBookingForCollect(b)}
                              className="inline-flex items-center gap-1 text-[10px] text-white bg-emerald-600 hover:bg-emerald-700 font-semibold px-2 py-0.5 rounded shadow-2xs cursor-pointer transition-colors"
                              title="Check-out & Thu tiền còn lại tại quầy"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Tất toán / Thu tiền</span>
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span className="text-slate-400 text-[11px] block">Đã đủ (0 ₫)</span>
                            {b.invoice && (
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceBooking(b)}
                                className="text-[10px] text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                                title="Xem Hóa Đơn Thanh Toán"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Hóa đơn: {b.invoice.invoiceId}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        {b.paymentStatus === 'cancelled' ? (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            Đã hủy
                          </span>
                        ) : isDepositPending ? (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                              <span>Chờ thanh toán cọc</span>
                            </span>
                            {b.depositExpiresAt && (
                              <div className="text-[10px] font-mono text-amber-700 font-bold flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatCountdown(remainingSec)}</span>
                              </div>
                            )}
                          </div>
                        ) : b.checkInStatus === 'checked_in' ? (
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            <span>Đang chơi</span>
                          </span>
                        ) : b.checkInStatus === 'checked_out' ? (
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                            Hoàn thành
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
                          {/* UC01 A1: Thu cọc hộ nếu pending */}
                          {isDepositPending && (
                            <button
                              onClick={() => setSelectedBookingForDeposit(b)}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                              title="Xác nhận thu cọc hộ khách"
                            >
                              Thu cọc
                            </button>
                          )}

                          {/* Check-in */}
                          {b.checkInStatus === 'not_checked_in' && b.paymentStatus !== 'cancelled' && !isDepositPending && (
                            <button
                              onClick={() => setSelectedBookingForCheckIn(b)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                              title="Check-in và nhận sân"
                            >
                              Check-in
                            </button>
                          )}

                          {/* UC-17: Check-out & Thu tiền còn lại (Tất toán) */}
                          {b.checkInStatus === 'checked_in' && (
                            <button
                              onClick={() => setSelectedBookingForCollect(b)}
                              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                              title="Check-out & Thu tiền còn lại tại quầy"
                            >
                              Check-out / Tất toán
                            </button>
                          )}

                          {/* Audit Log */}
                          <button
                            onClick={() => setSelectedBookingForAudit(b)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Xem lịch sử giao dịch & nhật ký thao tác"
                          >
                            <ShieldCheck className="w-4 h-4 text-slate-600" />
                          </button>

                          {/* Đổi Sân */}
                          {b.paymentStatus !== 'cancelled' && b.checkInStatus !== 'checked_out' && (
                            <button
                              onClick={() => setSelectedBookingForChange(b)}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[11px] font-bold transition-colors cursor-pointer"
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

        {/* Pagination Bar */}
        {filteredBookings.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            {/* Range counter & Page size */}
            <div className="flex items-center gap-3">
              <span>
                Hiển thị{' '}
                <strong className="font-mono text-slate-900 font-bold">
                  {(validCurrentPage - 1) * pageSize + 1}
                </strong>
                -
                <strong className="font-mono text-slate-900 font-bold">
                  {Math.min(validCurrentPage * pageSize, totalItems)}
                </strong>{' '}
                trong tổng số{' '}
                <strong className="font-mono text-slate-900 font-bold">
                  {totalItems}
                </strong>{' '}
                đơn đặt sân
              </span>

              <div className="flex items-center gap-1 text-slate-500">
                <span>·</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value={5}>5 đơn / trang</option>
                  <option value={10}>10 đơn / trang</option>
                  <option value={20}>20 đơn / trang</option>
                </select>
              </div>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4 text-slate-600" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              <span className="px-3 py-1 font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-xs">
                {validCurrentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Trang cuối"
              >
                <ChevronsRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* UC01 A1: Manager Confirm Deposit Modal */}
      {selectedBookingForDeposit && (
        <ManagerConfirmDepositModal
          booking={selectedBookingForDeposit}
          isOpen={true}
          onClose={() => setSelectedBookingForDeposit(null)}
          onSuccess={(updated) => {
            setToastNotification(`Đã xác nhận thu cọc thành công cho đơn ${updated.id}! Hệ thống đã gửi tin Zalo ZNS và ghi log BR-03.`);
            if (updated.zaloNotification) {
              setZaloNotificationData({
                recipientPhone: updated.customerPhone,
                bookingId: updated.id,
                courtName: updated.courtName,
                dateTime: `${formatDateVN(updated.date)} ${updated.startTime}-${updated.endTime}`,
                depositAmount: updated.depositAmount,
                remainingAmount: updated.remainingAmount,
                qrPassCode: updated.qrPassCode,
                paymentMethod: updated.paymentMethod === 'cash' ? 'Tiền mặt tại quầy' : 'Chuyển khoản ngoài'
              });
            }
          }}
        />
      )}

      {/* UC02: Collect Remaining Payment Modal */}
      {selectedBookingForCollect && (
        <CollectPaymentModal
          booking={selectedBookingForCollect}
          isOpen={true}
          onClose={() => setSelectedBookingForCollect(null)}
          onSuccess={(invoice) => {
            setToastNotification(`Hoàn tất thanh toán đơn ${invoice.bookingId}! Hóa đơn ${invoice.invoiceId} đã được ghi nhận và khóa vĩnh viễn (BR-03).`);
          }}
        />
      )}

      {/* Audit Logs Modal (BR-03) */}
      {selectedBookingForAudit && (
        <BookingAuditLogsModal
          booking={selectedBookingForAudit}
          isOpen={true}
          onClose={() => setSelectedBookingForAudit(null)}
        />
      )}

      {/* Check In Modal */}
      {selectedBookingForCheckIn && (
        <CheckInModal
          booking={selectedBookingForCheckIn}
          onClose={() => setSelectedBookingForCheckIn(null)}
          onSuccess={() => {
            setToastNotification(`Đã check-in thành công cho khách ${selectedBookingForCheckIn.customerName}!`);
          }}
        />
      )}

      {/* Change Court Modal */}
      {selectedBookingForChange && (
        <ChangeCourtModal
          booking={selectedBookingForChange}
          onClose={() => setSelectedBookingForChange(null)}
          onSuccess={() => {
            setToastNotification(`Đã cập nhật lịch sân cho đơn ${selectedBookingForChange.id}!`);
          }}
        />
      )}

      {/* Simulated Zalo ZNS Notification Popup */}
      {zaloNotificationData && (
        <ZaloNotificationModal
          isOpen={true}
          onClose={() => setZaloNotificationData(null)}
          {...zaloNotificationData}
        />
      )}

      {/* UC-17 Web Invoice Modal */}
      {selectedInvoiceBooking && selectedInvoiceBooking.invoice && (
        <WebInvoiceModal
          invoice={selectedInvoiceBooking.invoice}
          booking={selectedInvoiceBooking}
          isOpen={true}
          onClose={() => setSelectedInvoiceBooking(null)}
        />
      )}
    </div>
  );
};
