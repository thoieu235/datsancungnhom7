import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerProfile, Booking } from '../../types';
import { formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import { ChangeCourtModal } from './ChangeCourtModal';
import { CheckInModal } from './CheckInModal';
import {
  Search,
  Crown,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Clock,
  History,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  User
} from 'lucide-react';

export const ManagerCustomers: React.FC = () => {
  const { customers, bookings, cancelBooking, checkOutBooking } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [vipOnly, setVipOnly] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Modals for actions from customer history
  const [selectedBookingForChange, setSelectedBookingForChange] = useState<Booking | null>(null);
  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<Booking | null>(null);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (vipOnly && !c.isVip) return false;

    return true;
  });

  // Get bookings for selected customer
  const customerBookings = selectedCustomer
    ? bookings.filter(b => b.customerPhone === selectedCustomer.phone)
    : [];

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Quản Lý Khách Hàng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách khách, lịch sử đặt sân và ghi chú liên hệ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 w-56"
            />
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer bg-slate-100 px-3 py-2 rounded-xl">
            <input
              type="checkbox"
              checked={vipOnly}
              onChange={(e) => setVipOnly(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <span>Khách VIP</span>
          </label>
        </div>
      </div>

      {/* Customers Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(cust => {
          const custBookingsCount = bookings.filter(b => b.customerPhone === cust.phone).length;
          return (
            <div
              key={cust.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-sm">
                      {cust.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{cust.name}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{cust.phone}</span>
                      </div>
                    </div>
                  </div>

                  {cust.isVip && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      <Crown className="w-3 h-3 text-amber-600" />
                      <span>VIP</span>
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">Đã đặt:</span>
                    <div className="font-bold font-mono text-slate-900 text-sm">{custBookingsCount} lượt</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Tổng chi:</span>
                    <div className="font-bold font-mono text-emerald-700 text-sm">{formatVND(cust.totalSpent)}</div>
                  </div>
                </div>

                {/* Notes */}
                {cust.notes && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                    <span className="font-semibold text-slate-700 text-[11px] block mb-0.5">Ghi chú:</span>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{cust.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
                <a
                  href={`tel:${cust.phone}`}
                  className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cust.phone}</span>
                </a>

                {/* Key user request: Xem lịch sử đặt sân trực tiếp cho chủ sân */}
                <button
                  onClick={() => setSelectedCustomer(cust)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Lịch sử đặt sân</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Customer Booking History for Court Owner */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{selectedCustomer.name}</h3>
                    {selectedCustomer.isVip && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    SĐT: {selectedCustomer.phone} {selectedCustomer.email ? `· ${selectedCustomer.email}` : ''}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Summary Bar */}
            <div className="px-6 py-3 bg-slate-100/60 border-b border-slate-200 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Tổng lượt đặt:</span>
                <div className="font-bold font-mono text-slate-900 text-sm mt-0.5">{customerBookings.length} lượt</div>
              </div>
              <div>
                <span className="text-slate-500">Tổng tiền tích lũy:</span>
                <div className="font-bold font-mono text-emerald-700 text-sm mt-0.5">
                  {formatVND(customerBookings.reduce((sum, b) => sum + (b.paymentStatus !== 'cancelled' ? b.totalAmount : 0), 0))}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Đơn chờ nhận sân:</span>
                <div className="font-bold font-mono text-amber-700 text-sm mt-0.5">
                  {customerBookings.filter(b => b.checkInStatus === 'not_checked_in' && b.paymentStatus !== 'cancelled').length} đơn
                </div>
              </div>
            </div>

            {/* Bookings List Area */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Danh Sách Các Ca Đặt Sân ({customerBookings.length})
              </h4>

              {customerBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Khách hàng này chưa có đơn đặt sân nào trên hệ thống.
                </div>
              ) : (
                customerBookings.map(b => {
                  const sportMeta = getSportDetails(b.sport);
                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {b.id}
                          </span>
                          <span className="font-semibold text-slate-700">{b.courtName}</span>
                          <span className="text-slate-400">· {sportMeta.label}</span>
                        </div>

                        {/* Status badge */}
                        <div>
                          {b.paymentStatus === 'cancelled' ? (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              Đã hủy
                            </span>
                          ) : b.checkInStatus === 'checked_in' ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Đang chơi
                            </span>
                          ) : b.checkInStatus === 'checked_out' ? (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Đã hoàn tất
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Đã cọc {b.depositRate}% · Chờ nhận sân
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="flex flex-wrap items-center justify-between text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDateVN(b.date)}</span>
                          <span className="font-mono text-emerald-800 font-bold ml-1">
                            {b.startTime} - {b.endTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span>Tổng: <strong className="font-mono text-slate-900">{formatVND(b.totalAmount)}</strong></span>
                          <span>Đã cọc: <strong className="font-mono text-emerald-700">{formatVND(b.depositAmount)}</strong></span>
                          {b.remainingAmount > 0 && b.paymentStatus !== 'cancelled' && (
                            <span>Còn lại: <strong className="font-mono text-amber-700">{formatVND(b.remainingAmount)}</strong></span>
                          )}
                        </div>
                      </div>

                      {b.note && (
                        <div className="text-[11px] text-slate-500 italic">
                          Ghi chú: {b.note}
                        </div>
                      )}

                      {/* Direct manager actions on this customer's booking */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        {b.checkInStatus === 'not_checked_in' && b.paymentStatus !== 'cancelled' && (
                          <button
                            onClick={() => setSelectedBookingForCheckIn(b)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Check-in & Thu tiền
                          </button>
                        )}

                        {b.checkInStatus === 'checked_in' && (
                          <button
                            onClick={() => {
                              if (confirm(`Xác nhận hoàn tất ca thi đấu cho đơn ${b.id}?`)) {
                                checkOutBooking(b.id);
                              }
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Trả sân
                          </button>
                        )}

                        {b.paymentStatus !== 'cancelled' && b.checkInStatus !== 'checked_out' && (
                          <button
                            onClick={() => setSelectedBookingForChange(b)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Đổi sân / Dời giờ
                          </button>
                        )}

                        {b.paymentStatus !== 'cancelled' && (
                          <button
                            onClick={() => {
                              const reason = prompt(`Nhập lý do khách yêu cầu hủy đơn ${b.id}:`);
                              if (reason !== null) {
                                cancelBooking(b.id, reason);
                              }
                            }}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Court Modal */}
      {selectedBookingForChange && (
        <ChangeCourtModal
          booking={selectedBookingForChange}
          onClose={() => setSelectedBookingForChange(null)}
          onSuccess={() => setSelectedBookingForChange(null)}
        />
      )}

      {/* Check In Modal */}
      {selectedBookingForCheckIn && (
        <CheckInModal
          booking={selectedBookingForCheckIn}
          onClose={() => setSelectedBookingForCheckIn(null)}
          onSuccess={() => setSelectedBookingForCheckIn(null)}
        />
      )}
    </div>
  );
};
