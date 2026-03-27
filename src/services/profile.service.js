const profileRepo = require("../repositories/profile.repo");
const userRepo = require("../repositories/user.repo");
const bcrypt = require("bcryptjs");
const mailer = require("../utils/mailer");

class ProfileService {
  // --- 1. LẤY THÔNG TIN PROFILE ---
  async getMyProfile(userId) {
    if (!userId) throw new Error("Không tìm thấy User ID!");

    // Lấy thông tin cơ bản từ bảng users
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User không tồn tại!");

    let profileData = null;
    const role = user.role ? user.role.toLowerCase() : '';

    // Lấy thông tin chi tiết dựa trên Role (Khớp với bảng patients/doctors)
    if (role === 'patient') {
      profileData = await profileRepo.getPatientProfile(userId);
    } else if (role === 'doctor') {
      profileData = await profileRepo.getDoctorProfile(userId);
    }

    console.log(`--- [SERVICE CHECK] User ID: ${userId} ---`);
    console.log("Dữ liệu Profile từ Repo:", profileData);

    const result = {
      id: Number(user.id),
      email: user.email,
      role: user.role,
      fullName: profileData?.fullName || "",
      phone: profileData?.phone || "",
      avatar: profileData?.avatar || "",
      birthday: profileData?.birthday || "",
      createdAt: user.created_at ? new Date(user.created_at).toISOString() : ""
    };

    console.log("Dữ liệu Service sẽ trả ra:", result);
    console.log("---------------------------------------");

    return result;
  }

  // --- 2. CẬP NHẬT THÔNG TIN PROFILE ---
  async updateProfile(userId, data) {
    const current = await this.getMyProfile(userId);

    // Ưu tiên data mới, nếu không có thì giữ data cũ (tránh bị null khi update)
    const updateData = {
      fullName: (data.fullName && data.fullName.trim() !== "") ? data.fullName : current.fullName,
      phone: (data.phone && data.phone.trim() !== "") ? data.phone : current.phone,
      avatar: (data.avatar && data.avatar.trim() !== "") ? data.avatar : current.avatar,
      birthday: (data.birthday && data.birthday.trim() !== "") ? data.birthday : current.birthday
    };

    const user = await userRepo.findById(userId);
    if (user.role === 'doctor') {
      await profileRepo.updateDoctor(userId, updateData);
    } else if (user.role === 'patient') {
      await profileRepo.updatePatient(userId, updateData);
    }

    return await this.getMyProfile(userId);
  }

  // --- 3. YÊU CẦU GỬI MÃ OTP ĐỂ ĐỔI MẬT KHẨU ---
  async requestChangePasswordOTP(userId) {
    if (!userId) throw new Error("Không tìm thấy User ID!");

    // Lấy thông tin email của user
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User không tồn tại!");

    // Tạo mã OTP ngẫu nhiên 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000); // Mã có hiệu lực trong 10 phút

    // Lưu mã OTP vào database (bảng users)
    await userRepo.updateOTP(user.email, otp, expiredAt);

    // Gửi email chứa mã OTP (Chạy ngầm không dùng await để tránh làm chậm phản hồi)
    mailer.sendOTPChangePassword(user.email, otp)
      .then(() => console.log(`[Mailer] Đã gửi mã OTP đổi pass tới: ${user.email}`))
      .catch((err) => console.error("[Mailer] Lỗi gửi mã OTP:", err));

    return {
      success: true,
      message: "Mã xác thực đã được gửi đến email của bạn."
    };
  }

  // --- 4. XÁC NHẬN ĐỔI MẬT KHẨU ---
  async changePassword(userId, oldPassword, newPassword, otpInput) {
    if (!userId) throw new Error("Không tìm thấy User ID!");

    // 1. Tìm thông tin user và mật khẩu hiện tại
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User không tồn tại!");
    
    const passwordInfo = await userRepo.findPasswordById(userId);
    const profileInfo = await this.getMyProfile(userId);

    // 2. So sánh mật khẩu cũ (Dùng bcrypt.compare)
    const isMatch = await bcrypt.compare(oldPassword, passwordInfo.password);
    if (!isMatch) throw new Error("Mật khẩu cũ không chính xác!");

    // 3. Kiểm tra mã OTP từ database
    const otpData = await userRepo.findOTPByEmail(user.email);
    if (!otpData || otpData.otp_code !== otpInput) {
      throw new Error("Mã xác thực OTP không chính xác!");
    }

    // Kiểm tra thời gian hết hạn của OTP
    if (new Date() > new Date(otpData.otp_expired_at)) {
      throw new Error("Mã xác thực OTP đã hết hạn!");
    }

    // 4. Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 5. Cập nhật mật khẩu mới vào DB và xóa OTP (Hàm này của ông đã xử lý clear OTP)
    const success = await userRepo.updatePasswordByEmail(user.email, hashedPassword);

    if (success) {
      // 6. Gửi email thông báo mật khẩu đã thay đổi thành công
      mailer.sendChangePasswordNotification(user.email, profileInfo.fullName)
        .then(() => console.log(`[Mailer] Đã gửi thông báo thay đổi mật khẩu tới: ${user.email}`))
        .catch((err) => console.error("[Mailer] Lỗi gửi thông báo đổi pass:", err));
    }

    return {
      success: success,
      message: success ? "Đổi mật khẩu thành công!" : "Đổi mật khẩu thất bại!"
    };
  }
}

module.exports = new ProfileService();