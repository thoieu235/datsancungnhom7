import React, { useEffect, useState } from 'react';
import { PaymentSuccessNotification } from '../../types';
import { formatVND } from '../../utils/formatters';
import { CheckCircle2, X, Sparkles, CreditCard, Banknote, Calendar, Phone, ArrowRight } from 'lucide-react';

interface PaymentSuccessToastProps {
  notification: PaymentSuccessNotification | null;
  onClose: () => void;
  onViewInvoice?: (bookingId: string) => void;
}

// Gentle pleasant notification sound using Web Audio API
const playSuccessSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // First tone (G5 - 784Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Second tone (C6 - 1046.5Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.12);
    gain2.gain.setValueAtTime(0.12, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch (e) {
    // Audio might be blocked by browser policy until user gesture
  }
};

export const PaymentSuccessToast: React.FC<PaymentSuccessToastProps> = ({
  notification,
  onClose,
  onViewInvoice
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!notification) return;

    playSuccessSound();
    setProgress(100);

    const duration = 6500; // 6.5s auto-dismiss
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-md w-full px-4 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 overflow-hidden ring-4 ring-emerald-500/20">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-1.5">
                <span>{notification.title}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              </div>
              <span className="text-[10px] text-emerald-100 font-medium">
                Giao dịch được ghi nhận thành công
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 bg-white text-xs">
          {/* Amount and Method Hero */}
          <div className="flex items-center justify-between bg-emerald-50/80 p-3 rounded-xl border border-emerald-100">
            <div>
              <span className="text-[11px] text-emerald-800 font-semibold block">
                {notification.type === 'deposit' ? 'Số tiền cọc đã thu:' : notification.type === 'settlement' ? 'Số tiền đã tất toán:' : 'Số tiền thanh toán:'}
              </span>
              <div className="text-xl font-black font-mono text-emerald-700">
                +{formatVND(notification.amount)}
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                notification.paymentMethod === 'cash'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                {notification.paymentMethod === 'cash' ? (
                  <>
                    <Banknote className="w-3.5 h-3.5 text-amber-700" />
                    <span>Tiền mặt tại quầy</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                    <span>Chuyển khoản VietQR</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Details Row */}
          <div className="space-y-1.5 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Mã đơn đặt sân:</span>
              <strong className="font-mono text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">{notification.bookingId}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Sân thể thao:</span>
              <strong className="text-slate-900">{notification.courtName}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Khách hàng:</span>
              <span className="text-slate-800 font-medium">
                {notification.customerName} (<span className="font-mono text-emerald-700">{notification.customerPhone}</span>)
              </span>
            </div>
          </div>

          {/* Message */}
          <p className="text-[11px] text-slate-600 italic">
            "{notification.message}"
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {onViewInvoice && (
              <button
                type="button"
                onClick={() => {
                  onViewInvoice(notification.bookingId);
                  onClose();
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <span>Xem Hóa Đơn / Vé</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Bottom Countdown Progress Bar */}
        <div className="h-1 bg-slate-100 w-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
