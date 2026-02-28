const profileRepo = require("../repositories/patientProfile.repo");

class PatientProfileService {
  
  // Lấy danh sách
  async getAllProfiles(userId) {
      if (!userId) throw new Error("Thiếu User ID!");

      // 1. Tìm ID xịn trong bảng patients
      const actualPatientId = await profileRepo.getPatientIdByUserId(userId);
      
      if (!actualPatientId) {
        // Nếu chưa có record trong bảng patients thì trả về mảng rỗng thay vì báo lỗi
        return [];
      }

      // 2. Lấy toàn bộ danh sách hồ sơ của chủ này
      return await profileRepo.getAllByOwnerId(actualPatientId);
  }

  async getProfileDetail(id, userId) {
      if (!id || !userId) throw new Error("Thiếu ID hồ sơ hoặc User ID!");

      // 1. Tìm Patient ID xịn từ User ID
      const actualPatientId = await profileRepo.getPatientIdByUserId(userId);
      if (!actualPatientId) throw new Error("Không tìm thấy quyền Bệnh nhân!");

      // 2. Lấy chi tiết hồ sơ kèm kiểm tra chủ sở hữu
      const profile = await profileRepo.getByIdAndOwner(id, actualPatientId);
      
      if (!profile) {
        throw new Error("Hồ sơ không tồn tại, đã bị xóa hoặc bạn không có quyền xem!");
      }

      return profile;
  }

  // Tạo mới
  async createProfile(data) {
    // 1. Validate cơ bản
    if (!data.user_id || !data.full_name) {
      throw new Error("Tên và User ID là bắt buộc!");
    }

    // 2. Đi tìm Patient ID xịn từ User ID của ông chủ
    const actualPatientId = await profileRepo.getPatientIdByUserId(data.user_id);
    
    if (!actualPatientId) {
      throw new Error("Tài khoản này chưa có quyền Bệnh nhân!");
    }

    console.log(`>>> [CREATE DEBUG] User ID: ${data.user_id} -> Patient ID: ${actualPatientId}`);

    // 3. Gán dữ liệu: Truyền THẲNG gender, không mông má gì nữa
    const dataToInsert = { 
      ...data, 
      user_id: actualPatientId,
      gender: data.gender || "Chưa xác định" // Nếu không nhập thì để mặc định hoặc null tùy ông
    };
    
    // 4. Lưu vào DB
    const newId = await profileRepo.create(dataToInsert);
    
    // 5. Trả về kết quả
    return await this.getProfileById(newId);
  }

  // Cập nhật
  async updateProfile(data) {
    if (!data.id || !data.user_id) throw new Error("Thiếu ID!");

    const actualPatientId = await profileRepo.getPatientIdByUserId(data.user_id);
    if (!actualPatientId) throw new Error("Không có quyền!");

    // 1. Lấy dữ liệu hiện tại để "bảo toàn" những gì không đổi
    const current = await profileRepo.getById(data.id);
    if (!current) throw new Error("Hồ sơ không tồn tại!");

    if (current.owner_patient_id !== actualPatientId) {
      throw new Error("Bạn không có quyền sửa hồ sơ này!");
    }

    // 2. CỨ TRUYỀN THẲNG: Có gì dùng nấy, không có dùng cũ
    const finalData = {
      full_name: data.full_name || current.full_name,
      birthday: data.birthday || current.birthday,
      gender: data.gender || current.gender, // TRUYỀN THẲNG "Nam"/"Nữ" VÀO ĐÂY
      phone: data.phone_number || current.phone,
      address: data.address || current.address,
      relationship: data.relationship || current.relationship
    };

    const isUpdated = await profileRepo.update(data.id, actualPatientId, finalData);
    
    if (!isUpdated) throw new Error("Cập nhật thất bại!");
    
    return await this.getProfileById(data.id);
  }

  // Hàm helper để ép giới tính cho chuẩn (giữ nguyên logic cũ của ông)
  normalizeGender(gender) {
    const g = gender.trim().toLowerCase();
    if (g.startsWith('n') || g.startsWith('m')) return 'M';
    if (g.startsWith('f') || g === 'nữ') return 'F';
    return 'O';
  }

  // Xóa
  async deleteProfile(id, userId) {
    if (!id || !userId) throw new Error("Thiếu ID hồ sơ hoặc User ID!");

    // 1. Tìm Patient ID xịn từ User ID
    const actualPatientId = await profileRepo.getPatientIdByUserId(userId);
    if (!actualPatientId) throw new Error("Không tìm thấy quyền Bệnh nhân!");

    // 2. Kiểm tra xem hồ sơ này có thuộc về ông chủ này không
    const profile = await profileRepo.getById(id);
    if (!profile) throw new Error("Hồ sơ không tồn tại hoặc đã bị xóa!");

    if (profile.owner_patient_id !== actualPatientId) {
      throw new Error("Bạn không có quyền xóa hồ sơ này!");
    }

    // 3. Thực hiện xóa ảo
    const isDeleted = await profileRepo.delete(id, actualPatientId);
    
    if (!isDeleted) throw new Error("Xóa hồ sơ thất bại!");
    
    return true;
  }
}

module.exports = new PatientProfileService();