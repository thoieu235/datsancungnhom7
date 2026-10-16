import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import { QrCodeSvg } from '../common/QrCodeSvg';
import { CustomerPayDepositModal } from './CustomerPayDepositModal';
import { ZaloNotificationModal } from '../common/ZaloNotificationModal';
import { WebInvoiceModal } from '../common/WebInvoiceModal';
import {
  Calendar,
  Clock,
  DollarSign,
  Phone,
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  User,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  FileText
} from 'lucide-react';

export const MyBookingsHistory: React.FC = () => {
  const { bookings, customerPhone, setCustomerPhone, customerName, setCustomerName, settings, cancelDepositPending } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const [selectedPassBooking, setSelectedPassBooking] = useState<Booking | null>(null);
  const [selectedPayBooking, setSelectedPayBooking] = useState<Booking | null>(null);
  const [zaloNotificationData, setZaloNotificationData] = useState<any | null>(null);
  const [phoneInput, setPhoneInput] = useState(customerPhone);

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

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.trim()) {
      setCustomerPhone(phoneInput.trim());
      setCurrentPage(1);
    }
  };

  // Filter bookings for current customer phone
  const myBookings = bookings.filter(b => b.customerPhone === customerPhone);

  const filteredBookings = myBookings.filter(b => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return b.paymentStatus === 'deposit_pending';
    if (filterStatus === 'upcoming') return b.paymentStatus === 'deposited' && b.checkInStatus === 'not_checked_in';
    if (filterStatus === 'in_use') return b.checkInStatus === 'checked_in';
    if (filterStatus === 'completed') return b.checkInStatus === 'checked_out';
    if (filterStatus === 'cancelled') return b.paymentStatus === 'cancelled' || b.checkInStatus === 'cancelled';
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
      {/* Header & Phone Switcher Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Lịch Sử Đặt Sân Của Bạn</h2>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
              Tự thanh toán cọc UC01
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tình trạng đơn đặt, thanh toán cọc VietQR 24/7, số tiền còn lại và mã vé QR check-in
          </p>
        </div>

        {/* Customer Phone Search */}
        <form onSubmit={handlePhoneSearch} className="flex items-center gap-2">
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="Nhập SĐT để tra cứu..."
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 w-48 sm:w-56"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tra Cứu
          </button>
        </form>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Tổng lượt đặt</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{myBookings.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Chờ nộp cọc (10p)</span>
          <div className="text-xl font-bold font-mono text-amber-600 mt-1">
            {myBookings.filter(b => b.paymentStatus === 'deposit_pending').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Chờ nhận sân</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {myBookings.filter(b => b.checkInStatus === 'not_checked_in' && b.paymentStatus === 'deposited').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Cần trả tại quầy</span>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">
            {formatVND(myBookings.filter(b => b.checkInStatus !== 'checked_out' && b.paymentStatus !== 'cancelled').reduce((sum, b) => sum + b.remainingAmount, 0))}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `Tất cả (${myBookings.length})` },
          { id: 'pending', label: `Chờ cọc (${myBookings.filter(b => b.paymentStatus === 'deposit_pending').length})` },
          { id: 'upcoming', label: `Đã cọc / Chờ chơi (${myBookings.filter(b => b.checkInStatus === 'not_checked_in' && b.paymentStatus === 'deposited').length})` },
          { id: 'in_use', label: `Đang chơi (${myBookings.filter(b => b.checkInStatus === 'checked_in').length})` },
          { id: 'completed', label: `Hoàn tất (${myBookings.filter(b => b.checkInStatus === 'checked_out').length})` },
          { id: 'cancelled', label: `Đã hủy (${myBookings.filter(b => b.paymentStatus === 'cancelled').length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setFilterStatus(tab.id);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List Cards View */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Không tìm thấy lượt đặt sân nào</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Không có đơn nào khớp với số điện thoại <strong>{customerPhone}</strong> trong mục này.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedBookings.map((b) => {
              const sportMeta = getSportDetails(b.sport);
              const isDepositPending = b.paymentStatus === 'deposit_pending';
              const remainingSec = getDepositRemainingSeconds(b.depositExpiresAt);

              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl p-5 border shadow-xs transition-all flex flex-col justify-between ${
                    isDepositPending
                      ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/20'
                      : 'border-slate-200 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Tag & Status */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {b.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {sportMeta.label}
                        </span>
                      </div>

                      {/* Status badges */}
                      <div>
                        {b.paymentStatus === 'cancelled' ? (
                          <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            Đã hủy
                          </span>
                        ) : isDepositPending ? (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                            <span>Chờ cọc ({formatCountdown(remainingSec)})</span>
                          </span>
                        ) : b.checkInStatus === 'checked_in' ? (
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            Đang chơi trên sân
                          </span>
                        ) : b.checkInStatus === 'checked_out' ? (
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            Đã hoàn tất
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Đã cọc {b.depositRate}% · Chờ nhận sân
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Court & Time Information */}
                    <div className="py-3 space-y-1.5">
                      <h3 className="font-bold text-slate-900 text-base">{b.courtName}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateVN(b.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-emerald-800 font-bold">{b.startTime} - {b.endTime}</span>
                        <span className="text-slate-400">({b.durationHours} tiếng)</span>
                      </div>
                      {b.note && (
                        <div className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-2">
                          Ghi chú: {b.note}
                        </div>
                      )}
                    </div>

                    {/* Financial Breakdown */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs border border-slate-100">
                      <div className="flex justify-between text-slate-600">
                        <span>Tổng tiền thuê:</span>
                        <span className="font-mono font-bold text-slate-900">{formatVND(b.totalAmount)}</span>
                      </div>

                      {/* Deposit row */}
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>{isDepositPending ? 'Tiền cọc cần nộp (30%):' : `Đã đặt cọc (${b.depositRate}%):`}</span>
                        <div className="text-right">
                          <span className="font-mono font-bold">{formatVND(b.depositAmount)}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {isDepositPending ? 'Chưa thanh toán' : b.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                          </span>
                        </div>
                      </div>

                      {/* Remaining row */}
                      {b.checkInStatus !== 'checked_out' && b.paymentStatus !== 'cancelled' && (
                        <div className="flex justify-between text-amber-700 font-semibold border-t border-slate-200/60 pt-1">
                          <span>Số tiền còn lại thanh toán tại quầy:</span>
                          <div className="text-right">
                            <span className="font-mono font-bold">{formatVND(b.remainingAmount)}</span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              (Tiền mặt hoặc Chuyển khoản VietQR)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2 flex-wrap">
                    {/* UC01 Case 1: Button for pending deposit */}
                    {isDepositPending ? (
                      <div className="flex items-center gap-2 w-full justify-between">
                        <button
                          type="button"
                          onClick={() => setSelectedPayBooking(b)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Thanh Toán Cọc Ngay (VietQR)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Hủy giữ chỗ ca đặt sân này?')) {
                              cancelDepositPending(b.id, 'Khách hàng bấm hủy giữ chỗ');
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                        >
                          Hủy giữ chỗ
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedPassBooking(b)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Mã vé check-in</span>
                          </button>

                          {b.zaloNotification?.sent && (
                            <button
                              onClick={() => {
                                setZaloNotificationData({
                                  recipientPhone: b.customerPhone,
                                  bookingId: b.id,
                                  courtName: b.courtName,
                                  dateTime: `${formatDateVN(b.date)} ${b.startTime}-${b.endTime}`,
                                  depositAmount: b.depositAmount,
                                  remainingAmount: b.remainingAmount,
                                  qrPassCode: b.qrPassCode,
                                  paymentMethod: b.paymentMethod === 'cash' ? 'Tiền mặt tại quầy' : 'VietQR'
                                });
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              title="Xem tin nhắn Zalo ZNS đã nhận"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                              <span>Tin Zalo ZNS</span>
                            </button>
                          )}

                          {b.invoice && (
                            <button
                              onClick={() => setSelectedInvoiceBooking(b)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              title="Xem Hóa Đơn Thanh Toán"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Xem Hóa Đơn</span>
                            </button>
                          )}
                        </div>

                        <a
                          href={`tel:${settings.hotline}`}
                          className="flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-700 font-medium"
                          title="Liên hệ quản lý để đổi sân hoặc dời giờ"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đổi sân: {settings.hotline}</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Bar */}
          {filteredBookings.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
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
                  lượt đặt
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
                    <option value={2}>2 đơn / trang</option>
                    <option value={4}>4 đơn / trang</option>
                    <option value={8}>8 đơn / trang</option>
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
      )}

      {/* Customer Pay Deposit Modal (UC01 Case 1) */}
      {selectedPayBooking && (
        <CustomerPayDepositModal
          booking={selectedPayBooking}
          isOpen={true}
          onClose={() => setSelectedPayBooking(null)}
          onSuccess={(bId) => {
            const b = bookings.find(item => item.id === bId);
            if (b) {
              setZaloNotificationData({
                recipientPhone: b.customerPhone,
                bookingId: b.id,
                courtName: b.courtName,
                dateTime: `${formatDateVN(b.date)} ${b.startTime}-${b.endTime}`,
                depositAmount: b.depositAmount,
                remainingAmount: b.remainingAmount,
                qrPassCode: b.qrPassCode,
                paymentMethod: 'VietQR 24/7'
              });
            }
          }}
        />
      )}

      {/* QR Pass Modal */}
      {selectedPassBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-sm text-slate-900">Thẻ Check-in Điện Tử</span>
              <button
                onClick={() => setSelectedPassBooking(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl text-left text-xs space-y-1.5">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                {selectedPassBooking.id}
              </span>
              <h4 className="font-bold text-sm text-white">{selectedPassBooking.courtName}</h4>
              <div className="text-slate-300">
                {formatDateVN(selectedPassBooking.date)} · <strong className="text-emerald-300 font-mono">{selectedPassBooking.startTime} - {selectedPassBooking.endTime}</strong>
              </div>
              <div className="text-slate-400">
                Khách: {selectedPassBooking.customerName} ({selectedPassBooking.customerPhone})
              </div>
            </div>

            <div className="py-2 flex justify-center">
              <QrCodeSvg value={selectedPassBooking.qrPassCode} size={160} label={selectedPassBooking.qrPassCode} />
            </div>

            <div className="text-xs text-slate-500 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-left">
              <strong>Lưu ý:</strong> Xuất trình mã này cho lễ tân khi đến sân để check-in và thanh toán nốt số tiền còn lại{' '}
              <strong className="font-mono text-amber-900">{formatVND(selectedPassBooking.remainingAmount)}</strong>.
            </div>

            <button
              onClick={() => setSelectedPassBooking(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Simulated Zalo ZNS Notification Modal */}
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
