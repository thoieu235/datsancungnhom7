# Hệ thống Quản lý & Đặt sân Thể thao Đa năng (Bóng đá · Cầu lông · Pickleball)

Nền tảng đặt sân trực tuyến tối ưu trải nghiệm dành cho khách hàng kết hợp bảng điều khiển vận hành chuyên nghiệp dành cho chủ sân thể thao gồm 6 sân bóng đá cỏ nhân tạo, 4 sân cầu lông và 4 sân pickleball tiêu chuẩn.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Các quyết định đã xác nhận & cơ chế vận hành:**
> - **Chính sách đặt cọc linh hoạt**: Hệ thống mặc định áp dụng mức cọc **30%** khi khách hàng đặt trực tuyến, nhưng khi chủ sân đặt lịch hộ khách hoặc cập nhật đơn tại quầy, chủ sân có thể điều chỉnh thủ công tỷ lệ cọc (0%, 30%, 50%, 100%) hoặc nhập trực tiếp số tiền cọc tùy ý.
> - **Phân quyền & Chuyển đổi vai trò**: Cung cấp bộ chuyển đổi vai trò tức thì giữa **Khách hàng** (giao diện đặt sân, tra cứu lịch trống theo bộ môn, thanh toán VietQR, lịch sử đặt sân cá nhân) và **Chủ sân / Quản lý** (quản trị ma trận sân thời gian thực, check-in/out, thu cọc & phần còn lại, đổi sân/hủy sân, quản lý khách hàng & giá giờ cao điểm).
> - **Giao diện đặt lịch tối ưu**: Kết hợp ma trận thời gian trực quan (Time-Grid Slot Matrix) và bộ lọc nhanh theo bộ môn (Bóng đá / Cầu lông / Pickleball) + chọn ngày, giúp khách hàng nhận biết ngay sân nào còn trống và đặt chỉ trong 3 bước.

---

## 1. Overview & Core Concept

- **Mục tiêu**: Xóa bỏ rào cản trùng lịch, hỏi sân thủ công qua tin nhắn và hỗ trợ quản lý toàn diện cơ sở thể thao 14 sân (6 Sân bóng đá mini 5-7 người, 4 Sân cầu lông thảm PVC, 4 Sân pickleball đạt chuẩn thi đấu).
- **Đối tượng sử dụng**:
  - **Khách hàng**: Người chơi thể thao, đội nhóm phong trào, cơ quan muốn tìm sân nhanh theo môn, giờ trống, đặt cọc minh bạch, giữ chỗ tức thì và có mã vé QR check-in tại quầy.
  - **Chủ sân / Quản lý**: Nhân sự quản lý sân thể thao cần nắm bắt trạng thái 14 sân thời gian thực, xử lý đơn đặt, đổi sân khi khách gọi hotline, check-in khách đến sân, thu nốt 70% số tiền còn lại và theo dõi khách hàng thân thiết.
- **Giá trị cốt lõi**: Trải nghiệm đặt sân 3 bước mượt mà, hạn chế tối đa sai sót lịch, kiểm soát dòng tiền cọc và thanh toán quyết toán minh bạch.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Khách hàng - Tìm kiếm & Đặt sân theo ca giờ**:
   - Chọn môn thể thao (Bóng đá, Cầu lông hoặc Pickleball) $\rightarrow$ Chọn ngày thi đấu.
   - Bảng ma trận giờ (06:00 đến 23:00) hiển thị rõ ràng từng sân với mã màu trực quan: **Còn trống (Available)**, **Đã đặt (Booked)**, **Đang chơi (In-use)**, **Bảo trì (Maintenance)**.
   - Nhấp vào slot trống $\rightarrow$ Ngăn bên phải hiển thị tóm tắt: Sân, loại sân, khung giờ, bảng giá (giờ thường / giờ vàng), tạm tính tổng tiền và mức cọc 30%.
   - Nhập thông tin liên hệ (Tên, SĐT, ghi chú) $\rightarrow$ Bấm "Tiến hành đặt cọc".
   
