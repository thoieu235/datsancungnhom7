import { Court, Booking, CustomerProfile, FacilitySettings } from '../types';

export const INITIAL_COURTS: Court[] = [
  // 6 Sân bóng đá
  {
    id: 'court-fb-1',
    name: 'Sân Bóng Đá 1 (Cỏ nhân tạo 7 người)',
    sport: 'football',
    courtNumber: 1,
    pricePerHour: 300000,
    peakPricePerHour: 450000,
    status: 'active',
    description: 'Sân cỏ nhân tạo nhập khẩu tiêu chuẩn FIFA mini, đèn chiếu sáng LED Philips 400W',
    amenities: ['Mặt cỏ chuẩn FIFA', 'Hệ thống đèn LED ban đêm', 'Lưới chắn bóng cao', 'Bóng thi đấu miễn phí'],
    surface: 'Cỏ nhân tạo sợi đay cao cấp',
    lighting: '8 dàn đèn LED 400W'
  },
  {
    id: 'court-fb-2',
    name: 'Sân Bóng Đá 2 (Cỏ nhân tạo 7 người)',
    sport: 'football',
    courtNumber: 2,
    pricePerHour: 300000,
    peakPricePerHour: 450000,
    status: 'active',
    description: 'Sân bóng thoáng mát trung tâm, vạch vôi chuẩn, khu nghỉ ngơi có mái che',
    amenities: ['Mặt cỏ chuẩn FIFA', 'Đèn LED công suất cao', 'Khu chờ có ghế ngồi', 'Nước uống nóng lạnh'],
    surface: 'Cỏ nhân tạo sợi đay cao cấp',
    lighting: '8 dàn đèn LED 400W'
  },
  {
    id: 'court-fb-3',
    name: 'Sân Bóng Đá 3 (Sân 5 người)',
    sport: 'football',
    courtNumber: 3,
    pricePerHour: 220000,
    peakPricePerHour: 320000,
    status: 'active',
    description: 'Sân bóng mini 5 người lý tưởng cho giao hữu tốc độ cao, thoát nước tốt',
    amenities: ['Mặt cỏ êm ái', 'Đèn LED ban đêm', 'Gần căn tin', 'Áo bib phân đội'],
    surface: 'Cỏ nhân tạo 50mm đệm cao su',
    lighting: '6 dàn đèn LED 300W'
  },
  {
    id: 'court-fb-4',
    name: 'Sân Bóng Đá 4 (Sân 5 người)',
    sport: 'football',
    courtNumber: 4,
    pricePerHour: 220000,
    peakPricePerHour: 320000,
    status: 'active',
    description: 'Sân 5 người gần cổng ra vào, thuận tiện khởi động và di chuyển',
    amenities: ['Mặt cỏ êm ái', 'Đèn LED ban đêm', 'Gần bãi xe', 'Áo bib phân đội'],
    surface: 'Cỏ nhân tạo 50mm đệm cao su',
    lighting: '6 dàn đèn LED 300W'
  },
  {
    id: 'court-fb-5',
    name: 'Sân Bóng Đá 5 (Sân 5 người)',
    sport: 'football',
    courtNumber: 5,
    pricePerHour: 220000,
    peakPricePerHour: 320000,
    status: 'active',
    description: 'Sân 5 người chất lượng cao, lưới bao kín, an toàn tuyệt đối',
    amenities: ['Mặt cỏ 50mm', 'Đèn LED chống chói', 'Khu nghỉ ngơi quạt mát', 'Bóng thi đấu'],
    surface: 'Cỏ nhân tạo 50mm đệm cao su',
    lighting: '6 dàn đèn LED 300W'
  },
  {
    id: 'court-fb-6',
    name: 'Sân Bóng Đá 6 (Sân 5 người)',
    sport: 'football',
    courtNumber: 6,
    pricePerHour: 220000,
    peakPricePerHour: 320000,
    status: 'maintenance',
    description: 'Đang bảo dưỡng bề mặt cỏ và thay thế hệ thống lưới đèn định kỳ',
    amenities: ['Đang bảo trì thảm cỏ', 'Hệ thống đèn LED mới'],
    surface: 'Đang bảo dưỡng',
    lighting: 'Bảo trì dàn đèn'
  },

  // 4 Sân cầu lông
  {
    id: 'court-bm-1',
    name: 'Sân Cầu Lông 1 (Thảm BWF Pro)',
    sport: 'badminton',
    courtNumber: 1,
    pricePerHour: 100000,
    peakPricePerHour: 140000,
    status: 'active',
    description: 'Sân thảm cầu lông đạt chuẩn thi đấu BWF, độ bám hoàn hảo, trần cao 9m không gió',
    amenities: ['Thảm PVC BWF 4.5mm', 'Đèn chống lóa mắt', 'Trần cao 9m không gió', 'Ghế trọng tài & nghỉ ngơi'],
    surface: 'Thảm PVC Enlio vân cát 4.5mm',
    lighting: 'Hệ thống đèn tuýp LED chống chói dọc biên'
  },
  {
    id: 'court-bm-2',
    name: 'Sân Cầu Lông 2 (Thảm BWF Pro)',
    sport: 'badminton',
    courtNumber: 2,
    pricePerHour: 100000,
    peakPricePerHour: 140000,
    status: 'active',
    description: 'Sân vị trí trung tâm, thông thoáng, ánh sáng đồng đều chuyên nghiệp',
    amenities: ['Thảm PVC BWF 4.5mm', 'Đèn chống lóa mắt', 'Trần cao 9m', 'Ổ cắm sạc điện thoại'],
    surface: 'Thảm PVC Enlio vân cát 4.5mm',
    lighting: 'Hệ thống đèn tuýp LED chống chói dọc biên'
  },
  {
    id: 'court-bm-3',
    name: 'Sân Cầu Lông 3 (Thảm BWF Tiêu chuẩn)',
    sport: 'badminton',
    courtNumber: 3,
    pricePerHour: 90000,
    peakPricePerHour: 130000,
    status: 'active',
    description: 'Sân thảm chất lượng cao, lưới căng chuẩn centimet, thích hợp tập luyện & thi đấu',
    amenities: ['Thảm PVC đàn hồi cao', 'Đèn LED viền sân', 'Trần cao không gió', 'Nước uống miễn phí'],
    surface: 'Thảm PVC 4.0mm',
    lighting: 'Đèn LED chống chói tiêu chuẩn'
  },
  {
    id: 'court-bm-4',
    name: 'Sân Cầu Lông 4 (Thảm BWF Tiêu chuẩn)',
    sport: 'badminton',
    courtNumber: 4,
    pricePerHour: 90000,
    peakPricePerHour: 130000,
    status: 'active',
    description: 'Sân cầu lông thoáng mát, gần khu thay đồ và tắm rửa',
    amenities: ['Thảm PVC đàn hồi cao', 'Đèn LED viền sân', 'Gần phòng thay đồ', 'Khu quạt làm mát'],
    surface: 'Thảm PVC 4.0mm',
    lighting: 'Đèn LED chống chói tiêu chuẩn'
  },

  // 4 Sân Pickleball
  {
    id: 'court-pk-1',
    name: 'Sân Pickleball 1 (Center Court VIP)',
    sport: 'pickleball',
    courtNumber: 1,
    pricePerHour: 150000,
    peakPricePerHour: 220000,
    status: 'active',
    description: 'Sân trung tâm VIP với khán đài mini, mặt sân Acrylic 8 lớp giảm chấn bảo vệ khớp gối',
    amenities: ['Sơn Acrylic 8 lớp tiêu chuẩn USA', 'Mái che cách nhiệt', 'Lưới Pickleball cố định chuẩn', 'Quạt công nghiệp làm mát'],
    surface: 'Acrylic chuyên dụng 8 lớp Cushion',
    lighting: 'Hệ thống đèn LED thể thao 500 Lux'
  },
  {
    id: 'court-pk-2',
    name: 'Sân Pickleball 2 (Mái che mát)',
    sport: 'pickleball',
    courtNumber: 2,
    pricePerHour: 140000,
    peakPricePerHour: 200000,
    status: 'active',
    description: 'Sân có mái che cao ráo, chơi được cả trời mưa nắng, mặt sơn độ nảy chuẩn quốc tế',
    amenities: ['Mái che cách nhiệt 100%', 'Mặt sơn Acrylic giảm chấn', 'Ghế ngồi nghỉ ngơi', 'Nước lọc nóng lạnh'],
    surface: 'Acrylic chuyên dụng 6 lớp',
    lighting: 'Đèn LED thể thao 400 Lux'
  },
  {
    id: 'court-pk-3',
    name: 'Sân Pickleball 3 (Mái che mát)',
    sport: 'pickleball',
    courtNumber: 3,
    pricePerHour: 140000,
    peakPricePerHour: 200000,
    status: 'active',
    description: 'Sân mái che tiêu chuẩn, không gian thoáng đãng, vạch kẻ sắc nét',
    amenities: ['Mái che cách nhiệt', 'Mặt sơn Acrylic', 'Bàn ghế nghỉ ngơi', 'Có cho thuê vợt & bóng'],
    surface: 'Acrylic chuyên dụng 6 lớp',
    lighting: 'Đèn LED thể thao 400 Lux'
  },
  {
    id: 'court-pk-4',
    name: 'Sân Pickleball 4 (Sân ngoài trời thoáng đãng)',
    sport: 'pickleball',
    courtNumber: 4,
    pricePerHour: 120000,
    peakPricePerHour: 180000,
    status: 'active',
    description: 'Sân ngoài trời đón gió tự nhiên, lưới chắn xung quanh, đèn sáng rực rỡ buổi tối',
    amenities: ['Mặt sơn ngoài trời chống trơn', 'Đèn LED ban đêm cực sáng', 'Bóng thi đấu Franklin X-40', 'Không gian mở rộng rãi'],
    surface: 'Sơn thể thao ngoài trời chống trơn trượt',
    lighting: 'Dàn đèn cao áp LED thể thao'
  }
];

