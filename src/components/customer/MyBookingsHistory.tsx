import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import { QrCodeSvg } from '../common/QrCodeSvg';
import { Calendar, Clock, DollarSign, Phone, QrCode, Search, CheckCircle2, AlertCircle, XCircle, ChevronRight, User } from 'lucide-react';

export const MyBookingsHistory: React.FC = () => {
  const { bookings, customerPhone, setCustomerPhone, customerName, setCustomerName, settings } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPassBooking, setSelectedPassBooking] = useState<Booking | null>(null);
  const [phoneInput, setPhoneInput] = useState(customerPhone);

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.trim()) {
      setCustomerPhone(phoneInput.trim());
    }
  };

  // Filter bookings for current customer phone
  const myBookings = bookings.filter(b => b.customerPhone === customerPhone);

  const filteredBookings = myBookings.filter(b => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'upcoming') return b.checkInStatus === 'not_checked_in' && b.paymentStatus !== 'cancelled';
    if (filterStatus === 'in_use') return b.checkInStatus === 'checked_in';
    if (filterStatus === 'completed') return b.checkInStatus === 'checked_out';
    if (filterStatus === 'cancelled') return b.paymentStatus === 'cancelled' || b.checkInStatus === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Phone Switcher Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Lịch Sử Đặt Sân Của Bạn</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tình trạng đơn đặt, số tiền đã cọc 30%, số tiền còn lại và mã vé QR check-in
          </p>
        </div>

        {/* Customer Phone Search */}
        <form onSubmit={handlePhoneSearch} className="flex items-center gap-2">
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="Nhập SĐT để tra cứu..."
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 w-48 sm:w-56"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tra Cứu
          </button>
        </form>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Tổng lượt đặt</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{myBookings.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Chờ nhận sân</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {myBookings.filter(b => b.checkInStatus === 'not_checked_in' && b.paymentStatus !== 'cancelled').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Tổng tiền đã cọc</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatVND(myBookings.reduce((sum, b) => sum + (b.paymentStatus !== 'cancelled' ? b.depositAmount : 0), 0))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Cần trả tại quầy</span>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">
            {formatVND(myBookings.filter(b => b.checkInStatus === 'not_checked_in' && b.paymentStatus !== 'cancelled').reduce((sum, b) => sum + b.remainingAmount, 0))}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit overflow-x-auto">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tất cả ({myBookings.length})
        </button>
        <button
          onClick={() => setFilterStatus('upcoming')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            filterStatus === 'upcoming' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sắp diễn ra
        </button>
        <button
          onClick={() => setFilterStatus('in_use')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            filterStatus === 'in_use' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Đang trên sân
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            filterStatus === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Đã hoàn tất
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            filterStatus === 'cancelled' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Đã hủy
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">Chưa Có Đơn Đặt Sân Nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Không tìm thấy lượt đặt nào tương ứng với số điện thoại <strong className="font-mono">{customerPhone}</strong> và bộ lọc đã chọn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map(b => {
            const sportMeta = getSportDetails(b.sport);
            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {b.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {sportMeta.label}
                      </span>
                    </div>

                    {/* Status badges */}
                    <div>
                      {b.checkInStatus === 'cancelled' ? (
                        <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          Đã hủy
                        </span>
                      ) : b.checkInStatus === 'checked_in' ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Đang chơi trên sân
                        </span>
                      ) : b.checkInStatus === 'checked_out' ? (
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          Đã hoàn tất
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Đã cọc {b.depositRate}% · Chờ nhận sân
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Court & Time Information */}
                  <div className="py-3 space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-base">{b.courtName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDateVN(b.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-emerald-800 font-bold">{b.startTime} - {b.endTime}</span>
                      <span className="text-slate-400">({b.durationHours} tiếng)</span>
                    </div>
                    {b.note && (
                      <div className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-2">
                        Ghi chú: {b.note}
                      </div>
                    )}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs border border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Tổng tiền sân:</span>
                      <span className="font-mono font-bold text-slate-900">{formatVND(b.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Đã đặt cọc ({b.depositRate}%):</span>
                      <span className="font-mono">{formatVND(b.depositAmount)}</span>
                    </div>
                    {b.checkInStatus !== 'checked_out' && b.checkInStatus !== 'cancelled' && (
                      <div className="flex justify-between text-amber-700 font-semibold border-t border-slate-200/60 pt-1">
                        <span>Số tiền còn lại thanh toán tại quầy:</span>
                        <span className="font-mono font-bold">{formatVND(b.remainingAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-2">
                  <button
                    onClick={() => setSelectedPassBooking(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Mã vé check-in</span>
                  </button>

                  <a
                    href={`tel:${settings.hotline}`}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-700 font-medium"
                    title="Liên hệ quản lý để đổi sân hoặc dời giờ"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đổi sân: {settings.hotline}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Pass Modal */}
      {selectedPassBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-sm text-slate-900">Thẻ Check-in Điện Tử</span>
              <button
                onClick={() => setSelectedPassBooking(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl text-left text-xs space-y-1.5">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                {selectedPassBooking.id}
              </span>
              <h4 className="font-bold text-sm text-white">{selectedPassBooking.courtName}</h4>
              <div className="text-slate-300">
                {formatDateVN(selectedPassBooking.date)} · <strong className="text-emerald-300 font-mono">{selectedPassBooking.startTime} - {selectedPassBooking.endTime}</strong>
              </div>
              <div className="text-slate-400">
                Khách: {selectedPassBooking.customerName} ({selectedPassBooking.customerPhone})
              </div>
            </div>

            <div className="py-2 flex justify-center">
              <QrCodeSvg value={selectedPassBooking.qrPassCode} size={160} label={selectedPassBooking.qrPassCode} />
            </div>

            <div className="text-xs text-slate-500 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-left">
              <strong>Lưu ý:</strong> Xuất trình mã này cho lễ tân khi đến sân để check-in và thanh toán nốt số tiền còn lại{' '}
              <strong className="font-mono text-amber-900">{formatVND(selectedPassBooking.remainingAmount)}</strong>.
            </div>

            <button
              onClick={() => setSelectedPassBooking(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
