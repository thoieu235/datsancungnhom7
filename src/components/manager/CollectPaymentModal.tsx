import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, BookingInvoice, PaymentMethod } from '../../types';
import { formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import { QrCodeSvg } from '../common/QrCodeSvg';
import {
  DollarSign,
  CreditCard,
  Banknote,
  CheckCircle2,
  X,
  Copy,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Printer,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Phone
} from 'lucide-react';

interface CollectPaymentModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoice: BookingInvoice) => void;
}

export const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { collectRemainingPayment, settings, role } = useApp();

  // Payment method selection (Tiền mặt hoặc Chuyển khoản)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('bank_transfer');

  // Xử lý chênh lệch dư/thiếu tại quầy
  const [showDiscrepancyPanel, setShowDiscrepancyPanel] = useState(false);
  const [discrepancyNoteInput, setDiscrepancyNoteInput] = useState('');
  const [actualReceivedInput, setActualReceivedInput] = useState<string>('');

  // Chờ tiền chuyển khoản
  const [isCheckingWebhook, setIsCheckingWebhook] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Lỗi hệ thống khi cập nhật hóa đơn hoặc đồng bộ trạng thái
  const [simulateSystemErrorE2, setSimulateSystemErrorE2] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed invoice preview (Web Invoice)
  const [finalInvoice, setFinalInvoice] = useState<BookingInvoice | null>(booking.invoice || null);

  if (!isOpen) return null;

  // Kiểm tra quyền: Chỉ Chủ sân / Quản lý
  if (role !== 'manager') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 border border-slate-200 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Không Có Quyền Truy Cập</h3>
            <p className="text-xs text-slate-600 mt-1">
              Chỉ Quản lý sân mới có quyền thực hiện tất toán và xuất hóa đơn thu tiền còn lại.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  // Remaining_Amount = Total_Amount - tiền cọc đã thanh toán
  const totalGrandAmount = booking.totalAmount;
  const totalRemainingToCollect = Math.max(0, totalGrandAmount - booking.depositAmount);
  const isFullyDeposited = totalRemainingToCollect === 0;

  const sportMeta = getSportDetails(booking.sport);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Xác nhận thanh toán thành công
  const executeFinalPayment = (method: PaymentMethod) => {
    if (simulateSystemErrorE2) {
      setErrorMessage('Lỗi kết nối khi cập nhật hóa đơn. Đơn chưa hoàn tất, vui lòng thử lại.');
      return;
    }

    setIsProcessingPayment(true);
    setTimeout(() => {
      let discrepancyString = '';
      if (showDiscrepancyPanel && (actualReceivedInput || discrepancyNoteInput)) {
        discrepancyString = `Thực thu: ${actualReceivedInput ? formatVND(Number(actualReceivedInput)) : 'Tự thỏa thuận'} | Ghi chú: ${discrepancyNoteInput || 'Điều chỉnh tiền thu tại quầy'}`;
      }

      const invoice = collectRemainingPayment(
        booking.id,
        method,
        [],
        'Quản lý sân',
        discrepancyString
      );
      setIsProcessingPayment(false);

      if (invoice) {
        setFinalInvoice(invoice);
        onSuccess(invoice);
      }
    }, 400);
  };

  // Webhook / IPN simulation
  const handleSimulateWebhookReceived = () => {
    setIsCheckingWebhook(true);
    setTimeout(() => {
      setIsCheckingWebhook(false);
      executeFinalPayment('vietqr');
    }, 600);
  };

  // Kiểm tra lại giao dịch khi ngân hàng báo chậm
  const handleCheckBankDelay = () => {
    setIsCheckingWebhook(true);
    setTimeout(() => {
      setIsCheckingWebhook(false);
      executeFinalPayment('vietqr');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {finalInvoice ? 'Hóa Đơn Thanh Toán (Đã Hoàn Tất)' : 'Thanh Toán Số Tiền Còn Lại'}
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Check-out & Tất Toán
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Mã đơn: <strong className="font-mono text-slate-800">{booking.id}</strong> · Khách hàng: <strong className="text-slate-800">{booking.customerName}</strong> (<span className="font-mono text-emerald-700">{booking.customerPhone}</span>)
              </span>
            </div>
          </div>
          {/* Nút đóng / Tạm dừng */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="Đóng / Tạm dừng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Thông báo lỗi hệ thống */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl flex items-start justify-between gap-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-xs">Thông báo lỗi hệ thống</h5>
                  <p className="text-[11px] text-red-700 mt-0.5">{errorMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-500 hover:text-red-800 text-[11px] font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          )}

          {/* VIEW 1: INVOICE FINALIZED */}
          {finalInvoice ? (
            <div className="space-y-4">
              <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Tất Toán Hoàn Tất & Đã Khóa Hóa Đơn!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Đơn đặt sân đã chuyển sang trạng thái <strong>Đã hoàn thành</strong>. Dữ liệu đã được cập nhật vào lịch sử khách hàng.
                </p>
              </div>

              {/* Immutable Bill Receipt */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-mono text-[11px]">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900">HÓA ĐƠN THANH TOÁN: {finalInvoice.invoiceId}</span>
                  <span className="text-slate-500">{new Date(finalInvoice.issuedAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Sân thi đấu:</span>
                  <span className="font-bold text-slate-900">{booking.courtName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Khách hàng:</span>
                  <span className="text-slate-900">{booking.customerName} ({booking.customerPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Thời gian chơi:</span>
                  <span className="text-slate-900">{formatDateVN(booking.date)} · {booking.startTime} - {booking.endTime} ({booking.durationHours}h)</span>
                </div>
                <div className="flex justify-between text-slate-700 font-bold border-t border-slate-200 pt-2">
                  <span>Tổng tiền thuê sân:</span>
                  <span>{formatVND(finalInvoice.courtFee)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Tiền cọc đã thanh toán trước:</span>
                  <span>- {formatVND(finalInvoice.depositPaid)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-300 pt-2 font-mono">
                  <span>ĐÃ THANH TOÁN TẤT TOÁN TẠI QUẦY:</span>
                  <span className="text-emerald-700">{formatVND(finalInvoice.remainingPaid)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>Hình thức: {finalInvoice.paymentMethod === 'cash' ? 'Tiền mặt tại quầy' : 'Chuyển khoản VietQR'}</span>
                  <span>Xác nhận bởi: {finalInvoice.collectedBy}</span>
                </div>
                {finalInvoice.discrepancyNote && (
                  <div className="p-2 bg-amber-50 rounded text-amber-900 text-[10px] border border-amber-200">
                    <strong>Ghi chú điều chỉnh: </strong>{finalInvoice.discrepancyNote}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Hóa đơn điện tử nội bộ đã được xác thực thanh toán thành công và lưu trữ an toàn trên hệ thống.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>In Phiếu Thu / Hóa Đơn</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Đóng Màn Hình
                </button>
              </div>
            </div>
          ) : (
            /* VIEW 2: CHECK-OUT & TẤT TOÁN SỐ TIỀN CÒN LẠI */
            <div className="space-y-4">
              {/* Booking Context Banner */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sportMeta.bgLight}`}>
                    {sportMeta.label}
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">{booking.id}</span>
                </div>
                <h4 className="font-bold text-sm text-white">{booking.courtName}</h4>
                <div className="text-slate-300">
                  {formatDateVN(booking.date)} · <strong className="font-mono text-emerald-300">{booking.startTime} - {booking.endTime}</strong> ({booking.durationHours}h)
                </div>
                <div className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Khách hàng: <strong className="text-white">{booking.customerName}</strong> (<span className="font-mono text-emerald-300">{booking.customerPhone}</span>)</span>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Tiền thuê sân:</span>
                  <span className="font-bold text-white text-sm">{formatVND(booking.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400">
                  <span>Tiền cọc đã thanh toán trước:</span>
                  <span className="font-bold">- {formatVND(booking.depositAmount)}</span>
                </div>
                <div className="border-t-2 border-emerald-500 pt-2 flex justify-between items-center text-emerald-300">
                  <span className="text-sm font-bold font-sans">SỐ TIỀN CÒN LẠI CẦN THU:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {formatVND(totalRemainingToCollect)}
                  </span>
                </div>
              </div>

              {/* Trường hợp đã cọc đủ 100% */}
              {isFullyDeposited ? (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-950 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Đã Thanh Toán Đủ 100% Giá Trị Đơn</span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Số tiền còn lại bằng 0 ₫. Không phát sinh thêm khoản thu nào tại quầy.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => executeFinalPayment('cash')}
                    disabled={isProcessingPayment}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Xác Nhận Hoàn Tất Check-out & Xuất Hóa Đơn</span>
                  </button>
                </div>
              ) : (
                /* Chọn hình thức thanh toán */
                <div className="space-y-4">
                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        paymentMethod === 'bank_transfer' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Chuyển Khoản</div>
                        <div className="text-[10px] text-slate-500">Mã VietQR động tự động điền tiền</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        paymentMethod === 'cash'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        paymentMethod === 'cash' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Tiền Mặt</div>
                        <div className="text-[10px] text-slate-500">Thu trực tiếp tại quầy thu ngân</div>
                      </div>
                    </button>
                  </div>

                  {/* HÌNH THỨC 1: CHUYỂN KHOẢN (VietQR) */}
                  {paymentMethod === 'bank_transfer' ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div className="text-center">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
                          Mã VietQR Tất Toán ({formatVND(totalRemainingToCollect)})
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Mã QR chứa sẵn số tiền còn lại và nội dung thanh toán đơn {booking.id}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="shrink-0 flex flex-col items-center">
                          <QrCodeSvg
                            value={`vietqr://transfer?bank=${settings.bankName}&acc=${settings.bankAccount}&amount=${totalRemainingToCollect}&desc=TATTOAN_${booking.id}`}
                            size={140}
                            label="VietQR Tất Toán"
                          />
                          <span className="text-[10px] text-slate-400 mt-1">Khách mở App ngân hàng quét mã</span>
                        </div>

                        <div className="flex-1 space-y-2 w-full text-[11px]">
                          <div className="p-2 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-400 text-[10px] block">Ngân hàng thụ hưởng:</span>
                            <strong className="text-slate-900">{settings.bankName}</strong>
                          </div>

                          <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-slate-400 text-[10px] block">Số tài khoản:</span>
                              <strong className="font-mono text-slate-900 text-xs">{settings.bankAccount}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(settings.bankAccount, 'acc')}
                              className="p-1 text-slate-500 hover:text-emerald-700 cursor-pointer"
                            >
                              {copiedField === 'acc' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                            <div>
                              <span className="text-emerald-800 text-[10px] block">Số tiền còn lại cần chuyển:</span>
                              <strong className="font-mono text-emerald-800 text-sm font-bold">{formatVND(totalRemainingToCollect)}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(totalRemainingToCollect.toString(), 'amount')}
                              className="p-1 text-emerald-700 cursor-pointer"
                            >
                              {copiedField === 'amount' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-slate-400 text-[10px] block">Nội dung chuyển khoản:</span>
                              <strong className="font-mono text-slate-900 text-xs">TATTOAN {booking.id}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(`TATTOAN ${booking.id}`, 'desc')}
                              className="p-1 text-slate-500 hover:text-emerald-700 cursor-pointer"
                            >
                              {copiedField === 'desc' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Tín hiệu nhận diện và Hỗ trợ chuyển chậm */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 font-bold text-[11px]">
                            Tín hiệu ngân hàng tự động:
                          </span>
                          <button
                            type="button"
                            onClick={handleSimulateWebhookReceived}
                            disabled={isCheckingWebhook || isProcessingPayment}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingWebhook ? 'animate-spin' : ''}`} />
                            <span>Mô phỏng ngân hàng báo có tức thì</span>
                          </button>
                        </div>

                        <div className="border-t border-slate-100 pt-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[11px] text-amber-800 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Chưa thấy tiền về tài khoản?</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCheckBankDelay}
                            disabled={isCheckingWebhook}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Kiểm Tra Lại Giao Dịch
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 italic">
                          Lưu ý: Nếu chưa thấy biến động số dư, vui lòng chờ ngân hàng hoặc bấm kiểm tra lại trước khi bấm xác nhận.
                        </p>
                      </div>

                      {/* Nút xác nhận thanh toán thành công */}
                      <button
                        type="button"
                        onClick={() => executeFinalPayment('bank_transfer')}
                        disabled={isProcessingPayment}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{isProcessingPayment ? 'Đang cập nhật hóa đơn...' : 'Xác Nhận Thanh Toán Thành Công (Chuyển Khoản)'}</span>
                      </button>
                    </div>
                  ) : (
                    /* HÌNH THỨC 2: TIỀN MẶT TẠI QUẦY */
                    <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                        <Banknote className="w-5 h-5 text-amber-700 shrink-0" />
                        <span>Thu tiền mặt trực tiếp tại quầy thu ngân</span>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-2">
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Số tiền mặt cần thu:</span>
                          <span className="font-mono font-extrabold text-amber-900 text-base">
                            {formatVND(totalRemainingToCollect)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-1.5">
                          <span>Khách hàng thanh toán:</span>
                          <span className="font-bold text-slate-900">{booking.customerName} ({booking.customerPhone})</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-amber-900">
                        Thu ngân kiểm đếm đủ số tiền mặt <strong>{formatVND(totalRemainingToCollect)}</strong> và nhấn nút xác nhận bên dưới.
                      </p>

                      {/* Nút xác nhận thanh toán thành công */}
                      <button
                        type="button"
                        onClick={() => executeFinalPayment('cash')}
                        disabled={isProcessingPayment}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{isProcessingPayment ? 'Đang cập nhật hóa đơn...' : 'Xác Nhận Thanh Toán Thành Công (Tiền Mặt)'}</span>
                      </button>
                    </div>
                  )}

                  {/* Điều chỉnh chênh lệch hoặc làm tròn tiền */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showDiscrepancyPanel}
                        onChange={(e) => setShowDiscrepancyPanel(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Ghi chú điều chỉnh / làm tròn tiền lẻ tại quầy</span>
                    </label>

                    {showDiscrepancyPanel && (
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 animate-in fade-in">
                        <p className="text-[11px] text-slate-600">
                          Ghi nhận số tiền thực tế khách đưa nếu có chênh lệch hoặc làm tròn tiền lẻ ngoài hệ thống.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-1">Số tiền thực nhận (₫):</span>
                            <input
                              type="number"
                              placeholder={`Mặc định: ${totalRemainingToCollect}`}
                              value={actualReceivedInput}
                              onChange={(e) => setActualReceivedInput(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-1">Ghi chú điều chỉnh:</span>
                            <input
                              type="text"
                              placeholder="VD: Khách gửi thêm tip, hoặc làm tròn tiền lẻ..."
                              value={discrepancyNoteInput}
                              onChange={(e) => setDiscrepancyNoteInput(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nút hành động */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-medium cursor-pointer transition-colors"
                    >
                      Đóng / Tạm dừng thanh toán
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
