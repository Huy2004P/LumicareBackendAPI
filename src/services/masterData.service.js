const repo = require('../repositories/masterData.repo');

class MasterDataService {
  // --- SPECIALTY ---
  async createSpecialty(data) { return await repo.createSpecialty(data); }
  async updateSpecialty(data) { return await repo.updateSpecialty(data); }
  async getSpecialtyById(id) { return await repo.getSpecialtyById(id); }
  async getAllSpecialties() { return await repo.getAllSpecialties(); }
  async deleteSpecialty(id) { return await repo.deleteSpecialty(id); }

  // --- CLINIC ---
  async createClinic(data) { return await repo.createClinic(data); }
  async updateClinic(data) { return await repo.updateClinic(data); }
  async getClinicById(id) { return await repo.getClinicById(id); }
  async getAllClinics() { return await repo.getAllClinics(); }
  async deleteClinic(id) { return await repo.deleteClinic(id); }

  // --- ROOM ---
  async createRoom(data) { return await repo.createRoom(data); }
  async updateRoom(data) { return await repo.updateRoom(data); }
  async getAllRooms(clinicId) { return await repo.getAllRooms(clinicId); }
  async deleteRoom(id) { return await repo.deleteRoom(id); }

  // --- SERVICE (CÁI ÔNG ĐANG THIẾU) ---
  async createService(data) { return await repo.createService(data); }
  async updateService(data) { return await repo.updateService(data); }
  async getAllServices() { return await repo.getAllServices(); }
  async deleteService(id) { return await repo.deleteService(id); }

  // --- DRUG ---
  async createDrug(data) { return await repo.createDrug(data); }
  async updateDrug(data) { return await repo.updateDrug(data); }
  async getDrugById(id) { return await repo.getDrugById(id); }
  async getAllDrugs() { return await repo.getAllDrugs(); }
  async deleteDrug(id) { return await repo.deleteDrug(id); }

  // --- ALLCODES ---
  async createAllCode(data) { return await repo.createAllCode(data); }
  async updateAllCode(data) { return await repo.updateAllCode(data); }
  async getAllCodes(type) { return await repo.getAllCodes(type); }
  async deleteAllCode(id) { return await repo.deleteAllCode(id); }
}

module.exports = new MasterDataService();