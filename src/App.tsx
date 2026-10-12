/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { CustomerHomeView } from './components/customer/CustomerHomeView';
import { AllCourtsScheduleView } from './components/customer/AllCourtsScheduleView';
import { MyBookingsHistory } from './components/customer/MyBookingsHistory';
import { PricingOverview } from './components/customer/PricingOverview';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { ManagerBookingsTable } from './components/manager/ManagerBookingsTable';
import { ManagerCourtsPricing } from './components/manager/ManagerCourtsPricing';
import { ManagerCustomers } from './components/manager/ManagerCustomers';
import { Phone, MapPin, Clock, ShieldCheck, Mail } from 'lucide-react';

const AppContent: React.FC = () => {
  const { role, settings } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('booking');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Customer Views */}
        {role === 'customer' && (
          <>
            {currentTab === 'booking' && (
              <CustomerHomeView
                onGoToHistory={() => setCurrentTab('history')}
                onGoToPricing={() => setCurrentTab('pricing')}
              />
            )}
            {currentTab === 'schedule' && <AllCourtsScheduleView />}
            {currentTab === 'history' && <MyBookingsHistory />}
            {currentTab === 'pricing' && <PricingOverview />}
          </>
        )}

        {/* Manager Views */}
        {role === 'manager' && (
          <>
            {currentTab === 'manager_dashboard' && <ManagerDashboard />}
            {currentTab === 'manager_bookings' && <ManagerBookingsTable />}
            {currentTab === 'manager_courts' && <ManagerCourtsPricing />}
            {currentTab === 'manager_customers' && <ManagerCustomers />}
          </>
        )}
      </main>

      {/* Footer */}
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
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
