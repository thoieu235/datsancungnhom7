import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SYSTEM_ADMIN_ACCOUNT } from '../../data/mockData';
import {
  Phone,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Mail,
  Lock,
  Sparkles,
  Smartphone,
  ChevronLeft,
  Info
} from 'lucide-react';

const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_DURATION_SEC = 90; // 1p30s cooldown per user requirements

export const AuthScreen: React.FC = () => {
  const {
    closeAuthModal,
    loginUser,
    customers,
    addCustomer,
    settings,
    authPromptMessage
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
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

    // Validate phone number (10 digits starting with 0)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage('Số điện thoại không hợp lệ (cần đủ 10 chữ số bắt đầu bằng số 0, ví dụ: 0912345678).');
      return;
    }

    // Check if account is locked by pitch owner
    if (isLockedCustomer) {
      setErrorMessage(
        `⛔ Tài khoản đang bị chủ sân tạm khóa! Lý do: "${existingCustomer?.lockedReason || 'Vi phạm chính sách đặt sân'}". Vui lòng liên hệ Hotline ${settings.hotline} để được hỗ trợ.`
      );
      return;
    }

    // If registering or new user (neither Admin nor existing customer), require full name
    const isNewUser = !isAdminPhone && !existingCustomer;
    if ((authMode === 'register' || isNewUser) && !name.trim()) {
      setErrorMessage('Số điện thoại này chưa có trong hệ thống. Vui lòng nhập Họ và tên để hoàn tất đăng ký!');
      return;
    }

    // Generate 6-digit OTP code
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
      setErrorMessage(`⛔ Bạn đã nhập sai mã OTP 5 lần! Vui lòng chờ ${formatTime(cooldownSeconds)} trước khi thử lại.`);
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
          `⛔ Bạn đã nhập sai mã OTP ${MAX_FAILED_ATTEMPTS} lần! Hệ thống tạm khóa ô xác thực trong 1 phút 30 giây để đảm bảo an toàn.`
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
      setSuccessMessage('Đăng nhập thành công với quyền Chủ Sân (Admin)! Đang chuyển hướng...');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Back to Home / Browse Link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={closeAuthModal}
          className="text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại xem thông tin sân</span>
        </button>

        <span className="text-[11px] font-mono text-slate-500 font-medium">
          Hotline: {settings.hotline}
        </span>
      </div>

      {/* Main Focused Authentication Card (Only Login / Register Content) */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Brand Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-600 text-white items-center justify-center font-black text-2xl shadow-lg shadow-emerald-600/20 mb-3">
            S
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            SportArena
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'phone'
              ? authMode === 'login'
                ? 'Đăng nhập tài khoản bằng số điện thoại'
                : 'Đăng ký tài khoản thành viên mới'
              : 'Xác thực mã OTP gửi về số điện thoại'}
          </p>
        </div>

        {/* Action Prompt Banner (If redirected from clicking to book online) */}
        {authPromptMessage && (
          <div className="mb-5 p-3.5 bg-emerald-950/70 border border-emerald-700/80 rounded-2xl text-xs text-emerald-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="font-semibold leading-relaxed">{authPromptMessage}</div>
          </div>
        )}

        {/* Cooldown Alert Banner (If in 1p30s timeout) */}
        {cooldownSeconds > 0 && (
          <div className="mb-5 p-4 bg-rose-950/70 border border-rose-800/80 rounded-2xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h5 className="text-xs font-bold text-rose-200">
                Tạm Khóa Xác Thực (Đã Sai 5 Lần)
              </h5>
              <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                Bạn đã nhập sai mã OTP 5 lần liên tiếp. Vui lòng chờ{' '}
                <strong className="font-mono text-rose-100 text-sm font-bold bg-rose-900/80 px-2 py-0.5 rounded border border-rose-700/60">
                  {formatTime(cooldownSeconds)}
                </strong>{' '}
                (1 phút 30 giây) trước khi thử lại.
              </p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-xs text-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* Simulated SMS Notification Banner */}
        {otpSentNotice && step === 'otp' && (
          <div className="mb-5 p-3.5 bg-amber-950/50 border border-amber-700/70 rounded-2xl text-xs text-amber-100 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-[11px] text-amber-300">Thông báo SMS OTP Giả Lập</span>
            </div>
            <div className="text-[11px] font-mono bg-slate-950 p-2.5 rounded-xl border border-amber-800/60 text-slate-200">
              {otpSentNotice}
            </div>
            <button
              type="button"
              onClick={() => setOtpInput(generatedOtp)}
              className="text-left text-[11px] font-bold text-amber-300 hover:text-amber-200 hover:underline cursor-pointer flex items-center gap-1 self-start"
            >
              <span>⚡ Bấm để tự động điền mã ({generatedOtp})</span>
            </button>
          </div>
        )}

        {/* Auth Mode Toggle Tabs (Login vs Register) */}
        {step === 'phone' && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Đăng Ký Mới
            </button>
          </div>
        )}

        {/* Step 1: Phone and Registration Info Form */}
        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                <span>Số Điện Thoại <span className="text-rose-400">*</span></span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  10 chữ số
                </span>
              </label>

              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0912345678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-3 py-3 text-sm font-mono font-semibold rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-950 text-white placeholder-slate-500"
                />
              </div>

              {/* Instant Feedback about the Phone */}
              {isAdminPhone && (
                <div className="mt-2.5 p-3 bg-slate-950 border border-slate-700 text-white rounded-xl text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>👑 <strong>Tài khoản Quản lý / Chủ Sân</strong> đã được hệ thống cấp sẵn.</span>
                </div>
              )}

              {existingCustomer && !isAdminPhone && (
                <div className={`mt-2.5 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  isLockedCustomer
                    ? 'bg-rose-950/80 text-rose-200 border border-rose-800/80'
                    : 'bg-emerald-950/80 text-emerald-200 border border-emerald-800/80'
                }`}>
                  {isLockedCustomer ? (
                    <>
                      <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <strong>Tài khoản đang bị khóa:</strong> {existingCustomer.name}
                        <div className="text-[11px] text-rose-300 mt-0.5">Lý do: {existingCustomer.lockedReason}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Đã có tài khoản: <strong>{existingCustomer.name}</strong> ({existingCustomer.totalBookings} lần đặt)</span>
                    </>
                  )}
                </div>
              )}

              {/* If new phone or Register mode -> Add Step: Name of Customer */}
              {(authMode === 'register' || (!isAdminPhone && !existingCustomer && cleanPhone.length >= 10)) && (
                <div className="mt-3.5 p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3.5 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Thông tin đăng ký thành viên mới:</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Họ và Tên Khách Hàng <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nguyễn Văn An"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Email nhận vé &amp; hóa đơn (Tùy chọn)
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="an.nguyen@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-500"
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
              className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                isLockedCustomer
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black cursor-pointer hover:shadow-lg hover:shadow-emerald-600/30'
              }`}
            >
              <span>Nhận Mã OTP Tiếp Tục</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            {/* Preset Quick Login Badges for Instant Demo Testing */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Tài khoản mẫu để thử nghiệm nhanh:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    handleQuickFillPhone('0988888888');
                  }}
                  className="p-2.5 text-left bg-slate-950 hover:bg-slate-900 text-white rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer"
                >
                  <div className="font-bold text-[11px] text-emerald-400 flex items-center gap-1">
                    <span>👑 Chủ Sân (Admin)</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 mt-0.5">0988888888</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    handleQuickFillPhone('0912345678', 'Đặng Tuấn Anh');
                  }}
                  className="p-2.5 text-left bg-slate-950 hover:bg-slate-900 text-white rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer"
                >
                  <div className="font-bold text-[11px] text-teal-400">
                    👤 Khách VIP
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 mt-0.5">0912345678</div>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Step 2: OTP Input Form */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                <span>Mã OTP (6 Chữ Số) <span className="text-rose-400">*</span></span>
                <span className="text-[10px] font-bold font-mono text-slate-400">
                  Lần thử: {failedAttempts}/{MAX_FAILED_ATTEMPTS}
                </span>
              </label>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  disabled={cooldownSeconds > 0}
                  placeholder="Nhập 6 số"
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, ''));
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-3 py-3 text-center text-lg font-mono font-black tracking-[0.3em] rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-950 text-white disabled:bg-slate-900/40 disabled:cursor-not-allowed placeholder:tracking-normal placeholder:text-xs placeholder:font-normal placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-slate-400">
                  Mã dự phòng: <strong className="font-mono text-emerald-400">686868</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setOtpInput('686868')}
                  className="text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Điền 686868
                </button>
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={cooldownSeconds > 0}
              className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                cooldownSeconds > 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black cursor-pointer hover:shadow-lg hover:shadow-emerald-600/30'
              }`}
            >
              <span>Xác Nhận &amp; Đăng Nhập</span>
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
            </button>

            {/* Back to change phone */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setErrorMessage(null);
                }}
                className="hover:text-white hover:underline cursor-pointer"
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
                className="hover:text-emerald-400 hover:underline cursor-pointer"
              >
                Gửi lại mã OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
