import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Court, FacilitySettings } from '../../types';
import { formatVND, getSportDetails } from '../../utils/formatters';
import { Edit2, Save, Wrench, CheckCircle2, Clock, DollarSign, Settings, Phone } from 'lucide-react';

export const ManagerCourtsPricing: React.FC = () => {
  const { courts, updateCourt, settings, updateSettings } = useApp();

  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [courtFormData, setCourtFormData] = useState<Partial<Court>>({});

  const [settingsFormData, setSettingsFormData] = useState<FacilitySettings>(settings);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  const startEditCourt = (court: Court) => {
    setEditingCourtId(court.id);
    setCourtFormData({
      name: court.name,
      pricePerHour: court.pricePerHour,
      peakPricePerHour: court.peakPricePerHour,
      status: court.status,
      description: court.description,
      surface: court.surface
    });
  };

  const handleSaveCourt = (courtId: string) => {
    updateCourt(courtId, courtFormData);
    setEditingCourtId(null);
    alert('Đã cập nhật thông tin và bảng giá sân thành công!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsFormData);
    setIsEditingSettings(false);
    alert('Đã lưu cấu hình hoạt động & tài khoản ngân hàng thành công!');
  };

  return (
    <div className="space-y-8">
      {/* Facility Operations & Settings Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              <span>Khung Giờ Hoạt Động & Tài Khoản Nhận Cọc</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấu hình giờ mở cửa, số hotline hỗ trợ khách đổi sân và tài khoản tạo mã VietQR
            </p>
          </div>

          <button
            onClick={() => setIsEditingSettings(!isEditingSettings)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer self-start"
          >
            {isEditingSettings ? 'Hủy Bỏ' : 'Chỉnh Sửa Cấu Hình'}
          </button>
        </div>

        {isEditingSettings ? (
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giờ Mở Cửa</label>
                <input
                  type="time"
                  value={settingsFormData.openTime}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, openTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giờ Đóng Cửa</label>
                <input
                  type="time"
                  value={settingsFormData.closeTime}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, closeTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hotline Ban Quản Lý</label>
                <input
                  type="text"
                  value={settingsFormData.hotline}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, hotline: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">% Cọc Mặc Định Cho Khách</label>
                <input
                  type="number"
                  value={settingsFormData.defaultDepositRate}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, defaultDepositRate: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngân Hàng Thụ Hưởng</label>
                <input
                  type="text"
                  value={settingsFormData.bankName}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, bankName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số Tài Khoản</label>
                <input
                  type="text"
                  value={settingsFormData.bankAccount}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, bankAccount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên Chủ Tài Khoản</label>
                <input
                  type="text"
                  value={settingsFormData.bankAccountName}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, bankAccountName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Lưu Thay Đổi Cấu Hình
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Khung giờ hoạt động:</span>
              <div className="font-bold font-mono text-slate-900 mt-0.5">{settings.openTime} - {settings.closeTime}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Hotline đổi sân:</span>
              <div className="font-bold font-mono text-emerald-700 mt-0.5">{settings.hotline}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Mức cọc trực tuyến:</span>
              <div className="font-bold font-mono text-slate-900 mt-0.5">{settings.defaultDepositRate}% tổng tiền</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Tài khoản VietQR:</span>
              <div className="font-bold text-slate-900 mt-0.5 truncate">{settings.bankName} - {settings.bankAccount}</div>
            </div>
          </div>
        )}
      </div>

      {/* Courts & Pricing Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Quản Lý 14 Sân Thể Thao & Bảng Giá Chi Tiết
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật giá giờ thường, giá giờ cao điểm (Peak) và trạng thái sẵn sàng / bảo trì của từng sân
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {courts.map(court => {
            const isEditing = editingCourtId === court.id;
            const sportMeta = getSportDetails(court.sport);

            return (
              <div key={court.id} className="p-5 hover:bg-slate-50/40 transition-colors">
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Tên Sân</label>
                        <input
                          type="text"
                          value={courtFormData.name || ''}
                          onChange={(e) => setCourtFormData({ ...courtFormData, name: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Giá Giờ Thường (VNĐ/h)</label>
                        <input
                          type="number"
                          value={courtFormData.pricePerHour || ''}
                          onChange={(e) => setCourtFormData({ ...courtFormData, pricePerHour: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 border rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Giá Giờ Vàng/Cuối Tuần (VNĐ/h)</label>
                        <input
                          type="number"
                          value={courtFormData.peakPricePerHour || ''}
                          onChange={(e) => setCourtFormData({ ...courtFormData, peakPricePerHour: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 border rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Trạng Thái Sân</label>
                        <select
                          value={courtFormData.status || 'active'}
                          onChange={(e) => setCourtFormData({ ...courtFormData, status: e.target.value as 'active' | 'maintenance' })}
                          className="w-full px-3 py-1.5 border rounded-lg"
                        >
                          <option value="active">🟢 Đang Hoạt Động (Sẵn sàng cho đặt)</option>
                          <option value="maintenance">🔴 Đang Bảo Trì (Khóa lịch)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Mặt Sân / Tiêu Chuẩn</label>
                        <input
                          type="text"
                          value={courtFormData.surface || ''}
                          onChange={(e) => setCourtFormData({ ...courtFormData, surface: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingCourtId(null)}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveCourt(court.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu Cập Nhật</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{court.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          court.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {court.status === 'active' ? 'Sẵn Sàng' : 'Bảo Trì'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">· {sportMeta.label}</span>
                      </div>
                      <div className="text-slate-600">{court.description}</div>
                      <div className="text-slate-500 text-[11px]">
                        Mặt sân: <strong className="text-slate-700">{court.surface}</strong> · Chiếu sáng: {court.lighting}
                      </div>
                    </div>

                    {/* Price and actions */}
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <div className="text-slate-500 text-[11px]">Giờ thường:</div>
                        <div className="font-mono font-bold text-slate-900 text-sm">{formatVND(court.pricePerHour)}/h</div>
                      </div>

                      <div className="text-right">
                        <div className="text-amber-700 text-[11px] font-semibold">Giờ vàng (&gt;17h & T7-CN):</div>
                        <div className="font-mono font-bold text-emerald-700 text-sm">{formatVND(court.peakPricePerHour)}/h</div>
                      </div>

                      <button
                        onClick={() => startEditCourt(court)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa thông tin & giá sân"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
