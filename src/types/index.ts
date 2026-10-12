export type SportType = 'football' | 'badminton' | 'pickleball';

export interface Court {
  id: string;
  name: string;
  sport: SportType;
  courtNumber: number;
  pricePerHour: number;
  peakPricePerHour: number;
  status: 'active' | 'maintenance';
  description: string;
  amenities: string[];
  surface: string;
  lighting: string;
}

export type PaymentStatus = 'deposit_pending' | 'deposited' | 'fully_paid' | 'cancelled' | 'refunded';
export type CheckInStatus = 'not_checked_in' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentMethod = 'vietqr' | 'momo' | 'cash' | 'bank_transfer';

export interface Booking {
  id: string;
  courtId: string;
  courtName: string;
  sport: SportType;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationHours: number;
  totalAmount: number;
  depositRate: number; // percentage (e.g. 30)
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  checkInStatus: CheckInStatus;
  paymentMethod: PaymentMethod;
  qrPassCode: string;
  note?: string;
  createdByRole: 'customer' | 'manager';
  createdAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalBookings: number;
  totalSpent: number;
  isVip: boolean;
  notes?: string;
  createdAt: string;
}

export interface FacilitySettings {
  name: string;
  address: string;
  hotline: string;
  zalo: string;
  openTime: string; // "06:00"
  closeTime: string; // "23:00"
  peakHourStart: string; // "17:00"
  peakHourEnd: string; // "22:00"
  defaultDepositRate: number; // 30
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
}
