# TÀI LIỆU VẬN HÀNH & GIẢI QUYẾT MÂU THUẪN NGHIỆP VỤ HỆ THỐNG SPORTARENA

Hệ thống quản lý và đặt sân thể thao **SportArena** (gồm 14 sân: 6 sân bóng đá, 4 sân cầu lông, 4 sân pickleball) được hoàn thiện toàn diện với các quy tắc nghiệp vụ và giao diện chuẩn xác như sau:

---

## 1. Khóa và Mở Khóa Khách Hàng (Lock / Unlock Customers)
- **Vị trí thao tác:** Chủ sân / Quản lý có thể thực hiện khóa hoặc mở khóa khách hàng ở cả 2 màn hình:
  - **Màn hình danh sách khách hàng (`ManagerCustomers`):** Nút hành động trực tiếp trên từng dòng bảng cùng bộ lọc trạng thái (*Tất cả*, *Đang hoạt động*, *Đang bị khóa*).
  - **Màn hình chi tiết khách hàng (`CustomerDetailModal`):** Banner cảnh báo trạng thái đỏ/xanh, hiển thị lý do khóa, thời điểm khóa và nút chuyển đổi trạng thái tức thì.
- **Quy tắc khi tài khoản bị khóa:**
  - Khách hàng có số điện thoại bị khóa sẽ bị chặn không thể thực hiện đặt sân trực tuyến (ở cả bước chọn ca và bước xác nhận).
  - Khi cố gắng đăng nhập tại Modal xác thực, hệ thống sẽ hiển thị cảnh báo đỏ nêu rõ lý do bị khóa và hiển thị số Hotline để liên hệ xử lý.
  - Khi chủ sân tạo đơn đặt hộ trên màn hình quản lý, hệ thống sẽ cảnh báo tài khoản đang bị khóa và cung cấp nút mở khóa nhanh ngay tại form đặt sân nếu chủ sân đồng ý.

---

## 2. Chuẩn Hóa Căn Thẳng Hàng Cột Ma Trận Lịch Sân (Schedule Matrix Alignment)
- **Vấn đề trước đây:** Các ô ở Hàng 1 (hàng tiêu đề thời gian và hàng sân đầu tiên) bị lệch pixel so với các hàng dưới do cơ chế `border-collapse` của trình duyệt khi kết hợp `sticky` và thiếu thẻ định nghĩa cột.
- **Giải pháp kỹ thuật đã áp dụng:**
  - Chuyển toàn bộ cấu trúc bảng ma trận sang `border-separate border-spacing-0`.
  - Khai báo thẻ `<colgroup>` cố định kích thước cột bằng pixel chuẩn: Cột Tên Sân cố định `190px`, 16 cột khung giờ (06:00 - 22:00) cố định chính xác `75px/cột`.
  - Đồng bộ chiều cao ô `h-[58px]`, viền `border-b border-r border-slate-200` và `box-border` xuyên suốt từ tiêu đề đến tất cả các dòng sân, đảm bảo thẳng hàng 100% tuyệt đối trên mọi độ phân giải màn hình.

---

## 3. Quản Lý Khách Hàng & Nguyên Tắc Không Tự Động Thêm Khi Chủ Sân Đặt Sân
- **Chức năng Thêm khách hàng mới chủ động (`AddCustomerModal`):**
  - Đặt nút **"+ Thêm Khách Hàng Mới"** nổi bật tại giao diện Quản Lý Khách Hàng.
  - Xác thực số điện thoại chuẩn Việt Nam (10 chữ số bắt đầu bằng số 0, chống trùng lặp SĐT).
  - Nhập họ tên (bắt buộc), email, phân loại VIP, ghi chú nội bộ và tùy chọn khóa ngay từ đầu với lý do cụ thể.
- **Giải quyết triệt để mâu thuẫn thêm khách:**
  - Khi **khách hàng tự đặt online:** Hệ thống ghi nhận hồ sơ khách hàng.
  - Khi **chủ sân/quản lý đặt sân hộ khách vãng lai:** Hệ thống **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG THÊM** khách đó vào danh bạ quản trị. Form tạo đơn hiển thị nhãn thông tin rõ ràng: *Khách vãng lai: Đơn đặt này sẽ không tự động thêm vào danh sách khách hàng. Để lưu hồ sơ lâu dài, vui lòng dùng chức năng Thêm khách hàng mới.*

---

## 4. Hệ Thống Đăng Nhập, Đăng Ký & Đăng Xuất (Phone + OTP Verification)
- **Hiển thị yêu cầu đăng nhập khi vào website:**
  - Khi người dùng truy cập website lần đầu (hoặc sau khi đăng xuất), hệ thống tự động hiển thị Modal yêu cầu đăng nhập bằng số điện thoại. Người dùng có thể đăng nhập ngay hoặc bấm "Xem trước với tư cách khách vãng lai".
