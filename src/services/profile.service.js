const profileRepo = require("../repositories/profile.repo");
const userRepo = require("../repositories/user.repo");
const bcrypt = require("bcryptjs");

class ProfileService {

  // --- 1. XEM THÔNG TIN (Ép key từ Snake Case sang Camel Case) ---
  async getMyProfile(userId) {
      if (!userId) throw new Error("Không tìm thấy User ID!");

      const user = await userRepo.findById(userId);
      if (!user) throw new Error("User không tồn tại!");

      let profile = null;
      if (user.role === 'patient') {
        profile = await profileRepo.getPatientProfile(userId);
      } else if (user.role === 'doctor') {
        profile = await profileRepo.getDoctorProfile(userId);
      } else if (user.role === 'admin') {
        profile = await profileRepo.getAdminProfile(userId);
      }

      // Trong ProfileService.js -> đoạn return của hàm getMyProfile
      const response = { 
        id: Number(user.id), 
        email: String(user.email || ""), 
        role: String(user.role || ""), 
        
        // Trả về cả 2 kiểu để gRPC chắc chắn nhận được
        fullName: String(profile?.fullName || profile?.full_name || ""),
        full_name: String(profile?.fullName || profile?.full_name || ""),
        
        phone: String(profile?.phone || ""),
        avatar: String(profile?.avatar || ""),
        
        // Trả về cả 2 kiểu cho ngày tháng
        createdAt: user.created_at ? new Date(user.created_at).toISOString() : "",
        created_at: user.created_at ? new Date(user.created_at).toISOString() : ""
      };
      return response;
  }

  // --- 2. CẬP NHẬT THÔNG TIN (Bao quát 4 bảng) ---
  async updateProfile(userId, data) {
      const user = await userRepo.findById(userId);
      if (!user) throw new Error("User không tồn tại!");

      // Lấy dữ liệu hiện tại để "vá"
      const current = await this.getMyProfile(userId);

      // Logic gộp: Nếu data mới trống thì lấy lại data cũ
      const updateData = {
          fullName: (data.fullName && data.fullName.trim() !== "") 
                    ? data.fullName 
                    : current.fullName,
          phone: (data.phone && data.phone.trim() !== "") 
                 ? data.phone 
                 : current.phone,
          avatar: (data.avatar && data.avatar.trim() !== "") 
                  ? data.avatar 
                  : current.avatar
      };

      // Thực hiện Update theo đúng bảng (Dựa trên 4 hình ông gửi)
      if (user.role === 'doctor') {
          // Bảng doctors (cột user_id)
          await profileRepo.updateDoctor(userId, updateData);
      } else if (user.role === 'patient') {
          // Bảng patient_profiles (cột owner_patient_id)
          // Nếu có gender thì thêm vào đây
          updateData.gender = (data.gender && data.gender.trim() !== "") ? data.gender : (current.gender || null);
          await profileRepo.updatePatient(userId, updateData);
      } else if (user.role === 'admin') {
          // Bảng admin_profiles (cột user_id)
          await profileRepo.updateAdmin(userId, updateData);
      }

      // Trả về JSON đã được map lại key
      return await this.getMyProfile(userId);
  }

  // --- 3. ĐỔI MẬT KHẨU ---
  async changePassword(userId, oldPassword, newPassword) {
    // 1. Tìm user
    const user = await userRepo.findPasswordById(userId);
    if (!user) throw new Error("User không tồn tại!");

    // 1. In ra để soi
    console.log("-----------------------------------------");
    console.log(">>> [DEBUG] Pass ông nhập từ Kreya:", `|${oldPassword}|`);
    console.log(">>> [DEBUG] Mã Hash đang nằm trong DB:", `|${user.password}|`);

    // 2. Kiểm tra thử bằng mắt thường (Dành cho trường hợp quên hash lúc tạo user)
    if (!user.password.startsWith('$2')) {
        console.warn("⚠️ CẢNH BÁO: Password trong DB chưa được Hash! Bcrypt sẽ luôn báo SAI.");
    }
    
    // 2. So sánh mật khẩu cũ (Dùng bcrypt.compare)
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    console.log(">>> [RESULT] Kết quả so sánh Bcrypt:", isMatch ? "✅ KHỚP" : "❌ KHÔNG KHỚP");
    console.log("-----------------------------------------");
    if (!isMatch) throw new Error("Mật khẩu cũ không chính xác!");

    // 3. Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Lưu vào DB
    const success = await userRepo.updatePassword(userId, hashedPassword);
    
    return {
      success: success,
      message: success ? "Đổi mật khẩu thành công!" : "Đổi mật khẩu thất bại!"
    };
  }
}

module.exports = new ProfileService();