# BookingCare - Hệ thống Quản lý Đặt lịch Khám bệnh (Backend gRPC)

Dự án Backend cho hệ thống BookingCare, được xây dựng trên nền tảng Node.js và giao thức truyền tải dữ liệu gRPC. Hệ thống tập trung vào việc tối ưu hóa hiệu suất đặt lịch và quản lý dữ liệu y tế quy mô lớn.

## Thông tin Tác giả
* **Họ và tên:** Văn Bá Phát Huy
* **Vai trò:** Sinh viên thực hiện
* **Giai đoạn:** Tuần 4 - Hoàn thiện các Module nâng cao (Statistic, Feedback, Notification)

---

## Các tính năng chính (Cập nhật Tuần 4)

### 1. Hệ thống Thống kê và Dashboard (Statistic Service)
Cung cấp các chỉ số phân tích dữ liệu thực tế thông qua các truy vấn SQL tối ưu:
* **Admin Dashboard:**
    * Thống kê tổng doanh thu, tổng số lượng bác sĩ và bệnh nhân trên toàn hệ thống.
    * Tính toán tỷ lệ tăng trưởng doanh thu theo tháng.
    * Danh sách Top 3 Bác sĩ có hiệu suất cao nhất và các dịch vụ y tế phổ biến nhất.
    * Dữ liệu biểu đồ doanh thu định dạng theo tháng.
* **Doctor Dashboard:**
    * Theo dõi số lượng bệnh nhân thực tế trong ngày.
    * Phân loại trạng thái lịch hẹn: Chờ khám, Hoàn thành, Đã hủy.
    * Thống kê điểm đánh giá trung bình (Average Rating) và doanh thu tuần.
    * Lịch sử 5 ca khám gần nhất kèm thông tin chi tiết bệnh nhân.

### 2. Module Đánh giá và Phản hồi (Feedback Service)
* Cho phép bệnh nhân gửi đánh giá định lượng (1-5 sao) và định tính (nhận xét) sau ca khám.
* Tự động tính toán điểm uy tín cho bác sĩ dựa trên hàm AVG trong cơ sở dữ liệu.
* Ràng buộc Unique Key đảm bảo mỗi ca khám (booking_id) chỉ được đánh giá một lần duy nhất.

### 3. Hệ thống Thông báo (Notification Service)
* Gửi thông báo thời gian thực khi có sự thay đổi về trạng thái lịch hẹn (Xác nhận/Hoàn thành).
* API hỗ trợ đánh dấu thông báo đã đọc (Mark as read) và lấy danh sách thông báo cá nhân.

---

## Công nghệ và Kỹ thuật sử dụng
* **Ngôn ngữ:** [Node.js](https://nodejs.org/) (JavaScript)
* **Giao thức:** [gRPC](https://grpc.io/) - Sử dụng HTTP/2 để tối ưu hóa băng thông.
* **Cơ sở dữ liệu:** [MySQL](https://www.mysql.com/) (Sử dụng JOIN, Subqueries và Aggregate Functions).
* **Quản lý mã nguồn:** Git (Phân nhánh theo tuần: `tuan-4`).

---

## Cấu trúc thư mục dự án
```text
src/
├── protos/            # Định nghĩa Interface Definition Language (.proto)
│   ├── appointment.proto
│   ├── feedback.proto
│   ├── statistic.proto
│   └── ....
├── repositories/      # Tầng truy xuất dữ liệu (Data Access Layer)
│   ├── appointment.repo.js
│   ├── feedback.repo.js
│   ├── statistic.repo.js
│   └── ....
├── services/          # Tầng xử lý logic nghiệp vụ (Business Logic Layer)
├── handlers/          # Tầng tiếp nhận request từ gRPC (Presentation Layer)
└── server.js          # Điểm khởi chạy hệ thống (Entry Point)

```
