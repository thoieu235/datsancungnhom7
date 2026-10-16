import React, { useState } from 'react';
import { CustomerProfile, Booking } from '../../types';
import { formatVND, formatDateVN } from '../../utils/formatters';
import {
  User,
  Phone,
  Mail,
  Calendar,
  History,
  X,
  Copy,
  Check,
  Save,
  FileText,
  Clock,
  ShieldCheck,
  DollarSign,
  Lock,
  Unlock,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CustomerDetailModalProps {
  customer: CustomerProfile;
  isOpen: boolean;
  onClose: () => void;
  onViewHistory: (customer: CustomerProfile) => void;
}

const PRESET_LOCK_REASONS = [
  'Bùng sân không đến nhận & không báo trước',
  'Nợ tiền thanh toán dịch vụ / giờ chơi chưa hoàn tất',
  'Vi phạm nội quy an ninh, gây rối tại khu thể thao',
  'Gây hư hỏng thiết bị, cơ sở vật chất sân',
  'Khác (nhập lý do cụ thể bên dưới)...'
];

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onViewHistory
}) => {
  const { bookings, customers, updateCustomer, lockCustomer, unlockCustomer } = useApp();
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [notes, setNotes] = useState(customer.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Lock modal state
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [selectedReason, setSelectedReason] = useState(PRESET_LOCK_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  if (!isOpen) return null;

  // Always read latest state from context
  const currentCustomer = customers.find(c => c.phone === customer.phone || c.id === customer.id) || customer;

  // Bookings of this customer by phone identifier
  const customerBookings = bookings.filter(b => b.customerPhone === currentCustomer.phone);
  const pendingBookings = customerBookings.filter(
    b => b.checkInStatus === 'not_checked_in' && b.paymentStatus !== 'cancelled'
  ).length;
  const activePlayingBookings = customerBookings.filter(
    b => b.checkInStatus === 'checked_in'
  ).length;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(currentCustomer.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSaveNotes = () => {
    setIsSaving(true);
    updateCustomer(currentCustomer.phone, {
      notes: notes.trim()
    });
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 300);
  };

  const handleConfirmLock = () => {
    const finalReason = selectedReason.startsWith('Khác')
      ? (customReason.trim() || 'Chủ sân tạm khóa theo yêu cầu quản lý')
      : selectedReason;

    lockCustomer(currentCustomer.phone, finalReason);
    setShowLockConfirm(false);
    setActionFeedback({
      message: `Đã khóa khách hàng ${currentCustomer.name} (${currentCustomer.phone}) thành công!`,
      type: 'warning'
    });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleConfirmUnlock = () => {
    unlockCustomer(currentCustomer.phone);
    setActionFeedback({
      message: `Đã mở khóa tài khoản khách hàng ${currentCustomer.name} (${currentCustomer.phone}) thành công!`,
      type: 'success'
    });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-xs ${
              currentCustomer.isLocked ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {currentCustomer.isLocked ? <Lock className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Hồ Sơ Khách Hàng
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Định danh qua SĐT
                </span>
                {currentCustomer.isLocked ? (
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-rose-600" />
                    Đang bị khóa
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Hoạt động
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Thông tin chi tiết, trạng thái hoạt động & lịch sử ca chơi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div className={`px-6 py-3 border-b text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionFeedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Identifier Highlight Card */}
          <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Số điện thoại định danh chính
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xl font-mono font-extrabold text-slate-900 tracking-tight">
                    {currentCustomer.phone}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-1 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                    title="Sao chép số điện thoại"
                  >
                    {copiedPhone ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${currentCustomer.phone}`}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Gọi điện</span>
                </a>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-slate-500">Họ và tên (phụ):</span>
                <strong className="text-slate-900 font-semibold">{currentCustomer.name}</strong>
              </div>
              {currentCustomer.isVip && (
                <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200">
                  Khách VIP
                </span>
              )}
            </div>
          </div>

          {/* CHỨC NĂNG KHÓA / MỞ KHÓA KHÁCH HÀNG (DÀNH CHO CHỦ SÂN) */}
          <div className="rounded-2xl border transition-all overflow-hidden shadow-xs">
            {currentCustomer.isLocked ? (
              /* Trạng thái: ĐANG BỊ KHÓA */
              <div className="bg-linear-to-br from-rose-50 via-rose-50/80 to-red-100/50 border-2 border-rose-300 p-4.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-rose-900 bg-rose-200/70 px-2.5 py-0.5 rounded-full border border-rose-300">
                          Tài Khoản Đang Bị Khóa
                        </span>
                        {currentCustomer.lockedAt && (
                          <span className="text-[11px] text-rose-700 font-medium">
                            Đã khóa lúc: {formatDateVN(currentCustomer.lockedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-rose-950 font-medium pt-0.5">
                        <span className="font-bold text-rose-900">Lý do khóa: </span>
                        <span className="bg-white/80 border border-rose-300 px-2 py-0.5 rounded font-semibold text-rose-900">
                          {currentCustomer.lockedReason || 'Chủ sân tạm khóa'}
                        </span>
                      </p>
                      <p className="text-[11px] text-rose-700">
                        Khách hàng này hiện không thể tạo mới lịch đặt sân trên hệ thống.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmUnlock}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Mở Khóa Khách</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Trạng thái: HOẠT ĐỘNG BÌNH THƯỜNG */
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Quyền đặt sân:</span>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Đang hoạt động bình thường
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Khách hàng được phép đặt sân online, nhận vé QR và sử dụng dịch vụ sân.
                      </p>
                    </div>
                  </div>

                  {!showLockConfirm && (
                    <button
                      type="button"
                      onClick={() => setShowLockConfirm(true)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      <span>Khóa Khách Này</span>
                    </button>
                  )}
                </div>

                {/* Khối Nhập Lý Do Khóa Khách Hàng */}
                {showLockConfirm && (
                  <div className="mt-3 pt-3 border-t border-slate-200 bg-white p-4 rounded-xl border space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Xác nhận khóa khách hàng: {currentCustomer.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLockConfirm(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Chọn lý do khóa tài khoản:
                      </label>
                      <div className="space-y-1.5">
                        {PRESET_LOCK_REASONS.map(reason => (
                          <label
                            key={reason}
                            className={`flex items-start gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                              selectedReason === reason
                                ? 'bg-rose-50/70 border-rose-300 text-rose-950 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="radio"
                              name="lockReason"
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
                          Nhập lý do cụ thể:
                        </label>
                        <input
                          type="text"
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          placeholder="Ví dụ: Nợ tiền nước ngọt 150k chưa trả, gây mất trật tự ca tối qua..."
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowLockConfirm(false)}
                        className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 font-medium cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmLock}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Xác Nhận Khóa Khách</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Tổng lượt đặt</span>
              <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                {customerBookings.length} lượt
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Tổng tiền tích lũy</span>
              <span className="text-lg font-bold font-mono text-emerald-700 mt-0.5 block">
                {formatVND(currentCustomer.totalSpent)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Chờ nhận / Đang đá</span>
              <span className="text-lg font-bold font-mono text-amber-700 mt-0.5 block">
                {pendingBookings + activePlayingBookings} đơn
              </span>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-4 text-xs">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Thông tin định danh & liên hệ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-500 block mb-0.5">Số điện thoại (Chính):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {currentCustomer.phone}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Họ và tên (Phụ):</span>
                <span className="font-medium text-slate-900">
                  {currentCustomer.name}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Email liên hệ:</span>
                <span className="font-mono text-slate-700">
                  {currentCustomer.email || 'Chưa cập nhật'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Ngày tạo hồ sơ:</span>
                <span className="text-slate-700">
                  {formatDateVN(currentCustomer.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Owner Care Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Ghi chú chăm sóc khách hàng của chủ sân</span>
              </label>
              {saveSuccess && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  Đã lưu ghi chú thành công!
                </span>
              )}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Nhập đặc điểm, thói quen đặt sân, yêu cầu riêng của khách..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu ghi chú'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewHistory(currentCustomer);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <History className="w-4 h-4" />
            <span>Xem lịch sử đặt sân ({customerBookings.length})</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
