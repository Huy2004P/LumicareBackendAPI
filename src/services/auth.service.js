const userRepo = require("../repositories/user.repo");
const patientRepo = require("../repositories/patient.repo");
const { hashPassword, comparePassword } = require("../utils/hash.util");

const otpStorage = {};
// 👇 QUAN TRỌNG: Import đúng tên hàm từ file jwt.util.js bạn vừa gửi
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken, // Import thêm cái này để dùng cho hàm refreshToken
} = require("../utils/jwt.util");

class AuthService {
  // --- ĐĂNG KÝ ---
  async register({ email, password, role, fullName, phone }) {
    // 1. Check email
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) throw new Error("Email already exists");

    // 2. Hash pass & Tạo User
    const hashedPassword = await hashPassword(password);
    const newUserId = await userRepo.create({
      email,
      password: hashedPassword,
      role: role || "patient",
    });

    // 3. Nếu là Patient, tạo hồ sơ
    if (role === "patient" || !role) {
      if (!fullName) throw new Error("Full name is required for patients");
      await patientRepo.create(newUserId, fullName, phone);
    }

    return { id: newUserId, email };
  }

  // --- ĐĂNG NHẬP ---
  async login({ email, password }) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error("Incorrect password");

    let patientInfo = null;
    if (user.role === "patient") {
      patientInfo = await patientRepo.findByUserId(user.id);
    }

    // 👇 SỬA: Gọi đúng tên hàm generateToken / generateRefreshToken
    const accessToken = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: patientInfo ? patientInfo.full_name : null,
        avatar: patientInfo ? patientInfo.avatar : null,
        phone: patientInfo ? patientInfo.phone : null,
      },
    };
  }

  // --- GIA HẠN TOKEN ---
  async refreshToken(token) {
    // 👇 SỬA: Dùng hàm verifyRefreshToken đã import ở trên
    const decode = verifyRefreshToken(token);

    if (!decode) {
      throw new Error("Invalid or expired refresh token");
    }

    // 👇 SỬA: Dùng đúng tên hàm generateToken
    const newAccessToken = generateToken({ id: decode.id, role: decode.role });

    return { accessToken: newAccessToken };
  }

  //quen mat khau
  //yeu cau otp
  async forgotPassword(email) {
    //b1: kiem tra xem mat khau co trong he thong ko
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new Error("Email không tồn tại trong hệ thống");
    }

    //b2: sinh ma otp ngau nhien
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    //b3: luu otp vao bo nho tam.
    otpStorage[email] = otp;

    //b4: gia lap gui email:
    console.log("----------------------------------------------------");
    console.log(` [DỊCH VỤ OTP]: OTP được gửi đến email: ${email} là: ${otp}`);
    console.log("----------------------------------------------------");

    return true;
  }

  //dat lai mat khau
  async resetPassword({ email, otp, newPassword }) {
    //b1: lay otp da luu trong ram.
    const storedOtp = otpStorage[email];

    if (!storedOtp) {
      throw new Error("Yêu cầu hết hạn hoặc chưa gửi OTP");
    }

    if (storedOtp !== otp) {
      throw new Error("Mã OTP không chính xác!");
    }

    //b2: ma dung --> hash mat khau moi.
    const hashedPassword = await hashPassword(newPassword);

    //b3: cap nhat mat khau vao database.
    await userRepo.updatePasswordByEmail(email, hashedPassword);

    //b4: xoa otp sau khi dung.
    delete otpStorage[email];

    return true;
  }
}

module.exports = new AuthService();
