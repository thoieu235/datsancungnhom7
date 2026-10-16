import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SYSTEM_ADMIN_ACCOUNT } from '../../data/mockData';
import {
  X,
  Phone,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Mail,
  RefreshCw,
  Lock,
  Sparkles,
  Smartphone
} from 'lucide-react';

const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_DURATION_SEC = 90; // 1p30s cooldown as requested by user

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginUser,
    customers,
    addCustomer,
    settings
  } = useApp();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 5-attempt limit and 1p30s cooldown tracking (persisted in localStorage)
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('sportarena_otp_failed_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [cooldownSeconds, setCooldownSeconds] = useState<number>(() => {
    const lockedUntil = localStorage.getItem('sportarena_otp_locked_until');
    if (lockedUntil) {
      const remainingMs = parseInt(lockedUntil, 10) - Date.now();
      if (remainingMs > 0) {
        return Math.ceil(remainingMs / 1000);
      }
    }
    return 0;
  });

  // Countdown timer effect
  useEffect(() => {
    let timer: any = null;
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            localStorage.removeItem('sportarena_otp_locked_until');
            localStorage.setItem('sportarena_otp_failed_attempts', '0');
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownSeconds]);

  if (!isAuthModalOpen) return null;

  const cleanPhone = phone.trim().replace(/\s+/g, '');
  const isAdminPhone = cleanPhone === SYSTEM_ADMIN_ACCOUNT.phone;
  const existingCustomer = customers.find(c => c.phone.trim() === cleanPhone);
  const isLockedCustomer = Boolean(existingCustomer?.isLocked);

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick fill phone helper
  const handleQuickFillPhone = (p: string, n?: string) => {
    setPhone(p);
    if (n) setName(n);
    setErrorMessage(null);
  };

  // Step 1: Request OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate phone number
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage('Số điện thoại không hợp lệ (cần đủ 10 số và bắt đầu bằng số 0, ví dụ: 0912345678).');
      return;
    }

    // Check if account is locked
    if (isLockedCustomer) {
      setErrorMessage(
        `Tài khoản đang bị chủ sân tạm khóa! Lý do: "${existingCustomer?.lockedReason || 'Vi phạm chính sách'}". Vui lòng liên hệ Hotline ${settings.hotline} để được hỗ trợ.`
      );
      return;
    }

    // If new user (neither Admin nor existing customer), ensure name is provided
    if (!isAdminPhone && !existingCustomer && !name.trim()) {
      setErrorMessage('Số điện thoại này chưa có tài khoản. Vui lòng nhập Họ và tên để đăng ký!');
      return;
    }

    // Generate 6-digit OTP code (random or friendly code)
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpInput('');
    setOtpSentNotice(`📲 SMS Brandname [SportArena]: Mã OTP xác thực của bạn là ${newOtp} (có hiệu lực trong 5 phút).`);
    setStep('otp');
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If locked by 5 failed attempts cooldown
    if (cooldownSeconds > 0) {
      setErrorMessage(`Bạn đã nhập sai 5 lần! Vui lòng chờ ${formatTime(cooldownSeconds)} trước khi thử lại.`);
      return;
    }

    const cleanInput = otpInput.trim();
    if (!cleanInput) {
      setErrorMessage('Vui lòng nhập mã OTP gồm 6 chữ số.');
      return;
    }

    // Master OTP for testing or match generated OTP
    const isCorrectOtp = cleanInput === generatedOtp || cleanInput === '686868' || cleanInput === '123456';

    if (!isCorrectOtp) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      localStorage.setItem('sportarena_otp_failed_attempts', nextFailed.toString());

      if (nextFailed >= MAX_FAILED_ATTEMPTS) {
        // Trigger 1p30s cooldown
        const lockUntil = Date.now() + COOLDOWN_DURATION_SEC * 1000;
        localStorage.setItem('sportarena_otp_locked_until', lockUntil.toString());
        setCooldownSeconds(COOLDOWN_DURATION_SEC);
        setErrorMessage(
          `⛔ Bạn đã nhập sai mã OTP ${MAX_FAILED_ATTEMPTS} lần! Hệ thống tạm khóa trong 1 phút 30 giây để đảm bảo an toàn.`
        );
      } else {
        setErrorMessage(
          `Mã OTP không chính xác! Bạn còn ${MAX_FAILED_ATTEMPTS - nextFailed} lần thử (tối đa 5 lần sai).`
        );
      }
      return;
    }

    // OTP Correct -> Reset failed attempts
    setFailedAttempts(0);
    localStorage.removeItem('sportarena_otp_failed_attempts');
    localStorage.removeItem('sportarena_otp_locked_until');

    // Case 1: Admin Account (Pre-provisioned in system)
    if (isAdminPhone) {
      loginUser(SYSTEM_ADMIN_ACCOUNT);
      setSuccessMessage('Đăng nhập thành công với quyền Chủ Sân (Admin)!');
      return;
    }

    // Case 2: Existing Customer
    if (existingCustomer) {
      loginUser({
        id: existingCustomer.id,
        phone: existingCustomer.phone,
        name: existingCustomer.name,
        email: existingCustomer.email,
        role: 'customer',
        isLocked: existingCustomer.isLocked,
        lockedReason: existingCustomer.lockedReason
      });
      setSuccessMessage(`Đăng nhập thành công! Chào mừng ${existingCustomer.name}.`);
      return;
    }

    // Case 3: New Customer Register
    const newCust = addCustomer({
      name: name.trim(),
      phone: cleanPhone,
      email: email.trim() || undefined,
      notes: 'Khách hàng tự đăng ký qua website với xác thực OTP',
      isVip: false,
      isLocked: false
    });

    loginUser({
      id: newCust.id,
      phone: newCust.phone,
      name: newCust.name,
      email: newCust.email,
      role: 'customer'
    });
    setSuccessMessage(`Đăng ký và đăng nhập thành công! Chào mừng ${newCust.name}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng (xem với tư cách khách vãng lai)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-xl shadow-md text-white">
              S
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Hệ Thống Sân Thể Thao
              </span>
              <h3 className="text-lg font-black text-white leading-tight">
                {step === 'phone' ? 'Đăng Nhập / Đăng Ký' : 'Xác Thực Mã OTP'}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-2.5">
            {step === 'phone'
              ? 'Nhập số điện thoại để nhận mã OTP. Hệ thống tự động nhận diện tài khoản hoặc chuyển sang bước đăng ký.'
              : `Mã OTP xác thực đã được gửi đến SĐT ${phone}. Vui lòng nhập mã để hoàn tất.`}
          </p>
        </div>

        {/* Cooldown Alert Banner (If in 1p30s timeout) */}
        {cooldownSeconds > 0 && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h5 className="text-xs font-bold text-rose-900">
                Tạm Khóa Xác Thực (Quá 5 Lần Thử)
              </h5>
              <p className="text-xs text-rose-700 mt-0.5">
                Bạn đã nhập sai mã OTP 5 lần liên tiếp. Vui lòng chờ{' '}
                <strong className="font-mono text-rose-900 text-sm font-bold bg-rose-100 px-1.5 py-0.5 rounded">
                  {formatTime(cooldownSeconds)}
                </strong>{' '}
                (1 phút 30 giây) trước khi thử lại.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{successMessage}</div>
          </div>
        )}

        {/* Simulated SMS Notification Banner */}
        {otpSentNotice && step === 'otp' && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-bold text-[11px] text-amber-900">Thông báo SMS OTP Giả Lập</span>
            </div>
            <div className="text-[11px] font-mono bg-white p-2 rounded-xl border border-amber-200 text-slate-800">
              {otpSentNotice}
            </div>
            <button
              type="button"
              onClick={() => setOtpInput(generatedOtp)}
              className="text-left text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1 self-start"
            >
              <span>⚡ Bấm để tự động điền mã ({generatedOtp})</span>
            </button>
          </div>
        )}

        {/* Modal Form Content */}
        <div className="p-6 space-y-5">
          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center justify-between">
                  <span>Số Điện Thoại <span className="text-red-500">*</span></span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Định danh tài khoản
                  </span>
                </label>

                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0912345678 hoặc 0988888888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm font-mono font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>

                {/* Instant Feedback about the Phone */}
                {isAdminPhone && (
                  <div className="mt-2 p-2.5 bg-slate-900 text-white rounded-xl text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>👑 <strong>Tài khoản Quản lý / Chủ Sân</strong> đã được hệ thống cấp sẵn.</span>
                  </div>
                )}

                {existingCustomer && !isAdminPhone && (
                  <div className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    isLockedCustomer
                      ? 'bg-rose-50 text-rose-800 border border-rose-300'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {isLockedCustomer ? (
                      <>
                        <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                        <div>
                          <strong>Tài khoản đang bị khóa:</strong> {existingCustomer.name}
                          <div className="text-[11px] text-rose-600">Lý do: {existingCustomer.lockedReason}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Hồ sơ đã có: <strong>{existingCustomer.name}</strong> ({existingCustomer.totalBookings} lần đặt)</span>
                      </>
                    )}
                  </div>
                )}

                {/* If new phone -> Add Step: Name of Customer */}
                {!isAdminPhone && !existingCustomer && cleanPhone.length >= 10 && (
                  <div className="mt-3 p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-blue-900 text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Chưa có tài khoản · Đăng ký tài khoản mới:</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Họ và Tên Khách Hàng <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Nguyễn Văn An"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Email nhận vé (Tùy chọn)
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="an.nguyen@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLockedCustomer}
                className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  isLockedCustomer
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-lg'
                }`}
              >
                <span>Nhận Mã OTP Tiếp Tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Preset Quick Login Badges for Instant Demo Testing */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Tài khoản mẫu để thử nghiệm nhanh:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickFillPhone('0988888888')}
                    className="p-2 text-left bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-[11px] text-emerald-400 flex items-center gap-1">
                      <span>👑 Chủ Sân (Admin)</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-300 mt-0.5">0988888888</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFillPhone('0912345678', 'Đặng Tuấn Anh')}
                    className="p-2 text-left bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-[11px] text-emerald-800">
                      👤 Khách VIP
                    </div>
                    <div className="font-mono text-[11px] text-emerald-700 mt-0.5">0912345678</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center justify-between">
                  <span>Mã OTP (6 Chữ Số) <span className="text-red-500">*</span></span>
                  <span className="text-[10px] font-bold font-mono text-slate-500">
                    Lần thử: {failedAttempts}/{MAX_FAILED_ATTEMPTS}
                  </span>
                </label>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    disabled={cooldownSeconds > 0}
                    placeholder="Nhập 6 số (hoặc bấm điền nhanh)"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3 py-3 text-center text-lg font-mono font-bold tracking-[0.3em] rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-slate-500">
                    Mã dự phòng demo: <strong className="font-mono text-emerald-700">686868</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpInput('686868')}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Điền 686868
                  </button>
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={cooldownSeconds > 0}
                className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  cooldownSeconds > 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-lg'
                }`}
              >
                <span>Xác Nhận &amp; Đăng Nhập</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              {/* Back to change phone */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setErrorMessage(null);
                  }}
                  className="hover:text-slate-900 hover:underline cursor-pointer"
                >
                  ← Đổi số điện thoại khác
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedOtp(newOtp);
                    setOtpSentNotice(`📲 SMS Brandname [SportArena]: Mã OTP mới của bạn là ${newOtp}.`);
                  }}
                  className="hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  Gửi lại mã OTP
                </button>
              </div>
            </form>
          )}

          {/* Footer note */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={closeAuthModal}
              className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer underline"
            >
              Tiếp tục xem sân trước (chế độ khách vãng lai)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
