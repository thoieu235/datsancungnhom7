import React, { createContext, useContext, useState, useEffect } from 'react';
import { Court, Booking, CustomerProfile, FacilitySettings, SportType, PaymentMethod, BookingServiceItem, BookingInvoice, BookingAuditLog, PaymentSuccessNotification, AuthUser } from '../types';
import { INITIAL_COURTS, INITIAL_SETTINGS, INITIAL_CUSTOMERS, getInitialBookings, SYSTEM_ADMIN_ACCOUNT } from '../data/mockData';

interface AppContextType {
  role: 'customer' | 'manager';
  setRole: (role: 'customer' | 'manager') => void;
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginUser: (user: AuthUser) => void;
  logout: () => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  courts: Court[];
  bookings: Booking[];
  customers: CustomerProfile[];
  settings: FacilitySettings;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'qrPassCode'>) => Booking;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  changeCourtBooking: (id: string, newCourtId: string, newDate: string, newStartTime: string, newEndTime: string) => boolean;
  cancelBooking: (id: string, note?: string) => void;
  confirmDepositByManager: (bookingId: string, customAmount?: number, method?: PaymentMethod, note?: string) => Booking | null;
  payDepositByCustomer: (bookingId: string, method?: PaymentMethod) => Booking | null;
  cancelDepositPending: (bookingId: string, reason?: string) => void;
  addServiceToBooking: (bookingId: string, service: Omit<BookingServiceItem, 'id'>) => void;
  removeServiceFromBooking: (bookingId: string, serviceId: string) => void;
  checkInBooking: (id: string) => void;
  checkOutBooking: (id: string) => void;
  collectRemainingPayment: (id: string, method?: PaymentMethod, finalServices?: BookingServiceItem[], collectorName?: string, discrepancyNote?: string) => BookingInvoice | null;
  updateCourt: (id: string, updates: Partial<Court>) => void;
  addCourt: (court: Omit<Court, 'id'>) => Court;
  deleteCourt: (id: string) => void;
  addCustomer: (customerData: {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
    isVip?: boolean;
    isLocked?: boolean;
    lockedReason?: string;
  }) => CustomerProfile;
  updateCustomer: (phoneOrId: string, updates: Partial<CustomerProfile>) => void;
  lockCustomer: (phoneOrId: string, reason?: string) => void;
  unlockCustomer: (phoneOrId: string) => void;
  updateSettings: (updates: Partial<FacilitySettings>) => void;
  resetAllData: () => void;
  selectedSport: SportType;
  setSelectedSport: (sport: SportType) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  paymentNotification: PaymentSuccessNotification | null;
  triggerPaymentSuccess: (notification: Omit<PaymentSuccessNotification, 'id' | 'timestamp'>) => void;
  clearPaymentSuccess: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'sportarena_role_v1',
  AUTH_USER: 'sportarena_auth_user_v1',
  COURTS: 'sportarena_courts_v1',
  BOOKINGS: 'sportarena_bookings_v2', // bumped to reload initial bookings with deposit_pending and checked_in demo data
  CUSTOMERS: 'sportarena_customers_v2',
  SETTINGS: 'sportarena_settings_v1',
  CUSTOMER_PHONE: 'sportarena_cust_phone_v1',
  CUSTOMER_NAME: 'sportarena_cust_name_v1',
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  // User requirement: "Khi vào website hệ thống sẽ hiển thị yêu cầu đăng nhập bằng sđt mà mã sẽ được gửi về"
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return !saved;
  });

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const [role, setRoleState] = useState<'customer' | 'manager'>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.role === 'manager' || u.isAdmin) return 'manager';
      } catch (e) {}
    }
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return saved === 'manager' ? 'manager' : 'customer';
  });

  const [customerPhone, setCustomerPhoneState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOMER_PHONE) || '0912345678';
  });

  const [customerName, setCustomerNameState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOMER_NAME) || 'Đặng Tuấn Anh';
  });

  const loginUser = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    if (user.role === 'manager' || user.isAdmin) {
      setRoleState('manager');
      localStorage.setItem(STORAGE_KEYS.ROLE, 'manager');
    } else {
      setRoleState('customer');
      localStorage.setItem(STORAGE_KEYS.ROLE, 'customer');
      setCustomerPhone(user.phone);
      setCustomerName(user.name);
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setRoleState('customer');
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.setItem(STORAGE_KEYS.ROLE, 'customer');
    setIsAuthModalOpen(true);
  };


  const [selectedSport, setSelectedSport] = useState<SportType>('football');
  
  // Default selected date to today (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [courts, setCourts] = useState<Court[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COURTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_COURTS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return getInitialBookings();
  });

  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CUSTOMERS;
  });

  const [settings, setSettings] = useState<FacilitySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_SETTINGS;
  });

  // Global payment success notification state
  const [paymentNotification, setPaymentNotification] = useState<PaymentSuccessNotification | null>(null);

  const triggerPaymentSuccess = (notification: Omit<PaymentSuccessNotification, 'id' | 'timestamp'>) => {
    const newNotif: PaymentSuccessNotification = {
      ...notification,
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    setPaymentNotification(newNotif);
  };

  const clearPaymentSuccess = () => {
    setPaymentNotification(null);
  };

  // UC01 E2: Auto-expire pending deposit bookings after 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toISOString();
      setBookings(prev => {
        let hasExpired = false;
        const updated = prev.map(b => {
          if (
            b.paymentStatus === 'deposit_pending' &&
            b.depositExpiresAt &&
            new Date(now).getTime() > new Date(b.depositExpiresAt).getTime()
          ) {
            hasExpired = true;
            return {
              ...b,
              paymentStatus: 'cancelled' as const,
              checkInStatus: 'cancelled' as const,
              note: `${b.note ? b.note + ' | ' : ''}Hệ thống tự động hủy giữ chỗ do quá 10 phút chờ thanh toán cọc (E2)`,
              auditLogs: [
                ...(b.auditLogs || []),
                {
                  id: `log-${Date.now()}`,
                  timestamp: now,
                  actorRole: 'system' as const,
                  actorName: 'Hệ thống tự động',
                  action: 'deposit_expired' as const,
                  note: 'Quá thời hạn 10 phút thanh toán cọc, đã giải phóng lịch sân'
                }
              ]
            };
          }
          return b;
        });
        return hasExpired ? updated : prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_PHONE, customerPhone);
  }, [customerPhone]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_NAME, customerName);
  }, [customerName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURTS, JSON.stringify(courts));
  }, [courts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const setRole = (newRole: 'customer' | 'manager') => {
    setRoleState(newRole);
  };

  const setCustomerPhone = (phone: string) => {
    setCustomerPhoneState(phone);
    // Find customer name if exists in database
    const found = customers.find(c => c.phone === phone);
    if (found) {
      setCustomerNameState(found.name);
    }
  };

  const setCustomerName = (name: string) => {
    setCustomerNameState(name);
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'qrPassCode'>): Booking => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `BK-${randNum}`;
    const qrPassCode = `PASS-${bookingData.sport.slice(0, 2).toUpperCase()}-${randNum}`;
    const now = new Date().toISOString();
    const isDepositPending = bookingData.paymentStatus === 'deposit_pending';
    const depositExpiresAt = isDepositPending
      ? new Date(Date.now() + 10 * 60 * 1000).toISOString()
      : undefined;

    const initialAuditLogs: BookingAuditLog[] = [
      {
        id: `log-${Date.now()}`,
        timestamp: now,
        actorRole: bookingData.createdByRole,
        actorName: bookingData.createdByRole === 'manager' ? 'Quản lý sân' : bookingData.customerName,
        action: 'create_booking',
        amount: bookingData.totalAmount,
        note: isDepositPending
          ? `Tạo đơn đặt sân chờ cọc 10 phút (${bookingData.depositRate}% - ${bookingData.depositAmount.toLocaleString('vi-VN')} ₫)`
          : `Tạo đơn đặt sân trực tiếp và đã xác nhận cọc ${bookingData.depositRate}%`
      }
    ];

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      createdAt: now,
      qrPassCode,
      depositExpiresAt,
      auditLogs: initialAuditLogs,
    };

    setBookings(prev => [newBooking, ...prev]);

    // Upsert customer profile: If customer exists, update stats; if not, only auto-create if booked by customer
    setCustomers(prev => {
      const existingIndex = prev.findIndex(c => c.phone.trim() === bookingData.customerPhone.trim());
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updatedList = [...prev];
        const newTotalBookings = existing.totalBookings + 1;
        const newTotalSpent = existing.totalSpent + bookingData.totalAmount;
        updatedList[existingIndex] = {
          ...existing,
          name: bookingData.customerName || existing.name,
          totalBookings: newTotalBookings,
          totalSpent: newTotalSpent
        };
        return updatedList;
      } else {
        // User Request: Không cho phép tự động thêm khách hàng mới khi thực hiện đặt sân của chủ sân
        if (bookingData.createdByRole === 'manager') {
          return prev;
        }

        const newCustomer: CustomerProfile = {
          id: `cust-${Date.now()}`,
          name: bookingData.customerName,
          phone: bookingData.customerPhone,
          email: bookingData.customerEmail,
          totalBookings: 1,
          totalSpent: bookingData.totalAmount,
          notes: 'Khách hàng tạo từ hệ thống đặt online',
          createdAt: now.split('T')[0]
        };
        return [newCustomer, ...prev];
      }
    });

    if (newBooking.depositAmount > 0 && newBooking.paymentStatus !== 'deposit_pending') {
      triggerPaymentSuccess({
        bookingId: newBooking.id,
        customerName: newBooking.customerName,
        customerPhone: newBooking.customerPhone,
        courtName: newBooking.courtName,
        title: 'Thanh toán tiền cọc thành công!',
        message: `Đã xác nhận thanh toán tiền cọc ${newBooking.depositAmount.toLocaleString('vi-VN')} ₫ (${newBooking.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản VietQR'}) cho đơn ${newBooking.id}. Lịch sân đã được giữ chỗ.`,
        amount: newBooking.depositAmount,
        paymentMethod: newBooking.paymentMethod,
        type: newBooking.depositAmount >= newBooking.totalAmount ? 'full' : 'deposit'
      });
    }

    return newBooking;
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  // UC01 A1: Quản lý sân xác nhận cọc hộ khách
  const confirmDepositByManager = (
    bookingId: string,
    customAmount?: number,
    method: PaymentMethod = 'cash',
    note?: string
  ): Booking | null => {
    const now = new Date().toISOString();
    let updatedBooking: Booking | null = null;

    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      
      // BR-01: Chỉ cho phép thanh toán/xác nhận cọc đối với booking trạng thái "Chờ thanh toán cọc"
      if (b.paymentStatus !== 'deposit_pending') return b;

      // BR-02: Tiền cọc hệ thống tự tính mặc định là 30%, quản lý sân có quyền tùy chỉnh
      const depositPaid = customAmount !== undefined && customAmount !== null ? customAmount : b.depositAmount;
      const newRemaining = Math.max(0, b.totalAmount - depositPaid);
      const isFullyPaid = depositPaid >= b.totalAmount;

      const newAuditLog: BookingAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: now,
        actorRole: 'manager',
        actorName: 'Quản lý sân',
        action: 'deposit_manager_confirmed',
        amount: depositPaid,
        paymentMethod: method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản ngoài',
        note: note || `Quản lý xác nhận thu cọc hộ khách (${method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản ngoài'}): ${depositPaid.toLocaleString('vi-VN')} ₫`
      };

      updatedBooking = {
        ...b,
        paymentStatus: isFullyPaid ? 'fully_paid' : 'deposited',
        depositAmount: depositPaid,
        remainingAmount: newRemaining,
        paymentMethod: method,
        depositPaidAt: now,
        depositCollector: 'Quản lý sân',
        depositExpiresAt: undefined, // Hủy timer đếm ngược vì đã cọc thành công
        auditLogs: [...(b.auditLogs || []), newAuditLog],
        zaloNotification: {
          sent: true,
          sentAt: now,
          recipientPhone: b.customerPhone,
          content: `SportArena Zalo ZNS: Xác nhận thu cọc thành công! Đơn ${b.id}, Sân ${b.courtName}, ${b.startTime}-${b.endTime} ngày ${b.date}. Tiền cọc đã nhận: ${depositPaid.toLocaleString('vi-VN')} ₫ (${method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản ngoài'}). Mã vé: ${b.qrPassCode}.`
        }
      };

      return updatedBooking;
    }));

    if (updatedBooking) {
      const ub = updatedBooking as Booking;
      triggerPaymentSuccess({
        bookingId: ub.id,
        customerName: ub.customerName,
        customerPhone: ub.customerPhone,
        courtName: ub.courtName,
        title: 'Xác nhận thu cọc thành công!',
        message: `Quản lý đã thu cọc ${ub.depositAmount.toLocaleString('vi-VN')} ₫ (${method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}) cho đơn ${ub.id}. Thẻ SportPass đã được kích hoạt.`,
        amount: ub.depositAmount,
        paymentMethod: method,
        type: 'deposit'
      });
    }

    return updatedBooking;
  };

  // UC01 Case 1: Khách hàng tự thanh toán cọc trên hệ thống
  const payDepositByCustomer = (bookingId: string, method: PaymentMethod = 'vietqr'): Booking | null => {
    const now = new Date().toISOString();
    let updatedBooking: Booking | null = null;

    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      if (b.paymentStatus !== 'deposit_pending') return b;

      const newAuditLog: BookingAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: now,
        actorRole: 'customer',
        actorName: b.customerName,
        action: 'deposit_customer_paid',
        amount: b.depositAmount,
        paymentMethod: method,
        note: 'Khách hàng tự thanh toán cọc qua mã QR VietQR (Cổng thanh toán xác nhận Webhook/IPN)'
      };

      updatedBooking = {
        ...b,
        paymentStatus: 'deposited',
        paymentMethod: method,
        depositPaidAt: now,
        depositExpiresAt: undefined,
        auditLogs: [...(b.auditLogs || []), newAuditLog],
        zaloNotification: {
          sent: true,
          sentAt: now,
          recipientPhone: b.customerPhone,
          content: `SportArena Zalo ZNS: Đặt cọc thành công đơn ${b.id}! Sân ${b.courtName}, ${b.startTime}-${b.endTime} ngày ${b.date}. Tiền cọc đã thanh toán: ${b.depositAmount.toLocaleString('vi-VN')} ₫ qua VietQR. Mã vé nhận sân: ${b.qrPassCode}.`
        }
      };

      return updatedBooking;
    }));

    if (updatedBooking) {
      const ub = updatedBooking as Booking;
      triggerPaymentSuccess({
        bookingId: ub.id,
        customerName: ub.customerName,
        customerPhone: ub.customerPhone,
        courtName: ub.courtName,
        title: 'Thanh toán cọc trực tuyến thành công!',
        message: `Hệ thống đã nhận thanh toán cọc ${ub.depositAmount.toLocaleString('vi-VN')} ₫ qua VietQR cho đơn ${ub.id}. Lịch sân đã được xác nhận giữ chỗ.`,
        amount: ub.depositAmount,
        paymentMethod: 'vietqr',
        type: 'deposit'
      });
    }

    return updatedBooking;
  };

  // UC01 E1: Khách hủy giao dịch hoặc thanh toán thất bại
  const cancelDepositPending = (bookingId: string, reason?: string) => {
    const now = new Date().toISOString();
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      return {
        ...b,
        paymentStatus: 'cancelled',
        checkInStatus: 'cancelled',
        note: `${b.note ? b.note + ' | ' : ''}Hủy giữ chỗ: ${reason || 'Khách hủy thanh toán cọc'}`,
        auditLogs: [
          ...(b.auditLogs || []),
          {
            id: `log-${Date.now()}`,
            timestamp: now,
            actorRole: 'customer',
            actorName: b.customerName,
            action: 'cancel',
            note: reason || 'Khách hủy giao dịch thanh toán cọc'
          }
        ]
      };
    }));
  };

  const changeCourtBooking = (id: string, newCourtId: string, newDate: string, newStartTime: string, newEndTime: string): boolean => {
    const targetCourt = courts.find(c => c.id === newCourtId);
    if (!targetCourt) return false;

    // Check collision with another active booking
    const hasCollision = bookings.some(b => 
      b.id !== id &&
      b.courtId === newCourtId &&
      b.date === newDate &&
      b.checkInStatus !== 'cancelled' &&
      b.paymentStatus !== 'cancelled' &&
      ((newStartTime >= b.startTime && newStartTime < b.endTime) ||
       (newEndTime > b.startTime && newEndTime <= b.endTime) ||
       (newStartTime <= b.startTime && newEndTime >= b.endTime))
    );

    if (hasCollision) {
      return false;
    }

    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        courtId: newCourtId,
        courtName: targetCourt.name,
        sport: targetCourt.sport,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        note: `${b.note ? b.note + ' | ' : ''}Quản lý đã chuyển sang ${targetCourt.name} (${newDate} ${newStartTime}-${newEndTime})`
      };
    }));

    return true;
  };

  const cancelBooking = (id: string, cancelNote?: string) => {
    const now = new Date().toISOString();
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        paymentStatus: 'cancelled',
        checkInStatus: 'cancelled',
        note: `${b.note ? b.note + ' | ' : ''}Đã hủy: ${cancelNote || 'Khách liên hệ hủy'}`,
        auditLogs: [
          ...(b.auditLogs || []),
          {
            id: `log-${Date.now()}`,
            timestamp: now,
            actorRole: 'manager',
            actorName: 'Quản lý sân',
            action: 'cancel',
            note: cancelNote || 'Quản lý hủy đơn đặt sân'
          }
        ]
      };
    }));
  };

  // UC02 E1: Thêm dịch vụ giờ chót
  const addServiceToBooking = (bookingId: string, service: Omit<BookingServiceItem, 'id'>) => {
    const newService: BookingServiceItem = {
      ...service,
      id: `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      const currentServices = b.services || [];
      const updatedServices = [...currentServices, newService];
      return {
        ...b,
        services: updatedServices,
        auditLogs: [
          ...(b.auditLogs || []),
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actorRole: 'manager',
            actorName: 'Quản lý sân',
            action: 'service_added',
            amount: newService.price * newService.quantity,
            note: `Thêm dịch vụ: ${newService.name} x${newService.quantity} (${(newService.price * newService.quantity).toLocaleString('vi-VN')} ₫)`
          }
        ]
      };
    }));
  };

  const removeServiceFromBooking = (bookingId: string, serviceId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      return {
        ...b,
        services: (b.services || []).filter(s => s.id !== serviceId)
      };
    }));
  };

  // Khi check-in thì KHÔNG thu tiền, chỉ phát sinh thu tiền khi check-out
  const checkInBooking = (id: string) => {
    const now = new Date().toISOString();
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        checkInStatus: 'checked_in',
        checkedInAt: now,
        // Giữ nguyên remainingAmount và paymentStatus (không thu tiền khi check-in)
        auditLogs: [
          ...(b.auditLogs || []),
          {
            id: `log-${Date.now()}`,
            timestamp: now,
            actorRole: 'manager',
            actorName: 'Quản lý sân',
            action: 'check_in',
            note: 'Khách hàng check-in nhận sân (Chưa thu tiền còn lại, chỉ thu khi check-out)'
          }
        ]
      };
    }));
  };

  const checkOutBooking = (id: string) => {
    const now = new Date().toISOString();
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        checkInStatus: 'checked_out',
        checkedOutAt: now
      };
    }));
  };

  // Thanh toán số tiền còn lại (Tất toán) tại thời điểm Check-out
  const collectRemainingPayment = (
    id: string,
    method: PaymentMethod = 'cash',
    finalServices?: BookingServiceItem[],
    collectorName: string = 'Quản lý sân',
    discrepancyNote?: string
  ): BookingInvoice | null => {
    const now = new Date().toISOString();
    let generatedInvoice: BookingInvoice | null = null;
    let targetCustomerPhone = '';
    let targetGrandTotal = 0;

    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;

      // Tiền còn lại = Tổng tiền sân - Tiền cọc đã thanh toán
      const effectiveServices = finalServices || b.services || [];
      const totalServicesCost = effectiveServices.reduce((sum, s) => sum + (s.price * s.quantity), 0);
      const grandTotal = b.totalAmount + totalServicesCost;
      const remainingToCollect = Math.max(0, grandTotal - b.depositAmount);

      targetCustomerPhone = b.customerPhone;
      targetGrandTotal = grandTotal;

      const invoice: BookingInvoice = {
        invoiceId: `INV-${Date.now().toString().slice(-6)}`,
        bookingId: b.id,
        issuedAt: now,
        courtFee: b.totalAmount,
        servicesFee: totalServicesCost,
        depositPaid: b.depositAmount,
        remainingPaid: remainingToCollect,
        totalCollected: grandTotal,
        paymentMethod: method,
        collectedBy: collectorName,
        services: effectiveServices,
        isLocked: true,
        status: 'Paid',
        discrepancyNote: discrepancyNote || undefined
      };

      generatedInvoice = invoice;

      const newAuditLog: BookingAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: now,
        actorRole: 'manager',
        actorName: collectorName,
        action: 'final_payment_paid',
        amount: remainingToCollect,
        paymentMethod: method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản VietQR',
        note: `Đã tất toán số tiền còn lại: ${remainingToCollect.toLocaleString('vi-VN')} ₫ (${method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}). Hóa đơn ${invoice.invoiceId} đã được khóa hoàn tất.${discrepancyNote ? ` [Thỏa thuận: ${discrepancyNote}]` : ''}`
      };

      return {
        ...b,
        paymentStatus: 'fully_paid',
        checkInStatus: 'checked_out',
        checkedOutAt: now,
        remainingAmount: 0,
        remainingPaymentMethod: method,
        services: effectiveServices,
        invoice,
        auditLogs: [...(b.auditLogs || []), newAuditLog]
      };
    }));

    // UC-17 bước 8: MOD-04 báo MOD-03 chuyển Booking sang Completed và ghi dữ liệu vào lịch sử khách hàng ở MOD-01
    if (targetCustomerPhone) {
      setCustomers(prevCust => prevCust.map(c => {
        if (c.phone === targetCustomerPhone) {
          return {
            ...c,
            totalBookings: (c.totalBookings || 0) + 1,
            totalSpent: (c.totalSpent || 0) + targetGrandTotal
          };
        }
        return c;
      }));
    }

    if (generatedInvoice) {
      const inv: BookingInvoice = generatedInvoice;
      const targetB = bookings.find(item => item.id === id);
      triggerPaymentSuccess({
        bookingId: id,
        customerName: targetB?.customerName || 'Khách hàng',
        customerPhone: targetB?.customerPhone || targetCustomerPhone,
        courtName: targetB?.courtName || 'Sân thể thao',
        title: 'Thanh toán tất toán thành công!',
        message: `Đã thu số tiền còn lại ${inv.remainingPaid.toLocaleString('vi-VN')} ₫ (${method === 'cash' ? 'Tiền mặt tại quầy' : 'Chuyển khoản VietQR'}) cho đơn ${id}. Hóa đơn điện tử đã chốt hoàn tất.`,
        amount: inv.remainingPaid,
        paymentMethod: method,
        type: 'settlement'
      });
    }

    return generatedInvoice;
  };

  const updateCourt = (id: string, updates: Partial<Court>) => {
    setCourts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addCourt = (courtData: Omit<Court, 'id'>): Court => {
    const newId = `court-${courtData.sport.slice(0, 2)}-${Date.now()}`;
    const newCourt: Court = {
      ...courtData,
      id: newId
    };
    setCourts(prev => [...prev, newCourt]);
    return newCourt;
  };

  const deleteCourt = (id: string) => {
    setCourts(prev => prev.filter(c => c.id !== id));
  };

  const addCustomer = (customerData: {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
    isVip?: boolean;
    isLocked?: boolean;
    lockedReason?: string;
  }): CustomerProfile => {
    const now = new Date().toISOString();
    const newCust: CustomerProfile = {
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: customerData.name.trim(),
      phone: customerData.phone.trim(),
      email: customerData.email?.trim() || undefined,
      notes: customerData.notes?.trim() || undefined,
      isVip: customerData.isVip || false,
      isLocked: customerData.isLocked || false,
      lockedReason: customerData.isLocked ? (customerData.lockedReason?.trim() || 'Chủ sân tạm khóa') : undefined,
      lockedAt: customerData.isLocked ? now : undefined,
      totalBookings: 0,
      totalSpent: 0,
      createdAt: now.split('T')[0]
    };
    setCustomers(prev => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (phoneOrId: string, updates: Partial<CustomerProfile>) => {
    setCustomers(prev => prev.map(c => (c.id === phoneOrId || c.phone === phoneOrId) ? { ...c, ...updates } : c));
  };

  const lockCustomer = (phoneOrId: string, reason?: string) => {
    const defaultReason = reason?.trim() || 'Chủ sân tạm khóa đặt sân do vi phạm nội quy/bùng kèo';
    const now = new Date().toISOString();
    setCustomers(prev => prev.map(c => {
      if (c.id === phoneOrId || c.phone === phoneOrId) {
        return {
          ...c,
          isLocked: true,
          lockedReason: defaultReason,
          lockedAt: now
        };
      }
      return c;
    }));
  };

  const unlockCustomer = (phoneOrId: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === phoneOrId || c.phone === phoneOrId) {
        return {
          ...c,
          isLocked: false,
          lockedReason: undefined,
          lockedAt: undefined
        };
      }
      return c;
    }));
  };

  const updateSettings = (updates: Partial<FacilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetAllData = () => {
    setCourts(INITIAL_COURTS);
    setBookings(getInitialBookings());
    setCustomers(INITIAL_CUSTOMERS);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.COURTS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginUser,
        logout,
        customerPhone,
        setCustomerPhone,
        customerName,
        setCustomerName,
        courts,
        bookings,
        customers,
        settings,
        createBooking,
        updateBooking,
        changeCourtBooking,
        cancelBooking,
        confirmDepositByManager,
        payDepositByCustomer,
        cancelDepositPending,
        addServiceToBooking,
        removeServiceFromBooking,
        checkInBooking,
        checkOutBooking,
        collectRemainingPayment,
        updateCourt,
        addCourt,
        deleteCourt,
        addCustomer,
        updateCustomer,
        lockCustomer,
        unlockCustomer,
        updateSettings,
        resetAllData,
        selectedSport,
        setSelectedSport,
        selectedDate,
        setSelectedDate,
        paymentNotification,
        triggerPaymentSuccess,
        clearPaymentSuccess
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
