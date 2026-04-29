# LumicareAPI Backend

## Giới thiệu

Đây là dự án backend cho hệ thống Lumicare, cung cấp các API và dịch vụ gRPC phục vụ ứng dụng quản lý đặt lịch, khám bệnh, thông báo, và nhiều chức năng khác cho phòng khám hoặc bệnh viện.

## Công nghệ sử dụng
- Node.js (Express)
- gRPC
- MySQL (qua Sequelize, mysql2)
- Redis
- Socket.io
- OneSignal (Push Notification)
- JWT (Xác thực)
- Nodemailer (Gửi email)

## Cấu trúc thư mục

```
├── package.json
├── run.bat
├── test_noti.js
├── middlewares/
│   └── authMiddleware.js
├── src/
│   ├── server.js                # Khởi động server, socket, gRPC
│   ├── config/                  # Cấu hình DB, Redis
│   ├── handlers/                # Xử lý các request gRPC
│   ├── interceptors/            # Interceptor cho gRPC (auth...)
│   ├── protos/                  # Định nghĩa các proto file cho gRPC
│   ├── repositories/            # Tầng truy xuất dữ liệu
│   ├── services/                # Xử lý logic nghiệp vụ
│   └── utils/                   # Tiện ích chung (jwt, mail, hash...)
```

## Hướng dẫn cài đặt

1. **Cài đặt Node.js** (>= 16)
2. **Cài đặt MySQL** và tạo database, cấu hình biến môi trường `.env`:
   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
   - JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRE, JWT_REFRESH_EXPIRE
   - ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY
   - Các biến khác nếu cần
3. **Cài đặt Redis**
4. **Cài đặt package**:
   ```bash
   npm install
   ```
5. **Chạy server**:
   - Chạy bằng script:
     ```bash
     run.bat
     ```
   - Hoặc:
     ```bash
     npm start
     ```

## Các chức năng chính
- **Xác thực & Quản lý người dùng**: Đăng ký, đăng nhập, quên mật khẩu, xác thực OTP, JWT, phân quyền.
- **Đặt lịch & Quản lý lịch khám**: Đặt lịch, xác nhận, hoàn tất, hủy lịch, lấy danh sách lịch khám.
- **Thông báo real-time**: Gửi thông báo qua OneSignal, Redis, Socket.io, gRPC stream.
- **Quản lý hồ sơ bệnh nhân, bác sĩ, thống kê, phản hồi, v.v.**
- **Gửi email tự động**: Thông báo, OTP, xác nhận tài khoản.

## Test hệ thống thông báo
- Sử dụng file `test_noti.js` để kiểm tra gửi notification tới user (cần sửa ID user trong file).

## Liên hệ & đóng góp
- Vui lòng liên hệ nhóm phát triển để biết thêm chi tiết hoặc đóng góp mã nguồn.

---
*File này được tạo tự động bởi AI dựa trên source code thực tế.*
