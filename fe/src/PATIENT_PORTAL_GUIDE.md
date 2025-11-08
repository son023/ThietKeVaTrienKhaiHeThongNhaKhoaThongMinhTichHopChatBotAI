# Hướng dẫn sử dụng Patient Portal - DentalCareX

## 🎯 Tổng quan

Patient Portal là giao diện dành cho bệnh nhân để quản lý lịch hẹn, xem hồ sơ bệnh án, thanh toán hóa đơn và tương tác với hệ thống phòng khám nha khoa DentalCareX.

## 🔐 Đăng nhập

### Tài khoản mẫu để test:
- **Email**: bất kỳ (ví dụ: patient@gmail.com)
- **Password**: bất kỳ
- **Role**: Patient (mặc định cho tất cả email không phải staff)

### Tài khoản staff (để test các role khác):
- Admin: `admin@gmail.com`
- Pharmacist: `pharmacist@gmail.com`
- Receptionist: `receptionist@gmail.com`
- Doctor: `doctor@gmail.com`

## 📱 Các tính năng chính

### 1. Dashboard (Trang chủ)
**Đường dẫn**: Trang chủ sau khi đăng nhập

**Tính năng**:
- ✅ Xem tổng quan nhanh: lịch hẹn sắp tới, kế hoạch điều trị, lịch sử khám, hóa đơn chưa thanh toán
- ✅ Thẻ thống kê với số liệu trực quan
- ✅ Danh sách lịch hẹn sắp tới chi tiết
- ✅ Tiến độ điều trị với thanh progress bar
- ✅ Cảnh báo hóa đơn chưa thanh toán
- ✅ Quick actions: Đặt lịch hẹn mới, Xem hồ sơ
- ✅ Thông tin liên hệ nhanh

### 2. Quản lý Lịch hẹn
**Đường dẫn**: Sidebar > Lịch hẹn

**Tính năng**:
- ✅ Tab "Lịch hẹn sắp tới":
  - Xem danh sách lịch hẹn sắp tới
  - Thông tin chi tiết: dịch vụ, bác sĩ, ngày giờ, địa điểm
  - Trạng thái: Đã xác nhận / Chờ xác nhận
  - Ghi chú và nhắc nhở
  - Đổi lịch (reschedule)
  - Hủy lịch với dialog xác nhận
  
- ✅ Tab "Lịch sử khám":
  - Xem lịch sử các lần khám đã hoàn thành
  - Kết quả khám và chẩn đoán
  - Lịch tái khám tiếp theo
  - Đặt lại dịch vụ đã khám

### 3. Hồ sơ Bệnh án
**Đường dẫn**: Sidebar > Hồ sơ bệnh án

**Tính năng**:
- ✅ Tab "Thông tin cá nhân":
  - Hiển thị đầy đủ thông tin: họ tên, ngày sinh, giới tính, SĐT, email, địa chỉ
  - Liên hệ khẩn cấp
  - Nhóm máu, dị ứng, số BHYT
  - Chỉnh sửa thông tin với button "Chỉnh sửa"

- ✅ Tab "Kế hoạch điều trị":
  - Xem các kế hoạch điều trị đang diễn ra và đã hoàn thành
  - Progress bar hiển thị tiến độ
  - Số bước đã hoàn thành / tổng số bước
  - Thông tin chi phí: tổng chi phí, đã thanh toán, còn lại
  - Lịch khám tiếp theo

- ✅ Tab "Lịch sử khám":
  - Danh sách tất cả lần khám theo thời gian
  - Chẩn đoán và điều trị chi tiết
  - Đơn thuốc (nếu có)
  - Chi phí từng lần khám
  - Lịch tái khám

### 4. Thanh toán & Hóa đơn
**Đường dẫn**: Sidebar > Thanh toán

**Tính năng**:
- ✅ Thẻ tóm tắt:
  - Tổng tiền chờ thanh toán
  - Tổng tiền đã thanh toán
  - Số lượng hóa đơn

- ✅ Tab "Chờ thanh toán":
  - Danh sách hóa đơn chưa thanh toán
  - Highlight nổi bật các hóa đơn sắp đến hạn
  - Chi tiết từng hóa đơn: dịch vụ, số tiền, hạn thanh toán
  - Button "Thanh toán ngay" mở dialog
  - Dialog thanh toán với các phương thức:
    - Chuyển khoản ngân hàng (VietQR)
    - Thẻ tín dụng/ghi nợ
    - Tiền mặt tại phòng khám
  - Tải xuống hóa đơn PDF

- ✅ Tab "Đã thanh toán":
  - Lịch sử các hóa đơn đã thanh toán
  - Thông tin thanh toán: ngày, phương thức
  - Tải xuống hóa đơn PDF

- ✅ Tìm kiếm hóa đơn theo mã

### 5. Thông tin Cá nhân
**Đường dẫn**: Sidebar > Thông tin cá nhân

**Tính năng**:
- ✅ Profile header với avatar và badges
- ✅ Tab "Thông tin":
  - Form chỉnh sửa thông tin cá nhân
  - Enable/disable mode chỉnh sửa
  - Lưu thay đổi với validation

- ✅ Tab "Bảo mật":
  - Đổi mật khẩu
  - Xác thực hai yếu tố (2FA)
  - Xóa tài khoản (với cảnh báo)

