const profileRepo = require("../repositories/patientProfile.repo");

class PatientProfileService {
  // Hàm này dùng để lấy actualPatientId từ userId, nếu không có sẽ ném lỗi
  async _getActualPatientId(userId) {
    const actualPatientId = await profileRepo.getPatientIdByUserId(userId);
    if (!actualPatientId) throw new Error("Tài khoản chưa có quyền Bệnh nhân!");
    return actualPatientId;
  }
  // Lấy tất cả hồ sơ của bệnh nhân dựa trên userId (thực chất là actualPatientId)
  async getAllProfiles(userId) {
    const actualPatientId = await this._getActualPatientId(userId);
    return await profileRepo.getAllByOwnerId(actualPatientId);
  }
  // Lấy chi tiết hồ sơ dựa trên id hồ sơ và userId (để kiểm tra quyền sở hữu)
  async getProfileDetail(id, userId) {
    const actualPatientId = await this._getActualPatientId(userId);
    const profile = await profileRepo.getById(id, actualPatientId);
    if (!profile) throw new Error("Hồ sơ không tồn tại hoặc không thuộc quyền sở hữu!");
    return profile;
  }
  // Tạo hồ sơ mới, đảm bảo rằng userId có quyền tạo hồ sơ cho bệnh nhân tương ứng
  async createProfile(data) {
    if (!data.user_id || !data.full_name) throw new Error("Thiếu thông tin bắt buộc!");
    const actualPatientId = await this._getActualPatientId(data.user_id);
    const dataToInsert = {
      owner_patient_id: actualPatientId,
      full_name: data.full_name,
      birthday: data.birthday,
      gender: data.gender || "Chưa xác định",
      phone: data.phone_number,
      address: data.address,
      relationship: data.relationship
    };
    const newId = await profileRepo.create(dataToInsert);
    return { id: newId, ...dataToInsert, success: true };
  }
  // Cập nhật hồ sơ, chỉ cho phép cập nhật những trường được cung cấp, và kiểm tra quyền sở hữu trước khi cập nhật
  async updateProfile(data) {
    const patientId = data.user_id;
    const current = await profileRepo.getById(data.id, patientId);
    if (!current) throw new Error("Hồ sơ không tồn tại hoặc bạn không có quyền sửa!");
    const finalData = {
      full_name: data.full_name || current.full_name,
      birthday: data.birthday || current.birthday,
      gender: data.gender || current.gender,
      phone: data.phone_number || current.phone,
      address: data.address || current.address,
      relationship: data.relationship || current.relationship
    };
    const isUpdated = await profileRepo.update(data.id, patientId, finalData);
    if (!isUpdated) throw new Error("Cập nhật thất bại!");
    return { id: data.id, ...finalData, user_id: patientId };
  }
  // Xóa hồ sơ, thực chất là xóa ảo (soft delete), chỉ cho phép xóa nếu hồ sơ tồn tại và thuộc quyền sở hữu của userId
  async deleteProfile(id, userId) {
    const actualPatientId = await this._getActualPatientId(userId);
    const profile = await profileRepo.getById(id, actualPatientId);
    if (!profile) throw new Error("Hồ sơ không tồn tại hoặc bạn không có quyền xóa!");
    const isDeleted = await profileRepo.delete(id, actualPatientId);
    if (!isDeleted) throw new Error("Xóa hồ sơ thất bại!");
    return true;
  }
}

module.exports = new PatientProfileService();