export const INITIAL_SETTINGS: FacilitySettings = {
  name: 'SportArena Stadium Complex',
  address: 'Số 18 Đường Thể Thao, Khu Đô Thị Nam Sài Gòn, TP. Hồ Chí Minh',
  hotline: '0988.123.456',
  zalo: '0988123456',
  openTime: '06:00',
  closeTime: '23:00',
  peakHourStart: '17:00',
  peakHourEnd: '22:00',
  defaultDepositRate: 30,
  bankName: 'MB Bank (Quân Đội)',
  bankAccount: '0988123456',
  bankAccountName: 'SPORTARENA COMPLEX'
};

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'cust-1',
    name: 'Đặng Tuấn Anh',
    phone: '0912345678',
    email: 'tuananh.dang@gmail.com',
    totalBookings: 12,
    totalSpent: 4200000,
    isVip: true,
    notes: 'Khách quen thường đặt Sân bóng 1 tối thứ 3, 5 hàng tuần. Luôn thanh toán đúng hạn.',
    createdAt: '2026-08-10'
  },
  {
    id: 'cust-2',
    name: 'Nguyễn Hoàng Minh',
    phone: '0987654321',
    email: 'minh.hoang@gmail.com',
    totalBookings: 6,
    totalSpent: 980000,
    isVip: false,
    notes: 'Thường chơi cầu lông sáng chủ nhật.',
    createdAt: '2026-09-02'
  },
  {
    id: 'cust-3',
    name: 'Trần Thị Thu Hà',
    phone: '0903112233',
    email: 'thuha.pickle@gmail.com',
    totalBookings: 8,
    totalSpent: 1650000,
    isVip: true,
    notes: 'Nhóm Pickleball cố định chiều thứ 7.',
    createdAt: '2026-09-15'
  },
  {
    id: 'cust-4',
    name: 'Lê Văn Phúc',
    phone: '0934567890',
    email: 'phuc.le@yahoo.com',
    totalBookings: 3,
    totalSpent: 950000,
    isVip: false,
    notes: 'Thường đặt sân bóng 3 hoặc 4.',
    createdAt: '2026-10-01'
  },
  {
    id: 'cust-5',
    name: 'Phạm Thanh Tùng',
    phone: '0977889900',
    email: 'tung.pham@viettel.com.vn',
    totalBookings: 5,
    totalSpent: 1400000,
    isVip: false,
    notes: 'Thường thuê thêm vợt pickleball tại quầy.',
    createdAt: '2026-10-05'
  },
  {
    id: 'cust-6',
    name: 'Vũ Quốc Bảo',
    phone: '0961223344',
    email: 'baovu.tech@gmail.com',
    totalBookings: 9,
    totalSpent: 3150000,
    isVip: true,
    notes: 'Khách VIP doanh nghiệp FPT, đặt sân cố định hàng tuần.',
    createdAt: '2026-08-22'
  },
  {
    id: 'cust-7',
    name: 'Hoàng Mai Phương',
    phone: '0945667788',
    email: 'maiphuong.h@gmail.com',
    totalBookings: 2,
    totalSpent: 480000,
    isVip: false,
    notes: 'Khách mới tập chơi cầu lông.',
    createdAt: '2026-10-08'
  },
  {
    id: 'cust-8',
    name: 'Bùi Đức Trọng',
    phone: '0919887766',
    email: 'trongbui@vnpay.vn',
    totalBookings: 7,
    totalSpent: 2200000,
    isVip: false,
    notes: 'Ưa thích thanh toán chuyển khoản VietQR.',
    createdAt: '2026-09-20'
  }
];

