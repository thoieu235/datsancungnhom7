import React, { useState, useEffect } from 'react';
import { Court, SportType, Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDateVN } from '../../utils/formatters';
import { CourtVisualBadge } from '../common/CourtVisualBadge';
import {
  X,
  Save,
  AlertTriangle,
  Check,
  Plus,
  Wrench,
  ShieldAlert,
  Sparkles,
  Calendar,
  Clock,
  Trash2
} from 'lucide-react';

interface CourtFormModalProps {
  court?: Court | null; // null for Create, Court for Edit
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (court: Court, affectedBookings?: Booking[], isNew?: boolean) => void;
}

const COMMON_AMENITIES_BY_SPORT: Record<SportType, string[]> = {
  football: ['Mặt cỏ chuẩn FIFA', 'Hệ thống đèn LED ban đêm', 'Lưới chắn bóng cao', 'Bóng thi đấu miễn phí', 'Áo bib phân đội', 'Khu chờ có ghế ngồi'],
  badminton: ['Thảm PVC BWF 4.5mm', 'Đèn chống lóa mắt', 'Trần cao 9m không gió', 'Ghế trọng tài & nghỉ ngơi', 'Nước uống miễn phí', 'Ổ cắm sạc điện thoại'],
  pickleball: ['Sơn Acrylic 8 lớp tiêu chuẩn USA', 'Mái che cách nhiệt 100%', 'Lưới Pickleball cố định chuẩn', 'Quạt công nghiệp làm mát', 'Có cho thuê vợt & bóng', 'Khán đài mini']
};

