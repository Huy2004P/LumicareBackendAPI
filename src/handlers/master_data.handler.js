const service = require('../services/masterData.service');

module.exports = {
  // --- 1. SPECIALTY ---
  createSpecialty: async (call, callback) => {
    try {
      const result = await service.createSpecialty(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  updateSpecialty: async (call, callback) => {
    try {
      const result = await service.updateSpecialty(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  deleteSpecialty: async (call, callback) => {
    try {
      const result = await service.deleteSpecialty(call.request.id);
      callback(null, { success: result, message: "Deleted successfully" });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  getSpecialtyById: async (call, callback) => {
    try {
      const result = await service.getSpecialtyById(call.request.id);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  getAllSpecialties: async (call, callback) => {
    try {
      const result = await service.getAllSpecialties();
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },

  // --- 2. CLINIC ---
  createClinic: async (call, callback) => {
    try {
      const result = await service.createClinic(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  updateClinic: async (call, callback) => {
    try {
      const result = await service.updateClinic(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  deleteClinic: async (call, callback) => {
    try {
      const result = await service.deleteClinic(call.request.id);
      callback(null, { success: result, message: "Deleted successfully" });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  getClinicById: async (call, callback) => {
    try {
      const result = await service.getClinicById(call.request.id);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  getAllClinics: async (call, callback) => {
    try {
      const result = await service.getAllClinics();
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },

  // --- 3. ROOM ---
  createRoom: async (call, callback) => {
    try {
      const result = await service.createRoom(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  updateRoom: async (call, callback) => {
    try {
      const result = await service.updateRoom(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  deleteRoom: async (call, callback) => {
    try {
      const result = await service.deleteRoom(call.request.id);
      callback(null, { success: result, message: "Deleted successfully" });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  getAllRooms: async (call, callback) => {
    try {
      const result = await service.getAllRooms(call.request.clinicId);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },

  // --- 4. SERVICE ---
  createService: async (call, callback) => {
    try {
      const result = await service.createService(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  updateService: async (call, callback) => {
    try {
      const result = await service.updateService(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  deleteService: async (call, callback) => {
    try {
      const result = await service.deleteService(call.request.id);
      callback(null, { success: result, message: "Deleted successfully" });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  getAllServices: async (call, callback) => {
    try {
      const result = await service.getAllServices();
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },

  // --- 5. DRUG ---
  createDrug: async (call, callback) => {
    try {
      const result = await service.createDrug(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  updateDrug: async (call, callback) => {
    try {
      const result = await service.updateDrug(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  deleteDrug: async (call, callback) => {
    try {
      const result = await service.deleteDrug(call.request.id);
      callback(null, { success: result, message: "Deleted successfully" });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  getDrugById: async (call, callback) => {
    try {
      const result = await service.getDrugById(call.request.id);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  getAllDrugs: async (call, callback) => {
    try {
      const result = await service.getAllDrugs();
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },

  // --- 6. ALLCODES ---
  createAllCode: async (call, callback) => {
    try {
      const result = await service.createAllCode(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  updateAllCode: async (call, callback) => {
    try {
      const result = await service.updateAllCode(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  deleteAllCode: async (call, callback) => {
    try {
      const result = await service.deleteAllCode(call.request.id);
      callback(null, { success: result, message: "Deleted successfully" });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  getAllCodes: async (call, callback) => {
    try {
      const result = await service.getAllCodes(call.request.type);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  }
};