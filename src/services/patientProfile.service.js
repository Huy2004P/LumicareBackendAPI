const profileRepo = require("../repositories/patientProfile.repo");

class PatientProfileService {
  
  // Lấy danh sách
  async getAllProfiles(userId) {
    if (!userId) throw new Error("Thiếu User ID!");
    return await profileRepo.getAllByOwnerId(userId);
  }

  // Lấy chi tiết
  async getProfileById(id) {
    const profile = await profileRepo.getById(id);
    if (!profile) throw new Error("Hồ sơ không tồn tại!");
    return profile;
  }

  // Tạo mới
  async createProfile(data) {
    // Validate
    if (!data.user_id || !data.full_name) {
      throw new Error("Tên và User ID là bắt buộc!");
    }
    
    // Gọi Repo tạo
    const newId = await profileRepo.create(data);
    
    // Trả về luôn object vừa tạo để frontend hiển thị
    return await this.getProfileById(newId);
  }

  // Cập nhật
  async updateProfile(data) {
    const isUpdated = await profileRepo.update(data.id, data.user_id, data);
    if (!isUpdated) throw new Error("Cập nhật thất bại (Không tìm thấy hồ sơ hoặc không có quyền)!");
    
    return await this.getProfileById(data.id);
  }

  // Xóa
  async deleteProfile(id, userId) {
    const isDeleted = await profileRepo.delete(id, userId);
    if (!isDeleted) throw new Error("Xóa thất bại!");
    return true;
  }
}

module.exports = new PatientProfileService();