2. **Khách hàng - Thanh toán VietQR & Nhận vé xác nhận tức thì**:
   - Hiển thị mã VietQR động kèm thông tin chuyển khoản chính xác: Ngân hàng, Số tài khoản, Số tiền cọc (30%), Nội dung chuyển khoản chuẩn cú pháp (`DATSAN [Mã_Đơn] [SĐT]`).
   - Khách bấm "Xác nhận đã chuyển khoản" (hoặc mô phỏng thanh toán tự động) $\rightarrow$ Hệ thống chuyển trạng thái đơn sang **Đã cọc 30% (Confirmed)** và cấp ngay **Mã vé điện tử (Booking QR Pass)**.
   - Thẻ thông báo hướng dẫn: *Khách hàng cần đổi giờ hoặc đổi sân xin vui lòng liên hệ Hotline/Zalo ban quản lý sân trước giờ đấu 2 tiếng*.

3. **Khách hàng - Quản lý Lịch sử Đặt sân & Check-in**:
   - Tab "Lịch sử của tôi" lưu trữ các đơn đặt: Đang chờ chơi, Đã check-in, Đã hoàn thành, Đã hủy.
   - Chi tiết đơn thể hiện rõ: Tiền đã cọc, Số tiền còn lại cần đóng tại quầy khi nhận sân.

4. **Chủ sân - Bảng Điều khiển Tổng thể (Manager Dashboard)**:
   - **Ma trận 14 sân thời gian thực**: Lọc nhanh theo 3 môn, xem ai đang chơi trên sân nào, ca giờ tiếp theo là ai.
   - **Đặt sân trực tiếp tại quầy (Quick Walk-in Booking)**: Cho phép chủ sân book lịch tại chỗ cho khách vãng lai, tự do điều chỉnh tiền cọc (nhập số tiền cọc tùy ý hoặc miễn cọc 0%).
   - **Đổi sân & Hủy sân theo yêu cầu**: Khi khách gọi hotline, chủ sân mở đơn $\rightarrow$ chọn "Đổi sân/Đổi giờ" (chuyển sang sân trống cùng loại hoặc giờ khác), hoặc "Hủy đơn & hoàn cọc/hủy chỗ".
   - **Quy trình Check-in & Check-out**:
     - Khách đến sân $\rightarrow$ Quét hoặc tra mã vé $\rightarrow$ Hiển thị số tiền còn lại cần thu (ví dụ 70% còn lại) $\rightarrow$ Nút "Xác nhận thu nốt & Check-in".
     - Hết giờ $\rightarrow$ Bấm "Check-out hoàn tất sân" $\rightarrow$ Sân trở về trạng thái sẵn sàng.
   - **Quản lý Bảng giá & Giờ hoạt động**: Cấu hình giá giờ thường, giá giờ cao điểm (17:00 - 21:00), cuối tuần cho từng loại sân; thông tin tiện ích sân.
   - **Quản lý Khách hàng**: Danh sách khách, số điện thoại, tổng lượt đặt, tổng chi tiêu và phân loại khách VIP.

### Visual Identity & Theme

- **Phong cách thẩm mỹ**: Thể thao hiện đại, cao cấp, tinh gọn và tràn đầy năng lượng (Sport High-Performance Aesthetics).
- **Màu sắc chủ đạo**:
  - Nền Canvas: Nền sáng cao cấp kết hợp dark slate tạo chiều sâu chuyên nghiệp (`bg-slate-50` / `bg-slate-900`).
  - Màu phân loại môn thể thao:
    - **Bóng đá**: Emerald / Forest Green (`emerald-600` tượng trưng cho mặt cỏ sân).
    - **Cầu lông**: Sapphire / Sky Blue (`blue-600` tượng trưng cho thảm thi đấu chuẩn).
    - **Pickleball**: Energetic Amber / Lime Green (`amber-500` & `lime-600` đặc trưng của bóng pickleball).
  - Trạng thái sân:
    - Xanh lá: Sẵn sàng / Còn trống.
    - Xanh lam: Đã xác nhận / Đã cọc.
    - Tím / Cam: Đang sử dụng trên sân.
    - Xám nhạt: Khung giờ đã qua hoặc đang bảo trì.
- **Typography**: `Plus Jakarta Sans` cho tiêu đề và thương hiệu, số liệu và giá tiền sử dụng `font-mono tabular-nums` để căn chỉnh cột chuẩn xác.
- **Micro-interactions**: Chuyển tab mượt mà với Motion, hiệu ứng pulse nhẹ khi slot đang chọn, thẻ modal thanh toán VietQR sắc nét.

---

## 3. Key Product Decisions & Trade-Offs

