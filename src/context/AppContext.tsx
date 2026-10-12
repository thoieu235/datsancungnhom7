import React, { createContext, useContext, useState, useEffect } from 'react';
import { Court, Booking, CustomerProfile, FacilitySettings, SportType } from '../types';
import { INITIAL_COURTS, INITIAL_SETTINGS, INITIAL_CUSTOMERS, getInitialBookings } from '../data/mockData';

interface AppContextType {
  role: 'customer' | 'manager';
  setRole: (role: 'customer' | 'manager') => void;
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
  checkInBooking: (id: string, collectRemainingPayment?: boolean) => void;
  checkOutBooking: (id: string) => void;
  collectRemainingPayment: (id: string) => void;
  updateCourt: (id: string, updates: Partial<Court>) => void;
  updateSettings: (updates: Partial<FacilitySettings>) => void;
  resetAllData: () => void;
  selectedSport: SportType;
  setSelectedSport: (sport: SportType) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'sportarena_role_v1',
  COURTS: 'sportarena_courts_v1',
  BOOKINGS: 'sportarena_bookings_v1',
  CUSTOMERS: 'sportarena_customers_v1',
  SETTINGS: 'sportarena_settings_v1',
  CUSTOMER_PHONE: 'sportarena_cust_phone_v1',
  CUSTOMER_NAME: 'sportarena_cust_name_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<'customer' | 'manager'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return saved === 'manager' ? 'manager' : 'customer';
  });

  const [customerPhone, setCustomerPhoneState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOMER_PHONE) || '0912345678';
  });

  const [customerName, setCustomerNameState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOMER_NAME) || 'Đặng Tuấn Anh';
  });

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

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      createdAt: now,
      qrPassCode,
    };

    setBookings(prev => [newBooking, ...prev]);

    // Upsert customer profile
    setCustomers(prev => {
      const existingIndex = prev.findIndex(c => c.phone === bookingData.customerPhone);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updatedList = [...prev];
        const newTotalBookings = existing.totalBookings + 1;
        const newTotalSpent = existing.totalSpent + bookingData.totalAmount;
        updatedList[existingIndex] = {
          ...existing,
          name: bookingData.customerName || existing.name,
          totalBookings: newTotalBookings,
          totalSpent: newTotalSpent,
          isVip: newTotalSpent >= 3000000 || newTotalBookings >= 5,
        };
        return updatedList;
      } else {
        const newCustomer: CustomerProfile = {
          id: `cust-${Date.now()}`,
          name: bookingData.customerName,
          phone: bookingData.customerPhone,
          email: bookingData.customerEmail,
          totalBookings: 1,
          totalSpent: bookingData.totalAmount,
          isVip: false,
          notes: 'Khách hàng mới tạo từ hệ thống đặt online',
          createdAt: now.split('T')[0]
        };
        return [newCustomer, ...prev];
      }
    });

    return newBooking;
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
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
      // overlap check
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
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        paymentStatus: 'cancelled',
        checkInStatus: 'cancelled',
        note: `${b.note ? b.note + ' | ' : ''}Đã hủy: ${cancelNote || 'Khách liên hệ hủy'}`
      };
    }));
  };

  const checkInBooking = (id: string, collectRemainingPayment: boolean = true) => {
    const now = new Date().toISOString();
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        checkInStatus: 'checked_in',
        checkedInAt: now,
        ...(collectRemainingPayment ? {
          paymentStatus: 'fully_paid',
          remainingAmount: 0
        } : {})
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

  const collectRemainingPayment = (id: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        paymentStatus: 'fully_paid',
        remainingAmount: 0
      };
    }));
  };

  const updateCourt = (id: string, updates: Partial<Court>) => {
    setCourts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
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
        checkInBooking,
        checkOutBooking,
        collectRemainingPayment,
        updateCourt,
        updateSettings,
        resetAllData,
        selectedSport,
        setSelectedSport,
        selectedDate,
        setSelectedDate,
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