- ✅ Tab "Thông báo":
  - Cài đặt nhắc nhở lịch hẹn
  - Nhắc nhở thanh toán
  - Mẹo chăm sóc sức khỏe
  - Khuyến mãi và ưu đãi
  - Chọn kênh nhận thông báo: SMS / Email

### 6. Chatbot Hỗ trợ
**Vị trí**: Button chat ở Header (góc trên bên phải)

**Tính năng**:
- ✅ Chatbot thông minh với AI responses
- ✅ Trả lời các câu hỏi thường gặp:
  - Giờ làm việc phòng khám
  - Địa chỉ và chỉ đường
  - Đặt lịch hẹn
  - Giá dịch vụ
  - Thông tin bác sĩ
  - Liên hệ nhân viên tư vấn
  
- ✅ Quick reply buttons để trả lời nhanh
- ✅ Typing indicator khi bot đang trả lời
- ✅ Lưu lịch sử chat trong session
- ✅ Giao diện chat bubble floating (góc dưới phải)
- ✅ Minimize/maximize chatbot

## 🎨 Design System

### Màu sắc chủ đạo:
- **Primary**: #3FB5FF (Xanh dương chính)
- **Primary Dark**: #1E8BC3 (Xanh dương đậm)
- **Secondary**: #05619A (Xanh đậm)
- **Background**: #FCFEFF (Trắng)
- **Background Light**: #EBF6FC (Xanh nhạt)
- **Text Primary**: #01304E (Xanh đậm)
- **Text Secondary**: #333333, #666666 (Xám)
- **Success**: #4CAF50
- **Warning**: #FF9800
- **Error**: #F44336

### Typography:
- **Font family**: Fz Poppins
- Font size, weight, line-height được quản lý qua `globals.css`

### Components:
- Shadcn/ui components được customize theo design system
- Responsive mobile-first approach
- Cards với border, shadow, hover effects
- Gradient buttons cho CTAs
- Icons từ lucide-react

## 📱 Responsive Design

### Breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features:
- ✅ Sidebar ẩn trên mobile, mở bằng floating button (góc dưới phải)
- ✅ Hamburger menu
- ✅ Swipeable tabs
- ✅ Touch-friendly buttons (min 44px)
- ✅ Optimized layouts cho màn hình nhỏ
- ✅ Chatbot responsive

## 🔄 Navigation Flow

### Luồng Bệnh nhân mới:
1. Truy cập trang Public Homepage
2. Click "Đặt lịch hẹn" hoặc "Đăng nhập"
3. Đăng nhập với email bất kỳ → Vào Patient Portal
4. Dashboard → Xem tổng quan
5. Đặt lịch hẹn mới (chức năng sẽ được hoàn thiện)
6. Nhận thông báo xác nhận

### Luồng Bệnh nhân cũ:
1. Đăng nhập → Patient Dashboard
2. Xem lịch hẹn sắp tới
3. Quản lý lịch hẹn: đổi/hủy
4. Xem hồ sơ bệnh án và tiến độ điều trị
5. Thanh toán hóa đơn online
6. Cập nhật thông tin cá nhân

## 🚀 Quick Start

### Để test Patient Portal:

1. **Đăng nhập**: 
   - Truy cập trang chủ
   - Click "Đăng nhập"
   - Nhập email bất kỳ (vd: patient@gmail.com)
   - Nhập password bất kỳ
   - Click "Đăng nhập"

2. **Explore các trang**:
   - Dashboard: Xem tổng quan
   - Lịch hẹn: Quản lý appointments
   - Thanh toán: Xem và thanh toán hóa đơn
   - Hồ sơ bệnh án: Xem EMR
   - Thông tin cá nhân: Cập nhật profile

3. **Test Chatbot**:
   - Click icon chat ở header
   - Thử hỏi: "Giờ làm việc?", "Địa chỉ?", "Đặt lịch hẹn"
   - Click quick reply buttons

4. **Test Responsive**:
   - Resize browser để test mobile view
   - Sidebar sẽ ẩn và có floating button
   - Layouts tự động adjust

## 📋 Mock Data

Hệ thống sử dụng mock data cho demo:
- 2 lịch hẹn sắp tới
- 4 lịch sử khám
- 2 hóa đơn chờ thanh toán
- 5 hóa đơn đã thanh toán
- 2 kế hoạch điều trị (1 đang thực hiện, 1 hoàn thành)

## 🎯 Tính năng nổi bật

1. **User-friendly**: Giao diện thân thiện, dễ sử dụng
2. **Mobile-first**: Tối ưu cho mobile trước
3. **Real-time**: Chatbot trả lời tức thì
4. **Visual feedback**: Toast notifications, loading states
5. **Data-driven**: Charts, progress bars, statistics
6. **Secure**: 2FA, password management
7. **Accessible**: ARIA labels, keyboard navigation
8. **Professional**: Clean design, consistent styling

## 🔮 Future Enhancements

- [ ] Tích hợp payment gateway thực
- [ ] Video call với bác sĩ
- [ ] Upload tài liệu y tế
- [ ] Nhắc nhở thông minh qua push notification
- [ ] AI chatbot nâng cao hơn
- [ ] Tích hợp Google Calendar
- [ ] Đánh giá và review dịch vụ
- [ ] Loyalty program / Points system

---

**Made with ❤️ by DentalCareX Team**