// Helper to get formatted date string for today and upcoming days
const getFormattedDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const getInitialBookings = (): Booking[] => {
  const today = getFormattedDate(0);
  const tomorrow = getFormattedDate(1);

  return [
    {
      id: 'BK-8901',
      courtId: 'court-fb-1',
      courtName: 'Sân Bóng Đá 1 (Cỏ nhân tạo 7 người)',
      sport: 'football',
      customerName: 'Đặng Tuấn Anh',
      customerPhone: '0912345678',
      customerEmail: 'tuananh.dang@gmail.com',
      date: today,
      startTime: '17:30',
      endTime: '19:00',
      durationHours: 1.5,
      totalAmount: 675000,
      depositRate: 30,
      depositAmount: 202500,
      remainingAmount: 472500,
      paymentStatus: 'deposited',
      checkInStatus: 'not_checked_in',
      paymentMethod: 'vietqr',
      qrPassCode: 'PASS-FB1-8901',
      note: 'Chuẩn bị thêm 2 quả bóng số 5 và 1 bộ áo bib xanh',
      createdByRole: 'customer',
      createdAt: `${today}T08:30:00Z`
    },
    {
      id: 'BK-8902',
      courtId: 'court-fb-2',
      courtName: 'Sân Bóng Đá 2 (Cỏ nhân tạo 7 người)',
      sport: 'football',
      customerName: 'Lê Văn Phúc',
      customerPhone: '0934567890',
      customerEmail: 'phuc.le@yahoo.com',
      date: today,
      startTime: '19:00',
      endTime: '20:30',
      durationHours: 1.5,
      totalAmount: 675000,
      depositRate: 30,
      depositAmount: 202500,
      remainingAmount: 472500,
      paymentStatus: 'deposited',
      checkInStatus: 'not_checked_in',
      paymentMethod: 'vietqr',
      qrPassCode: 'PASS-FB2-8902',
      note: 'Giao hữu công ty FPT',
      createdByRole: 'customer',
      createdAt: `${today}T09:15:00Z`
    },
    {
      id: 'BK-8903',
      courtId: 'court-bm-1',
      courtName: 'Sân Cầu Lông 1 (Thảm BWF Pro)',
      sport: 'badminton',
      customerName: 'Nguyễn Hoàng Minh',
      customerPhone: '0987654321',
      customerEmail: 'minh.hoang@gmail.com',
      date: today,
      startTime: '08:00',
      endTime: '10:00',
      durationHours: 2,
      totalAmount: 200000,
      depositRate: 30,
      depositAmount: 60000,
      remainingAmount: 0,
      paymentStatus: 'fully_paid',
      checkInStatus: 'checked_out',
      paymentMethod: 'vietqr',
      qrPassCode: 'PASS-BM1-8903',
      note: 'Ca tập sáng sớm',
      createdByRole: 'customer',
      createdAt: `${today}T06:00:00Z`,
      checkedInAt: `${today}T07:55:00Z`,
      checkedOutAt: `${today}T10:05:00Z`
    },
    {
      id: 'BK-8904',
      courtId: 'court-pk-1',
      courtName: 'Sân Pickleball 1 (Center Court VIP)',
      sport: 'pickleball',
      customerName: 'Trần Thị Thu Hà',
      customerPhone: '0903112233',
      customerEmail: 'thuha.pickle@gmail.com',
      date: today,
      startTime: '16:00',
      endTime: '18:00',
      durationHours: 2,
      totalAmount: 370000,
      depositRate: 50, // chủ sân đổi cọc thủ công cho khách thân thiết
      depositAmount: 185000,
      remainingAmount: 185000,
      paymentStatus: 'deposited',
      checkInStatus: 'checked_in',
      paymentMethod: 'vietqr',
      qrPassCode: 'PASS-PK1-8904',
      note: 'Khách VIP - Đã check-in lúc 15:50, đang chơi',
      createdByRole: 'manager',
      createdAt: `${today}T10:00:00Z`,
      checkedInAt: `${today}T15:50:00Z`
    },
    {
      id: 'BK-8905',
      courtId: 'court-pk-2',
      courtName: 'Sân Pickleball 2 (Mái che mát)',
      sport: 'pickleball',
      customerName: 'Phạm Thanh Tùng',
      customerPhone: '0977889900',
      date: today,
      startTime: '18:00',
      endTime: '20:00',
      durationHours: 2,
      totalAmount: 400000,
      depositRate: 30,
      depositAmount: 120000,
      remainingAmount: 280000,
      paymentStatus: 'deposited',
      checkInStatus: 'not_checked_in',
      paymentMethod: 'vietqr',
      qrPassCode: 'PASS-PK2-8905',
      note: 'Thuê thêm 2 vợt Pickleball tại quầy',
      createdByRole: 'customer',
      createdAt: `${today}T11:00:00Z`
    },
    {
      id: 'BK-8906',
      courtId: 'court-bm-2',
      courtName: 'Sân Cầu Lông 2 (Thảm BWF Pro)',
      sport: 'badminton',
      customerName: 'Đặng Tuấn Anh',
      customerPhone: '0912345678',
      date: tomorrow,
      startTime: '18:00',
      endTime: '20:00',
      durationHours: 2,
      totalAmount: 280000,
      depositRate: 30,
      depositAmount: 84000,
      remainingAmount: 196000,
      paymentStatus: 'deposited',
      checkInStatus: 'not_checked_in',
      paymentMethod: 'vietqr',
      qrPassCode: 'PASS-BM2-8906',
      note: '',
      createdByRole: 'customer',
      createdAt: `${today}T12:00:00Z`
    }
  ];
};
