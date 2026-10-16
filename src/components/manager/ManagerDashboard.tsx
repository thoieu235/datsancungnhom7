import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Court, Booking, SportType } from '../../types';
import { TIME_SLOTS, formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import { SportFilterBar } from '../customer/SportFilterBar';
import { ChangeCourtModal } from './ChangeCourtModal';
import { CheckInModal } from './CheckInModal';
import { CollectPaymentModal } from './CollectPaymentModal';
import { ManagerConfirmDepositModal } from './ManagerConfirmDepositModal';
import { BookingAuditLogsModal } from './BookingAuditLogsModal';
import { ZaloNotificationModal } from '../common/ZaloNotificationModal';
import { BookingModal } from '../customer/BookingModal';
import {
  CheckCircle2,
  Clock,
  PlusCircle,
  RefreshCw,
  Search,
  UserCheck,
  Wrench,
  XCircle,
  LogOut,
  QrCode,
  Calendar,
  ShieldCheck,
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
  const [bookingForDepositModal, setBookingForDepositModal] = useState<Booking | null>(null);
  const [bookingForAuditModal, setBookingForAuditModal] = useState<Booking | null>(null);
  const [zaloNotificationData, setZaloNotificationData] = useState<any | null>(null);
  const [quickBookingSlot, setQuickBookingSlot] = useState<{ court: Court; startTime: string; endTime: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInCodeInput, setCheckInCodeInput] = useState('');

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
          <table className="w-full border-separate border-spacing-0 table-fixed text-xs min-w-[1390px]">
            {/* Column definitions for strict mathematical alignment across all rows */}
            <colgroup>
              <col className="w-[190px] min-w-[190px] max-w-[190px]" style={{ width: '190px' }} />
              {TIME_SLOTS.slice(0, 16).map(slot => (
                <col key={slot} className="w-[75px] min-w-[75px] max-w-[75px]" style={{ width: '75px' }} />
              ))}
            </colgroup>

            {/* Hours Header (Row 1) */}
            <thead>
              <tr className="bg-slate-100 text-xs font-semibold text-slate-700 sticky top-0 z-20">
                <th className="w-[190px] min-w-[190px] max-w-[190px] h-12 p-3 text-left border-b border-r border-slate-200 bg-slate-100 sticky left-0 z-30 shadow-[1px_0_0_0_#cbd5e1] box-border">
                  <span className="font-bold text-xs text-slate-900 block truncate">Tên Sân / Giờ</span>
                </th>
                {TIME_SLOTS.slice(0, 16).map(slot => (
                  <th
                    key={slot}
                    className="w-[75px] min-w-[75px] max-w-[75px] h-12 p-1.5 text-center border-b border-r border-slate-200 font-mono text-[11px] font-bold text-slate-700 bg-slate-100 box-border"
                  >
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Courts Rows */}
            <tbody>
              {filteredCourts.map(court => (
                <tr
                  key={court.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Court Header Cell (Sticky Left) */}
                  <td className="w-[190px] min-w-[190px] max-w-[190px] h-[58px] p-2.5 border-b border-r border-slate-200 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#cbd5e1] align-middle box-border">
                    <span className="font-bold text-xs text-slate-900 truncate block" title={court.name}>
                      {court.name}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block mt-0.5">{court.surface}</span>
                    <span className="text-[10px] font-mono text-emerald-700 block mt-0.5 font-bold">
                      {formatVND(court.pricePerHour)}/h
                    </span>
                  </td>

                  {/* Slot Cells */}
                  {TIME_SLOTS.slice(0, 16).map(slotTime => {
                    const { type, booking } = getSlotState(court, slotTime);
                    const nextHour = getNextHour(slotTime);

                    if (type === 'maintenance') {
                      return (
                        <td
                          key={slotTime}
                          className="w-[75px] min-w-[75px] max-w-[75px] h-[58px] p-1 border-b border-r border-slate-200 bg-slate-100/80 text-center align-middle box-border"
                        >
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <Wrench className="w-3.5 h-3.5" />
                            <span className="text-[9px] uppercase font-semibold mt-0.5">Bảo trì</span>
                          </div>
                        </td>
                      );
                    }

                    if (type === 'in_use' && booking) {
                      return (
                        <td
                          key={slotTime}
                          onClick={() => setSelectedBookingSummary(booking)}
                          className="w-[75px] min-w-[75px] max-w-[75px] h-[58px] p-1 border-b border-r border-slate-200 bg-amber-100/90 hover:bg-amber-200 transition-colors cursor-pointer text-center align-middle box-border"
                          title={`Bấm để quản lý đơn: ${booking.customerName} (${booking.startTime}-${booking.endTime})`}
                        >
                          <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
                            <span className="text-[10px] font-bold text-amber-950 truncate block w-full text-center">
                              {booking.customerName}
                            </span>
                            <span className="text-[9px] text-amber-800 font-mono block mt-0.5 font-semibold">
                              Đang chơi
                            </span>
                          </div>
                        </td>
                      );
                    }

                    if (type === 'booked' && booking) {
                      return (
                        <td
                          key={slotTime}
                          onClick={() => setSelectedBookingSummary(booking)}
                          className="w-[75px] min-w-[75px] max-w-[75px] h-[58px] p-1 border-b border-r border-slate-200 bg-blue-100/80 hover:bg-blue-200 transition-colors cursor-pointer text-center align-middle box-border"
                          title={`Bấm để Check-in hoặc Đổi sân: ${booking.customerName} (${booking.startTime}-${booking.endTime})`}
                        >
                          <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
                            <span className="text-[10px] font-bold text-blue-950 truncate block w-full text-center">
                              {booking.customerName}
                            </span>
                            <span className="text-[9px] text-blue-800 font-mono block mt-0.5 font-semibold">
                              Đã cọc 30%
                            </span>
                          </div>
                        </td>
                      );
                    }

                    // Available cell -> Manager can click to book on behalf of customer!
                    return (
                      <td
                        key={slotTime}
                        onClick={() => setQuickBookingSlot({ court, startTime: slotTime, endTime: nextHour })}
                        className="w-[75px] min-w-[75px] max-w-[75px] h-[58px] p-1 border-b border-r border-slate-200 hover:bg-emerald-50 transition-colors cursor-pointer align-middle box-border"
                        title="Bấm để đặt sân hộ khách (có quyền sửa cọc thủ công)"
                      >
                        <button className="w-full h-full rounded border border-dashed border-emerald-300 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center text-[10px] font-semibold text-emerald-700 cursor-pointer">
                          + Đặt
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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
                {/* Xác nhận cọc hộ khách */}
                {selectedBookingSummary.paymentStatus === 'deposit_pending' && (
                  <button
                    onClick={() => {
                      const b = selectedBookingSummary;
                      setSelectedBookingSummary(null);
                      setBookingForDepositModal(b);
                    }}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Xác Nhận Đã Thu Cọc Tại Quầy ({formatVND(selectedBookingSummary.depositAmount)})</span>
                  </button>
                )}

                {selectedBookingSummary.checkInStatus === 'not_checked_in' && selectedBookingSummary.paymentStatus !== 'deposit_pending' && (
                  <button
                    onClick={() => {
                      const b = selectedBookingSummary;
                      setSelectedBookingSummary(null);
                      setBookingForCheckInModal(b);
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận Check-In & Nhận Sân (Không thu tiền)</span>
                  </button>
                )}

                {/* Check-Out & Tất toán số tiền còn lại */}
                {selectedBookingSummary.checkInStatus === 'checked_in' && (
                  <button
                    onClick={() => {
                      const b = selectedBookingSummary;
                      setSelectedBookingSummary(null);
                      setBookingForCollectModal(b);
                    }}
                    className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>
                      Check-Out & Tất Toán Tiền Sân {selectedBookingSummary.remainingAmount > 0 ? `(${formatVND(selectedBookingSummary.remainingAmount)})` : '(Đã thanh toán đủ)'}
                    </span>
                  </button>
                )}

                {/* View Audit Logs & Invoice */}
                <button
                  onClick={() => {
                    const b = selectedBookingSummary;
                    setSelectedBookingSummary(null);
                    setBookingForAuditModal(b);
                  }}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Xem Nhật Ký Kiểm Toán & Lịch Sử Giao Dịch</span>
                </button>

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

      {/* UC02: Collect Remaining Payment Modal */}
      {bookingForCollectModal && (
        <CollectPaymentModal
          booking={bookingForCollectModal}
          isOpen={!!bookingForCollectModal}
          onClose={() => setBookingForCollectModal(null)}
          onSuccess={(invoice) => {
            alert(`Đã thu thành công ${formatVND(invoice.remainingPaid)} và khóa hóa đơn ${invoice.invoiceId} vĩnh viễn (BR-03)!`);
            setBookingForCollectModal(null);
          }}
        />
      )}

      {/* UC01 A1: Manager Confirm Deposit Modal */}
      {bookingForDepositModal && (
        <ManagerConfirmDepositModal
          booking={bookingForDepositModal}
          isOpen={true}
          onClose={() => setBookingForDepositModal(null)}
          onSuccess={(updated) => {
            alert(`Đã xác nhận thu cọc thành công cho đơn ${updated.id}! Hệ thống đã gửi tin Zalo ZNS và ghi log BR-03.`);
            setBookingForDepositModal(null);
          }}
        />
      )}

      {/* Audit Logs Modal (BR-03) */}
      {bookingForAuditModal && (
        <BookingAuditLogsModal
          booking={bookingForAuditModal}
          isOpen={true}
          onClose={() => setBookingForAuditModal(null)}
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
