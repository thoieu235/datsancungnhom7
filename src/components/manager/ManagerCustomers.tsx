import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerProfile, Booking } from '../../types';
import { formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import { ChangeCourtModal } from './ChangeCourtModal';
import { CheckInModal } from './CheckInModal';
import { CustomerDetailModal } from './CustomerDetailModal';
import {
  Search,
  Phone,
  Calendar,
  History,
  X,
  Eye,
  User,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Users
} from 'lucide-react';

export const ManagerCustomers: React.FC = () => {
  const { customers, bookings, cancelBooking, checkOutBooking } = useApp();

  // Search input state and applied search term
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Error simulation / error state handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected modals
  const [selectedDetailCustomer, setSelectedDetailCustomer] = useState<CustomerProfile | null>(null);
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState<CustomerProfile | null>(null);

  // Modals for booking actions from customer history
  const [selectedBookingForChange, setSelectedBookingForChange] = useState<Booking | null>(null);
  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<Booking | null>(null);

  // Phone copy feedback
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Search execution
  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setAppliedSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setErrorMessage(null);
    setCurrentPage(1);
  };

  // Filtered customers (Phone is primary, Name is secondary)
  const filteredCustomers = useMemo(() => {
    try {
      return customers.filter(c => {
        if (!appliedSearch) return true;

        const term = appliedSearch.toLowerCase();
        // Priority 1: Phone number match
        const matchesPhone = c.phone.includes(term);
        // Priority 2: Customer name match (secondary)
        const matchesName = c.name.toLowerCase().includes(term);
        // Priority 3: Email match
        const matchesEmail = c.email ? c.email.toLowerCase().includes(term) : false;

        return matchesPhone || matchesName || matchesEmail;
      });
    } catch {
      setErrorMessage('Đã xảy ra lỗi khi tìm kiếm và lọc danh sách khách hàng.');
      return [];
    }
  }, [customers, appliedSearch]);

  // Pagination calculation
  const totalItems = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredCustomers, validCurrentPage, pageSize]);

  // Customer bookings for selected history customer
  const historyBookings = useMemo(() => {
    if (!selectedHistoryCustomer) return [];
    return bookings.filter(b => b.customerPhone === selectedHistoryCustomer.phone);
  }, [selectedHistoryCustomer, bookings]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Quản Lý Khách Hàng
            </h2>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Định danh chính: Số điện thoại
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu hồ sơ theo SĐT (chính) và tên (phụ), xem lịch sử đặt sân và quản lý ca chơi.
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600">Tổng khách hàng:</span>
            <strong className="font-mono text-slate-900 font-bold">{customers.length}</strong>
          </div>
        </div>
      </div>

      {/* Search Bar & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleExecuteSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nhập số điện thoại hoặc họ tên khách hàng để tìm kiếm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Xóa ô nhập"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Explicit Search Button */}
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tìm kiếm</span>
          </button>

          {/* Reset Button */}
          {appliedSearch && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </form>

        {appliedSearch && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span>Kết quả tìm kiếm cho:</span>
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                "{appliedSearch}"
              </span>
            </div>
            <span>Tìm thấy {filteredCustomers.length} khách hàng</span>
          </div>
        )}
      </div>

      {/* Error Message Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-red-900">
                Thông Báo Lỗi
              </h4>
              <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Customers Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Content */}
        {filteredCustomers.length === 0 ? (
          /* Empty State Display */
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-bold text-sm text-slate-900">
                {appliedSearch
                  ? 'Không tìm thấy dữ liệu khách hàng phù hợp'
                  : 'Chưa có dữ liệu khách hàng nào'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {appliedSearch
                  ? `Không có khách hàng nào khớp với từ khóa "${appliedSearch}". Vui lòng thử tìm kiếm lại bằng số điện thoại khác hoặc đặt lại bộ lọc.`
                  : 'Hệ thống chưa ghi nhận thông tin khách hàng nào. Khách đặt sân sẽ tự động được thêm vào danh sách.'}
              </p>
            </div>

            {appliedSearch && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc tìm kiếm</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <th className="p-3.5 text-center w-16">STT</th>
                  <th className="p-3.5 min-w-[180px]">Họ tên</th>
                  <th className="p-3.5 min-w-[170px]">Số điện thoại</th>
                  <th className="p-3.5 text-center w-40">
                    Thao tác (Xem chi tiết)
                  </th>
                  <th className="p-3.5 text-center w-48">
                    Xem lịch sử đặt sân
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCustomers.map((cust, index) => {
                  const stt = (validCurrentPage - 1) * pageSize + index + 1;
                  const custBookingsCount = bookings.filter(b => b.customerPhone === cust.phone).length;

                  return (
                    <tr
                      key={cust.id || cust.phone}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* 1. STT */}
                      <td className="p-3.5 text-center font-mono font-bold text-slate-500">
                        {stt}
                      </td>

                      {/* 2. Họ tên (Secondary) */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                            {cust.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {cust.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {cust.email || 'Họ tên phụ · Chưa có email'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. Số điện thoại (Primary Identifier) */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-mono font-extrabold text-slate-900 text-xs">
                              {cust.phone}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyPhone(cust.phone, e)}
                              className="text-slate-400 hover:text-emerald-700 p-0.5 rounded cursor-pointer"
                              title="Sao chép số điện thoại"
                            >
                              {copiedPhone === cust.phone ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 4. Thao tác (Xem chi tiết) */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailCustomer(cust)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-2xs border border-slate-200"
                          title="Xem chi tiết hồ sơ khách hàng"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Xem chi tiết</span>
                        </button>
                      </td>

                      {/* 5. Xem lịch sử đặt sân */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedHistoryCustomer(cust)}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs"
                          title="Xem lịch sử tất cả các ca đặt sân"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Lịch sử đặt sân</span>
                          <span className="ml-1 bg-emerald-700/80 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                            {custBookingsCount}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Thanh Phân Trang (Pagination Controls) */}
        {filteredCustomers.length > 0 && (
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
                khách hàng
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
                  <option value={5}>5 dòng / trang</option>
                  <option value={10}>10 dòng / trang</option>
                  <option value={20}>20 dòng / trang</option>
                </select>
              </div>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4 text-slate-600" />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              {/* Page Number Pills */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                      validCurrentPage === pageNum
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              {/* Last Page */}
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

      {/* 1. MODAL: Customer Detail Profile ("Xem chi tiết") */}
      {selectedDetailCustomer && (
        <CustomerDetailModal
          customer={selectedDetailCustomer}
          isOpen={true}
          onClose={() => setSelectedDetailCustomer(null)}
          onViewHistory={(cust) => {
            setSelectedDetailCustomer(null);
            setSelectedHistoryCustomer(cust);
          }}
        />
      )}

      {/* 2. MODAL: Customer Booking History ("Xem lịch sử đặt sân") */}
      {selectedHistoryCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Lịch Sử Đặt Sân Của Khách Hàng
                  </h3>
                  <div className="text-xs text-slate-600 font-mono mt-0.5 flex items-center gap-2">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      SĐT: {selectedHistoryCustomer.phone}
                    </span>
                    <span className="text-slate-500 font-sans">
                      (Họ tên: {selectedHistoryCustomer.name})
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHistoryCustomer(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Summary Bar */}
            <div className="px-6 py-3 bg-slate-100/60 border-b border-slate-200 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Tổng lượt đặt:</span>
                <div className="font-bold font-mono text-slate-900 text-sm mt-0.5">
                  {historyBookings.length} lượt
                </div>
              </div>
              <div>
                <span className="text-slate-500">Tổng tiền tích lũy:</span>
                <div className="font-bold font-mono text-emerald-700 text-sm mt-0.5">
                  {formatVND(
                    historyBookings.reduce(
                      (sum, b) => sum + (b.paymentStatus !== 'cancelled' ? b.totalAmount : 0),
                      0
                    )
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Đơn chờ nhận sân:</span>
                <div className="font-bold font-mono text-amber-700 text-sm mt-0.5">
                  {
                    historyBookings.filter(
                      b => b.checkInStatus === 'not_checked_in' && b.paymentStatus !== 'cancelled'
                    ).length
                  }{' '}
                  đơn
                </div>
              </div>
            </div>

            {/* Bookings List Area */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Danh Sách Các Ca Đặt Sân ({historyBookings.length})
              </h4>

              {historyBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Khách hàng này chưa có đơn đặt sân nào trên hệ thống.
                </div>
              ) : (
                historyBookings.map(b => {
                  const sportMeta = getSportDetails(b.sport);
                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {b.id}
                          </span>
                          <span className="font-semibold text-slate-700">{b.courtName}</span>
                          <span className="text-slate-400">· {sportMeta.label}</span>
                        </div>

                        {/* Status badge */}
                        <div>
                          {b.paymentStatus === 'cancelled' ? (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              Đã hủy
                            </span>
                          ) : b.checkInStatus === 'checked_in' ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Đang chơi
                            </span>
                          ) : b.checkInStatus === 'checked_out' ? (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Đã hoàn tất
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Đã cọc {b.depositRate}% · Chờ nhận sân
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="flex flex-wrap items-center justify-between text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDateVN(b.date)}</span>
                          <span className="font-mono text-emerald-800 font-bold ml-1">
                            {b.startTime} - {b.endTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span>
                            Tổng: <strong className="font-mono text-slate-900">{formatVND(b.totalAmount)}</strong>
                          </span>
                          <span>
                            Đã cọc: <strong className="font-mono text-emerald-700">{formatVND(b.depositAmount)}</strong>
                          </span>
                          {b.remainingAmount > 0 && b.paymentStatus !== 'cancelled' && (
                            <span>
                              Còn lại: <strong className="font-mono text-amber-700">{formatVND(b.remainingAmount)}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {b.note && (
                        <div className="text-[11px] text-slate-500 italic">
                          Ghi chú: {b.note}
                        </div>
                      )}

                      {/* Direct manager actions on this customer's booking */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        {b.checkInStatus === 'not_checked_in' && b.paymentStatus !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => setSelectedBookingForCheckIn(b)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Check-in & Thu tiền
                          </button>
                        )}

                        {b.checkInStatus === 'checked_in' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Xác nhận hoàn tất ca thi đấu cho đơn ${b.id}?`)) {
                                checkOutBooking(b.id);
                              }
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Trả sân
                          </button>
                        )}

                        {b.paymentStatus !== 'cancelled' && b.checkInStatus !== 'checked_out' && (
                          <button
                            type="button"
                            onClick={() => setSelectedBookingForChange(b)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Đổi sân / Dời giờ
                          </button>
                        )}

                        {b.paymentStatus !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt(`Nhập lý do khách yêu cầu hủy đơn ${b.id}:`);
                              if (reason !== null) {
                                cancelBooking(b.id, reason);
                              }
                            }}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedHistoryCustomer(null);
                  setSelectedDetailCustomer(selectedHistoryCustomer);
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem hồ sơ chi tiết khách</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedHistoryCustomer(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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
