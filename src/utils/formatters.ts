import { Court, SportType } from '../types';

export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDateVN = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[date.getDay()];
  
  return `${dayName}, ${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
};

export const getSportDetails = (sport: SportType) => {
  switch (sport) {
    case 'football':
      return {
        label: 'Bóng Đá',
        unit: '6 Sân',
        iconName: 'Goal',
        colorClass: 'emerald',
        bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        activeBtn: 'bg-emerald-600 text-white shadow-sm',
        accentBorder: 'border-emerald-500',
        dotColor: 'bg-emerald-500'
      };
    case 'badminton':
      return {
        label: 'Cầu Lông',
        unit: '4 Sân',
        iconName: 'Activity',
        colorClass: 'blue',
        bgLight: 'bg-blue-50 text-blue-800 border-blue-200',
        activeBtn: 'bg-blue-600 text-white shadow-sm',
        accentBorder: 'border-blue-500',
        dotColor: 'bg-blue-500'
      };
    case 'pickleball':
      return {
        label: 'Pickleball',
        unit: '4 Sân',
        iconName: 'Zap',
        colorClass: 'amber',
        bgLight: 'bg-amber-50 text-amber-900 border-amber-200',
        activeBtn: 'bg-amber-600 text-white shadow-sm',
        accentBorder: 'border-amber-500',
        dotColor: 'bg-amber-500'
      };
  }
};

export const calculateCourtPrice = (
  court: Court,
  startTime: string,
  endTime: string,
  dateStr: string
): { totalAmount: number; isPeak: boolean; durationHours: number } => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const durationHours = Math.max(0.5, (endMinutes - startMinutes) / 60);

  // Check if weekend
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

  // Peak hours: 17:00 onwards or weekend
  const isPeak = isWeekend || startH >= 17;
  const hourlyRate = isPeak ? court.peakPricePerHour : court.pricePerHour;
  const totalAmount = Math.round(hourlyRate * durationHours);

  return { totalAmount, isPeak, durationHours };
};

// Generates time intervals (e.g. 06:00, 07:00, 08:00... 22:00)
export const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];
