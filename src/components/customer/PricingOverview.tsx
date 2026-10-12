import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, getSportDetails } from '../../utils/formatters';
import { Check, ShieldAlert, Sparkles, Clock, Phone, DollarSign } from 'lucide-react';

export const PricingOverview: React.FC = () => {
  const { courts, settings } = useApp();

  const footballCourts = courts.filter(c => c.sport === 'football');
  const badmintonCourts = courts.filter(c => c.sport === 'badminton');
  const pickleballCourts = courts.filter(c => c.sport === 'pickleball');

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900">
          Bảng Giá Thuê Sân & Tiện Ích Thể Thao
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl">
          Bảng giá niêm yết áp dụng cho cụm 14 sân thể thao tiêu chuẩn. Khung giờ tiêu chuẩn: 06:00 - 17:00 ngày thường.
          Khung giờ cao điểm: Từ 17:00 - 23:00 và toàn bộ ngày Thứ 7, Chủ Nhật.
        </p>
      </div>

      {/* 3 Sports Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FOOTBALL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 bg-emerald-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">⚽ Bóng Đá</span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">6 Sân</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mt-1">Sân Cỏ Nhân Tạo</h3>
            <p className="text-xs text-slate-600 mt-0.5">Sân 7 người và Sân 5 người chuẩn FIFA mini</p>
          </div>

          <div className="p-5 divide-y divide-slate-100 space-y-4">
            {footballCourts.map(c => (
              <div key={c.id} className="pt-3 first:pt-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{c.name}</span>
                    <span className="block text-[11px] text-slate-500">{c.surface}</span>
                  </div>
                  {c.status === 'maintenance' && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">Bảo trì</span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Giờ thường (06h-17h):</span>
                    <strong className="font-mono text-slate-900">{formatVND(c.pricePerHour)}/h</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-700 text-[11px] block font-semibold">Giờ vàng (&gt;17h & T7-CN):</span>
                    <strong className="font-mono text-emerald-700">{formatVND(c.peakPricePerHour)}/h</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-900 block mb-1">Tiện ích đi kèm:</span>
            <ul className="space-y-1 text-[11px]">
              <li>✓ Miễn phí bóng thi đấu số 4 & số 5</li>
              <li>✓ Mượn áo bib phân đội 2 màu</li>
              <li>✓ Dàn đèn LED chiếu sáng 400W không chói</li>
            </ul>
          </div>
        </div>

        {/* BADMINTON */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 bg-blue-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">🏸 Cầu Lông</span>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">4 Sân</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mt-1">Sân Thảm PVC BWF</h3>
            <p className="text-xs text-slate-600 mt-0.5">Thảm Enlio vân cát 4.5mm, trần cao 9m</p>
          </div>

          <div className="p-5 divide-y divide-slate-100 space-y-4">
            {badmintonCourts.map(c => (
              <div key={c.id} className="pt-3 first:pt-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{c.name}</span>
                    <span className="block text-[11px] text-slate-500">{c.surface}</span>
                  </div>
                  {c.status === 'maintenance' && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">Bảo trì</span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Giờ thường (06h-17h):</span>
                    <strong className="font-mono text-slate-900">{formatVND(c.pricePerHour)}/h</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-700 text-[11px] block font-semibold">Giờ vàng (&gt;17h & T7-CN):</span>
                    <strong className="font-mono text-blue-700">{formatVND(c.peakPricePerHour)}/h</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-900 block mb-1">Tiện ích đi kèm:</span>
            <ul className="space-y-1 text-[11px]">
              <li>✓ Trần cao 9m cản gió 100%</li>
              <li>✓ Hệ thống đèn tuýp LED chống chói dọc biên</li>
              <li>✓ Nước uống nóng lạnh & phòng tắm nóng lạnh</li>
            </ul>
          </div>
        </div>

        {/* PICKLEBALL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 bg-amber-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">🎾 Pickleball</span>
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">4 Sân</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mt-1">Sân Sơn Acrylic Cushion</h3>
            <p className="text-xs text-slate-600 mt-0.5">Sân trung tâm VIP, sân mái che và sân ngoài trời</p>
          </div>

          <div className="p-5 divide-y divide-slate-100 space-y-4">
            {pickleballCourts.map(c => (
              <div key={c.id} className="pt-3 first:pt-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{c.name}</span>
                    <span className="block text-[11px] text-slate-500">{c.surface}</span>
                  </div>
                  {c.status === 'maintenance' && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">Bảo trì</span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Giờ thường (06h-17h):</span>
                    <strong className="font-mono text-slate-900">{formatVND(c.pricePerHour)}/h</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-700 text-[11px] block font-semibold">Giờ vàng (&gt;17h & T7-CN):</span>
                    <strong className="font-mono text-amber-700">{formatVND(c.peakPricePerHour)}/h</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-900 block mb-1">Tiện ích đi kèm:</span>
            <ul className="space-y-1 text-[11px]">
              <li>✓ Mặt sân giảm chấn 8 lớp bảo vệ khớp gối</li>
              <li>✓ Lưới Pickleball cố định đạt chuẩn USAPA</li>
              <li>✓ Cho thuê vợt cao cấp Franklin / Selkirk tại quầy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Booking and Cancellation Policy Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
        <h4 className="text-base font-bold mb-3 flex items-center gap-2">
          <span>Quy Định Đặt Sân & Đổi Sân Trực Tiếp</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <strong className="text-emerald-400 block text-sm mb-1">1. Đặt Cọc 30% Online</strong>
            <span>Khách hàng thanh toán trước 30% tiền cọc qua VietQR để khóa slot ngay lập tức. Số tiền 70% còn lại thanh toán tại quầy lễ tân khi check-in.</span>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <strong className="text-amber-400 block text-sm mb-1">2. Đổi Sân / Dời Lịch</strong>
            <span>Khách hàng có nhu cầu đổi giờ hoặc đổi sang sân khác vui lòng gọi trực tiếp Hotline/Zalo ban quản lý <strong>{settings.hotline}</strong> trước giờ đấu 2 tiếng để được hỗ trợ chuyển slot.</span>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <strong className="text-blue-400 block text-sm mb-1">3. Check-in & Nhận Sân</strong>
            <span>Xuất trình mã vé điện tử QR Pass tại quầy lễ tân để nhân viên xác nhận vào sân và thanh toán phần tiền còn lại.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
