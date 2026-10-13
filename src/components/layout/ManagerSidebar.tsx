import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  ClipboardList,
  Layers,
  Users,
  UserCheck,
  RefreshCw,
  Phone,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';

interface ManagerSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ManagerSidebar: React.FC<ManagerSidebarProps> = ({
  currentTab,
  setCurrentTab,
  isExpanded,
  onToggleExpand
}) => {
  const { setRole, settings, resetAllData } = useApp();

  const navItems = [
    {
      id: 'manager_dashboard',
      label: 'Sơ đồ sân',
      icon: Calendar,
      desc: 'Ma trận giờ & check-in'
    },
    {
      id: 'manager_bookings',
      label: 'Danh sách đơn',
      icon: ClipboardList,
      desc: 'Đổi sân & quản lý cọc'
    },
    {
      id: 'manager_courts',
      label: 'Quản lý sân',
      icon: Layers,
      desc: 'Thêm sân, bảng giá, bảo trì'
    },
    {
      id: 'manager_customers',
      label: 'Quản lý khách hàng',
      icon: Users,
      desc: 'Định danh theo SĐT & lịch sử'
    }
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-[72px]'
      }`}
    >
      {/* Top Header Zone */}
      <div>
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between h-16">
          {/* Logo & Title (shown when expanded) */}
          <div
            className={`flex items-center gap-2.5 overflow-hidden transition-all duration-200 ${
              isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 pointer-events-none'
            }`}
          >
            <span className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-xs">
              S
            </span>
            <div className="truncate">
              <h1 className="font-bold text-white text-sm leading-tight tracking-tight truncate">
                SportArena
              </h1>
              <span className="text-[10px] text-emerald-400 font-medium block truncate">
                Chủ Sân Quản Trị
              </span>
            </div>
          </div>

          {/* Toggle Hamburger / Panel Button (Gemini-style) */}
          <button
            type="button"
            onClick={onToggleExpand}
            className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer ${
              !isExpanded ? 'mx-auto' : ''
            }`}
            title={isExpanded ? 'Thu gọn thanh bên (Sidebar)' : 'Mở rộng thanh bên (Sidebar)'}
          >
            {isExpanded ? (
              <PanelLeftClose className="w-5 h-5 text-slate-300" />
            ) : (
              <PanelLeft className="w-5 h-5 text-slate-300" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-2.5 space-y-1.5">
          {isExpanded && (
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Menu Quản Lý
            </div>
          )}

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                title={item.label}
                className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                  isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-3'
                } ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {isExpanded && (
                  <div className="truncate">
                    <span className="block leading-tight truncate">{item.label}</span>
                    <span
                      className={`text-[10px] block font-normal mt-0.5 truncate ${
                        isActive ? 'text-emerald-100' : 'text-slate-500'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Zone */}
      <div className="p-2.5 border-t border-slate-800 space-y-2 bg-slate-950/40 text-xs">
        {/* Hotline info (only when expanded) */}
        {isExpanded && (
          <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-800/80 text-[11px] space-y-0.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Hotline:</span>
            </div>
            <strong className="font-mono text-emerald-300 block">{settings.hotline}</strong>
          </div>
        )}

        {/* Switch to customer view */}
        <button
          onClick={() => {
            setRole('customer');
            setCurrentTab('booking');
          }}
          title="Chuyển sang giao diện Khách hàng"
          className={`w-full flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer ${
            isExpanded ? 'gap-2 py-2 px-3' : 'p-2.5'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          {isExpanded && <span className="truncate">Giao diện khách</span>}
        </button>

        {/* Reset demo data */}
        <button
          onClick={() => {
            if (confirm('Khôi phục lại dữ liệu mẫu 14 sân ban đầu?')) {
              resetAllData();
            }
          }}
          title="Đặt lại dữ liệu mẫu 14 sân"
          className={`w-full flex items-center justify-center text-slate-500 hover:text-slate-300 text-[11px] transition-colors cursor-pointer ${
            isExpanded ? 'gap-1.5 py-1.5' : 'p-2'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          {isExpanded && <span>Đặt lại dữ liệu</span>}
        </button>
      </div>
    </aside>
  );
};
