import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, UserCheck, RefreshCw, LogIn, LogOut, User } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { role, setRole, resetAllData, currentUser, openAuthModal, logout } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Logo & Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('booking')}
              className="text-left group cursor-pointer focus:outline-none flex items-center gap-2"
            >
              <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-base shadow-xs group-hover:bg-emerald-700 transition-colors">
                S
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                SportArena
              </span>
            </button>
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 border-l border-slate-200 pl-3">
              <span>6 Sân bóng</span>
              <span>·</span>
              <span>4 Cầu lông</span>
              <span>·</span>
              <span>4 Pickleball</span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Natural, Concise Names) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setCurrentTab('booking')}
              className={`whitespace-nowrap transition-colors cursor-pointer ${
                currentTab === 'booking' ? 'text-emerald-700 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Đặt sân
            </button>
            <button
              onClick={() => setCurrentTab('schedule')}
              className={`whitespace-nowrap transition-colors cursor-pointer ${
                currentTab === 'schedule' ? 'text-emerald-700 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Lịch sân
            </button>
            <button
              onClick={() => setCurrentTab('history')}
              className={`whitespace-nowrap transition-colors cursor-pointer ${
                currentTab === 'history' ? 'text-emerald-700 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Lịch sử đặt
            </button>
            <button
              onClick={() => setCurrentTab('pricing')}
              className={`whitespace-nowrap transition-colors cursor-pointer ${
                currentTab === 'pricing' ? 'text-emerald-700 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Bảng giá
            </button>
          </nav>

          {/* Zone 3: Auth & Role Switcher & Reset */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* User Account / Auth Status */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-xl text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left max-w-[120px] truncate">
                  <span className="font-bold text-slate-900 block truncate leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block truncate">
                    {currentUser.phone}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Bạn có chắc chắn muốn đăng xuất khỏi tài khoản ${currentUser.name}?`)) {
                      logout();
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập / Đăng ký</span>
              </button>
            )}

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  setRole('customer');
                  setCurrentTab('booking');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  role === 'customer'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Giao diện khách hàng"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Khách</span>
              </button>
              <button
                onClick={() => {
                  setRole('manager');
                  setCurrentTab('manager_dashboard');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  role === 'manager'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Giao diện quản lý sân"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chủ sân</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (confirm('Khôi phục lại dữ liệu mẫu 14 sân ban đầu?')) {
                  resetAllData();
                }
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Đặt lại dữ liệu mẫu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
