import React, { useState, useEffect } from 'react';
import { Court, SportType, Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDateVN } from '../../utils/formatters';
import { CourtVisualBadge } from '../common/CourtVisualBadge';
import { X, Save, AlertTriangle, Check, Plus, Wrench, ShieldAlert, Sparkles } from 'lucide-react';

interface CourtFormModalProps {
  court?: Court | null; // null for Create, Court for Edit
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (court: Court, affectedBookings?: Booking[]) => void;
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
  const [courtNumber, setCourtNumber] = useState(1);
  const [courtTypeLabel, setCourtTypeLabel] = useState('');
  const [pricePerHour, setPricePerHour] = useState(250000);
  const [peakPricePerHour, setPeakPricePerHour] = useState(350000);
  const [status, setStatus] = useState<'active' | 'maintenance'>('active');
  const [surface, setSurface] = useState('');
  const [lighting, setLighting] = useState('');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  // Validation state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form when opened or court changes
  useEffect(() => {
    if (court) {
      setName(court.name);
      setSport(court.sport);
      setCourtNumber(court.courtNumber);
      setCourtTypeLabel(court.courtTypeLabel || '');
      setPricePerHour(court.pricePerHour);
      setPeakPricePerHour(court.peakPricePerHour);
      setStatus(court.status);
      setSurface(court.surface || '');
      setLighting(court.lighting || '');
      setDescription(court.description || '');
      setAmenities(court.amenities || []);
    } else {
      // Default values for new court
      const nextNum = courts.filter(c => c.sport === 'football').length + 1;
      setName(`Sân Bóng Đá ${nextNum}`);
      setSport('football');
      setCourtNumber(nextNum);
      setCourtTypeLabel('Sân 7 người');
      setPricePerHour(300000);
      setPeakPricePerHour(450000);
      setStatus('active');
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
      setCourtNumber(nextNum);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation: Name required
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Vui lòng nhập tên sân!');
      return;
    }

    // 2. Constraint: Check duplicate court name (case-insensitive, excluding self when editing)
    const duplicate = courts.find(c =>
      (!isEditing || c.id !== court?.id) &&
      c.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      setErrorMessage(`Tên sân "${trimmedName}" đã tồn tại trong hệ thống! Vui lòng đặt tên khác để tránh nhầm lẫn.`);
      return;
    }

    // 3. Price validation
    if (pricePerHour < 0 || peakPricePerHour < 0) {
      setErrorMessage('Giá thuê sân không được là số âm!');
      return;
    }

    // Check if status is transitioning to maintenance
    let affectedBookings: Booking[] = [];
    if (status === 'maintenance' && isEditing && court?.id) {
      // Find upcoming or ongoing bookings for this court
      affectedBookings = bookings.filter(b =>
        b.courtId === court.id &&
        b.checkInStatus !== 'checked_out' &&
        b.checkInStatus !== 'cancelled' &&
        b.paymentStatus !== 'cancelled'
      );
    }

    const courtPayload = {
      name: trimmedName,
      sport,
      courtNumber: Number(courtNumber) || 1,
      courtTypeLabel: courtTypeLabel || undefined,
      pricePerHour: Number(pricePerHour) || 0,
      peakPricePerHour: Number(peakPricePerHour) || 0,
      status,
      surface: surface || 'Tiêu chuẩn',
      lighting: lighting || 'Đèn LED tiêu chuẩn',
      description: description || 'Sân thể thao đạt chuẩn.',
      amenities: amenities.length > 0 ? amenities : ['Hệ thống chiếu sáng']
    };

    let resultCourt: Court;
    if (isEditing && court) {
      updateCourt(court.id, courtPayload);
      resultCourt = { ...court, ...courtPayload };
    } else {
      resultCourt = addCourt(courtPayload);
    }

    onSuccess(resultCourt, affectedBookings);
    onClose();
  };

  if (!isOpen) return null;

  // Dummy court object for previewing visual badge
  const previewCourt: Court = {
    id: court?.id || 'preview',
    name: name || 'Tên sân xem trước',
    sport,
    courtNumber,
    pricePerHour,
    peakPricePerHour,
    status,
    description,
    amenities,
    surface: surface || 'Mặt sân',
    lighting: lighting || 'Đèn'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
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
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Visual Badge Preview */}
          <div>
            <span className="font-semibold text-slate-700 block mb-1.5">
              Hình ảnh & Sơ đồ hiển thị của sân:
            </span>
            <CourtVisualBadge court={previewCourt} height="h-36" />
          </div>

          {/* Basic Info: Sport, Name, Number */}
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
                Tên Sân <span className="text-red-500">* (Không trùng lặp)</span>
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

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số Thứ Tự Sân (#)
              </label>
              <input
                type="number"
                min={1}
                value={courtNumber}
                onChange={(e) => setCourtNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                    {formatVND(pricePerHour)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-amber-800 font-medium mb-1">
                  Giá Giờ Cao Điểm (Sau 17:00 &amp; Thứ 7, CN):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={10000}
                    min={0}
                    required
                    value={peakPricePerHour}
                    onChange={(e) => setPeakPricePerHour(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700 font-mono text-[11px]">
                    {formatVND(peakPricePerHour)}
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hệ Thống Chiếu Sáng
              </label>
              <input
                type="text"
                placeholder="VD: 8 dàn đèn LED Philips 400W..."
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mô Tả Sân
            </label>
            <textarea
              rows={2}
              placeholder="Thông tin giới thiệu về sân..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Amenities Checklist */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Tiện Ích Đi Kèm (Chọn hoặc thêm mới)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_AMENITIES_BY_SPORT[sport].map(item => {
                const selected = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      selected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom amenity input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Thêm tiện ích khác..."
                value={customAmenityInput}
                onChange={(e) => setCustomAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomAmenity();
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={addCustomAmenity}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs cursor-pointer"
              >
                + Thêm
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Lưu Thay Đổi Sân' : 'Khởi Tạo Sân Mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
