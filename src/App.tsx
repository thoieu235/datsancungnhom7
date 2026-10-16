/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { ManagerSidebar } from './components/layout/ManagerSidebar';
import { CustomerHomeView } from './components/customer/CustomerHomeView';
import { AllCourtsScheduleView } from './components/customer/AllCourtsScheduleView';
import { MyBookingsHistory } from './components/customer/MyBookingsHistory';
import { PricingOverview } from './components/customer/PricingOverview';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { ManagerBookingsTable } from './components/manager/ManagerBookingsTable';
import { ManagerCourtsPricing } from './components/manager/ManagerCourtsPricing';
import { ManagerCustomers } from './components/manager/ManagerCustomers';
import { ManagerInvoicesAndTransactions } from './components/manager/ManagerInvoicesAndTransactions';
import { PaymentSuccessToast } from './components/common/PaymentSuccessToast';
import { WebInvoiceModal } from './components/common/WebInvoiceModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { Booking } from './types';
import { Phone, MapPin, Clock, ShieldCheck, UserCheck, PanelLeft, LogOut, LogIn } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    role,
    setRole,
    settings,
    bookings,
    paymentNotification,
    clearPaymentSuccess,
    currentUser,
    logout,
    openAuthModal,
    isAuthModalOpen
  } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('booking');
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  // Gemini-style collapsible sidebar state (persisted in localStorage)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('sportarena_sidebar_expanded');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => {
      const next = !prev;
      localStorage.setItem('sportarena_sidebar_expanded', String(next));
      return next;
    });
  };

  // Sync tab when role changes
  useEffect(() => {
    if (role === 'manager' && !currentTab.startsWith('manager_')) {
      setCurrentTab('manager_dashboard');
    } else if (role === 'customer' && currentTab.startsWith('manager_')) {
      setCurrentTab('booking');
    }
  }, [role]);

  const handleViewInvoice = (bookingId: string) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (targetBooking?.invoice) {
      setSelectedInvoiceBooking(targetBooking);
    } else if (role === 'customer') {
      setCurrentTab('history');
    } else {
      setCurrentTab('manager_bookings');
    }
  };

  // User Requirement: "sửa giao diện đăng nhập đăng kí thành 1 màn đừng dung pop up"
  // When in auth mode (first entry, login click, or logout), display the dedicated full-screen AuthScreen
  if (isAuthModalOpen) {
    return (
      <>
        {/* Global Payment Success Toast if needed */}
        <PaymentSuccessToast
          notification={paymentNotification}
          onClose={clearPaymentSuccess}
          onViewInvoice={handleViewInvoice}
        />
        <AuthScreen />
      </>
    );
  }

  return (
    <>
      {/* Global Payment Success Toast (shown on all deposit & checkout payments) */}
      <PaymentSuccessToast
        notification={paymentNotification}
        onClose={clearPaymentSuccess}
        onViewInvoice={handleViewInvoice}
      />

      {/* Global Web Invoice Modal viewable from toast or actions */}
      {selectedInvoiceBooking?.invoice && (
        <WebInvoiceModal
          invoice={selectedInvoiceBooking.invoice}
          booking={selectedInvoiceBooking}
          isOpen={true}
          onClose={() => setSelectedInvoiceBooking(null)}
        />
      )}

      {/* MANAGER INTERFACE: DEDICATED COLLAPSIBLE SIDEBAR LAYOUT (GEMINI STYLE) */}
      {role === 'manager' ? (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
          {/* Pinned Left Sidebar */}
          <ManagerSidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            isExpanded={isSidebarExpanded}
            onToggleExpand={toggleSidebar}
          />

          {/* Right Main Content Area (dynamic padding: pl-64 when open, pl-[72px] when closed) */}
          <div
            className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
              isSidebarExpanded ? 'pl-64' : 'pl-[72px]'
            }`}
          >
            {/* Top Header for Manager */}
            <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title={isSidebarExpanded ? 'Thu gọn thanh bên' : 'Mở rộng thanh bên'}
                >
                  <PanelLeft className="w-5 h-5 text-slate-600" />
                </button>

                <span className="font-bold text-sm text-slate-900">
                  {currentTab === 'manager_dashboard' && 'Sơ Đồ Sân'}
                  {currentTab === 'manager_bookings' && 'Danh Sách Đơn'}
                  {currentTab === 'manager_invoices' && 'Hóa Đơn & Lịch Sử Giao Dịch'}
                  {currentTab === 'manager_courts' && 'Quản Lý Sân'}
                  {currentTab === 'manager_customers' && 'Quản Lý Khách Hàng'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Cụm 14 Sân Thể Thao SportArena
                </span>
              </div>

              <div className="flex items-center gap-3">
                {currentUser ? (
                  <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-xl text-xs">
                    <span className="text-xs">👑</span>
                    <span className="font-bold text-slate-900 hidden sm:inline">{currentUser.name}</span>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="text-slate-400 hover:text-rose-600 p-0.5 ml-1 transition-colors cursor-pointer"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Đăng nhập</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setRole('customer');
                    setCurrentTab('booking');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xem giao diện khách</span>
                </button>
              </div>
            </header>

            {/* Main Manager Viewport */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {currentTab === 'manager_dashboard' && <ManagerDashboard />}
              {currentTab === 'manager_bookings' && <ManagerBookingsTable />}
              {currentTab === 'manager_invoices' && <ManagerInvoicesAndTransactions />}
              {currentTab === 'manager_courts' && <ManagerCourtsPricing />}
              {currentTab === 'manager_customers' && <ManagerCustomers />}
            </main>
          </div>
        </div>
      ) : (
        /* CUSTOMER INTERFACE: CLEAN TOP NAVIGATION */
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
          {/* Top Navigation */}
          <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

          {/* Main Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {currentTab === 'booking' && (
              <CustomerHomeView
                onGoToHistory={() => setCurrentTab('history')}
                onGoToPricing={() => setCurrentTab('pricing')}
              />
            )}
            {currentTab === 'schedule' && <AllCourtsScheduleView />}
            {currentTab === 'history' && <MyBookingsHistory />}
            {currentTab === 'pricing' && <PricingOverview />}
          </main>

          {/* Customer Footer */}
          <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
                <span className="font-bold text-slate-900 text-sm">
                  SportArena Complex
                </span>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{settings.address}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hotline Đổi Sân: <strong className="font-mono">{settings.hotline}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mở cửa: {settings.openTime} - {settings.closeTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cọc 30% VietQR Tự Động</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