- **Nhận diện và đăng ký tài khoản:**
  - **Tài khoản Admin / Chủ sân cấp sẵn:** Hệ thống tích hợp sẵn tài khoản Quản lý với SĐT **`0988888888`** (có nút bấm điền nhanh một chạm). Khi nhập SĐT này và mã OTP, người dùng được cấp quyền Chủ sân toàn quyền (`role = 'manager'`).
  - **Khách hàng đã có tài khoản:** Nhận diện ngay tên khách hàng, kiểm tra trạng thái khóa và gửi mã OTP 6 số.
  - **Số điện thoại chưa tồn tại (Đăng ký mới):** Hệ thống tự động mở thêm bước nhập **Họ và tên khách hàng** (bắt buộc) và Email (tùy chọn) để hoàn tất đăng ký ngay trong luồng OTP.
- **Cơ chế giới hạn bảo mật mã OTP:**
  - **Tối đa 5 lần nhập sai:** Hệ thống hiển thị số lần thử còn lại `Còn X/5 lần thử`.
  - **Thời gian chờ 1 phút 30 giây (90s):** Nếu nhập sai đủ 5 lần, hệ thống tạm khóa ô nhập OTP và kích hoạt đồng hồ đếm ngược trực tiếp từ `01:30` về `00:00`. Trạng thái khóa được lưu trong `localStorage` để ngăn chặn gian lận tải lại trang. Hết 90 giây hệ thống tự động mở lại cho người dùng thử lại.
  - **Mã OTP Demo:** Hiển thị trực tiếp qua thông báo SMS giả lập trên màn hình, hỗ trợ nút "Điền nhanh mã" hoặc nhập mã dự phòng `686868` để kiểm thử tiện lợi.
- **Chức năng Đăng xuất (Logout):**
  - Tích hợp nút Đăng xuất rõ ràng trên thanh Navbar khách hàng và thanh Sidebar / Header quản lý.
  - Khi bấm Đăng xuất, hệ thống xóa phiên làm việc và hiển thị lại hộp thoại Đăng nhập để sẵn sàng cho phiên mới.

---

## 5. Cập Nhật Quản Lý Sân & Thêm Sân Mới (Court Management & Form Upgrades)
- **Đổi "STT Sân" thành "Mã Sân" (`courtCode`):**
  - Trong Modal Thêm sân mới (`CourtFormModal`) và Chỉnh sửa thông tin sân, trường số thứ tự (STT) đã được chuyển đổi thành **Mã Sân** với định dạng chuẩn chuyên nghiệp (VD: `FB-01` cho Bóng Đá, `BD-01` cho Cầu Lông, `PK-01` cho Pickleball).
  - Tự động gợi ý mã sân theo bộ môn đã chọn, hỗ trợ chuyển đổi chữ hoa tự động và kiểm tra tính duy nhất chống trùng lặp.
  - Mã sân hiển thị nổi bật trên thẻ sân (`CourtVisualBadge`), bảng ma trận lịch sân và các hóa đơn đặt sân.
- **Thêm "Khoảng Thời Gian Bảo Trì (Nếu có)" vào thông tin sân:**
  - Bổ sung nhóm trường quản lý bảo trì chi tiết: **Thời gian bắt đầu bảo trì** (`maintenanceStart`), **Thời gian kết thúc bảo trì** (`maintenanceEnd`) và **Lý do bảo trì** (`maintenanceReason`).
  - Hỗ trợ các nút chọn nhanh tiện lợi: *Hôm nay*, *2 ngày*, *1 tuần*, và nút xóa thông tin bảo trì.
  - Tự động cảnh báo và kiểm tra các ca đặt sân hiện có bị ảnh hưởng khi chuyển sân sang trạng thái bảo trì.
  - Hiển thị tooltip chi tiết lý do và khung thời gian bảo trì khi di chuột qua các ô bảo trì trên ma trận lịch sân.
- **Thay đổi phần tìm kiếm & bộ lọc của quản lý sân:**
  - Bộ lọc trước đây mang tên "Phân loại" đã được chuẩn hóa đổi tên thành **"Bộ môn"** (`sportFilter`).
  - Cung cấp các tùy chọn rõ ràng: *Tất cả bộ môn*, *⚽ Bộ môn Bóng Đá*, *🏸 Bộ môn Cầu Lông*, *🎾 Bộ môn Pickleball* kèm số lượng sân cụ thể của từng môn.
  - Kết hợp đồng bộ với ô tìm kiếm tức thì theo tên sân, mã sân hoặc chất liệu bề mặt.

