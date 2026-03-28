const repo = require('../repositories/masterData.repo');

class MasterDataService {
  // --- 1. SPECIALTY ---
  async createSpecialty(data) { return await repo.createSpecialty(data); }
  async updateSpecialty(data) { return await repo.updateSpecialty(data); }
  async getSpecialtyById(id) { return await repo.getSpecialtyById(id); }
  async getAllSpecialties() { return await repo.getAllSpecialties(); }
  async deleteSpecialty(id) { return await repo.deleteSpecialty(id); }

  // --- 2. CLINIC ---
  async createClinic(data) { return await repo.createClinic(data); }
  async updateClinic(data) { return await repo.updateClinic(data); }
  async getClinicById(id) { return await repo.getClinicById(id); }
  async getAllClinics() { return await repo.getAllClinics(); }
  async deleteClinic(id) { return await repo.deleteClinic(id); }

  // --- 3. ROOM ---
  async createRoom(data) { return await repo.createRoom(data); }
  async updateRoom(data) { return await repo.updateRoom(data); }
  async getRoomById(id) { return await repo.getRoomById(id); }
  async getAllRooms(clinicId) { return await repo.getAllRooms(clinicId); }
  
  // HUY SOI CHỖ NÀY: Sửa tên hàm cho khớp với Handler và Proto
  async getRoomsByClinicId(clinicId) { 
    return await repo.getRoomsByClinicId(clinicId); 
  }
  
  async deleteRoom(id) { return await repo.deleteRoom(id); }

  // --- 4. SERVICE ---
  async createService(data) { return await repo.createService(data); }
  async updateService(data) { return await repo.updateService(data); }
  async getServiceById(id) { return await repo.getServiceById(id); }
  async getAllServices() { return await repo.getAllServices(); }
  async deleteService(id) { return await repo.deleteService(id); }

  // API Lấy bác sĩ theo dịch vụ
  async getDoctorsByService(serviceId) {
    const doctors = await repo.getDoctorsByServiceId(serviceId);
    return { success: true, data: doctors };
  }

  // HUY SOI CHỖ NÀY: Sửa tên hàm có đuôi "Id" cho chuẩn
  async getDoctorsByRoomId(roomId) {
    const doctors = await repo.getDoctorsByRoomId(roomId);
    return { success: true, data: doctors };
  }

  // --- 5. DRUG ---
  async createDrug(data) { return await repo.createDrug(data); }
  async updateDrug(data) { return await repo.updateDrug(data); }
  async getDrugById(id) { return await repo.getDrugById(id); }
  async getAllDrugs() { return await repo.getAllDrugs(); }
  async deleteDrug(id) { return await repo.deleteDrug(id); }

  // --- 6. ALLCODES ---
  async createAllCode(data) { return await repo.createAllCode(data); }
  async updateAllCode(data) { return await repo.updateAllCode(data); }
  async getAllCodeById(id) { return await repo.getAllCodeById(id); }
  async getAllCodes(type) { return await repo.getAllCodes(type); }
  async deleteAllCode(id) { return await repo.deleteAllCode(id); }
}

module.exports = new MasterDataService();