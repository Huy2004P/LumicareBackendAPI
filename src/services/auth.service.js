const userRepo = require("../repositories/user.repo");
const bcrypt = require("bcryptjs");
const { generateToken, generateRefreshToken } = require("../utils/jwt.util");
const { sendWelcomeEmail, sendOTPEmail } = require("../utils/mailer");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret_123";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_123";

class AuthService {
  generateTokens(payload) {
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  async register(data) {
    // LOG ĐỂ KIỂM TRA: Xem Kreya gửi gì xuống đây
    console.log(">>> Dữ liệu Register nhận được:", data);

    const { email, password, role, fullName, phone, gender, address } = data;

    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) throw new Error("Email đã tồn tại!");

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Ép kiểu: Nếu có role thì dùng, không thì mới lấy patient
    const userRole = role ? role.toLowerCase() : 'patient';
    console.log(">>> Role sẽ được lưu vào DB:", userRole);

    const userId = await userRepo.create({
      email,
      password: hashedPassword,
      role: userRole,
      fullName,
      phone,
      gender,
      address
    });

    if (userId) {
      // Chạy hàm gửi mail ngầm (asynchronous) để không làm chậm request gRPC
      sendWelcomeEmail(email, fullName || "Người dùng mới")
        .then(() => console.log(`[Mailer] Đã gửi mail thành công tới: ${email}`))
        .catch((err) => console.error("[Mailer] Lỗi gửi mail (nhưng vẫn cho user đăng ký):", err));
    }

    const tokens = this.generateTokens({ id: userId, role: userRole });
    return {
      ...tokens,
      user: { id: userId, email, role: userRole, fullName: fullName || "Người dùng mới" }
    };
  }

  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("Email không tồn tại!");
    
    if (!(await bcrypt.compare(password, user.password))) {
      throw new Error("Mật khẩu sai!");
    }

    // 1. Lấy thông tin full (đã join bảng doctor/patient)
    const userInfo = await userRepo.getUserFullInfo(user.id, user.role);

    // 2. Dùng hàm generateTokens (CÓ S TRONG FILE CỦA ÔNG)
    const tokens = this.generateTokens({ id: user.id, role: user.role });

    return {
      ...tokens,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        role: userInfo.role,
        fullName: userInfo.fullName || "",
        phone: userInfo.phone || "",
        avatar: userInfo.avatar || ""
      }
    };
  }

  async refreshToken(token) {
    if (!token) throw new Error("Token trống!");
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
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

  async resetPassword(email, otp, newPass) {
    // 1. Tìm user và mã OTP trong DB
    const user = await userRepo.findOTPByEmail(email);
    
    if (!user || !user.otp_code) {
        throw new Error("Yêu cầu khôi phục không tồn tại!");
    }

    // 2. So khớp mã OTP
    if (user.otp_code !== otp) {
        throw new Error("Mã OTP không chính xác!");
    }

    // 3. Kiểm tra hết hạn (Expired)
    if (new Date() > new Date(user.otp_expired_at)) {
        throw new Error("Mã OTP đã hết hạn!");
    }

    // 4. Nếu mọi thứ OK -> Hash mật khẩu mới và lưu lại
    const hashed = await bcrypt.hash(newPass, 10);
    await userRepo.updatePasswordByEmail(email, hashed);

    // 5. Xóa OTP sau khi dùng xong (để bảo mật)
    await userRepo.clearOTP(email);

    return "Đổi mật khẩu thành công!";
}
}

module.exports = new AuthService();