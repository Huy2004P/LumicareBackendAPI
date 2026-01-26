const repo = require("../repositories/master_data.repo");

class MasterDataService {
  //Chuyen khoa
  async createSpecialty(data) {
    return await repo.createSpecialty(data);
  }

  async getAllSpecialties() {
    return await repo.getAllSpecialties();
  }

  //Phong kham
  async createClinic(data) {
    return await repo.createClinic(data);
  }

  async getAllClinics() {
    return await repo.getAllClinics();
  }

  //Phong kham cu the
  async createRoom(data) {
    return await repo.createRoom(data);
  }

  async getAllRooms(clinicId) {
    return await repo.getAllRooms(clinicId);
  }

  //dich vu
  async createService(data) {
    return await repo.createService(data);
  }

  async getAllServices() {
    return await repo.getAllServices();
  }
}

module.exports = new MasterDataService();
