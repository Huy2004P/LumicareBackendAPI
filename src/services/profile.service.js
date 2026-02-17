const profileRepo = require("../repositories/profile.repo");
const userRepo = require("../repositories/user.repo"); // Tái sử dụng để lấy pass cũ
const bcrypt = require("bcryptjs");

class ProfileService {

  // --- 1. XEM THÔNG TIN ---
  async getMyProfile(userId) {
    if (!userId) throw new Error("Không tìm thấy User ID!");

    // Lấy role của user trước để biết đường query
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User không tồn tại!");

    let profile = null;

    if (user.role === 'patient') {
      profile = await profileRepo.getPatientProfile(userId);
    } else if (user.role === 'doctor') {
      profile = await profileRepo.getDoctorProfile(userId);
    } else {
      // Admin hoặc role khác
      profile = await profileRepo.getAdminProfile(userId);
    }

    // Fallback: Nếu bảng phụ (patients/doctors) chưa có dữ liệu thì trả về thông tin cơ bản
    return profile || { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      created_at: user.created_at,
      full_name: "", phone: "", avatar: "" 
    };
  }

  // --- 2. CẬP NHẬT THÔNG TIN ---
  async updateProfile(userId, data) {
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User không tồn tại!");

    // Chỉ cho phép update Patient và Doctor
    if (user.role === 'patient') {
      await profileRepo.updatePatient(userId, data);
    } else if (user.role === 'doctor') {
      await profileRepo.updateDoctor(userId, data);
    } else {
      throw new Error("Quyền hạn này (Admin) không hỗ trợ cập nhật profile qua API này!");
    }

    // Trả về profile mới nhất sau khi update
    return await this.getMyProfile(userId);
  }

  // --- 3. ĐỔI MẬT KHẨU ---
  async changePassword(userId, oldPassword, newPassword) {
    // B1: Lấy mật khẩu cũ trong DB
    const userParams = await userRepo.findPasswordById(userId);
    if (!userParams) throw new Error("User không tồn tại!");

    // B2: So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, userParams.password);
    if (!isMatch) throw new Error("Mật khẩu cũ không chính xác!");

    // B3: Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // B4: Cập nhật
    return await userRepo.updatePassword(userId, hashedPassword);
  }
}

module.exports = new ProfileService();