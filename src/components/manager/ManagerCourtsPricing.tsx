import React, { useState } from 'react';
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
  ChevronUp
} from 'lucide-react';

export const ManagerCourtsPricing: React.FC = () => {
  const { courts, updateCourt, bookings, settings, updateSettings } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  // Collapsible facility settings
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState(settings);

  // Filter courts
  const filteredCourts = courts.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.surface.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.courtTypeLabel && c.courtTypeLabel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;

    return true;
  });

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

      if (affected.length > 0) {
        setMaintenanceAlertData({
          court: { ...court, status: 'maintenance' },
          affectedBookings: affected
        });
      }
    } else {
      updateCourt(court.id, { status: 'active' });
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
    alert('Đã cập nhật cấu hình hoạt động & tài khoản ngân hàng thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Court Button */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Quản Lý Sân
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý thông tin, phân loại, giá thuê và tình trạng bảo trì của toàn bộ 14 sân
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
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sân, bề mặt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>

          {/* Sport / Court Type Filter */}
          <div>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">Tất cả loại sân (Bóng đá, Cầu lông, Pickleball)</option>
              <option value="football">⚽ Sân Bóng Đá ({courts.filter(c => c.sport === 'football').length} sân)</option>
              <option value="badminton">🏸 Sân Cầu Lông ({courts.filter(c => c.sport === 'badminton').length} sân)</option>
              <option value="pickleball">🎾 Sân Pickleball ({courts.filter(c => c.sport === 'pickleball').length} sân)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
                <th className="p-3.5">Tên Sân &amp; Phân Loại</th>
                <th className="p-3.5">Bộ Môn</th>
                <th className="p-3.5 text-right">Giá Giờ Thường</th>
                <th className="p-3.5 text-right">Giá Giờ Vàng (Peak)</th>
                <th className="p-3.5">Mặt Sân &amp; Chiếu Sáng</th>
                <th className="p-3.5 text-center">Trạng Thái</th>
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
                filteredCourts.map(court => {
                  const sportMeta = getSportDetails(court.sport);
                  return (
                    <tr key={court.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Image Thumbnail Column */}
                      <td className="p-3.5">
                        <div className="w-28 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                          <CourtVisualBadge court={court} height="h-16" />
                        </div>
                      </td>

                      {/* Name & Type */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{court.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {court.courtTypeLabel || court.surface} · Sân #{court.courtNumber}
                        </div>
                        {court.description && (
                          <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px] mt-0.5" title={court.description}>
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

                      {/* Status Toggle / Badge */}
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
                          {court.status === 'active' ? '🟢 Hoạt Động' : '🔴 Bảo Trì'}
                        </button>
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
      </div>

      {/* Add / Edit Court Modal */}
      <CourtFormModal
        court={selectedCourtForEdit}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCourtForEdit(null);
        }}
        onSuccess={(savedCourt, affected) => {
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
