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
  Users,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const PRESET_LOCK_REASONS = [
  'Bùng sân không đến nhận & không báo trước',
  'Nợ tiền thanh toán dịch vụ / giờ chơi chưa hoàn tất',
  'Vi phạm nội quy an ninh, gây rối tại khu thể thao',
  'Gây hư hỏng thiết bị, cơ sở vật chất sân',
  'Khác (nhập lý do cụ thể bên dưới)...'
];

export const ManagerCustomers: React.FC = () => {
  const { customers, bookings, cancelBooking, checkOutBooking, lockCustomer, unlockCustomer } = useApp();

  // Search input state and applied search term
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Status Filter: all | active | locked
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Error simulation / error state handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected modals
  const [selectedDetailCustomer, setSelectedDetailCustomer] = useState<CustomerProfile | null>(null);
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState<CustomerProfile | null>(null);

  // Quick lock / unlock modals from table
  const [customerToLock, setCustomerToLock] = useState<CustomerProfile | null>(null);
  const [customerToUnlock, setCustomerToUnlock] = useState<CustomerProfile | null>(null);
  const [selectedReason, setSelectedReason] = useState(PRESET_LOCK_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  // Toast feedback
  const [toastFeedback, setToastFeedback] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

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
    setStatusFilter('all');
    setErrorMessage(null);
    setCurrentPage(1);
  };

  // Counts
  const activeCount = useMemo(() => customers.filter(c => !c.isLocked).length, [customers]);
  const lockedCount = useMemo(() => customers.filter(c => !!c.isLocked).length, [customers]);

  // Filtered customers (Status + Phone primary, Name secondary)
  const filteredCustomers = useMemo(() => {
    try {
      return customers.filter(c => {
        // Status filter
        if (statusFilter === 'active' && c.isLocked) return false;
        if (statusFilter === 'locked' && !c.isLocked) return false;

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
  }, [customers, appliedSearch, statusFilter]);

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

  // Handle Lock Confirm from Table
  const handleConfirmLock = () => {
    if (!customerToLock) return;
    const finalReason = selectedReason.startsWith('Khác')
      ? (customReason.trim() || 'Chủ sân tạm khóa theo yêu cầu quản lý')
      : selectedReason;

    lockCustomer(customerToLock.phone, finalReason);
    const lockedName = customerToLock.name;
    const lockedPhone = customerToLock.phone;
    setCustomerToLock(null);
    setCustomReason('');
    setSelectedReason(PRESET_LOCK_REASONS[0]);

    setToastFeedback({
      message: `Đã khóa khách hàng ${lockedName} (${lockedPhone}) thành công!`,
      type: 'warning'
    });
    setTimeout(() => setToastFeedback(null), 4000);
  };

  // Handle Unlock Confirm from Table
  const handleConfirmUnlock = () => {
    if (!customerToUnlock) return;
    const unlockedName = customerToUnlock.name;
    const unlockedPhone = customerToUnlock.phone;
    unlockCustomer(customerToUnlock.phone);
    setCustomerToUnlock(null);

    setToastFeedback({
      message: `Đã mở khóa tài khoản khách hàng ${unlockedName} (${unlockedPhone}) thành công!`,
      type: 'success'
    });
    setTimeout(() => setToastFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastFeedback && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top-2 ${
          toastFeedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
            : 'bg-rose-50 text-rose-900 border-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {toastFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{toastFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastFeedback(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            Tra cứu hồ sơ khách, khóa / mở khóa đặt sân trực tiếp và theo dõi lịch sử ca chơi.
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600">Tổng:</span>
            <strong className="font-mono text-slate-900 font-bold">{customers.length}</strong>
          </div>

          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-800 font-medium">Hoạt động:</span>
            <strong className="font-mono text-emerald-950 font-bold">{activeCount}</strong>
          </div>

          <div className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border ${
            lockedCount > 0
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <Lock className={`w-4 h-4 ${lockedCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
            <span className="font-medium">Đang bị khóa:</span>
            <strong className="font-mono font-bold">{lockedCount}</strong>
          </div>
        </div>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-600 mr-1">Lọc theo trạng thái:</span>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Tất cả ({customers.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter('active');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Đang hoạt động ({activeCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter('locked');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'locked'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Đang bị khóa ({lockedCount})</span>
          </button>
        </div>

        {/* Search Form */}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Xóa ô nhập"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tìm kiếm</span>
          </button>

          {/* Reset Button */}
          {(appliedSearch || statusFilter !== 'all') && (
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
                {appliedSearch || statusFilter !== 'all'
                  ? 'Không tìm thấy dữ liệu khách hàng phù hợp'
                  : 'Chưa có dữ liệu khách hàng nào'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {appliedSearch
                  ? `Không có khách hàng nào khớp với tiêu chí tìm kiếm. Vui lòng thử tìm kiếm lại bằng số điện thoại khác hoặc đặt lại bộ lọc.`
                  : 'Hệ thống chưa ghi nhận thông tin khách hàng nào. Khách đặt sân sẽ tự động được thêm vào danh sách.'}
              </p>
            </div>

            {(appliedSearch || statusFilter !== 'all') && (
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
                  <th className="p-3.5 text-center w-14">STT</th>
                  <th className="p-3.5 min-w-[170px]">Họ tên</th>
                  <th className="p-3.5 min-w-[160px]">Số điện thoại</th>
                  <th className="p-3.5 min-w-[160px]">Trạng thái</th>
                  <th className="p-3.5 text-center w-36">
                    Khóa / Mở khóa
                  </th>
                  <th className="p-3.5 text-center w-32">
                    Chi tiết
                  </th>
                  <th className="p-3.5 text-center w-40">
                    Lịch sử đặt sân
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
                      className={`hover:bg-slate-50/70 transition-colors ${
                        cust.isLocked ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* 1. STT */}
                      <td className="p-3.5 text-center font-mono font-bold text-slate-500">
                        {stt}
                      </td>

                      {/* 2. Họ tên */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                            cust.isLocked
                              ? 'bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {cust.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{cust.name}</span>
                              {cust.isVip && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-200">
                                  VIP
                                </span>
                              )}
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

                      {/* 4. Trạng thái (Hoạt động / Đang bị khóa) */}
                      <td className="p-3.5">
                        {cust.isLocked ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-full font-bold text-[11px]">
                              <Lock className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>Đang bị khóa</span>
                            </span>
                            {cust.lockedReason && (
                              <p className="text-[10px] text-rose-600 font-medium truncate max-w-[180px]" title={cust.lockedReason}>
                                Lý do: {cust.lockedReason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Hoạt động</span>
                          </span>
                        )}
                      </td>

                      {/* 5. Khóa / Mở khóa (Thao tác nhanh cho chủ sân) */}
                      <td className="p-3.5 text-center">
                        {cust.isLocked ? (
                          <button
                            type="button"
                            onClick={() => setCustomerToUnlock(cust)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs"
                            title="Mở khóa tài khoản khách này"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Mở khóa</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomerToLock(cust);
                              setSelectedReason(PRESET_LOCK_REASONS[0]);
                              setCustomReason('');
                            }}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                            title="Khóa đặt sân đối với khách này"
                          >
                            <Lock className="w-3.5 h-3.5 text-rose-600" />
                            <span>Khóa</span>
                          </button>
                        )}
                      </td>

                      {/* 6. Chi tiết */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailCustomer(cust)}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-2xs border border-slate-200"
                          title="Xem chi tiết hồ sơ khách hàng"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Chi tiết</span>
                        </button>
                      </td>

                      {/* 7. Lịch sử đặt sân */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedHistoryCustomer(cust)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                          title="Xem lịch sử tất cả các ca đặt sân"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Lịch sử ({custBookingsCount})</span>
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
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      validCurrentPage === pageNum
                        ? 'bg-emerald-600 text-white shadow-2xs font-bold'
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
                title="Trang kế tiếp"
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

      {/* QUICK LOCK MODAL FROM TABLE */}
      {customerToLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 bg-rose-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Khóa Khách Hàng
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Chặn quyền tự đặt sân mới trên hệ thống
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomerToLock(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Target Customer Info */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Khách hàng:</span>
                  <strong className="text-slate-900 font-bold">{customerToLock.name}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-mono font-bold text-emerald-800">{customerToLock.phone}</span>
                </div>
              </div>

              {/* Reasons Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Chọn lý do khóa tài khoản:
                </label>
                <div className="space-y-1.5">
                  {PRESET_LOCK_REASONS.map(reason => (
                    <label
                      key={reason}
                      className={`flex items-start gap-2 p-2.5 rounded-xl text-xs cursor-pointer border transition-colors ${
                        selectedReason === reason
                          ? 'bg-rose-50 border-rose-300 text-rose-950 font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tableLockReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedReason.startsWith('Khác') && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Nhập chi tiết lý do:
                  </label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Ví dụ: Nợ tiền nước ngọt, gây mất trật tự..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCustomerToLock(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmLock}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Xác nhận khóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK UNLOCK MODAL FROM TABLE */}
      {customerToUnlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 bg-emerald-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Mở Khóa Khách Hàng
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Khôi phục quyền đặt sân online cho khách
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomerToUnlock(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Khách hàng:</span>
                  <strong className="text-slate-900 font-bold">{customerToUnlock.name}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-mono font-bold text-emerald-800">{customerToUnlock.phone}</span>
                </div>
                {customerToUnlock.lockedReason && (
                  <div className="pt-1 border-t border-slate-200 mt-1">
                    <span className="text-slate-500 block">Lý do đã khóa trước đó:</span>
                    <span className="font-semibold text-rose-800">{customerToUnlock.lockedReason}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600">
                Sau khi mở khóa, khách hàng sẽ có thể tự do đặt sân online, nhận mã QR vé và tham gia các hoạt động tại cụm sân như bình thường.
              </p>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCustomerToUnlock(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmUnlock}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Xác nhận mở khóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedDetailCustomer && (
        <CustomerDetailModal
          customer={selectedDetailCustomer}
          isOpen={true}
          onClose={() => setSelectedDetailCustomer(null)}
          onViewHistory={(c) => {
            setSelectedDetailCustomer(null);
            setSelectedHistoryCustomer(c);
          }}
        />
      )}

      {/* Customer Booking History Full Slide-over / Modal */}
      {selectedHistoryCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Lịch Sử Đặt Sân: {selectedHistoryCustomer.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      SĐT: {selectedHistoryCustomer.phone}
                    </span>
                    <span>·</span>
                    <span>{historyBookings.length} lượt đặt</span>
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

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-3">
              {historyBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Khách hàng chưa có lượt đặt sân nào.</p>
                </div>
              ) : (
                historyBookings.map((b) => {
                  const sportInfo = getSportDetails(b.sport);
                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2.5 text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {b.id}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {b.courtName}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          b.checkInStatus === 'checked_out'
                            ? 'bg-slate-100 text-slate-700'
                            : b.checkInStatus === 'checked_in'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.paymentStatus === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.checkInStatus === 'checked_out'
                            ? 'Đã trả sân'
                            : b.checkInStatus === 'checked_in'
                            ? 'Đang đá'
                            : b.paymentStatus === 'cancelled'
                            ? 'Đã hủy'
                            : 'Chờ nhận sân'}
                        </span>
                      </div>

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
                            Check-in nhận sân
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
