import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Court } from '../../types';
import { formatVND, formatDateVN, calculateCourtPrice, getSportDetails } from '../../utils/formatters';
import { QrCodeSvg } from '../common/QrCodeSvg';
import { CourtVisualBadge } from '../common/CourtVisualBadge';
import { ZaloNotificationModal } from '../common/ZaloNotificationModal';
import { X, CheckCircle, Copy, AlertTriangle, ShieldCheck, ArrowRight, ArrowLeft, Phone, Calendar, Clock, DollarSign, Sparkles, Banknote, CreditCard, MessageSquare, RefreshCw, XCircle, Lock, Unlock } from 'lucide-react';

interface BookingModalProps {
  court: Court;
  initialStartTime: string;
  initialEndTime: string;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  court,
  initialStartTime,
  initialEndTime,
  onClose,
  onSuccess
}) => {
  const {
    role,
    selectedDate,
    createBooking,
    settings,
    customerPhone: defaultPhone,
    customerName: defaultName,
    customers,
    unlockCustomer
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Slot & Time, 2: Customer Info (manager only), 3: VietQR Payment, 4: Success
  const [startTime, setStartTime] = useState(initialStartTime);
  const [durationHours, setDurationHours] = useState(1);
  
  // Contact info (Auto-filled from logged-in customer for customer flow)
  const [custName, setCustName] = useState(defaultName || (role === 'customer' ? 'Khách Hàng' : ''));
  const [custPhone, setCustPhone] = useState(defaultPhone || (role === 'customer' ? '0912345678' : ''));
  const [custEmail, setCustEmail] = useState('');
  const [note, setNote] = useState('');

  // Deposit control (default 30%, manager can override freely!)
  const [depositRate, setDepositRate] = useState<number>(30);
  const [customDepositAmount, setCustomDepositAmount] = useState<number | null>(null);

  // User Request: Phương thức thanh toán tiền cọc: Tiền mặt hoặc Chuyển khoản
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<'cash' | 'bank_transfer'>('bank_transfer');

  // Completed booking state
  const [createdBookingId, setCreatedBookingId] = useState('');
  const [createdQrPass, setCreatedQrPass] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showZaloModal, setShowZaloModal] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(600); // 10 minutes limit (UC01 E2)

  // Compute end time based on start time + duration
  const [startH, startM] = startTime.split(':').map(Number);
  const endMinutesTotal = startH * 60 + startM + Math.round(durationHours * 60);
  const endH = Math.floor(endMinutesTotal / 60);
  const endM = endMinutesTotal % 60;
  const computedEndTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

  // Check customer lock status
  const activeCustomerPhone = (role === 'customer' ? (custPhone || defaultPhone) : custPhone).trim();
  const currentCustomerProfile = customers.find(c => c.phone.trim() === activeCustomerPhone);
  const isCurrentCustomerLocked = !!currentCustomerProfile?.isLocked;

  // Price calculations
  const { totalAmount, isPeak } = calculateCourtPrice(court, startTime, computedEndTime, selectedDate);
  
  // Calculate deposit
  const effectiveDepositAmount = customDepositAmount !== null
    ? customDepositAmount
    : Math.round((totalAmount * depositRate) / 100);
  const effectiveRemainingAmount = Math.max(0, totalAmount - effectiveDepositAmount);

  const sportMeta = getSportDetails(court.sport);

  // UC01 E2: Countdown 10 minutes for deposit payment
  React.useEffect(() => {
    if (step !== 3) return;
    const interval = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const countdownM = Math.floor(countdownSeconds / 60);
  const countdownS = countdownSeconds % 60;
  const countdownFormatted = `${countdownM.toString().padStart(2, '0')}:${countdownS.toString().padStart(2, '0')}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custPhone.trim()) {
      alert('Vui lòng nhập số điện thoại khách hàng');
      return;
    }
    if (!custName.trim()) {
      alert('Vui lòng nhập họ tên khách hàng');
      return;
    }
    setStep(3);
  };

  const handleConfirmPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const finalPaymentMethod = effectiveDepositAmount === 0 ? 'cash' : (depositPaymentMethod === 'cash' ? 'cash' : 'vietqr');
      const finalCustPhone = (role === 'customer' ? (defaultPhone || custPhone) : custPhone).trim() || '0912345678';
      const finalCustName = (role === 'customer' ? (defaultName || custName) : custName).trim() || 'Khách Hàng';

      const newBooking = createBooking({
        courtId: court.id,
        courtName: court.name,
        sport: court.sport,
        customerName: finalCustName,
        customerPhone: finalCustPhone,
        customerEmail: custEmail || undefined,
        date: selectedDate,
        startTime,
        endTime: computedEndTime,
        durationHours,
        totalAmount,
        depositRate: customDepositAmount !== null ? Math.round((effectiveDepositAmount / totalAmount) * 100) : depositRate,
        depositAmount: effectiveDepositAmount,
        remainingAmount: effectiveRemainingAmount,
        paymentStatus: effectiveDepositAmount >= totalAmount ? 'fully_paid' : 'deposited',
        checkInStatus: 'not_checked_in',
        paymentMethod: finalPaymentMethod,
        note,
        createdByRole: role
      });

      setCreatedBookingId(newBooking.id);
      setCreatedQrPass(newBooking.qrPassCode);
      setIsProcessingPayment(false);
      setStep(4);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="font-bold text-slate-900 text-base">
              {step === 4 ? 'Đặt Sân Thành Công!' : `Đặt ${court.name}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Wizard Progress Bar */}
        {step < 4 && (
          <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            {role === 'customer' ? (
              <>
                <div className={`flex items-center gap-1.5 font-semibold ${step >= 1 ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>1</span>
                  <span>Chọn Giờ & Sân</span>
                </div>
                <div className="flex-1 max-w-[100px] h-px bg-slate-300 mx-2"></div>
                <div className={`flex items-center gap-1.5 font-semibold ${step >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>2</span>
                  <span>Thanh Toán Tiền Cọc</span>
                </div>
              </>
            ) : (
              <>
                <div className={`flex items-center gap-1.5 font-semibold ${step >= 1 ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>1</span>
                  <span>Chọn Giờ & Cọc</span>
                </div>
                <div className="w-8 h-px bg-slate-300"></div>
                <div className={`flex items-center gap-1.5 font-semibold ${step >= 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>2</span>
                  <span>Thông Tin Khách</span>
                </div>
                <div className="w-8 h-px bg-slate-300"></div>
                <div className={`flex items-center gap-1.5 font-semibold ${step >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>3</span>
                  <span>Thanh Toán Cọc</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: TIME, DURATION & DEPOSIT */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Court Quick Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <CourtVisualBadge court={court} height="h-32" className="mb-3" />
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-700">
                    {sportMeta.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {formatDateVN(selectedDate)}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1">{court.name}</h4>
                <p className="text-xs text-slate-600 mt-1">{court.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {court.amenities.map(a => (
                    <span key={a} className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Time Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giờ Bắt Đầu
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thời Lượng Chơi
                  </label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={1}>1.0 Giờ (60 phút)</option>
                    <option value={1.5}>1.5 Giờ (90 phút)</option>
                    <option value={2}>2.0 Giờ (120 phút)</option>
                    <option value={2.5}>2.5 Giờ (150 phút)</option>
                    <option value={3}>3.0 Giờ (180 phút)</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <span>Khung giờ đã chọn:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {startTime} ➔ {computedEndTime} ({durationHours} tiếng)
                </span>
              </div>

              {/* Deposit Policy Selection */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Chính Sách Đặt Cọc</span>
                    {role === 'manager' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-normal">
                        Chủ sân có quyền sửa cọc thủ công
                      </span>
                    )}
                  </label>
                  <span className="text-xs font-semibold text-emerald-700">
                    Mặc định 30% giữ chỗ
                  </span>
                </div>

                {/* Role-based deposit controls */}
                {role === 'manager' ? (
                  <div className="space-y-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                    <p className="text-xs text-amber-900">
                      Tùy chọn cọc khi đặt trực tiếp cho khách:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 30, 50, 100].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            setDepositRate(pct);
                            setCustomDepositAmount(null);
                          }}
                          className={`py-1.5 px-2 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                            customDepositAmount === null && depositRate === pct
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {pct === 0 ? '0% (Miễn cọc)' : `${pct}%`}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-600 whitespace-nowrap">Hoặc nhập số tiền cọc:</span>
                      <input
                        type="number"
                        placeholder="VD: 150000"
                        value={customDepositAmount !== null ? customDepositAmount : ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value) : null;
                          setCustomDepositAmount(val);
                        }}
                        className="w-full px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-emerald-950">Mức cọc thanh toán online: 30%</span>
                      <p className="text-emerald-700 text-[11px] mt-0.5">
                        Số tiền 70% còn lại thanh toán trực tiếp khi check-in tại quầy
                      </p>
                    </div>
                    <span className="text-sm font-bold font-mono text-emerald-800">30%</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown Card */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Đơn giá sân {isPeak ? '(Giờ cao điểm)' : '(Giờ tiêu chuẩn)'}:</span>
                  <span className="font-mono">{formatVND(isPeak ? court.peakPricePerHour : court.pricePerHour)}/h</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Tổng tiền thuê ({durationHours}h):</span>
                  <span className="font-mono font-bold text-white text-sm">{formatVND(totalAmount)}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-emerald-400 font-semibold">
                  <span>Tiền cọc cần thanh toán trước:</span>
                  <span className="font-mono text-base font-extrabold">{formatVND(effectiveDepositAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Số tiền còn lại khi check-out (trả sân):</span>
                  <span className="font-mono">{formatVND(effectiveRemainingAmount)}</span>
                </div>
              </div>

              {/* Khách hàng: Hiển thị thông tin tài khoản tự động định danh (không cần nhập lại) */}
              {role === 'customer' && (
                <div className="space-y-3">
                  <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                    isCurrentCustomerLocked
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-emerald-50/80 border-emerald-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center shrink-0 shadow-xs ${
                        isCurrentCustomerLocked ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}>
                        {isCurrentCustomerLocked ? <Lock className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>Số điện thoại: <strong className="font-mono text-xs">{custPhone || defaultPhone}</strong></span>
                          {isCurrentCustomerLocked ? (
                            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.2 rounded-full border border-rose-200">
                              Đang bị khóa
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                              Đã đăng nhập
                            </span>
                          )}
                        </div>
                        <div className="text-slate-600 text-[11px] mt-0.5">
                          Khách hàng: <strong>{custName || defaultName || 'Khách Hàng'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isCurrentCustomerLocked && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-800">
                        <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Tài khoản của quý khách đang bị tạm khóa đặt sân</span>
                      </div>
                      <p className="text-[11px] text-rose-800">
                        Lý do: <span className="font-semibold underline decoration-rose-400">{currentCustomerProfile?.lockedReason || 'Vi phạm chính sách đặt sân'}</span>
                      </p>
                      <p className="text-[11px] text-rose-700">
                        Vui lòng liên hệ Hotline chủ sân <strong className="font-mono">{settings.hotline}</strong> để được hỗ trợ mở khóa tài khoản.
                      </p>
                    </div>
                  )}

                  {!isCurrentCustomerLocked && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ghi Chú Đặt Sân (tùy chọn)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ví dụ: Mượn 2 áo bib, chuẩn bị sẵn nước suối, bóng thi đấu..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      ></textarea>
                    </div>
                  )}
                </div>
              )}

              {/* Nút Chuyển Bước: Luồng khách hàng chuyển thẳng sang Bước Thanh Toán Cọc */}
              {role === 'customer' ? (
                <button
                  type="button"
                  disabled={isCurrentCustomerLocked}
                  onClick={() => setStep(3)}
                  className={`w-full py-3 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                    isCurrentCustomerLocked
                      ? 'bg-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  }`}
                >
                  {isCurrentCustomerLocked ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Tài khoản đang bị khóa - Không thể đặt sân</span>
                    </>
                  ) : (
                    <>
                      <span>Tiếp tục: Thanh toán cọc ({formatVND(effectiveDepositAmount)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Tiếp tục: Nhập thông tin khách</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* STEP 2: CUSTOMER CONTACT INFO (Chỉ dành cho Quản lý sân khi tạo hộ khách) */}
          {step === 2 && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <span className="font-semibold text-slate-900">{court.name}</span>
                  <div className="text-slate-500">{formatDateVN(selectedDate)} · {startTime} - {computedEndTime}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Cọc online:</span>
                  <div className="font-bold text-emerald-700 font-mono text-sm">{formatVND(effectiveDepositAmount)}</div>
                </div>
              </div>

              {/* 1. SỐ ĐIỆN THOẠI ĐẨY LÊN TRÊN ĐẦU */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Số Điện Thoại Khách Hàng <span className="text-red-500">*</span></span>
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
                    value={custPhone}
                    onChange={(e) => {
                      const phoneVal = e.target.value;
                      setCustPhone(phoneVal);
                      // Tự động tìm kiếm hồ sơ khách hàng theo SĐT chính
                      const matched = customers.find(c => c.phone.trim() === phoneVal.trim());
                      if (matched) {
                        setCustName(matched.name);
                        if (matched.email && !custEmail) {
                          setCustEmail(matched.email);
                        }
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Định danh khách theo SĐT, tự động tải hồ sơ nếu đã từng đặt sân.
                </span>
              </div>

              {/* Cảnh báo nếu khách này đang bị khóa */}
              {isCurrentCustomerLocked && currentCustomerProfile && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-900 font-bold">
                      <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Khách hàng này đang bị khóa đặt sân!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => unlockCustomer(currentCustomerProfile.phone)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Unlock className="w-3 h-3" />
                      <span>Mở khóa ngay</span>
                    </button>
                  </div>
                  <p className="text-rose-800 text-[11px]">
                    Lý do khóa: <span className="font-semibold underline decoration-rose-400">{currentCustomerProfile.lockedReason}</span>
                  </p>
                </div>
              )}

              {/* 2. HỌ VÀ TÊN Ở PHÍA DƯỚI (PHỤ) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Họ và Tên Khách Hàng <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-slate-400">Thông tin phụ</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email (tùy chọn)
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi Chú Đặt Sân
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Mượn 2 áo bib, chuẩn bị sẵn nước suối, bóng thi đấu..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Xác nhận thông tin & Thanh toán cọc</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: DEPOSIT PAYMENT (TIỀN MẶT HOẶC CHUYỂN KHOẢN) */}
          {step === 3 && (
            <div className="space-y-4">
              {/* UC01 E2: Countdown 10 minutes warning banner */}
              {effectiveDepositAmount > 0 && (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  countdownSeconds <= 120
                    ? 'bg-red-50 border-red-300 text-red-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <span className="font-bold">Thời hạn giữ chỗ & thanh toán cọc:</span>
                      <p className="text-[10px] opacity-80">
                        {countdownSeconds <= 0
                          ? 'Đã hết thời gian giữ chỗ. Hệ thống tự động giải phóng lịch sân.'
                          : 'Hệ thống tự động hủy đơn sau 10 phút nếu chưa hoàn tất thanh toán cọc.'}
                      </p>
                    </div>
                  </div>
                  <div className="font-mono text-base font-extrabold">
                    {countdownFormatted}
                  </div>
                </div>
              )}

              {effectiveDepositAmount === 0 ? (
                /* 0% Deposit: Free direct booking */
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      Đơn Đặt Sân Được Miễn Cọc (0 ₫)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                      Quản lý đã thiết lập mức cọc 0% cho ca đặt này. Khách hàng <strong>{custName}</strong> sẽ thanh toán toàn bộ chi phí khi đến nhận sân.
                    </p>
                  </div>
                </div>
              ) : (
                /* Normal Deposit: Cho phép chọn Tiền mặt hoặc Chuyển khoản */
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                      Chọn Phương Thức Thanh Toán Cọc ({formatVND(effectiveDepositAmount)})
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Hỗ trợ chuyển khoản ngân hàng qua VietQR hoặc đóng tiền mặt tại quầy
                    </p>
                  </div>

                  {/* Payment Method Selector Tabs */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setDepositPaymentMethod('bank_transfer')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        depositPaymentMethod === 'bank_transfer'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        depositPaymentMethod === 'bank_transfer' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Chuyển Khoản</div>
                        <div className="text-[11px] text-slate-500">Quét mã VietQR 24/7</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositPaymentMethod('cash')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        depositPaymentMethod === 'cash'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        depositPaymentMethod === 'cash' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Tiền Mặt</div>
                        <div className="text-[11px] text-slate-500">Thanh toán tại quầy lễ tân</div>
                      </div>
                    </button>
                  </div>

                  {/* Option 1: Chuyển khoản VietQR */}
                  {depositPaymentMethod === 'bank_transfer' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="shrink-0 flex flex-col items-center">
                        <QrCodeSvg
                          value={`vietqr://transfer?bank=${settings.bankName}&acc=${settings.bankAccount}&amount=${effectiveDepositAmount}&desc=DATSAN_${custPhone}`}
                          size={160}
                          label="VietQR 24/7"
                        />
                        <span className="text-[10px] text-slate-400 mt-1">Quét mã tự động điền số tiền</span>
                      </div>

                      <div className="flex-1 space-y-2 text-xs w-full">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <div className="text-slate-500 text-[11px]">Ngân hàng thụ hưởng:</div>
                          <div className="font-bold text-slate-900">{settings.bankName}</div>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="text-slate-500 text-[11px]">Số tài khoản:</div>
                            <div className="font-mono font-bold text-slate-900 text-sm">{settings.bankAccount}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(settings.bankAccount, 'acc')}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-emerald-700 cursor-pointer"
                            title="Sao chép số tài khoản"
                          >
                            {copiedField === 'acc' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <div className="text-slate-500 text-[11px]">Chủ tài khoản:</div>
                          <div className="font-semibold text-slate-900">{settings.bankAccountName}</div>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="text-slate-500 text-[11px]">Số tiền cọc cần chuyển:</div>
                            <div className="font-mono font-extrabold text-emerald-700 text-base">
                              {formatVND(effectiveDepositAmount)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(effectiveDepositAmount.toString(), 'amount')}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-emerald-700 cursor-pointer"
                            title="Sao chép số tiền"
                          >
                            {copiedField === 'amount' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-200 flex items-center justify-between">
                          <div>
                            <div className="text-emerald-900 text-[11px] font-medium">Nội dung chuyển khoản:</div>
                            <div className="font-mono font-bold text-emerald-950 text-xs">
                              DATSAN {custPhone}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(`DATSAN ${custPhone}`, 'desc')}
                            className="p-1.5 hover:bg-emerald-100 rounded text-emerald-700 cursor-pointer"
                            title="Sao chép nội dung"
                          >
                            {copiedField === 'desc' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Option 2: Tiền Mặt tại quầy */
                    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 text-xs">
                      <div className="flex items-center gap-2.5 text-amber-950 font-bold text-sm">
                        <Banknote className="w-5 h-5 text-amber-700 shrink-0" />
                        <span>Thanh toán tiền mặt trực tiếp tại quầy thu ngân</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Số tiền cọc cần nộp bằng tiền mặt:</span>
                          <span className="font-mono font-extrabold text-amber-900 text-base">
                            {formatVND(effectiveDepositAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-1.5">
                          <span>Khách hàng nộp cọc:</span>
                          <span className="font-bold text-slate-900">{custName} ({custPhone})</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Số tiền còn lại khi kết thúc ca chơi (check-out):</span>
                          <span className="font-mono font-bold text-slate-700">{formatVND(effectiveRemainingAmount)}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-amber-900">
                        {role === 'manager'
                          ? '✓ Bạn đang tạo đơn với tư cách Chủ Sân. Xác nhận khách hàng đã nộp tiền mặt trực tiếp tại quầy để hệ thống cấp thẻ SportPass ngay lập tức.'
                          : '✓ Vui lòng thanh toán tiền mặt trực tiếp tại quầy lễ tân của sân thể thao. Hệ thống sẽ tạo đơn giữ chỗ và cấp mã vé SportPass ngay cho bạn.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(role === 'customer' ? 1 : 2)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{role === 'customer' ? 'Chọn lại giờ & sân' : 'Sửa thông tin khách'}</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessingPayment || (effectiveDepositAmount > 0 && countdownSeconds <= 0)}
                  onClick={handleConfirmPayment}
                  className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang nhận tín hiệu Webhook/IPN...</span>
                    </span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {effectiveDepositAmount === 0
                          ? 'Xác Nhận Đặt Chỗ Ngay'
                          : depositPaymentMethod === 'cash'
                          ? `Xác Nhận Nộp Tiền Mặt (${formatVND(effectiveDepositAmount)})`
                          : `Tôi Đã Chuyển Khoản Thành Công`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* UC01 E1: Khách hủy giao dịch trên màn hình QR */}
              {effectiveDepositAmount > 0 && (
                <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Hủy giao dịch thanh toán cọc và đóng đơn đặt sân?')) {
                        onClose();
                      }
                    }}
                    className="text-red-600 hover:text-red-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Hủy giao dịch</span>
                  </button>
                  <span className="text-[10px] text-slate-400">
                    Cổng thanh toán tự động xác nhận IPN 24/7
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION & QR PASS */}
          {step === 4 && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  Lịch Sân Đã Được Xác Nhận Ngay Lập Tức!
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Đơn đặt sân <strong>{createdBookingId}</strong> của bạn đã được ghi nhận vào hệ thống.
                </p>
              </div>

              {/* Booking Pass Card with QR */}
              <div className="p-5 rounded-2xl bg-linear-to-b from-slate-900 to-slate-800 text-white shadow-lg text-left max-w-md mx-auto">
                <div className="flex justify-between items-start border-b border-slate-700 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                      SportPass · Thẻ Check-in Điện Tử
                    </span>
                    <span className="font-bold text-base text-white">{court.name}</span>
                  </div>
                  <span className="font-mono text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-200">
                    {createdBookingId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-b border-slate-700 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Thời gian:</span>
                    <span className="font-semibold text-white">{formatDateVN(selectedDate)}</span>
                    <span className="font-mono text-emerald-300 block">{startTime} - {computedEndTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Khách hàng:</span>
                    <span className="font-semibold text-white">{custName}</span>
                    <span className="font-mono text-slate-300 block">{custPhone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <div className="text-[11px] text-slate-400">
                      Đã cọc: <strong className="text-emerald-400 font-mono">{formatVND(effectiveDepositAmount)}</strong>
                      <span className="text-[10px] text-slate-300 ml-1">
                        ({effectiveDepositAmount === 0 ? 'Miễn cọc' : depositPaymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Còn lại tại quầy: <strong className="text-amber-300 font-mono">{formatVND(effectiveRemainingAmount)}</strong></div>
                  </div>
                  <div className="bg-white p-1 rounded-lg">
                    <QrCodeSvg value={createdQrPass} size={70} label="" />
                  </div>
                </div>
              </div>

              {/* UC01 Step 8: Zalo Notification Service */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-left flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0068FF] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                    Z
                  </div>
                  <div>
                    <strong className="text-xs text-blue-900 block font-bold">
                      Đã gửi thông báo đặt sân thành công qua Zalo ZNS (Bước 8)
                    </strong>
                    <span className="text-[11px] text-blue-800">
                      Tin nhắn xác nhận đặt cọc và thẻ SportPass đã được tự động gửi đến SĐT <strong>{custPhone}</strong>.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowZaloModal(true)}
                  className="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-[#0068FF] border border-blue-300 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer shadow-2xs"
                >
                  Xem tin Zalo
                </button>
              </div>

              {/* Exchange / Reschedule Notice */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-950 flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-900">Quy định đổi sân hoặc dời giờ:</strong>
                  <span>
                    Nếu bạn có nhu cầu đổi sang sân khác hoặc đổi khung giờ, vui lòng liên hệ trực tiếp Quản lý sân qua Hotline/Zalo:{' '}
                    <strong className="font-mono text-amber-950 underline">{settings.hotline}</strong> ít nhất 2 giờ trước giờ thi đấu.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSuccess(createdBookingId);
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Xem Lịch Sử Đặt Sân Của Tôi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulated Zalo ZNS Notification Modal */}
      {showZaloModal && (
        <ZaloNotificationModal
          isOpen={true}
          onClose={() => setShowZaloModal(false)}
          recipientPhone={custPhone}
          bookingId={createdBookingId}
          courtName={court.name}
          dateTime={`${formatDateVN(selectedDate)} ${startTime}-${computedEndTime}`}
          depositAmount={effectiveDepositAmount}
          remainingAmount={effectiveRemainingAmount}
          qrPassCode={createdQrPass}
          paymentMethod={depositPaymentMethod === 'cash' ? 'Tiền mặt' : 'VietQR'}
        />
      )}
    </div>
  );
};
