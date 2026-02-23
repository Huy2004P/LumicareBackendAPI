const service = require('../services/masterData.service');

// Helper để kiểm tra dữ liệu tồn tại
const handleSingleResponse = (callback, result, notFoundMsg) => {
  if (!result) {
    return callback({
      code: 5, // gRPC NOT_FOUND
      message: notFoundMsg || "Dữ liệu không tồn tại hoặc đã bị xóa"
    });
  }
  callback(null, result);
};

module.exports = {
  // --- 1. SPECIALTY ---
  CreateSpecialty: async (call, callback) => {
    try {
      const result = await service.createSpecialty(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  UpdateSpecialty: async (call, callback) => {
    try {
      const result = await service.updateSpecialty(call.request);
      handleSingleResponse(callback, result, "Không tìm thấy Chuyên khoa để cập nhật");
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  DeleteSpecialty: async (call, callback) => {
    try {
      const result = await service.deleteSpecialty(call.request.id);
      callback(null, { success: result, message: "Xóa chuyên khoa thành công" });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetSpecialtyById: async (call, callback) => {
    try {
      const result = await service.getSpecialtyById(call.request.id);
      handleSingleResponse(callback, result, "Chuyên khoa không tồn tại");
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetAllSpecialties: async (call, callback) => {
    try {
      const result = await service.getAllSpecialties();
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },

  // --- 2. CLINIC ---
  CreateClinic: async (call, callback) => {
    try {
      const result = await service.createClinic(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  UpdateClinic: async (call, callback) => {
    try {
      const result = await service.updateClinic(call.request);
      handleSingleResponse(callback, result, "Không tìm thấy Cơ sở y tế để cập nhật");
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  DeleteClinic: async (call, callback) => {
    try {
      const result = await service.deleteClinic(call.request.id);
      callback(null, { success: result, message: "Xóa cơ sở y tế thành công" });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetClinicById: async (call, callback) => {
    try {
      const result = await service.getClinicById(call.request.id);
      handleSingleResponse(callback, result, "Cơ sở y tế không tồn tại");
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetAllClinics: async (call, callback) => {
    try {
      const result = await service.getAllClinics();
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },

  // --- 3. ROOM ---
  CreateRoom: async (call, callback) => {
    try {
      const result = await service.createRoom(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  UpdateRoom: async (call, callback) => {
    try {
      const result = await service.updateRoom(call.request);
      handleSingleResponse(callback, result, "Không tìm thấy phòng để cập nhật");
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  DeleteRoom: async (call, callback) => {
    try {
      const result = await service.deleteRoom(call.request.id);
      callback(null, { success: result, message: "Xóa phòng thành công" });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetRoomById: async (call, callback) => {
    try {
      const result = await service.getRoomById(call.request.id);
      handleSingleResponse(callback, result, "Phòng khám không tồn tại");
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetAllRooms: async (call, callback) => {
    try {
      const result = await service.getAllRooms(call.request.clinicId);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },

  // --- 4. SERVICE ---
  CreateService: async (call, callback) => {
    try {
      const result = await service.createService(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  UpdateService: async (call, callback) => {
    try {
      const result = await service.updateService(call.request);
      handleSingleResponse(callback, result, "Không tìm thấy dịch vụ để cập nhật");
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  DeleteService: async (call, callback) => {
    try {
      const result = await service.deleteService(call.request.id);
      callback(null, { success: result, message: "Xóa dịch vụ thành công" });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetServiceById: async (call, callback) => {
    try {
      const result = await service.getServiceById(call.request.id);
      handleSingleResponse(callback, result, "Dịch vụ không tồn tại");
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetAllServices: async (call, callback) => {
    try {
      const result = await service.getAllServices();
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },

  // --- 5. DRUG ---
  CreateDrug: async (call, callback) => {
    try {
      const result = await service.createDrug(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  UpdateDrug: async (call, callback) => {
    try {
      const result = await service.updateDrug(call.request);
      handleSingleResponse(callback, result, "Không tìm thấy thuốc để cập nhật");
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  DeleteDrug: async (call, callback) => {
    try {
      const result = await service.deleteDrug(call.request.id);
      callback(null, { success: result, message: "Xóa thuốc thành công" });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetDrugById: async (call, callback) => {
    try {
      const result = await service.getDrugById(call.request.id);
      handleSingleResponse(callback, result, "Thuốc không tồn tại");
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetAllDrugs: async (call, callback) => {
    try {
      const result = await service.getAllDrugs();
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },

  // --- 6. ALLCODES ---
  CreateAllCode: async (call, callback) => {
    try {
      const result = await service.createAllCode(call.request);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  UpdateAllCode: async (call, callback) => {
    try {
      const result = await service.updateAllCode(call.request);
      handleSingleResponse(callback, result, "Không tìm thấy mã code để cập nhật");
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  DeleteAllCode: async (call, callback) => {
    try {
      const result = await service.deleteAllCode(call.request.id);
      callback(null, { success: result, message: "Xóa mã code thành công" });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetAllCodeById: async (call, callback) => {
    try {
      const result = await service.getAllCodeById(call.request.id);
      handleSingleResponse(callback, result, "Mã code không tồn tại");
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetAllCodes: async (call, callback) => {
    try {
      const result = await service.getAllCodes(call.request.type);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  }
};