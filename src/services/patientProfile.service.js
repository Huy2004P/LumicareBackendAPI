const profileRepo = require("../repositories/patientProfile.repo");

class PatientProfileService {
  // Helper lấy Patient ID và check quyền
  async _getActualPatientId(userId) {
    const actualPatientId = await profileRepo.getPatientIdByUserId(userId);
    if (!actualPatientId) throw new Error("Tài khoản chưa có quyền Bệnh nhân!");
    return actualPatientId;
  }

  async getAllProfiles(userId) {
    const actualPatientId = await this._getActualPatientId(userId);
    return await profileRepo.getAllByOwnerId(actualPatientId);
  }

  async getProfileDetail(id, userId) {
    const actualPatientId = await this._getActualPatientId(userId);
    const profile = await profileRepo.getById(id, actualPatientId);
    if (!profile) throw new Error("Hồ sơ không tồn tại hoặc không thuộc quyền sở hữu!");
    return profile;
  }

  async createProfile(data) {
    if (!data.user_id || !data.full_name) throw new Error("Thiếu thông tin bắt buộc!");
    
    const actualPatientId = await this._getActualPatientId(data.user_id);
    
    const dataToInsert = {
      owner_patient_id: actualPatientId,
      full_name: data.full_name,
      birthday: data.birthday,
      gender: data.gender || "Chưa xác định",
      phone: data.phone_number, // Khớp với tham số truyền từ gRPC
      address: data.address,
      relationship: data.relationship
    };

    const newId = await profileRepo.create(dataToInsert);
    return { id: newId, ...dataToInsert, success: true };
  }

  async updateProfile(data) {
    if (!data.id || !data.user_id) throw new Error("Thiếu ID!");

    const actualPatientId = await this._getActualPatientId(data.user_id);

    // 🎯 Kiểm tra xem hồ sơ có tồn tại và có thuộc về user này không
    const current = await profileRepo.getById(data.id, actualPatientId);
    if (!current) throw new Error("Hồ sơ không tồn tại hoặc bạn không có quyền sửa!");

    const finalData = {
      full_name: data.full_name || current.full_name,
      birthday: data.birthday || current.birthday,
      gender: data.gender || current.gender,
      phone: data.phone_number || current.phone,
      address: data.address || current.address,
      relationship: data.relationship || current.relationship
    };

    const isUpdated = await profileRepo.update(data.id, actualPatientId, finalData);
    if (!isUpdated) throw new Error("Cập nhật thất bại!");

    return { id: data.id, ...finalData, success: true };
  }

  async deleteProfile(id, userId) {
    const actualPatientId = await this._getActualPatientId(userId);

    // Kiểm tra trước khi xóa ảo
    const profile = await profileRepo.getById(id, actualPatientId);
    if (!profile) throw new Error("Hồ sơ không tồn tại hoặc bạn không có quyền xóa!");

    const isDeleted = await profileRepo.delete(id, actualPatientId);
    if (!isDeleted) throw new Error("Xóa hồ sơ thất bại!");

    return true;
  }
}

module.exports = new PatientProfileService();