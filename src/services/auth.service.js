const userRepo = require("../repositories/user.repo");
const patientRepo = require("../repositories/patient.repo"); // Cần file này để lưu tên, sđt
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Key bí mật (Nên để trong file .env)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret_123";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_123";

class AuthService {
  
  // --- HELPERS ---
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
    return { accessToken, refreshToken };
  }

  // 1. ĐĂNG KÝ
  async register(data) {
    const { email, password, fullName, phone } = data;

    // B1: Check email tồn tại
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) throw new Error("Email này đã được sử dụng!");

    // B2: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // B3: Tạo User (Mặc định là patient)
    const userId = await userRepo.create({ 
      email, 
      password: hashedPassword, 
      role: 'patient' 
    });

    // B4: Tạo Profile Patient (Để lưu tên và SĐT)
    // Lưu ý: Đảm bảo patientRepo.create nhận tham số (userId, fullName, phone)
    if (patientRepo && patientRepo.create) {
        await patientRepo.create(userId, fullName, phone); 
    }

    // B5: Tự động đăng nhập luôn (Generate Token)
    const tokens = this.generateTokens({ id: userId, role: 'patient' });
    
    return {
      ...tokens,
      user: { id: userId, email, role: 'patient', fullName, phone, avatar: '' }
    };
  }

  // 2. ĐĂNG NHẬP
  async login(email, password) {
    // B1: Tìm user
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("Email không tồn tại!");

    // B2: Check pass
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Mật khẩu không đúng!");

    // B3: Lấy thông tin chi tiết (Tên, Avatar)
    const userInfo = await userRepo.getUserFullInfo(user.id, user.role);

    // B4: Tạo Token
    const tokens = this.generateTokens({ id: user.id, role: user.role });

    return {
      ...tokens,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        role: userInfo.role,
        fullName: userInfo.full_name || "",
        phone: userInfo.phone || "",
        avatar: userInfo.avatar || ""
      }
    };
  }

  // 3. QUÊN MẬT KHẨU
  async forgotPassword(email) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("Email không tồn tại trong hệ thống!");
    
    // TODO: Thực tế phải gửi Email chứa OTP thật.
    // Ở đây mình Mock (giả lập) là đã gửi thành công.
    console.log(`[MOCK EMAIL] Gửi OTP về ${email}`);
    
    return "Mã xác nhận đã được gửi về email của bạn (Giả lập).";
  }

  // 4. ĐẶT LẠI MẬT KHẨU
  async resetPassword(email, otp, newPassword) {
    // Check OTP (Giả sử OTP là 123456 cho mọi trường hợp test)
    if (otp !== "123456") throw new Error("Mã OTP không đúng!");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const success = await userRepo.updatePasswordByEmail(email, hashedPassword);
    
    if (!success) throw new Error("Lỗi cập nhật mật khẩu!");
    return "Đặt lại mật khẩu thành công!";
  }
}

module.exports = new AuthService();