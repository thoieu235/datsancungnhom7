export type SportType = 'football' | 'badminton' | 'pickleball';

export interface Court {
  id: string;
  name: string;
  courtCode?: string; // Mã sân (VD: FB-01, BD-02, PK-03)
  sport: SportType;
  courtNumber: number;
  pricePerHour: number;
  peakPricePerHour: number;
  status: 'active' | 'maintenance';
  maintenanceStart?: string; // Thời gian bắt đầu bảo trì (YYYY-MM-DDTHH:mm)
  maintenanceEnd?: string;   // Thời gian kết thúc bảo trì (YYYY-MM-DDTHH:mm)
  maintenanceReason?: string; // Lý do bảo trì
  description: string;
  amenities: string[];
  surface: string;
  lighting: string;
  courtTypeLabel?: string;
  capacity?: string;
  dimensions?: string;
  imageUrl?: string;
}

export type PaymentStatus = 'deposit_pending' | 'deposited' | 'fully_paid' | 'cancelled' | 'refunded';
export type CheckInStatus = 'not_checked_in' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentMethod = 'vietqr' | 'momo' | 'cash' | 'bank_transfer';

export interface BookingServiceItem {
  id: string;
  name: string;
  category: 'drink' | 'equipment' | 'service';
  price: number;
  quantity: number;
}

export interface BookingAuditLog {
  id: string;
  timestamp: string;
  actorRole: 'customer' | 'manager' | 'system';
  actorName: string;
  action: 'create_booking' | 'deposit_customer_paid' | 'deposit_manager_confirmed' | 'deposit_expired' | 'cancel' | 'check_in' | 'change_court' | 'service_added' | 'final_payment_paid';
  amount?: number;
  paymentMethod?: string;
  note?: string;
}

export interface BookingInvoice {
  invoiceId: string;
  bookingId: string;
  issuedAt: string;
  courtFee: number;
  servicesFee: number;
  depositPaid: number;
  remainingPaid: number;
  totalCollected: number;
  paymentMethod: PaymentMethod;
  collectedBy: string;
  services: BookingServiceItem[];
  isLocked: boolean; // BR-PAY-10: Hóa đơn dạng Web không thể chỉnh sửa sau khi khóa
  status: 'Paid' | 'Unpaid'; // UC-17: Cập nhật Invoice sang Paid
  discrepancyNote?: string; // UC-17 A2: Ghi chú xử lý chênh lệch dư/thiếu tại quầy (BR-PAY-09)
}

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
  remainingPaymentMethod?: PaymentMethod;
  qrPassCode: string;
  note?: string;
  createdByRole: 'customer' | 'manager';
  createdAt: string;
  depositExpiresAt?: string; // 10 minutes limit for deposit
  depositPaidAt?: string;
  depositCollector?: string;
  services?: BookingServiceItem[];
  auditLogs?: BookingAuditLog[];
  invoice?: BookingInvoice;
  zaloNotification?: {
    sent: boolean;
    sentAt: string;
    recipientPhone: string;
    content: string;
  };
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
  isVip?: boolean;
  isLocked?: boolean; // Khóa / mở khóa khách hàng
  lockedReason?: string; // Lý do khóa khách
  lockedAt?: string; // Thời điểm khóa
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

export interface PaymentSuccessNotification {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  courtName: string;
  title: string;
  message: string;
  amount: number;
  paymentMethod: PaymentMethod;
  type: 'deposit' | 'settlement' | 'full';
  timestamp: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: 'customer' | 'manager';
  isAdmin?: boolean;
  isLocked?: boolean;
  lockedReason?: string;
}

