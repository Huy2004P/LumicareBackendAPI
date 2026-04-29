const repo = require('../repositories/masterData.repo');

class MasterDataService {
  // Tạo các phương thức cho từng loại dữ liệu (Specialty, Clinic, Room, Service, Drug, AllCode)
  async createSpecialty(data) { return await repo.createSpecialty(data); }
  // Cập nhật thông tin chuyên khoa (đã bao gồm id trong data)
  async updateSpecialty(data) { return await repo.updateSpecialty(data); }
  // Lấy chi tiết 1 chuyên khoa theo ID
  async getSpecialtyById(id) { return await repo.getSpecialtyById(id); }
  // Lấy tất cả chuyên khoa (có thể thêm params để lọc nếu cần)
  async getAllSpecialties() { return await repo.getAllSpecialties(); }
  // Xóa chuyên khoa (đổi trạng thái is_deleted)
  async deleteSpecialty(id) { return await repo.deleteSpecialty(id); }

  // Tạo mới một cơ sở y tế (đã bao gồm specialty_ids trong data)
  async createClinic(data) { return await repo.createClinic(data); }
  // Cập nhật thông tin cơ sở y tế (đã bao gồm id và specialty_ids trong data)
  async updateClinic(data) { return await repo.updateClinic(data); }
  // Lấy chi tiết 1 cơ sở y tế theo ID
  async getClinicById(id) { return await repo.getClinicById(id); }
  // Lấy tất cả cơ sở y tế (có thể thêm params để lọc nếu cần)
  async getAllClinics() { return await repo.getAllClinics(); }
  // Xóa cơ sở y tế (đổi trạng thái is_deleted)
  async deleteClinic(id) { return await repo.deleteClinic(id); }

  // Tạo mới một phòng khám (đã bao gồm clinic_id trong data)
  async createRoom(data) { return await repo.createRoom(data); }
  // Cập nhật thông tin phòng khám (đã bao gồm id và clinic_id trong data)
  async updateRoom(data) { return await repo.updateRoom(data); }
  // Lấy chi tiết 1 phòng khám theo ID
  async getRoomById(id) { return await repo.getRoomById(id); }
  // Lấy tất cả phòng khám (có thể thêm params để lọc nếu cần)
  async getAllRooms(clinicId) { return await repo.getAllRooms(clinicId); }
  // API Lấy phòng khám theo clinic_id
  async getRoomsByClinicId(clinicId) {
    return await repo.getRoomsByClinicId(clinicId);
  }
  // Xóa phòng khám (đổi trạng thái is_deleted)
  async deleteRoom(id) { return await repo.deleteRoom(id); }

  // Tạo mới một dịch vụ (đã bao gồm specialty_id trong data)
  async createService(data) { return await repo.createService(data); }
  // Cập nhật thông tin dịch vụ (đã bao gồm id và specialty_id trong data)
  async updateService(data) { return await repo.updateService(data); }
  // Lấy chi tiết 1 dịch vụ theo ID
  async getServiceById(id) { return await repo.getServiceById(id); }
  // Lấy tất cả dịch vụ (có thể thêm params để lọc nếu cần)
  async getAllServices() { return await repo.getAllServices(); }
  // Xóa dịch vụ (đổi trạng thái is_deleted)
  async deleteService(id) { return await repo.deleteService(id); }
  // Lấy danh sách bác sĩ theo service_id (đã cập nhật để trả về data trong format { success: true, data: doctors })
  async getDoctorsByService(serviceId) {
    const doctors = await repo.getDoctorsByServiceId(serviceId);
    return { success: true, data: doctors };
  }
  // Lấy danh sách bác sĩ theo room_id (đã cập nhật để trả về data trong format { success: true, data: doctors })
  async getDoctorsByRoomId(roomId) {
    const doctors = await repo.getDoctorsByRoomId(roomId);
    return { success: true, data: doctors };
  }
  // Lấy danh sách dịch vụ theo danh sách id (đã cập nhật để trả về data trong format { success: true, data: services })
  async getServicesByIds(ids) {
    return await repo.getServicesByIds(ids);
  }

  // Tạo mới một loại thuốc (đã bao gồm specialty_id trong data
  async createDrug(data) {
    return await repo.createDrug(data);
  }
  // Cập nhật thông tin loại thuốc (đã bao gồm id và specialty_id trong data)
  async updateDrug(data) {
    return await repo.updateDrug(data);
  }
  // Lấy chi tiết 1 loại thuốc theo ID
  async getDrugById(id) {
    return await repo.getDrugById(id);
  }
  // Lấy tất cả loại thuốc (có thể thêm params để lọc nếu cần)
  async getAllDrugs(params) {
    return await repo.getAllDrugs(params);
  }
  // Xóa loại thuốc (đổi trạng thái is_deleted)
  async deleteDrug(id) {
    return await repo.deleteDrug(id);
  }

  // Tạo mới một mã chung (đã bao gồm type trong data)
  async createAllCode(data) { return await repo.createAllCode(data); }
  // Cập nhật thông tin mã chung (đã bao gồm id và type trong data)
  async updateAllCode(data) { return await repo.updateAllCode(data); }
  // Lấy chi tiết 1 mã chung theo ID và type
  async getAllCodeById(id) { return await repo.getAllCodeById(id); }
  // Lấy tất cả mã chung theo type (có thể thêm params để lọc nếu cần)
  async getAllCodes(type) { return await repo.getAllCodes(type); }
  // Xóa mã chung (đổi trạng thái is_deleted)
  async deleteAllCode(id) { return await repo.deleteAllCode(id); }
}

module.exports = new MasterDataService();