export const CourtFormModal: React.FC<CourtFormModalProps> = ({
  court,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { courts, bookings, addCourt, updateCourt } = useApp();
  const isEditing = !!court;

  // Form State
  const [name, setName] = useState('');
  const [sport, setSport] = useState<SportType>('football');
  const [courtCode, setCourtCode] = useState('');
  const [courtTypeLabel, setCourtTypeLabel] = useState('');
  const [pricePerHour, setPricePerHour] = useState(250000);
  const [peakPricePerHour, setPeakPricePerHour] = useState(350000);
  const [status, setStatus] = useState<'active' | 'maintenance'>('active');
  const [maintenanceStart, setMaintenanceStart] = useState('');
  const [maintenanceEnd, setMaintenanceEnd] = useState('');
  const [maintenanceReason, setMaintenanceReason] = useState('');
  const [surface, setSurface] = useState('');
  const [lighting, setLighting] = useState('');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  // Validation state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to suggest court code
  const getSuggestedCode = (s: SportType) => {
    const prefix = s === 'football' ? 'FB' : s === 'badminton' ? 'BD' : 'PK';
    const sameSportCourts = courts.filter(c => c.sport === s);
    const nextNum = sameSportCourts.length + 1;
    return `${prefix}-${nextNum.toString().padStart(2, '0')}`;
  };

  // Initialize form when opened or court changes
  useEffect(() => {
    if (court) {
      setName(court.name);
      setSport(court.sport);
      setCourtCode(
        court.courtCode ||
        `${court.sport === 'football' ? 'FB' : court.sport === 'badminton' ? 'BD' : 'PK'}-${court.courtNumber.toString().padStart(2, '0')}`
      );
      setCourtTypeLabel(court.courtTypeLabel || '');
      setPricePerHour(court.pricePerHour);
      setPeakPricePerHour(court.peakPricePerHour);
      setStatus(court.status);
      setMaintenanceStart(court.maintenanceStart || '');
      setMaintenanceEnd(court.maintenanceEnd || '');
      setMaintenanceReason(court.maintenanceReason || '');
      setSurface(court.surface || '');
      setLighting(court.lighting || '');
      setDescription(court.description || '');
      setAmenities(court.amenities || []);
    } else {
      // Default values for new court
      const nextNum = courts.filter(c => c.sport === 'football').length + 1;
      setName(`Sân Bóng Đá ${nextNum}`);
      setSport('football');
      setCourtCode(`FB-${nextNum.toString().padStart(2, '0')}`);
      setCourtTypeLabel('Sân 7 người');
      setPricePerHour(300000);
      setPeakPricePerHour(450000);
      setStatus('active');
      setMaintenanceStart('');
      setMaintenanceEnd('');
      setMaintenanceReason('');
      setSurface('Cỏ nhân tạo 50mm đệm cao su');
      setLighting('8 dàn đèn LED 400W');
      setDescription('Sân cỏ nhân tạo chất lượng cao, thoáng mát, hệ thống chiếu sáng tiêu chuẩn.');
      setAmenities(COMMON_AMENITIES_BY_SPORT.football.slice(0, 3));
    }
    setErrorMessage(null);
  }, [court, isOpen]);

  // When sport changes in Create mode, auto-suggest defaults
  const handleSportChange = (newSport: SportType) => {
    setSport(newSport);
    if (!isEditing) {
      const nextNum = courts.filter(c => c.sport === newSport).length + 1;
      const suggestedCode = getSuggestedCode(newSport);
      setCourtCode(suggestedCode);

      if (newSport === 'football') {
        setName(`Sân Bóng Đá ${nextNum}`);
        setCourtTypeLabel('Sân 7 người');
        setPricePerHour(300000);
        setPeakPricePerHour(450000);
        setSurface('Cỏ nhân tạo 50mm đệm cao su');
        setLighting('8 dàn đèn LED 400W');
        setAmenities(COMMON_AMENITIES_BY_SPORT.football.slice(0, 3));
      } else if (newSport === 'badminton') {
        setName(`Sân Cầu Lông ${nextNum}`);
        setCourtTypeLabel('Sân Thảm BWF Pro');
        setPricePerHour(100000);
        setPeakPricePerHour(140000);
        setSurface('Thảm PVC Enlio 4.5mm');
        setLighting('Đèn LED chống chói dọc biên');
        setAmenities(COMMON_AMENITIES_BY_SPORT.badminton.slice(0, 3));
      } else {
        setName(`Sân Pickleball ${nextNum}`);
        setCourtTypeLabel('Sân Mái Che Mát');
        setPricePerHour(150000);
        setPeakPricePerHour(220000);
        setSurface('Acrylic 8 lớp giảm chấn');
        setLighting('Đèn LED thể thao 400 Lux');
        setAmenities(COMMON_AMENITIES_BY_SPORT.pickleball.slice(0, 3));
      }
    }
  };

  const toggleAmenity = (item: string) => {
    setAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const addCustomAmenity = () => {
    if (customAmenityInput.trim() && !amenities.includes(customAmenityInput.trim())) {
      setAmenities(prev => [...prev, customAmenityInput.trim()]);
      setCustomAmenityInput('');
    }
  };

  // Quick presets for maintenance
  const setQuickMaintenance = (type: 'today' | '2days' | '1week' | 'clear') => {
    if (type === 'clear') {
      setMaintenanceStart('');
      setMaintenanceEnd('');
      setMaintenanceReason('');
      return;
    }

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const startStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T08:00`;

    let endDate = new Date(now);
    if (type === 'today') {
      endDate.setHours(22, 0, 0, 0);
    } else if (type === '2days') {
      endDate.setDate(endDate.getDate() + 2);
      endDate.setHours(18, 0, 0, 0);
    } else if (type === '1week') {
      endDate.setDate(endDate.getDate() + 7);
      endDate.setHours(18, 0, 0, 0);
    }
    const endStr = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

    setMaintenanceStart(startStr);
    setMaintenanceEnd(endStr);
    if (!maintenanceReason.trim()) {
      setMaintenanceReason('Bảo dưỡng định kỳ cơ sở vật chất');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation: Court Code required & unique
    const trimmedCode = courtCode.trim().toUpperCase();
    if (!trimmedCode) {
      setErrorMessage('Lỗi: Vui lòng nhập Mã Sân không được để trống!');
      return;
    }

    const duplicateCode = courts.find(c =>
      (!isEditing || c.id !== court?.id) &&
      c.courtCode && c.courtCode.trim().toUpperCase() === trimmedCode
    );

    if (duplicateCode) {
      setErrorMessage(`Lỗi: Mã sân "${trimmedCode}" đã được sử dụng cho sân "${duplicateCode.name}"! Vui lòng chọn mã sân khác.`);
      return;
    }

    // 2. Validation: Name required
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Lỗi: Vui lòng nhập tên sân không được để trống!');
      return;
    }

    // Constraint: Check duplicate court name (excluding self when editing)
    const duplicateName = courts.find(c =>
      (!isEditing || c.id !== court?.id) &&
      c.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicateName) {
      setErrorMessage(`Lỗi: Tên sân "${trimmedName}" đã tồn tại trong hệ thống! Vui lòng đặt tên khác để tránh nhầm lẫn.`);
      return;
    }

    // 3. Price validation
    if (pricePerHour < 0 || peakPricePerHour < 0 || isNaN(pricePerHour) || isNaN(peakPricePerHour)) {
      setErrorMessage('Lỗi: Giá thuê sân phải là số nguyên dương hợp lệ!');
      return;
    }

    // 4. Maintenance window validation (if provided)
    if (maintenanceStart && maintenanceEnd && maintenanceEnd < maintenanceStart) {
      setErrorMessage('Lỗi: Thời điểm kết thúc bảo trì phải sau thời điểm bắt đầu bảo trì!');
      return;
    }

    // Check if status is transitioning to maintenance
    let affectedBookings: Booking[] = [];
    if (status === 'maintenance' && isEditing && court?.id) {
      affectedBookings = bookings.filter(b =>
        b.courtId === court.id &&
        b.checkInStatus !== 'checked_out' &&
        b.checkInStatus !== 'cancelled' &&
        b.paymentStatus !== 'cancelled'
      );
    }

    // Extract court number from code if possible, or fallback to number
    const extractedNum = parseInt(trimmedCode.replace(/\D/g, ''), 10) || 1;

    const courtPayload = {
      name: trimmedName,
      courtCode: trimmedCode,
      sport,
      courtNumber: extractedNum,
      courtTypeLabel: courtTypeLabel.trim() || undefined,
      pricePerHour: Number(pricePerHour) || 0,
      peakPricePerHour: Number(peakPricePerHour) || 0,
      status,
      maintenanceStart: maintenanceStart || undefined,
      maintenanceEnd: maintenanceEnd || undefined,
      maintenanceReason: maintenanceReason.trim() || (status === 'maintenance' ? 'Bảo trì kỹ thuật định kỳ' : undefined),
      surface: surface.trim() || 'Tiêu chuẩn',
      lighting: lighting.trim() || 'Đèn LED tiêu chuẩn',
      description: description.trim() || 'Sân thể thao đạt chuẩn.',
      amenities: amenities.length > 0 ? amenities : ['Hệ thống chiếu sáng']
    };

    try {
      let resultCourt: Court;
      if (isEditing && court) {
        updateCourt(court.id, courtPayload);
        resultCourt = { ...court, ...courtPayload };
      } else {
        resultCourt = addCourt(courtPayload);
      }

      onSuccess(resultCourt, affectedBookings, !isEditing);
      onClose();
    } catch (err: any) {
      setErrorMessage(`Lỗi hệ thống: ${err?.message || 'Không thể lưu thông tin sân, vui lòng thử lại!'}`);
    }
  };

  if (!isOpen) return null;

  // Dummy court object for previewing visual badge
  const previewCourt: Court = {
    id: court?.id || 'preview',
    name: name || 'Tên sân xem trước',
    courtCode: courtCode || 'MÃ-SÂN',
    sport,
    courtNumber: parseInt(courtCode.replace(/\D/g, ''), 10) || 1,
    pricePerHour,
    peakPricePerHour,
    status,
    maintenanceStart,
    maintenanceEnd,
    maintenanceReason,
    description,
    amenities,
    surface: surface || 'Mặt sân',
    lighting: lighting || 'Đèn'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="font-bold text-slate-900 text-base">
              {isEditing ? `Chỉnh Sửa Sân: ${court.name}` : 'Thêm Sân Mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl flex items-start gap-2.5 font-medium shadow-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block text-red-900 text-xs">Phát hiện lỗi nhập liệu:</span>
                <span className="text-xs text-red-700">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Visual Badge Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700">
                Hình ảnh & Sơ đồ hiển thị của sân:
              </span>
              <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Mã: {courtCode || 'Chưa đặt'}
              </span>
            </div>
            <CourtVisualBadge court={previewCourt} height="h-36" />
          </div>

          {/* Basic Info: Sport, Name, Court Code (User Request: STT sân -> Mã sân) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bộ Môn <span className="text-red-500">*</span>
              </label>
              <select
                value={sport}
                onChange={(e) => handleSportChange(e.target.value as SportType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="football">⚽ Bóng Đá</option>
                <option value="badminton">🏸 Cầu Lông</option>
                <option value="pickleball">🎾 Pickleball</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên Sân <span className="text-red-500">* (Không trùng)</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Sân Bóng Đá 1"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* User Request: STT sân -> Mã Sân */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Mã Sân <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                  Định danh
                </span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: FB-01, BD-02, PK-03"
                value={courtCode}
                onChange={(e) => {
                  setCourtCode(e.target.value.toUpperCase());
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Court Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phân Loại Chi Tiết
              </label>
              <input
                type="text"
                placeholder="VD: Sân cỏ 7 người, Thảm BWF Pro, Sân mái che..."
                value={courtTypeLabel}
                onChange={(e) => setCourtTypeLabel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trạng Thái Hoạt Động <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'maintenance')}
                className={`w-full px-3 py-2 border rounded-lg font-semibold focus:outline-none ${
                  status === 'active'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-red-300 bg-red-50 text-red-800'
                }`}
              >
                <option value="active">🟢 Đang Hoạt Động (Sẵn sàng nhận lịch)</option>
                <option value="maintenance">🔴 Đang Bảo Trì (Khóa lịch & Cảnh báo ca đặt)</option>
              </select>
            </div>
          </div>

          {/* User Request: THÊM KHOẢNG THỜI GIAN BẢO TRÌ (NẾU CÓ) */}
          <div className={`p-4 rounded-xl border transition-all space-y-3 ${
            status === 'maintenance'
              ? 'bg-rose-50/70 border-rose-300 shadow-xs'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className={`w-4 h-4 ${status === 'maintenance' ? 'text-rose-600' : 'text-slate-500'}`} />
                <span className="font-bold text-slate-900">
                  Khoảng Thời Gian &amp; Lý Do Bảo Trì {status !== 'maintenance' ? '(Nếu có kế hoạch)' : '(Bắt buộc khi bảo trì)'}
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setQuickMaintenance('today')}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:border-slate-400 rounded text-slate-700 cursor-pointer"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setQuickMaintenance('2days')}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:border-slate-400 rounded text-slate-700 cursor-pointer"
                >
                  2 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setQuickMaintenance('1week')}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:border-slate-400 rounded text-slate-700 cursor-pointer"
                >
                  1 tuần
                </button>
                {(maintenanceStart || maintenanceEnd || maintenanceReason) && (
                  <button
                    type="button"
                    onClick={() => setQuickMaintenance('clear')}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Xóa thông tin bảo trì"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thời điểm bắt đầu bảo trì:</span>
                </label>
                <input
                  type="datetime-local"
                  value={maintenanceStart}
                  onChange={(e) => setMaintenanceStart(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thời điểm kết thúc dự kiến:</span>
                </label>
                <input
                  type="datetime-local"
                  value={maintenanceEnd}
                  onChange={(e) => setMaintenanceEnd(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Lý do / Nội dung bảo trì:
              </label>
              <input
                type="text"
                placeholder="VD: Thay thế mặt cỏ nhân tạo, sửa chữa dàn đèn LED chiếu sáng, bảo dưỡng thảm BWF..."
                value={maintenanceReason}
                onChange={(e) => setMaintenanceReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-900 block">
              Bảng Giá Thuê Sân Theo Giờ (VNĐ)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">
                  Giá Giờ Thường (06:00 - 17:00 ngày thường):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={10000}
                    min={0}
                    required
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[11px]">
                    ₫/giờ
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">
                  Giá Giờ Vàng (Từ 17:00 &amp; Cuối tuần):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={10000}
                    min={0}
                    required
                    value={peakPricePerHour}
                    onChange={(e) => setPeakPricePerHour(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[11px]">
                    ₫/giờ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specs: Surface & Lighting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bề Mặt Sân
              </label>
              <input
                type="text"
                placeholder="VD: Cỏ nhân tạo 50mm, Thảm PVC Enlio 4.5mm..."
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hệ Thống Chiếu Sáng
              </label>
              <input
                type="text"
                placeholder="VD: 8 dàn đèn LED 400W, Đèn chống chói..."
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mô Tả Chi Tiết Về Sân
            </label>
            <textarea
              rows={2}
              placeholder="Nhập thông tin giới thiệu, vị trí, đặc điểm nổi bật..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Amenities checklist */}
          <div>
            <span className="font-semibold text-slate-700 block mb-1.5">
              Tiện Ích &amp; Trang Thiết Bị Đi Kèm ({amenities.length} mục đã chọn):
            </span>

            <div className="flex flex-wrap gap-2 mb-2">
              {COMMON_AMENITIES_BY_SPORT[sport].map(item => {
                const isSelected = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom amenity input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Thêm tiện ích khác (VD: Bảng tỉ số điện tử, Camera tự động...)"
                value={customAmenityInput}
                onChange={(e) => setCustomAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomAmenity();
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
              />
              <button
                type="button"
                onClick={addCustomAmenity}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          {/* Sticky Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Lưu Thay Đổi Sân' : 'Hoàn Tất Thêm Sân'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
