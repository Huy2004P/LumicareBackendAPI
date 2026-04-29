# LumicareAPI Backend

## Tổng quan
LumicareAPI là hệ thống backend phục vụ cho ứng dụng quản lý phòng khám/bệnh viện, hỗ trợ đặt lịch khám, quản lý người dùng, thông báo real-time, và nhiều chức năng khác.

## Công nghệ sử dụng
- Node.js (Express)
- gRPC
- MySQL (Sequelize, mysql2)
- Redis
- Socket.io
- OneSignal (Push Notification)
- JWT (Xác thực)
- Nodemailer (Gửi email)

## Cấu trúc thư mục chính
```
├── package.json
├── run.bat
├── test_noti.js
├── middlewares/
├── src/
│   ├── server.js
│   ├── config/
│   ├── handlers/
│   ├── interceptors/
│   ├── protos/
│   ├── repositories/
│   ├── services/
│   └── utils/
```

## Hướng dẫn cài đặt
1. Cài Node.js >= 16, MySQL, Redis.
2. Tạo file `.env` với các biến cấu hình:
   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
   - JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRE, JWT_REFRESH_EXPIRE
   - ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY
3. Cài đặt package:
   ```bash
   npm install
   ```
4. Khởi động server:
   ```bash
   npm start
   ```
   hoặc chạy file `run.bat`.

## Chức năng nổi bật
- Đăng ký, đăng nhập, xác thực OTP, JWT, phân quyền.
- Đặt lịch, xác nhận, hoàn tất, hủy lịch khám.
- Thông báo real-time qua OneSignal, Redis, Socket.io, gRPC stream.
- Quản lý hồ sơ bệnh nhân, bác sĩ, thống kê, phản hồi.
- Gửi email tự động (OTP, xác nhận, thông báo).

## Kiểm tra hệ thống thông báo
- Sử dụng file `test_noti.js` để test gửi notification (sửa ID user trong file).

## Đóng góp
Mọi đóng góp hoặc thắc mắc vui lòng liên hệ nhóm phát triển.

---
*README này được tạo tự động bởi AI dựa trên mã nguồn thực tế.*
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
