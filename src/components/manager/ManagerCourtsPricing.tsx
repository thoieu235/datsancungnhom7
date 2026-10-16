import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Court, SportType, Booking } from '../../types';
import { formatVND, getSportDetails } from '../../utils/formatters';
import { CourtVisualBadge } from '../common/CourtVisualBadge';
import { CourtFormModal } from './CourtFormModal';
import { MaintenanceAlertModal } from './MaintenanceAlertModal';
import { ChangeCourtModal } from './ChangeCourtModal';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Settings,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export const ManagerCourtsPricing: React.FC = () => {
  const { courts, updateCourt, bookings, settings, updateSettings } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal State for Add / Edit Court
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCourtForEdit, setSelectedCourtForEdit] = useState<Court | null>(null);

  // Maintenance Alert State
  const [maintenanceAlertData, setMaintenanceAlertData] = useState<{
    court: Court;
    affectedBookings: Booking[];
  } | null>(null);

  // Change Court Modal State (when rescheduling from alert)
  const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);

  // Toast Notification State (Success / Error)
  const [toastNotification, setToastNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Collapsible facility settings
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState(settings);

  // Filter courts
  const filteredCourts = courts.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.courtCode && c.courtCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.surface.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.courtTypeLabel && c.courtTypeLabel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;

    return true;
  });

  // Pagination calculation
  const totalItems = filteredCourts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedCourts = filteredCourts.slice(startIndex, startIndex + pageSize);

  const activeCount = courts.filter(c => c.status === 'active').length;
  const maintenanceCount = courts.filter(c => c.status === 'maintenance').length;

  // Handler for direct status toggle
  const handleToggleCourtStatus = (court: Court) => {
    const newStatus = court.status === 'active' ? 'maintenance' : 'active';

    if (newStatus === 'maintenance') {
      // Find affected bookings
      const affected = bookings.filter(
        b => b.courtId === court.id &&
             b.checkInStatus !== 'checked_out' &&
             b.checkInStatus !== 'cancelled' &&
             b.paymentStatus !== 'cancelled'
      );

      updateCourt(court.id, { status: 'maintenance' });
      setToastNotification({
        type: 'success',
        message: `Đã chuyển sân "${court.name}" sang trạng thái Đang Bảo Trì!`
      });

      if (affected.length > 0) {
        setMaintenanceAlertData({
          court: { ...court, status: 'maintenance' },
          affectedBookings: affected
        });
      }
    } else {
      updateCourt(court.id, { status: 'active' });
      setToastNotification({
        type: 'success',
        message: `Đã kích hoạt sân "${court.name}" hoạt động trở lại!`
      });
    }
  };

  const handleOpenAddModal = () => {
    setSelectedCourtForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (court: Court) => {
    setSelectedCourtForEdit(court);
    setIsFormModalOpen(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsFormData);
    setToastNotification({
      type: 'success',
      message: 'Đã cập nhật cấu hình hoạt động & tài khoản nhận cọc VietQR thành công!'
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastNotification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border shadow-xs transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {toastNotification.type === 'success' ? (
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-xs">
                {toastNotification.type === 'success' ? 'Thành Công!' : 'Thông Báo Lỗi!'}
              </h4>
              <p className="text-xs mt-0.5 font-medium">{toastNotification.message}</p>
            </div>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="p-1.5 hover:bg-black/5 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Title and Add Court Button */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Quản Lý Sân
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý thông tin, bộ môn, mã sân, giá thuê và tình trạng bảo trì của toàn bộ 14 sân
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Giờ mở cửa &amp; VietQR</span>
            {showSettingsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* User Request: Button Thêm Mới Sân */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sân Mới</span>
          </button>
        </div>
      </div>

      {/* Facility Settings Drawer (Optional Collapsible) */}
      {showSettingsDrawer && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs animate-in fade-in duration-150">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-bold text-slate-900">Cấu Hình Hoạt Động &amp; Nhận Tiền Cọc</span>
            <span className="text-slate-400">Thiết lập chung toàn cụm sân</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Giờ mở cửa:</label>
              <input
                type="time"
                value={settingsFormData.openTime}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, openTime: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Giờ đóng cửa:</label>
              <input
                type="time"
                value={settingsFormData.closeTime}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, closeTime: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Hotline đổi sân:</label>
              <input
                type="text"
                value={settingsFormData.hotline}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, hotline: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">% Cọc trực tuyến mặc định:</label>
              <input
                type="number"
                value={settingsFormData.defaultDepositRate}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, defaultDepositRate: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-1.5 border rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Ngân hàng:</label>
              <input
                type="text"
                value={settingsFormData.bankName}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, bankName: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Số tài khoản:</label>
              <input
                type="text"
                value={settingsFormData.bankAccount}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, bankAccount: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Chủ tài khoản:</label>
              <input
                type="text"
                value={settingsFormData.bankAccountName}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, bankAccountName: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
            >
              Lưu Cấu Hình
            </button>
          </div>
        </form>
      )}

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Tìm kiếm sân:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên sân, mã sân (FB-01...), bề mặt..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
            </div>
          </div>

          {/* User Request: Bộ lọc đổi tên phần phân loại thành bộ môn */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Bộ môn:</span>
              <span className="text-[10px] font-normal text-slate-400">Lọc theo môn thể thao</span>
            </label>
            <select
              value={sportFilter}
              onChange={(e) => {
                setSportFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">Tất cả bộ môn (Bóng đá, Cầu lông, Pickleball)</option>
              <option value="football">⚽ Bộ môn Bóng Đá ({courts.filter(c => c.sport === 'football').length} sân)</option>
              <option value="badminton">🏸 Bộ môn Cầu Lông ({courts.filter(c => c.sport === 'badminton').length} sân)</option>
              <option value="pickleball">🎾 Bộ môn Pickleball ({courts.filter(c => c.sport === 'pickleball').length} sân)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Trạng thái:</span>
              <span className="text-[10px] font-normal text-slate-400">Hoạt động / Bảo trì</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">🟢 Đang hoạt động ({activeCount} sân)</option>
              <option value="maintenance">🔴 Đang bảo trì ({maintenanceCount} sân)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Hiển thị <strong>{filteredCourts.length}</strong> / <strong>{courts.length}</strong> sân
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{activeCount} sân hoạt động</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>{maintenanceCount} sân bảo trì</span>
            </span>
          </div>
        </div>
      </div>

      {/* Courts Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-32">Hình Ảnh Sân</th>
                <th className="p-3.5">Mã Sân &amp; Tên Sân</th>
                <th className="p-3.5">Bộ Môn</th>
                <th className="p-3.5 text-right">Giá Giờ Thường</th>
                <th className="p-3.5 text-right">Giá Giờ Vàng (Peak)</th>
                <th className="p-3.5">Mặt Sân &amp; Chiếu Sáng</th>
                <th className="p-3.5 text-center">Trạng Thái &amp; Bảo Trì</th>
                <th className="p-3.5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCourts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Không tìm thấy sân nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                paginatedCourts.map(court => {
                  const sportMeta = getSportDetails(court.sport);
                  return (
                    <tr key={court.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Image Thumbnail Column */}
                      <td className="p-3.5">
                        <div className="w-28 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                          <CourtVisualBadge court={court} height="h-16" />
                        </div>
                      </td>

                      {/* Mã Sân & Tên Sân */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-900 text-white shadow-2xs">
                            {court.courtCode || `SÂN-${court.courtNumber}`}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{court.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {court.courtTypeLabel || court.surface}
                        </div>
                        {court.description && (
                          <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[220px] mt-0.5" title={court.description}>
                            {court.description}
                          </div>
                        )}
                      </td>

                      {/* Sport Badge */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${sportMeta.bgLight}`}>
                          {sportMeta.label}
                        </span>
                      </td>

                      {/* Standard Price */}
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        {formatVND(court.pricePerHour)}/h
                      </td>

                      {/* Peak Price */}
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                        {formatVND(court.peakPricePerHour)}/h
                      </td>

                      {/* Surface & Lighting */}
                      <td className="p-3.5 text-[11px]">
                        <div className="text-slate-800 font-medium">{court.surface}</div>
                        <div className="text-slate-400 text-[10px] mt-0.5">{court.lighting}</div>
                      </td>

                      {/* Status Toggle / Badge with Maintenance Period */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleCourtStatus(court)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors border ${
                            court.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                          }`}
                          title="Bấm để chuyển trạng thái sân"
                        >
                          {court.status === 'active' ? '🟢 Hoạt Động' : '🔴 Đang Bảo Trì'}
                        </button>

                        {/* Display Maintenance Period & Reason if present */}
                        {court.status === 'maintenance' && (court.maintenanceStart || court.maintenanceEnd || court.maintenanceReason) && (
                          <div className="mt-1.5 p-1.5 bg-red-50/90 rounded-lg border border-red-200 text-[10px] text-red-900 text-left max-w-[150px] mx-auto leading-tight space-y-0.5">
                            {(court.maintenanceStart || court.maintenanceEnd) && (
                              <>
                                <span className="font-bold block text-red-950 text-[9px]">Khoảng thời gian:</span>
                                <span className="font-mono block text-[9px]">{court.maintenanceStart ? court.maintenanceStart.replace('T', ' ') : '...'}</span>
                                <span className="text-slate-400 block text-[8px] text-center leading-none">đến</span>
                                <span className="font-mono block text-[9px]">{court.maintenanceEnd ? court.maintenanceEnd.replace('T', ' ') : '...'}</span>
                              </>
                            )}
                            {court.maintenanceReason && (
                              <span className="block text-slate-600 italic text-[9px] pt-0.5 truncate" title={court.maintenanceReason}>
                                Lý do: {court.maintenanceReason}
                              </span>
                            )}
                          </div>
                        )}

                        {court.status === 'active' && court.maintenanceStart && (
                          <div className="mt-1 text-[9px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 truncate max-w-[130px] mx-auto" title={`Bảo trì dự kiến từ: ${court.maintenanceStart.replace('T', ' ')}`}>
                            ⏳ Lịch: {court.maintenanceStart.split('T')[0]}
                          </div>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(court)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          title="Chỉnh sửa thông tin sân"
                        >
                          <Edit className="w-3.5 h-3.5 text-slate-600" />
                          <span>Sửa</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredCourts.length > 0 && (
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
                sân
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
                  <option value={5}>5 sân / trang</option>
                  <option value={10}>10 sân / trang</option>
                  <option value={15}>15 sân / trang</option>
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

      {/* Add / Edit Court Modal */}
      <CourtFormModal
        court={selectedCourtForEdit}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCourtForEdit(null);
        }}
        onSuccess={(savedCourt, affected, isNew) => {
          if (isNew) {
            setToastNotification({
              type: 'success',
              message: `Thêm sân mới "${savedCourt.name}" thành công!`
            });
          } else {
            setToastNotification({
              type: 'success',
              message: `Cập nhật thông tin sân "${savedCourt.name}" thành công!`
            });
          }

          if (affected && affected.length > 0) {
            setMaintenanceAlertData({
              court: savedCourt,
              affectedBookings: affected
            });
          }
        }}
      />

      {/* Maintenance Alert Modal */}
      {maintenanceAlertData && (
        <MaintenanceAlertModal
          court={maintenanceAlertData.court}
          affectedBookings={maintenanceAlertData.affectedBookings}
          onClose={() => setMaintenanceAlertData(null)}
          onInitiateChangeCourt={(b) => {
            setMaintenanceAlertData(null);
            setBookingToReschedule(b);
          }}
        />
      )}

      {/* Reschedule Court Modal */}
      {bookingToReschedule && (
        <ChangeCourtModal
          booking={bookingToReschedule}
          onClose={() => setBookingToReschedule(null)}
          onSuccess={() => setBookingToReschedule(null)}
        />
      )}
    </div>
  );
};