- **Cơ chế lưu trữ trạng thái (Data Persistence)**: Sử dụng LocalStorage kết hợp bộ dữ liệu mẫu 14 sân được khởi tạo đầy đủ (6 sân bóng, 4 sân cầu lông, 4 sân pickleball) kèm các ca đặt thực tế trong tuần. Mọi thay đổi (đặt sân, đổi sân, chỉnh cọc, check-in/out, đổi giá) đều được lưu trữ bền vững trong trình duyệt.
- **Trải nghiệm Đổi sân qua Hotline/Quản lý**: Đúng với quy định thực tế tại các cụm sân thể thao Việt Nam, khách hàng không tự ý nhảy sân trên web để tránh xung đột khung giờ và chênh lệch cọc, mà liên hệ chủ sân để chủ sân đổi trực tiếp trong quyền Admin.
- **Tùy biến cọc 30% linh hoạt**: Khách đặt qua web tự động tính 30% tiền cọc. Phía quản lý có ô input cho phép ghi đè mức cọc này khi thao tác thay khách.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SPORTS COURT APP ROOT                          │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation (Brand Wordmark · Role Switcher: Khách/Chủ · Date)    │
├───────────────────────────────────┬────────────────────────────────────┤
│       CUSTOMER VIEW               │         MANAGER VIEW               │
│ ┌───────────────────────────────┐ │ ┌────────────────────────────────┐ │
│ │ Sport Filter Tabs             │ │ │ Operations Overview (KPIs)     │ │
│ │ (Bóng đá | Cầu lông | Pickle) │ │ │ (Sân đang chơi, Doanh thu cọc) │ │
│ ├───────────────────────────────┤ │ ├────────────────────────────────┤ │
│ │ Time-Grid Court Matrix View   │ │ │ Master Time-Grid & Slot Editor │ │
│ │ (6 Sân bóng · 4 Cầu lông · 4) │ │ ├────────────────────────────────┤ │
│ ├───────────────────────────────┤ │ │ Booking Actions: Change/Cancel │ │
│ │ Booking Drawer & VietQR Modal │ │ ├────────────────────────────────┤ │
│ │ (Cọc 30% · Xác nhận tức thì)  │ │ │ Check-in / Checkout / Thu nốt  │ │
│ ├───────────────────────────────┤ │ ├────────────────────────────────┤ │
│ │ My Bookings History & QR Pass │ │ │ Court Info & Pricing Manager   │ │
│ └───────────────────────────────┘ │ │ Customer Directory CRM         │ │
│                                   │ └────────────────────────────────┘ │
├───────────────────────────────────┴────────────────────────────────────┤
│  Shared Storage Service (Courts, Slots, Bookings, Customers, Settings) │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Entities & Data Model

1. **Court**:
   - `id`: string (`court-fb-1` ... `court-fb-6`, `court-bm-1` ... `court-bm-4`, `court-pk-1` ... `court-pk-4`)
   - `name`: string ("Sân bóng cỏ 1", "Sân cầu lông VIP 2", "Sân Pickleball Pro 3")
   - `sport`: `'football' | 'badminton' | 'pickleball'`
   - `pricePerHour`: number (e.g. 250,000 VND / 120,000 VND / 180,000 VND)
   - `peakPricePerHour`: number (sau 17:00 & cuối tuần)
   - `status`: `'active' | 'maintenance'`
   - `amenities`: string[] ("Mái che", "Đèn LED chuyên dụng", "Thảm chuẩn", "Nước uống")

2. **Booking**:
   - `id`: string (e.g. `BK-8821`)
   - `courtId`: string
   - `courtName`: string
   - `sport`: `'football' | 'badminton' | 'pickleball'`
   - `customerName`: string
   - `customerPhone`: string
   - `date`: string (YYYY-MM-DD)
   - `startTime`: string (e.g. "17:30")
   - `endTime`: string (e.g. "19:00")
   - `durationHours`: number
   - `totalAmount`: number
   - `depositRate`: number (default 30, customizable by manager)
   - `depositAmount`: number
   - `remainingAmount`: number
   - `paymentStatus`: `'deposit_pending' | 'deposited' | 'fully_paid' | 'refunded'`
   - `checkInStatus`: `'not_checked_in' | 'checked_in' | 'checked_out' | 'cancelled'`
   - `note`: string
   - `createdAt`: string

3. **Time Slots**:
   - Khung giờ hoạt động từ 06:00 đến 23:00, chia theo các slot linh hoạt và trực quan.
