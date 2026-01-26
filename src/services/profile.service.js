const userRepo = require("../repositories/user.repo");
const patientRepo = require("../repositories/patient.repo"); // Import thêm
const { hashPassword, comparePassword } = require("../utils/hash.util");

class ProfileService {
  // 1. Lấy thông tin cá nhân (Ghép từ User + Patient)
  async getProfile(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    // Lấy thêm thông tin chi tiết bên bảng patients
    const patient = await patientRepo.findByUserId(userId);

    // Ghép lại trả về cho đẹp
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: patient ? patient.full_name : null,
      phone: patient ? patient.phone : null,
      avatar: patient ? patient.avatar : null,
      createdAt: user.created_at,
    };
  }

  // 2. Cập nhật thông tin (Tên, SĐT, Avatar -> Lưu vào bảng patients)
  async updateProfile(userId, data) {
    // data bao gồm: { full_name, phone, avatar }
    return await patientRepo.update(userId, data);
  }

  // 3. Đổi mật khẩu (Giữ nguyên như cũ)
  async changePassword(userId, { oldPassword, newPassword }) {
    const user = await userRepo.findPasswordById(userId);
    if (!user) throw new Error("User not found");

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) throw new Error("Incorrect old password");

    const hashedNewPassword = await hashPassword(newPassword);
    await userRepo.updatePassword(userId, hashedNewPassword);

    return true;
  }
}

module.exports = new ProfileService();
