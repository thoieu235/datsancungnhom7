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
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CustomerDetailModalProps {
  customer: CustomerProfile;
  isOpen: boolean;
  onClose: () => void;
  onViewHistory: (customer: CustomerProfile) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onViewHistory
}) => {
  const { bookings, updateCustomer } = useApp();
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [notes, setNotes] = useState(customer.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  // Bookings of this customer by phone identifier
  const customerBookings = bookings.filter(b => b.customerPhone === customer.phone);
  const pendingBookings = customerBookings.filter(
    b => b.checkInStatus === 'not_checked_in' && b.paymentStatus !== 'cancelled'
  ).length;
  const activePlayingBookings = customerBookings.filter(
    b => b.checkInStatus === 'checked_in'
  ).length;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(customer.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSaveNotes = () => {
    setIsSaving(true);
    updateCustomer(customer.phone, {
      notes: notes.trim()
    });
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Hồ Sơ Khách Hàng
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Định danh qua SĐT
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Thông tin chi tiết, liên hệ & dữ liệu tích lũy
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
                    {customer.phone}
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
                  href={`tel:${customer.phone}`}
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
                <strong className="text-slate-900 font-semibold">{customer.name}</strong>
              </div>
            </div>
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
                {formatVND(customer.totalSpent)}
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
                  {customer.phone}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Họ và tên (Phụ):</span>
                <span className="font-medium text-slate-900">
                  {customer.name}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Email liên hệ:</span>
                <span className="font-mono text-slate-700">
                  {customer.email || 'Chưa cập nhật'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Ngày tạo hồ sơ:</span>
                <span className="text-slate-700">
                  {formatDateVN(customer.createdAt)}
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
              onViewHistory(customer);
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
