import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Court, Booking, SportType } from '../../types';
import { TIME_SLOTS, formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import { SportFilterBar } from '../customer/SportFilterBar';
import { ChangeCourtModal } from './ChangeCourtModal';
import { CheckInModal } from './CheckInModal';
import { CollectPaymentModal } from './CollectPaymentModal';
import { BookingModal } from '../customer/BookingModal';
import {
  Activity,
  CheckCircle2,
  Clock,
  DollarSign,
  PlusCircle,
  RefreshCw,
  Search,
  UserCheck,
  Wrench,
  XCircle,
  LogOut,
  QrCode,
  Calendar,
  X
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const {
    courts,
    bookings,
    selectedDate,
    selectedSport,
    setSelectedSport,
    checkOutBooking,
    cancelBooking,
    collectRemainingPayment
  } = useApp();

  // Modals state
  const [selectedBookingForChange, setSelectedBookingForChange] = useState<Booking | null>(null);
  const [selectedBookingSummary, setSelectedBookingSummary] = useState<Booking | null>(null);
  const [bookingForCheckInModal, setBookingForCheckInModal] = useState<Booking | null>(null);
  const [bookingForCollectModal, setBookingForCollectModal] = useState<Booking | null>(null);
  const [quickBookingSlot, setQuickBookingSlot] = useState<{ court: Court; startTime: string; endTime: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInCodeInput, setCheckInCodeInput] = useState('');

  // Daily statistics
  const todayBookings = bookings.filter(b => b.date === selectedDate && b.paymentStatus !== 'cancelled');
  const activePlayingCount = todayBookings.filter(b => b.checkInStatus === 'checked_in').length;
  const depositCollected = todayBookings.reduce((sum, b) => sum + b.depositAmount, 0);
  const remainingToCollect = todayBookings
    .filter(b => b.checkInStatus === 'not_checked_in' || b.paymentStatus === 'deposited')
    .reduce((sum, b) => sum + b.remainingAmount, 0);

  const filteredCourts = courts.filter(c => c.sport === selectedSport);

  // Quick check-in by code
  const handleQuickCheckInByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInCodeInput.trim()) return;
    const target = bookings.find(
      b => (b.qrPassCode.toLowerCase() === checkInCodeInput.trim().toLowerCase() ||
            b.id.toLowerCase() === checkInCodeInput.trim().toLowerCase() ||
            b.customerPhone.includes(checkInCodeInput.trim())) &&
           b.date === selectedDate &&
           b.checkInStatus !== 'cancelled'
    );

    if (target) {
      setBookingForCheckInModal(target);
      setCheckInCodeInput('');
    } else {
      alert('Không tìm thấy đơn đặt hoặc mã vé nào trùng khớp cho ngày hôm nay!');
    }
  };

  // Helper for manager grid slot
  const getSlotState = (court: Court, slotTime: string) => {
    if (court.status === 'maintenance') {
      return { type: 'maintenance' as const, booking: null };
    }

    const slotStartMin = parseInt(slotTime.split(':')[0]) * 60 + parseInt(slotTime.split(':')[1]);
    const slotEndMin = slotStartMin + 60;

    const activeBooking = bookings.find(b => {
      if (b.courtId !== court.id || b.date !== selectedDate) return false;
      if (b.checkInStatus === 'cancelled' || b.paymentStatus === 'cancelled') return false;

      const [bStartH, bStartM] = b.startTime.split(':').map(Number);
      const [bEndH, bEndM] = b.endTime.split(':').map(Number);
      const bStartMin = bStartH * 60 + bStartM;
      const bEndMin = bEndH * 60 + bEndM;

      return (
        (slotStartMin >= bStartMin && slotStartMin < bEndMin) ||
        (slotEndMin > bStartMin && slotEndMin <= bEndMin) ||
        (slotStartMin <= bStartMin && slotEndMin >= bEndMin)
      );
    });

    if (activeBooking) {
      if (activeBooking.checkInStatus === 'checked_in') {
        return { type: 'in_use' as const, booking: activeBooking };
      }
      return { type: 'booked' as const, booking: activeBooking };
    }

    return { type: 'available' as const, booking: null };
  };

  const getNextHour = (time: string) => {
    const [h] = time.split(':').map(Number);
    return `${(h + 1).toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Đang Chơi Trên Sân
            </span>
            <div className="text-2xl font-black font-mono text-amber-700 mt-1">
              {activePlayingCount} / {courts.length} Sân
            </div>
            <span className="text-[11px] text-slate-400">Đã check-in đang sử dụng</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Lịch Hôm Nay
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {todayBookings.length} Lượt
            </div>
            <span className="text-[11px] text-slate-400">{formatDateVN(selectedDate)}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Doanh Thu Cọc (30%+)
            </span>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
              {formatVND(depositCollected)}
            </div>
            <span className="text-[11px] text-slate-400">Đã nhận về tài khoản</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cần Thu Nốt Tại Quầy
            </span>
            <div className="text-2xl font-black font-mono text-amber-800 mt-1">
              {formatVND(remainingToCollect)}
            </div>
            <span className="text-[11px] text-slate-400">70% còn lại khi khách đến</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action & QR Pass Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Quick Check-in Scan Form */}
        <form onSubmit={handleQuickCheckInByCode} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nhập mã vé hoặc SĐT khách để check-in..."
              value={checkInCodeInput}
              onChange={(e) => setCheckInCodeInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Check-in
          </button>
        </form>
      </div>

      {/* Sport Selector & Date Stepper */}
      <SportFilterBar />

      {/* Manager Master Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-sm text-slate-900">
              Sơ đồ sân theo giờ
            </h3>
            <span className="text-xs text-slate-500">
              {formatDateVN(selectedDate)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Trống</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500"></span> Đã cọc</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Đang chơi</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1050px]">
            {/* Hours Header */}
            <div className="grid grid-cols-[190px_repeat(16,1fr)] border-b border-slate-200 bg-slate-100/80 text-xs font-semibold text-slate-700 sticky top-0 z-10">
              <div className="p-3 border-r border-slate-200 text-slate-900">Tên Sân / Giờ</div>
              {TIME_SLOTS.slice(0, 16).map(slot => (
                <div key={slot} className="p-2.5 text-center border-r border-slate-200 font-mono text-[11px]">
                  {slot}
                </div>
              ))}
            </div>

            {/* Courts Rows */}
            <div className="divide-y divide-slate-100">
              {filteredCourts.map(court => (
                <div
                  key={court.id}
                  className="grid grid-cols-[190px_repeat(16,1fr)] hover:bg-slate-50/40 transition-colors"
                >
                  {/* Court Header Cell */}
                  <div className="p-3 border-r border-slate-200 bg-white flex flex-col justify-center">
                    <span className="font-bold text-xs text-slate-900 truncate" title={court.name}>
                      {court.name}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">{court.surface}</span>
                    <span className="text-[10px] font-mono text-emerald-700 mt-0.5">
                      {formatVND(court.pricePerHour)}/h
                    </span>
                  </div>

                  {/* Slot Cells */}
                  {TIME_SLOTS.slice(0, 16).map(slotTime => {
                    const { type, booking } = getSlotState(court, slotTime);
                    const nextHour = getNextHour(slotTime);

                    if (type === 'maintenance') {
                      return (
                        <div key={slotTime} className="p-1 border-r border-slate-100 bg-slate-100 flex items-center justify-center">
                          <Wrench className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      );
                    }

                    if (type === 'in_use' && booking) {
                      return (
                        <div
                          key={slotTime}
                          onClick={() => setSelectedBookingSummary(booking)}
                          className="p-1 border-r border-slate-100 bg-amber-100/90 hover:bg-amber-200 transition-colors cursor-pointer group flex flex-col justify-center text-center"
                          title={`Bấm để quản lý đơn: ${booking.customerName} (${booking.startTime}-${booking.endTime})`}
                        >
                          <span className="text-[10px] font-bold text-amber-950 truncate">{booking.customerName}</span>
                          <span className="text-[9px] text-amber-800 font-mono">Đang chơi</span>
                        </div>
                      );
                    }

                    if (type === 'booked' && booking) {
                      return (
                        <div
                          key={slotTime}
                          onClick={() => setSelectedBookingSummary(booking)}
                          className="p-1 border-r border-slate-100 bg-blue-100/80 hover:bg-blue-200 transition-colors cursor-pointer group flex flex-col justify-center text-center"
                          title={`Bấm để Check-in hoặc Đổi sân: ${booking.customerName} (${booking.startTime}-${booking.endTime})`}
                        >
                          <span className="text-[10px] font-bold text-blue-950 truncate">{booking.customerName}</span>
                          <span className="text-[9px] text-blue-800 font-mono">Đã cọc 30%</span>
                        </div>
                      );
                    }

                    // Available cell -> Manager can click to book on behalf of customer!
                    return (
                      <div
                        key={slotTime}
                        onClick={() => setQuickBookingSlot({ court, startTime: slotTime, endTime: nextHour })}
                        className="p-1 border-r border-slate-100 hover:bg-emerald-50 transition-colors cursor-pointer group flex items-center justify-center"
                        title="Bấm để đặt sân hộ khách (có quyền sửa cọc thủ công)"
                      >
                        <button className="w-full h-10 rounded border border-dashed border-emerald-200 hover:border-emerald-500 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center text-[10px] font-semibold text-emerald-700 cursor-pointer">
                          + Đặt
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Booking Quick Action Drawer / Dialog for Manager */}
      {selectedBookingSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedBookingSummary.id}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">
                  Quản Lý Đơn Đặt Sân
                </h4>
              </div>
              <button
                onClick={() => setSelectedBookingSummary(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-200">
                <div className="font-bold text-slate-900 text-sm">{selectedBookingSummary.courtName}</div>
                <div className="text-slate-600">
                  {formatDateVN(selectedBookingSummary.date)} · <strong className="font-mono">{selectedBookingSummary.startTime} - {selectedBookingSummary.endTime}</strong>
                </div>
                <div className="text-slate-600">
                  Khách: <strong>{selectedBookingSummary.customerName}</strong> ({selectedBookingSummary.customerPhone})
                </div>
              </div>

              {/* Payment & Deposit state */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950">
                <div className="flex justify-between">
                  <span>Tổng tiền thuê:</span>
                  <span className="font-mono font-bold">{formatVND(selectedBookingSummary.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Đã nhận cọc ({selectedBookingSummary.depositRate}%):</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-800">{formatVND(selectedBookingSummary.depositAmount)}</span>
                    <span className="text-[10px] text-slate-500 block">
                      ({selectedBookingSummary.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'})
                    </span>
                  </div>
                </div>
                <div className="flex justify-between border-t border-emerald-200/80 pt-1 text-amber-900 font-bold">
                  <span>Số tiền còn lại cần thu:</span>
                  <span className="font-mono">{formatVND(selectedBookingSummary.remainingAmount)}</span>
                </div>
              </div>

              {/* Operations: Check-in, Thu tiền còn lại, Đổi sân, Trả sân, Hủy đơn */}
              <div className="space-y-2 pt-1">
                {selectedBookingSummary.checkInStatus === 'not_checked_in' && (
                  <button
                    onClick={() => {
                      const b = selectedBookingSummary;
                      setSelectedBookingSummary(null);
                      setBookingForCheckInModal(b);
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Check-In & Thu Tiền Còn Lại ({formatVND(selectedBookingSummary.remainingAmount)})</span>
                  </button>
                )}

                {/* If already checked-in but still owes remaining balance */}
                {selectedBookingSummary.checkInStatus === 'checked_in' && selectedBookingSummary.remainingAmount > 0 && (
                  <button
                    onClick={() => {
                      const b = selectedBookingSummary;
                      setSelectedBookingSummary(null);
                      setBookingForCollectModal(b);
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Thu Tiền Còn Lại ({formatVND(selectedBookingSummary.remainingAmount)}) - Tiền Mặt / CK</span>
                  </button>
                )}

                {selectedBookingSummary.checkInStatus === 'checked_in' && (
                  <button
                    onClick={() => {
                      if (confirm('Xác nhận khách đã trả sân và hoàn tất ca thi đấu?')) {
                        checkOutBooking(selectedBookingSummary.id);
                        setSelectedBookingSummary(null);
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Check-Out (Khách Trả Sân)</span>
                  </button>
                )}

                {/* Change Court button */}
                <button
                  onClick={() => {
                    const b = selectedBookingSummary;
                    setSelectedBookingSummary(null);
                    setSelectedBookingForChange(b);
                  }}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Đổi Sang Sân Khác / Dời Giờ Cho Khách</span>
                </button>

                {/* Cancel Booking button */}
                <button
                  onClick={() => {
                    const reason = prompt('Nhập lý do khách yêu cầu hủy sân:');
                    if (reason !== null) {
                      cancelBooking(selectedBookingSummary.id, reason);
                      alert('Đã hủy lịch sân và cập nhật trạng thái đơn!');
                      setSelectedBookingSummary(null);
                    }
                  }}
                  className="w-full py-2 px-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Hủy Lịch Đặt & Trả Lại Sân Trống</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Check In Modal */}
      {bookingForCheckInModal && (
        <CheckInModal
          booking={bookingForCheckInModal}
          onClose={() => setBookingForCheckInModal(null)}
          onSuccess={() => setBookingForCheckInModal(null)}
        />
      )}

      {/* Collect Remaining Payment Modal */}
      {bookingForCollectModal && (
        <CollectPaymentModal
          booking={bookingForCollectModal}
          isOpen={!!bookingForCollectModal}
          onClose={() => setBookingForCollectModal(null)}
          onSuccess={(method, amount) => {
            alert(`Đã thu thành công ${formatVND(amount)} (${method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'})!`);
            setBookingForCollectModal(null);
          }}
        />
      )}

      {/* Change Court Modal */}
      {selectedBookingForChange && (
        <ChangeCourtModal
          booking={selectedBookingForChange}
          onClose={() => setSelectedBookingForChange(null)}
          onSuccess={() => setSelectedBookingForChange(null)}
        />
      )}

      {/* Quick Walk-in Booking Modal */}
      {quickBookingSlot && (
        <BookingModal
          court={quickBookingSlot.court}
          initialStartTime={quickBookingSlot.startTime}
          initialEndTime={quickBookingSlot.endTime}
          onClose={() => setQuickBookingSlot(null)}
          onSuccess={() => setQuickBookingSlot(null)}
        />
      )}
    </div>
  );
};
