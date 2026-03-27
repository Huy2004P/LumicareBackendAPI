const userRepo = require("../repositories/user.repo");
const bcrypt = require("bcryptjs");
const { generateToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt.util");
const { sendWelcomeEmail, sendOTPEmail, sendChangePasswordNotification } = require("../utils/mailer");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret_123";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_123";

class AuthService {
  generateTokens(payload) {
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  async register(data) {
    console.log(">>> Dữ liệu Register nhận được:", data);

    // 🚀 SỬA TẠI ĐÂY: Thêm birthday vào để lấy ra từ data
    const { email, password, role, fullName, phone, gender, address, birthday } = data;

    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) throw new Error("Email đã tồn tại!");

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userRole = role ? role.toLowerCase() : 'patient';
    console.log(">>> Role sẽ được lưu vào DB:", userRole);

    const userId = await userRepo.create({
      email,
      password: hashedPassword,
      role: userRole,
      fullName,
      phone,
      gender,
      address,
      birthday // 🚀 PHẢI TRUYỀN THẰNG NÀY XUỐNG REPO THÌ NÓ MỚI LƯU ĐƯỢC
    });

    if (userId) {
      sendWelcomeEmail(email, fullName || "Người dùng mới")
        .then(() => console.log(`[Mailer] Đã gửi mail thành công tới: ${email}`))
        .catch((err) => console.error("[Mailer] Lỗi gửi mail:", err));
    }

    const tokens = this.generateTokens({ id: userId, role: userRole });
    return {
      ...tokens,
      user: { 
        id: userId, 
        email, 
        role: userRole, 
        fullName: fullName || "Người dùng mới",
        birthday: birthday || "" // Trả về luôn cho nóng
      }
    };
  }

  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("Email không tồn tại!");
    
    if (!(await bcrypt.compare(password, user.password))) {
      throw new Error("Mật khẩu sai!");
    }

    const userInfo = await userRepo.getUserFullInfo(user.id, user.role);
    const tokens = this.generateTokens({ id: user.id, role: user.role });

    return {
      ...tokens,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        role: userInfo.role,
        fullName: userInfo.fullName || "",
        phone: userInfo.phone || "",
        avatar: userInfo.avatar || "",
        birthday: userInfo.birthday || "" // 🚀 THÊM DÒNG NÀY ĐỂ APP CÓ DATA HIỆN LÊN PROFILE
      }
    };
  }

  async refreshToken(token) {
  if (!token) throw new Error("Token trống!");
  const decoded = verifyRefreshToken(token); 
  return this.generateTokens({ id: decoded.id, role: decoded.role });
}

  async logout() { return { success: true, message: "Đã đăng xuất" }; }

  // Trong AuthService.js (hàm forgotPassword)
  async forgotPassword(email) {
      const user = await userRepo.findByEmail(email);
      if (!user) throw new Error("Email không tồn tại!");

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút sau

      if (user && user.otp_expired_at) {
          const remainingTime = new Date(user.otp_expired_at) - Date.now();
          const totalDuration = 5 * 60 * 1000; // 5 phút
          
          // Nếu mới gửi chưa được 1 phút (còn hơn 4 phút hạn) thì không cho gửi tiếp
          if (remainingTime > (totalDuration - 60000)) {
              throw new Error("Vui lòng đợi 60 giây trước khi yêu cầu mã mới!");
          }
      }

      // LƯU VÀO DATABASE (Ông cần viết thêm hàm này trong user.repo.js)
      await userRepo.updateOTP(email, otpCode, expiredAt); 

      await sendOTPEmail(email, otpCode);
      return { success: true, message: "Mã OTP đã được gửi!" };
  }

  async verifyOTP(email, otp) {
    const user = await userRepo.findOTPByEmail(email);
    
    if (!user || !user.otp_code) {
        throw new Error("Yêu cầu xác thực không tồn tại!");
    }

    if (user.otp_code !== otp) {
        throw new Error("Mã OTP không chính xác!");
    }

    if (new Date() > new Date(user.otp_expired_at)) {
        throw new Error("Mã OTP đã hết hạn!");
    }

    return { success: true, message: "Xác thực mã OTP thành công!" };
  }

  async resetPassword(email, otp, newPass) {
    // 1. Kiểm tra OTP trước
    await this.verifyOTP(email, otp);

    // 2. Hash mật khẩu mới
    const hashed = await bcrypt.hash(newPass, 10);
    
    // 3. Cập nhật DB
    const success = await userRepo.updatePasswordByEmail(email, hashed);

    if (success) {
        // 🚀 SỬA TẠI ĐÂY: Gọi đúng hàm thông báo thành công (Design Gradient)
        sendChangePasswordNotification(email, "bạn")
          .catch((err) => console.error("[Mailer] Lỗi gửi mail thông báo:", err));

        return { 
            success: true, 
            message: "Mật khẩu đã được cập nhật thành công!" 
        };
    }

    throw new Error("Không thể cập nhật mật khẩu, vui lòng thử lại!");
  }
}

module.exports = new AuthService();