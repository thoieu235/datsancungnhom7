import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, BookingInvoice, BookingAuditLog, PaymentMethod } from '../../types';
import { formatVND, formatDateVN, getSportDetails } from '../../utils/formatters';
import { WebInvoiceModal } from '../common/WebInvoiceModal';
import { BookingAuditLogsModal } from './BookingAuditLogsModal';
import {
  FileText,
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  Search,
  Filter,
  Calendar,
  Clock,
  Printer,
  Download,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
  User,
  Phone,
  Eye,
  RefreshCw
} from 'lucide-react';

interface FlatTransaction {
  id: string;
  timestamp: string;
  bookingId: string;
  booking: Booking;
  action: BookingAuditLog['action'];
  actionLabel: string;
  actionType: 'deposit' | 'settlement' | 'other';
  actorName: string;
  actorRole: string;
  amount: number;
  paymentMethod: string;
  note: string;
}

export const ManagerInvoicesAndTransactions: React.FC = () => {
  const { bookings } = useApp();

  const [activeTab, setActiveTab] = useState<'invoices' | 'transactions'>('invoices');

  // Search & Filter state for Invoices
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceDateFilter, setInvoiceDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');
  const [invoiceMethodFilter, setInvoiceMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [invoiceSportFilter, setInvoiceSportFilter] = useState<string>('all');

  // Search & Filter state for Transactions
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'deposit' | 'settlement'>('all');
  const [txMethodFilter, setTxMethodFilter] = useState<'all' | 'vietqr' | 'cash'>('all');

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<{ invoice: BookingInvoice; booking?: Booking } | null>(null);
  const [selectedBookingForAudit, setSelectedBookingForAudit] = useState<Booking | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 1. Gather all issued invoices from bookings
  const allInvoices = useMemo(() => {
    const list: { invoice: BookingInvoice; booking: Booking }[] = [];
    bookings.forEach(b => {
      if (b.invoice) {
        list.push({ invoice: b.invoice, booking: b });
      }
    });
    // Sort newest issuedAt first
    return list.sort((a, b) => new Date(b.invoice.issuedAt).getTime() - new Date(a.invoice.issuedAt).getTime());
  }, [bookings]);

  // 2. Gather all payment transactions from audit logs + bookings
  const allTransactions: FlatTransaction[] = useMemo(() => {
    const list: FlatTransaction[] = [];

    bookings.forEach(b => {
      // From booking audit logs
      if (b.auditLogs && b.auditLogs.length > 0) {
        b.auditLogs.forEach(log => {
          if (
            log.action === 'deposit_customer_paid' ||
            log.action === 'deposit_manager_confirmed' ||
            log.action === 'final_payment_paid'
          ) {
            let actionLabel = 'Thu tiền cọc';
            let actionType: 'deposit' | 'settlement' | 'other' = 'deposit';

            if (log.action === 'final_payment_paid') {
              actionLabel = 'Tất toán khi Check-out';
              actionType = 'settlement';
            } else if (log.action === 'deposit_manager_confirmed') {
              actionLabel = 'Thu cọc tại quầy';
              actionType = 'deposit';
            } else if (log.action === 'deposit_customer_paid') {
              actionLabel = 'Khách cọc trực tuyến (VietQR)';
              actionType = 'deposit';
            }

            list.push({
              id: log.id,
              timestamp: log.timestamp,
              bookingId: b.id,
              booking: b,
              action: log.action,
              actionLabel,
              actionType,
              actorName: log.actorName,
              actorRole: log.actorRole === 'manager' ? 'Chủ sân / Lễ tân' : log.actorRole === 'customer' ? 'Khách hàng' : 'Hệ thống',
              amount: log.amount || (actionType === 'deposit' ? b.depositAmount : b.remainingAmount),
              paymentMethod: log.paymentMethod || (b.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản VietQR'),
              note: log.note || ''
            });
          }
        });
      } else {
        // Fallback if audit logs weren't initialized for older deposited bookings
        if (b.paymentStatus === 'deposited' || b.paymentStatus === 'fully_paid') {
          list.push({
            id: `tx-dep-${b.id}`,
            timestamp: b.depositPaidAt || b.createdAt,
            bookingId: b.id,
            booking: b,
            action: 'deposit_customer_paid',
            actionLabel: 'Thu tiền cọc',
            actionType: 'deposit',
            actorName: b.customerName,
            actorRole: 'Khách hàng',
            amount: b.depositAmount,
            paymentMethod: b.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản VietQR',
            note: 'Thanh toán tiền cọc giữ sân'
          });
        }
      }
    });

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [bookings]);

  // 3. Financial Metrics Calculations
  const metrics = useMemo(() => {
    let totalCollected = 0;
    let vietqrTotal = 0;
    let cashTotal = 0;

    allTransactions.forEach(tx => {
      totalCollected += tx.amount;
      const m = tx.paymentMethod.toLowerCase();
      if (m.includes('vietqr') || m.includes('chuyển') || m.includes('bank')) {
        vietqrTotal += tx.amount;
      } else {
        cashTotal += tx.amount;
      }
    });

    return {
      totalRevenue: totalCollected,
      vietqrRevenue: vietqrTotal,
      cashRevenue: cashTotal,
      totalInvoicesCount: allInvoices.length,
      totalTransactionsCount: allTransactions.length
    };
  }, [allTransactions, allInvoices]);

  // 4. Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(({ invoice, booking }) => {
      // Search
      if (invoiceSearch.trim()) {
        const q = invoiceSearch.trim().toLowerCase();
        const matchInvoiceId = invoice.invoiceId.toLowerCase().includes(q);
        const matchBookingId = invoice.bookingId.toLowerCase().includes(q);
        const matchCustName = booking.customerName.toLowerCase().includes(q);
        const matchCustPhone = booking.customerPhone.includes(q);
        const matchCourt = booking.courtName.toLowerCase().includes(q);
        if (!matchInvoiceId && !matchBookingId && !matchCustName && !matchCustPhone && !matchCourt) {
          return false;
        }
      }

      // Date Filter
      if (invoiceDateFilter === 'today') {
        if (!invoice.issuedAt.startsWith(todayStr)) return false;
      } else if (invoiceDateFilter === 'yesterday') {
        if (!invoice.issuedAt.startsWith(yesterdayStr)) return false;
      } else if (invoiceDateFilter === 'week') {
        if (new Date(invoice.issuedAt) < sevenDaysAgo) return false;
      }

      // Payment method
      if (invoiceMethodFilter !== 'all') {
        if (invoice.paymentMethod !== invoiceMethodFilter) return false;
      }

      // Sport
      if (invoiceSportFilter !== 'all') {
        if (booking.sport !== invoiceSportFilter) return false;
      }

      return true;
    });
  }, [allInvoices, invoiceSearch, invoiceDateFilter, invoiceMethodFilter, invoiceSportFilter, todayStr, yesterdayStr, sevenDaysAgo]);

  // 5. Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(tx => {
      // Search
      if (txSearch.trim()) {
        const q = txSearch.trim().toLowerCase();
        const matchId = tx.id.toLowerCase().includes(q);
        const matchBookingId = tx.bookingId.toLowerCase().includes(q);
        const matchCustName = tx.booking.customerName.toLowerCase().includes(q);
        const matchCustPhone = tx.booking.customerPhone.includes(q);
        const matchCourt = tx.booking.courtName.toLowerCase().includes(q);
        const matchNote = tx.note.toLowerCase().includes(q);
        if (!matchId && !matchBookingId && !matchCustName && !matchCustPhone && !matchCourt && !matchNote) {
          return false;
        }
      }

      // Type filter
      if (txTypeFilter !== 'all') {
        if (tx.actionType !== txTypeFilter) return false;
      }

      // Method filter
      if (txMethodFilter !== 'all') {
        const m = tx.paymentMethod.toLowerCase();
        if (txMethodFilter === 'vietqr' && !m.includes('vietqr') && !m.includes('chuyển') && !m.includes('bank')) {
          return false;
        }
        if (txMethodFilter === 'cash' && !m.includes('tiền mặt') && !m.includes('cash')) {
          return false;
        }
      }

      return true;
    });
  }, [allTransactions, txSearch, txTypeFilter, txMethodFilter]);

  // Export CSV handler
  const handleExportCSV = () => {
    if (activeTab === 'invoices') {
      const headers = ['Mã Hóa Đơn', 'Mã Đơn Đặt', 'Ngày Giờ Xuất', 'Khách Hàng', 'Số Điện Thoại', 'Sân Thể Thao', 'Môn', 'Tiền Sân', 'Tiền Cọc Trừ', 'Đã Tất Toán', 'Tổng Thu', 'Hình Thức', 'Người Thu', 'Trạng Thái'];
      const rows = filteredInvoices.map(({ invoice, booking }) => [
        invoice.invoiceId,
        invoice.bookingId,
        new Date(invoice.issuedAt).toLocaleString('vi-VN'),
        `"${booking.customerName}"`,
        booking.customerPhone,
        `"${booking.courtName}"`,
        booking.sport,
        invoice.courtFee,
        invoice.depositPaid,
        invoice.remainingPaid,
        invoice.totalCollected,
        invoice.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản VietQR',
        `"${invoice.collectedBy}"`,
        invoice.status
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `danh_sach_hoa_don_${todayStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Mã Giao Dịch', 'Ngày Giờ', 'Loại Giao Dịch', 'Mã Đơn', 'Sân', 'Khách Hàng', 'Số Điện Thoại', 'Số Tiền (VND)', 'Hình Thức', 'Người Thực Hiện', 'Ghi Chú'];
      const rows = filteredTransactions.map(tx => [
        tx.id,
        new Date(tx.timestamp).toLocaleString('vi-VN'),
        `"${tx.actionLabel}"`,
        tx.bookingId,
        `"${tx.booking.courtName}"`,
        `"${tx.booking.customerName}"`,
        tx.booking.customerPhone,
        tx.amount,
        `"${tx.paymentMethod}"`,
        `"${tx.actorName} (${tx.actorRole})"`,
        `"${tx.note.replace(/"/g, '""')}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `lich_su_giao_dich_${todayStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Page Title */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                Hóa Đơn & Lịch Sử Giao Dịch
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sổ cái tài chính, tra cứu hóa đơn điện tử Web Invoice và đối soát lịch sử dòng tiền thanh toán cho Chủ Sân
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            title="Tải tệp bảng tính CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Xuất file Excel / CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            title="In trang sổ cái"
          >
            <Printer className="w-4 h-4" />
            <span>In Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng doanh thu thực thu */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Tổng Thực Thu (Cọc + Tất toán)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-emerald-700">
            {formatVND(metrics.totalRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-800">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{metrics.totalTransactionsCount} lượt giao dịch đã ghi nhận</span>
          </div>
        </div>

        {/* Card 2: Chuyển khoản VietQR */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Thu Qua Chuyển Khoản VietQR</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-blue-700">
            {formatVND(metrics.vietqrRevenue)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Chiếm {metrics.totalRevenue > 0 ? Math.round((metrics.vietqrRevenue / metrics.totalRevenue) * 100) : 0}% tổng dòng tiền
          </div>
        </div>

        {/* Card 3: Tiền mặt tại quầy */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Thu Tiền Mặt Tại Quầy</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-amber-800">
            {formatVND(metrics.cashRevenue)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Chiếm {metrics.totalRevenue > 0 ? Math.round((metrics.cashRevenue / metrics.totalRevenue) * 100) : 0}% tổng dòng tiền
          </div>
        </div>

        {/* Card 4: Tổng số hóa đơn */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Hóa Đơn Đã Khóa (Paid)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-purple-900">
            {metrics.totalInvoicesCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-purple-800 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã khóa bất biến · Chuẩn kế toán</span>
          </div>
        </div>
      </div>

      {/* Main Container with Tab Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 pt-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'invoices'
                  ? 'border-emerald-600 text-emerald-800 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Danh Sách Hóa Đơn Điện Tử ({filteredInvoices.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'transactions'
                  ? 'border-emerald-600 text-emerald-800 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Lịch Sử Giao Dịch Dòng Tiền ({filteredTransactions.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: INVOICES LEDGER */}
        {activeTab === 'invoices' && (
          <div className="p-6 space-y-4">
            {/* Filter Bar for Invoices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo mã HĐ, mã đơn, khách, SĐT..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>

              {/* Date Filter */}
              <div>
                <select
                  value={invoiceDateFilter}
                  onChange={(e) => setInvoiceDateFilter(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="all">Thời gian: Tất cả</option>
                  <option value="today">Hôm nay ({formatDateVN(todayStr)})</option>
                  <option value="yesterday">Hôm qua</option>
                  <option value="week">7 ngày gần nhất</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <select
                  value={invoiceMethodFilter}
                  onChange={(e) => setInvoiceMethodFilter(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="all">Phương thức: Tất cả</option>
                  <option value="vietqr">Chuyển khoản VietQR</option>
                  <option value="cash">Tiền mặt tại quầy</option>
                </select>
              </div>

              {/* Sport Filter */}
              <div>
                <select
                  value={invoiceSportFilter}
                  onChange={(e) => setInvoiceSportFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="all">Môn: Tất cả</option>
                  <option value="football">⚽ Bóng đá</option>
                  <option value="badminton">🏸 Cầu lông</option>
                  <option value="pickleball">🎾 Pickleball</option>
                </select>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Mã Hóa Đơn</th>
                    <th className="p-3">Mã Đơn / Thời Gian</th>
                    <th className="p-3">Khách Hàng (SĐT)</th>
                    <th className="p-3">Sân / Môn</th>
                    <th className="p-3 text-right">Tiền Sân</th>
                    <th className="p-3 text-right">Tiền Cọc Đã Trừ</th>
                    <th className="p-3 text-right">Tất Toán Thu Quầy</th>
                    <th className="p-3 text-right">Tổng Hóa Đơn</th>
                    <th className="p-3 text-center">Hình Thức</th>
                    <th className="p-3 text-center">Người Thu</th>
                    <th className="p-3 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-400">
                        Chưa có hóa đơn nào phù hợp với bộ lọc tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map(({ invoice, booking }) => {
                      const sportMeta = getSportDetails(booking.sport);
                      return (
                        <tr key={invoice.invoiceId} className="hover:bg-slate-50/70 transition-colors">
                          {/* Mã HĐ */}
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {invoice.invoiceId}
                              </span>
                              <span title="Hóa đơn đã khóa">
                                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                              Đã thanh toán (Paid)
                            </span>
                          </td>

                          {/* Mã Đơn & Ngày Giờ */}
                          <td className="p-3">
                            <span className="font-mono font-bold text-slate-800 block">{invoice.bookingId}</span>
                            <span className="text-[11px] text-slate-500 block">
                              {new Date(invoice.issuedAt).toLocaleString('vi-VN')}
                            </span>
                          </td>

                          {/* Khách hàng */}
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{booking.customerName}</div>
                            <div className="font-mono text-emerald-700 text-[11px] font-semibold">{booking.customerPhone}</div>
                          </td>

                          {/* Sân & Môn */}
                          <td className="p-3">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${sportMeta.bgLight} mb-0.5`}>
                              {sportMeta.label}
                            </span>
                            <div className="text-slate-800 font-semibold truncate max-w-[140px]" title={booking.courtName}>
                              {booking.courtName}
                            </div>
                          </td>

                          {/* Tiền sân */}
                          <td className="p-3 text-right font-mono text-slate-600">
                            {formatVND(invoice.courtFee)}
                          </td>

                          {/* Tiền cọc đã cấn trừ */}
                          <td className="p-3 text-right font-mono text-emerald-700 font-semibold">
                            -{formatVND(invoice.depositPaid)}
                          </td>

                          {/* Tiền tất toán thu tại quầy */}
                          <td className="p-3 text-right font-mono font-bold text-amber-900">
                            {formatVND(invoice.remainingPaid)}
                          </td>

                          {/* Tổng HĐ */}
                          <td className="p-3 text-right font-mono font-bold text-slate-900 text-xs">
                            {formatVND(invoice.totalCollected)}
                          </td>

                          {/* Hình thức */}
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              invoice.paymentMethod === 'cash'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {invoice.paymentMethod === 'cash' ? (
                                <>
                                  <Banknote className="w-3 h-3 text-amber-700" />
                                  <span>Tiền mặt</span>
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-3 h-3 text-blue-700" />
                                  <span>VietQR</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Người thu */}
                          <td className="p-3 text-center text-slate-600 text-[11px]">
                            {invoice.collectedBy || 'Quản lý sân'}
                          </td>

                          {/* Thao tác */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice({ invoice, booking })}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Xem hóa đơn dạng Web"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Xem HĐ</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTIONS & CASH FLOW AUDIT */}
        {activeTab === 'transactions' && (
          <div className="p-6 space-y-4">
            {/* Filter Bar for Transactions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo mã GD, mã đơn, khách, SĐT, ghi chú..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={txTypeFilter}
                  onChange={(e) => setTxTypeFilter(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="all">Loại giao dịch: Tất cả</option>
                  <option value="deposit">Thu tiền cọc (Khách chuyển / Thu quầy)</option>
                  <option value="settlement">Tất toán khi Check-out</option>
                </select>
              </div>

              {/* Method Filter */}
              <div>
                <select
                  value={txMethodFilter}
                  onChange={(e) => setTxMethodFilter(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="all">Phương thức: Tất cả</option>
                  <option value="vietqr">Chuyển khoản VietQR</option>
                  <option value="cash">Tiền mặt tại quầy</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Thời Gian / Mã GD</th>
                    <th className="p-3">Loại Giao Dịch</th>
                    <th className="p-3">Mã Đơn & Sân</th>
                    <th className="p-3">Khách Hàng (SĐT)</th>
                    <th className="p-3 text-right">Số Tiền Thực Thu</th>
                    <th className="p-3 text-center">Phương Thức</th>
                    <th className="p-3">Người Xác Nhận</th>
                    <th className="p-3">Ghi Chú Giao Dịch</th>
                    <th className="p-3 text-center">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        Chưa có giao dịch thu tiền nào phù hợp với bộ lọc tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Time & Code */}
                        <td className="p-3">
                          <span className="font-mono text-slate-800 font-bold block text-[11px]">
                            {new Date(tx.timestamp).toLocaleString('vi-VN')}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[120px]">
                            {tx.id}
                          </span>
                        </td>

                        {/* Action Label */}
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tx.actionType === 'deposit'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${tx.actionType === 'deposit' ? 'bg-blue-600' : 'bg-emerald-600'}`}></span>
                            <span>{tx.actionLabel}</span>
                          </span>
                        </td>

                        {/* Booking & Court */}
                        <td className="p-3">
                          <span className="font-mono font-bold text-slate-900 block">{tx.bookingId}</span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[150px]" title={tx.booking.courtName}>
                            {tx.booking.courtName}
                          </span>
                        </td>

                        {/* Khách hàng */}
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{tx.booking.customerName}</div>
                          <div className="font-mono text-emerald-700 text-[11px] font-semibold">{tx.booking.customerPhone}</div>
                        </td>

                        {/* Amount */}
                        <td className="p-3 text-right">
                          <div className="font-mono font-black text-emerald-700 text-sm">
                            +{formatVND(tx.amount)}
                          </div>
                        </td>

                        {/* Method */}
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.paymentMethod.toLowerCase().includes('tiền mặt') || tx.paymentMethod.toLowerCase().includes('cash')
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {tx.paymentMethod.toLowerCase().includes('tiền mặt') || tx.paymentMethod.toLowerCase().includes('cash') ? (
                              <>
                                <Banknote className="w-3 h-3 text-amber-700" />
                                <span>Tiền mặt</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3 h-3 text-blue-700" />
                                <span>VietQR</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Người xác nhận */}
                        <td className="p-3">
                          <div className="text-slate-800 font-semibold">{tx.actorName}</div>
                          <div className="text-[10px] text-slate-400">{tx.actorRole}</div>
                        </td>

                        {/* Ghi chú */}
                        <td className="p-3 text-[11px] text-slate-600 max-w-[200px]">
                          <p className="truncate" title={tx.note}>{tx.note || 'Không có ghi chú'}</p>
                        </td>

                        {/* Chi tiết */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedBookingForAudit(tx.booking)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Xem nhật ký kiểm toán đơn"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Web Invoice Modal Popup */}
      {selectedInvoice && (
        <WebInvoiceModal
          isOpen={true}
          invoice={selectedInvoice.invoice}
          booking={selectedInvoice.booking}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Booking Audit Logs Modal Popup */}
      {selectedBookingForAudit && (
        <BookingAuditLogsModal
          isOpen={true}
          booking={selectedBookingForAudit}
          onClose={() => setSelectedBookingForAudit(null)}
        />
      )}
    </div>
  );
};
