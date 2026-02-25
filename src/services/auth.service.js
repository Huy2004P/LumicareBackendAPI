const userRepo = require("../repositories/user.repo");
const bcrypt = require("bcryptjs");
const { generateToken, generateRefreshToken } = require("../utils/jwt.util");

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

  async forgotPassword(email) { return "OTP 123456"; }

  async resetPassword(email, otp, newPass) {
    const hashed = await bcrypt.hash(newPass, 10);
    await userRepo.updatePasswordByEmail(email, hashed);
    return "Thành công!";
  }
}

module.exports = new AuthService();