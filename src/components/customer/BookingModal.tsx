import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Court } from '../../types';
import { formatVND, formatDateVN, calculateCourtPrice, getSportDetails } from '../../utils/formatters';
import { QrCodeSvg } from '../common/QrCodeSvg';
import { X, CheckCircle, Copy, AlertTriangle, ShieldCheck, ArrowRight, ArrowLeft, Phone, Calendar, Clock, DollarSign, Sparkles } from 'lucide-react';

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
    customerName: defaultName
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Slot & Time, 2: Customer Info, 3: VietQR Payment, 4: Success
  const [startTime, setStartTime] = useState(initialStartTime);
  const [durationHours, setDurationHours] = useState(1);
  
  // Contact info
  const [custName, setCustName] = useState(role === 'customer' ? defaultName : '');
  const [custPhone, setCustPhone] = useState(role === 'customer' ? defaultPhone : '');
  const [custEmail, setCustEmail] = useState('');
  const [note, setNote] = useState('');

  // Deposit control (default 30%, manager can override freely!)
  const [depositRate, setDepositRate] = useState<number>(30);
  const [customDepositAmount, setCustomDepositAmount] = useState<number | null>(null);

  // Completed booking state
  const [createdBookingId, setCreatedBookingId] = useState('');
  const [createdQrPass, setCreatedQrPass] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Compute end time based on start time + duration
  const [startH, startM] = startTime.split(':').map(Number);
  const endMinutesTotal = startH * 60 + startM + Math.round(durationHours * 60);
  const endH = Math.floor(endMinutesTotal / 60);
  const endM = endMinutesTotal % 60;
  const computedEndTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

  // Price calculations
  const { totalAmount, isPeak } = calculateCourtPrice(court, startTime, computedEndTime, selectedDate);
  
  // Calculate deposit
  const effectiveDepositAmount = customDepositAmount !== null
    ? customDepositAmount
    : Math.round((totalAmount * depositRate) / 100);
  const effectiveRemainingAmount = Math.max(0, totalAmount - effectiveDepositAmount);

  const sportMeta = getSportDetails(court.sport);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) {
      alert('Vui lòng nhập họ tên và số điện thoại liên hệ');
      return;
    }
    setStep(3);
  };

  const handleConfirmPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const newBooking = createBooking({
        courtId: court.id,
        courtName: court.name,
        sport: court.sport,
        customerName: custName,
        customerPhone: custPhone,
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
        paymentMethod: 'vietqr',
        note,
        createdByRole: role
      });

      setCreatedBookingId(newBooking.id);
      setCreatedQrPass(newBooking.qrPassCode);
      setIsProcessingPayment(false);
      setStep(4);
    }, 700);
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
              <span>Thanh Toán VietQR</span>
            </div>
          </div>
        )}

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: TIME, DURATION & DEPOSIT */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Court Quick Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
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
                  <span>Số tiền còn lại khi check-in tại quầy:</span>
                  <span className="font-mono">{formatVND(effectiveRemainingAmount)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Tiếp tục: Nhập thông tin khách</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: CUSTOMER CONTACT INFO */}
          {step === 2 && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
                <div>
                  <span className="font-semibold text-slate-900">{court.name}</span>
                  <div className="text-slate-500">{formatDateVN(selectedDate)} · {startTime} - {computedEndTime}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Cọc online:</span>
                  <div className="font-bold text-emerald-700 font-mono text-sm">{formatVND(effectiveDepositAmount)}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và Tên Khách Hàng <span className="text-red-500">*</span>
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
                  Số Điện Thoại Nhận Mã Vé <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0912345678"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  <span>Xác nhận thông tin & Lấy VietQR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: DYNAMIC VIETQR PAYMENT */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Quét Mã VietQR Chuyển Khoản
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Mở ứng dụng ngân hàng hoặc MoMo để quét mã thanh toán tiền cọc tức thì
                </p>
              </div>

              {/* VietQR Display Box */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="shrink-0 flex flex-col items-center">
                  <QrCodeSvg
                    value={`vietqr://transfer?bank=${settings.bankName}&acc=${settings.bankAccount}&amount=${effectiveDepositAmount}&desc=DATSAN_${custPhone}`}
                    size={170}
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
                      onClick={() => handleCopy(`DATSAN ${custPhone}`, 'desc')}
                      className="p-1.5 hover:bg-emerald-100 rounded text-emerald-700 cursor-pointer"
                      title="Sao chép nội dung"
                    >
                      {copiedField === 'desc' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Sửa thông tin</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleConfirmPayment}
                  className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <span>Đang kiểm tra giao dịch...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Xác Nhận Đã Chuyển Cọc</span>
                    </>
                  )}
                </button>
              </div>
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
                    <div className="text-[11px] text-slate-400">Đã cọc: <strong className="text-emerald-400 font-mono">{formatVND(effectiveDepositAmount)}</strong></div>
                    <div className="text-[11px] text-slate-400">Còn lại tại quầy: <strong className="text-amber-300 font-mono">{formatVND(effectiveRemainingAmount)}</strong></div>
                  </div>
                  <div className="bg-white p-1 rounded-lg">
                    <QrCodeSvg value={createdQrPass} size={70} label="" />
                  </div>
                </div>
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
    </div>
  );
};
