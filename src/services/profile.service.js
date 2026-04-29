const profileRepo = require("../repositories/profile.repo");
const userRepo = require("../repositories/user.repo");
const bcrypt = require("bcryptjs");
const mailer = require("../utils/mailer");

class ProfileService {
  // Lấy thông tin profile của chính mình (dựa trên userId từ token)
  async getMyProfile(userId) {
    if (!userId) throw new Error("Không tìm thấy User ID!");
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User không tồn tại!");
    let profileData = null;
    const role = user.role ? user.role.toLowerCase() : '';
    if (role === 'patient') {
      profileData = await profileRepo.getPatientProfile(userId);
    } else if (role === 'doctor') {
      profileData = await profileRepo.getDoctorProfile(userId);
    }
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
    return result;
  }
  // Cập nhật thông tin profile của chính mình
  async updateProfile(userId, data) {
    const current = await this.getMyProfile(userId);
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
  // Yêu cầu gửi mã OTP để xác thực đổi mật khẩu (Gửi email chứa mã OTP) - Chạy ngầm không dùng await để tránh làm chậm phản hồi
  async requestChangePasswordOTP(userId) {
    if (!userId) throw new Error("Không tìm thấy User ID!");
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User không tồn tại!");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000); // Mã có hiệu lực trong 10 phút
    await userRepo.updateOTP(user.email, otp, expiredAt);
    mailer.sendOTPChangePassword(user.email, otp)
      .then(() => console.log(`[Mailer] Đã gửi mã OTP đổi pass tới: ${user.email}`))
      .catch((err) => console.error("[Mailer] Lỗi gửi mã OTP:", err));
    return {
      success: true,
      message: "Mã xác thực đã được gửi đến email của bạn."
    };
  }
  // Xác thực mã OTP và đổi mật khẩu mới
  async changePassword(userId, oldPassword, newPassword, otpInput) {
    if (!userId) throw new Error("Không tìm thấy User ID!");
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User không tồn tại!");
    const passwordInfo = await userRepo.findPasswordById(userId);
    const profileInfo = await this.getMyProfile(userId);
    const isMatch = await bcrypt.compare(oldPassword, passwordInfo.password);
    if (!isMatch) throw new Error("Mật khẩu cũ không chính xác!");
    const otpData = await userRepo.findOTPByEmail(user.email);
    if (!otpData || otpData.otp_code !== otpInput) {
      throw new Error("Mã xác thực OTP không chính xác!");
    }
    if (new Date() > new Date(otpData.otp_expired_at)) {
      throw new Error("Mã xác thực OTP đã hết hạn!");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const success = await userRepo.updatePasswordByEmail(user.email, hashedPassword);
    if (success) {
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