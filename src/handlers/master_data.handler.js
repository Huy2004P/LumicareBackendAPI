const repo = require("../repositories/master_data.repo");

// Helper: Hàm bọc lỗi chung để code ngắn gọn, đỡ viết try/catch lặp lại
const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("GRPC Error:", error.message);
    callback({
      code: 13, // INTERNAL_ERROR
      message: error.message || "Lỗi Server nội bộ",
    });
  }
};

module.exports = {
  // =========================================================
  // 1. CHUYÊN KHOA (SPECIALTY)
  // =========================================================
  CreateSpecialty: (call, callback) => {
    safeCall(callback, () => repo.createSpecialty(call.request));
  },

  UpdateSpecialty: (call, callback) => {
    safeCall(callback, () => repo.updateSpecialty(call.request));
  },

  DeleteSpecialty: async (call, callback) => {
    try {
      await repo.deleteSpecialty(call.request.id);
      callback(null, { success: true, message: "Xóa thành công" });
    } catch (error) {
      callback({ code: 13, message: error.message });
    }
  },

  GetSpecialtyById: (call, callback) => {
    safeCall(callback, () => repo.getSpecialtyById(call.request.id));
  },

  GetAllSpecialties: (call, callback) => {
    safeCall(callback, () => repo.getAllSpecialties(call.request));
  },

  // =========================================================
  // 2. CƠ SỞ Y TẾ (CLINIC)
  // =========================================================
  CreateClinic: (call, callback) => {
    safeCall(callback, () => repo.createClinic(call.request));
  },

  UpdateClinic: (call, callback) => {
    safeCall(callback, () => repo.updateClinic(call.request));
  },

  DeleteClinic: async (call, callback) => {
    try {
      await repo.deleteClinic(call.request.id);
      callback(null, { success: true, message: "Xóa thành công" });
    } catch (error) {
      callback({ code: 13, message: error.message });
    }
  },

  GetClinicById: (call, callback) => {
    safeCall(callback, () => repo.getClinicById(call.request.id));
  },

  GetAllClinics: (call, callback) => {
    safeCall(callback, () => repo.getAllClinics(call.request));
  },

  // =========================================================
  // 3. PHÒNG KHÁM (ROOM)
  // =========================================================
  CreateRoom: (call, callback) => {
    safeCall(callback, () => repo.createRoom(call.request));
  },

  UpdateRoom: (call, callback) => {
    safeCall(callback, () => repo.updateRoom(call.request));
  },

  DeleteRoom: async (call, callback) => {
    try {
      await repo.deleteRoom(call.request.id);
      callback(null, { success: true, message: "Xóa thành công" });
    } catch (error) {
      callback({ code: 13, message: error.message });
    }
  },

  GetAllRooms: (call, callback) => {
    safeCall(callback, async () => {
      const data = await repo.getAllRooms(call.request);
      return { data }; // Wrap vào object { data: [] } cho khớp proto RoomListResponse
    });
  },

  // =========================================================
  // 4. DỊCH VỤ (SERVICE)
  // =========================================================
  CreateService: (call, callback) => {
    safeCall(callback, () => repo.createService(call.request));
  },

  UpdateService: (call, callback) => {
    safeCall(callback, () => repo.updateService(call.request));
  },

  DeleteService: async (call, callback) => {
    try {
      await repo.deleteService(call.request.id);
      callback(null, { success: true, message: "Xóa thành công" });
    } catch (error) {
      callback({ code: 13, message: error.message });
    }
  },

  GetAllServices: (call, callback) => {
    safeCall(callback, () => repo.getAllServices(call.request));
  },

  // =========================================================
  // 5. THUỐC (DRUGS) - MỚI
  // =========================================================
  CreateDrug: (call, callback) => {
    safeCall(callback, () => repo.createDrug(call.request));
  },

  UpdateDrug: (call, callback) => {
    safeCall(callback, () => repo.updateDrug(call.request));
  },

  DeleteDrug: async (call, callback) => {
    try {
      await repo.deleteDrug(call.request.id);
      callback(null, { success: true, message: "Xóa thành công" });
    } catch (error) {
      callback({ code: 13, message: error.message });
    }
  },

  GetDrugById: (call, callback) => {
    safeCall(callback, () => repo.getDrugById(call.request.id));
  },

  GetAllDrugs: (call, callback) => {
    safeCall(callback, () => repo.getAllDrugs(call.request));
  },

  // =========================================================
  // 6. ALLCODES (MÃ CHUNG) - MỚI
  // =========================================================
  CreateAllCode: (call, callback) => {
    safeCall(callback, () => repo.createAllCode(call.request));
  },

  UpdateAllCode: (call, callback) => {
    safeCall(callback, () => repo.updateAllCode(call.request));
  },

  DeleteAllCode: async (call, callback) => {
    try {
      await repo.deleteAllCode(call.request.id);
      callback(null, { success: true, message: "Xóa thành công" });
    } catch (error) {
      callback({ code: 13, message: error.message });
    }
  },

  GetAllCodes: (call, callback) => {
    safeCall(callback, async () => {
      // Hàm repo.getAllCodes trả về { data: [...] } nên return thẳng luôn
      return await repo.getAllCodes(call.request.type);
    });
  },
};
