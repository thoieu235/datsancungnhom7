import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerProfile } from '../../types';
import {
  X,
  UserPlus,
  Phone,
  User,
  Mail,
  FileText,
  Star,
  Lock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: CustomerProfile) => void;
}

const PRESET_LOCK_REASONS = [
  'Bùng sân không đến nhận & không báo trước',
  'Nợ tiền thanh toán dịch vụ / giờ chơi chưa hoàn tất',
  'Vi phạm nội quy an ninh, gây rối tại khu thể thao',
  'Gây hư hỏng thiết bị, cơ sở vật chất sân',
  'Lý do khác (nhập cụ thể)...'
];

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { customers, addCustomer } = useApp();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedReason, setLockedReason] = useState(PRESET_LOCK_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time duplicate phone check
  const trimmedPhone = phone.trim();
  const existingCustomer = customers.find(c => c.phone.trim() === trimmedPhone);
  const isDuplicatePhone = Boolean(trimmedPhone && existingCustomer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!trimmedPhone) {
      setErrorMessage('Vui lòng nhập số điện thoại định danh của khách hàng.');
      return;
    }

    // Basic VN phone format check: 10 digits starting with 0
    const phoneClean = trimmedPhone.replace(/\s+/g, '');
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phoneClean)) {
      setErrorMessage('Số điện thoại không hợp lệ (cần đủ 10 số và bắt đầu bằng số 0, ví dụ: 0912345678).');
      return;
    }

    if (isDuplicatePhone) {
      setErrorMessage(`Số điện thoại ${trimmedPhone} đã tồn tại trong danh sách (thuộc khách: ${existingCustomer?.name}).`);
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên khách hàng.');
      return;
    }

    const finalReason = isLocked
      ? (lockedReason.startsWith('Lý do khác') ? (customReason.trim() || 'Chủ sân tạm khóa') : lockedReason)
      : undefined;

    const newCustomer = addCustomer({
      name: name.trim(),
      phone: phoneClean,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      isVip,
      isLocked,
      lockedReason: finalReason
    });

    onSuccess(newCustomer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Thêm Khách Hàng Mới
              </h3>
              <p className="text-xs text-slate-500">
                Tạo hồ sơ khách hàng chủ động vào hệ thống quản lý
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-300 text-xs text-red-900 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* 1. SỐ ĐIỆN THOẠI (ĐỊNH DANH CHÍNH) */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center justify-between">
              <span>Số Điện Thoại <span className="text-red-500">*</span></span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Định danh chính
              </span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="Ví dụ: 0912345678"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className={`w-full pl-9 pr-3 py-2.5 text-xs font-mono font-bold rounded-xl border focus:outline-none focus:ring-2 transition-colors ${
                  isDuplicatePhone
                    ? 'border-red-400 bg-red-50/50 focus:ring-red-400 text-red-900'
                    : 'border-slate-300 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900'
                }`}
              />
            </div>
            {isDuplicatePhone ? (
              <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>SĐT này đã thuộc về khách: <strong>{existingCustomer?.name}</strong></span>
              </p>
            ) : (
              <span className="text-[11px] text-slate-500 mt-1 block">
                Số điện thoại là khóa duy nhất để định danh và tra cứu lịch sử đặt sân.
              </span>
            )}
          </div>

          {/* 2. HỌ VÀ TÊN (THÔNG TIN PHỤ) */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center justify-between">
              <span>Họ và Tên Khách Hàng <span className="text-red-500">*</span></span>
              <span className="text-[10px] text-slate-400">Thông tin phụ</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn Nam"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          {/* 3. EMAIL (TÙY CHỌN) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email liên hệ (tùy chọn)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="nam.nguyen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          {/* 4. PHÂN LOẠI KHÁCH VIP */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-950 block">Khách hàng VIP</span>
                <span className="text-[11px] text-amber-800 block">Ưu tiên phục vụ và hiển thị huy hiệu VIP</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isVip}
                onChange={(e) => setIsVip(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 5. GHI CHÚ CHĂM SÓC */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Ghi chú của chủ sân (tùy chọn)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ví dụ: Khách quen câu lạc bộ tennis, thích đá sân 1 buổi tối, thanh toán tiền mặt..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900"
            />
          </div>

          {/* 6. TÙY CHỌN KHÓA BAN ĐẦU */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Tạm khóa quyền đặt sân</span>
                  <span className="text-[11px] text-slate-500 block">Dành cho khách nợ tiền cũ hoặc vi phạm quy định</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLocked}
                  onChange={(e) => setIsLocked(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {isLocked && (
              <div className="pt-2 border-t border-slate-200 space-y-2 animate-in fade-in">
                <label className="text-[11px] font-bold text-rose-900 block">
                  Lý do khóa tài khoản:
                </label>
                <div className="space-y-1">
                  {PRESET_LOCK_REASONS.map(r => (
                    <label
                      key={r}
                      className={`flex items-start gap-2 p-2 rounded-lg text-xs cursor-pointer border ${
                        lockedReason === r
                          ? 'bg-rose-50 border-rose-300 text-rose-950 font-medium'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="addCustomerLockReason"
                        value={r}
                        checked={lockedReason === r}
                        onChange={() => setLockedReason(r)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                {lockedReason.startsWith('Lý do khác') && (
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Nhập lý do cụ thể..."
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                )}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isDuplicatePhone || !trimmedPhone || !name.trim()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Khách Hàng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
