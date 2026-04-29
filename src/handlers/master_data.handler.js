const service = require('../services/masterData.service');

const handleSingleResponse = (callback, result, notFoundMsg) => {
  if (!result) {
    return callback({ code: 5, message: notFoundMsg || "Dữ liệu không tồn tại" });
  }
  callback(null, result);
};

module.exports = {
  // Chuyên khoa
  CreateSpecialty: async (call, callback) => { try { const result = await service.createSpecialty(call.request); callback(null, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  UpdateSpecialty: async (call, callback) => { try { const result = await service.updateSpecialty(call.request); handleSingleResponse(callback, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  DeleteSpecialty: async (call, callback) => { try { const result = await service.deleteSpecialty(call.request.id); callback(null, { success: result, message: "Xóa thành công" }); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetSpecialtyById: async (call, callback) => { try { const result = await service.getSpecialtyById(call.request.id); handleSingleResponse(callback, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetAllSpecialties: async (call, callback) => { try { const result = await service.getAllSpecialties(); callback(null, result); } catch (e) { callback({ code: 13, message: e.message }); } },

  // Cơ sở y tế
  CreateClinic: async (call, callback) => { try { const result = await service.createClinic(call.request); callback(null, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  UpdateClinic: async (call, callback) => { try { const result = await service.updateClinic(call.request); handleSingleResponse(callback, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  DeleteClinic: async (call, callback) => { try { const result = await service.deleteClinic(call.request.id); callback(null, { success: result, message: "Xóa thành công" }); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetClinicById: async (call, callback) => { try { const result = await service.getClinicById(call.request.id); handleSingleResponse(callback, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetAllClinics: async (call, callback) => { try { const result = await service.getAllClinics(); callback(null, result); } catch (e) { callback({ code: 13, message: e.message }); } },

  // Phòng khám
  CreateRoom: async (call, callback) => { try { const result = await service.createRoom(call.request); callback(null, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  UpdateRoom: async (call, callback) => { try { const result = await service.updateRoom(call.request); handleSingleResponse(callback, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  DeleteRoom: async (call, callback) => { try { const result = await service.deleteRoom(call.request.id); callback(null, { success: result, message: "Xóa thành công" }); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetRoomById: async (call, callback) => { try { const result = await service.getRoomById(call.request.id); handleSingleResponse(callback, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetAllRooms: async (call, callback) => { try { const result = await service.getAllRooms(call.request.clinicId); callback(null, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetRoomsByClinicId: async (call, callback) => {
    try {
      const result = await service.getRoomsByClinicId(call.request.id);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },

  // Dịch vụ
  CreateService: async (call, callback) => { try { const result = await service.createService(call.request); callback(null, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  UpdateService: async (call, callback) => { try { const result = await service.updateService(call.request); handleSingleResponse(callback, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  DeleteService: async (call, callback) => { try { const result = await service.deleteService(call.request.id); callback(null, { success: result, message: "Xóa thành công" }); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetServiceById: async (call, callback) => { try { const result = await service.getServiceById(call.request.id); handleSingleResponse(callback, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetAllServices: async (call, callback) => { try { const result = await service.getAllServices(); callback(null, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetDoctorsByService: async (call, callback) => { try { const result = await service.getDoctorsByService(call.request.id); callback(null, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetDoctorsByRoomId: async (call, callback) => {
    try {
      const result = await service.getDoctorsByRoomId(call.request.id);
      callback(null, result);
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetDoctorsByService: async (call, callback) => {
    try {
        const result = await service.getDoctorsByService(call.request.id);
        callback(null, result);
    } catch (e) {
        callback({
            code: 13, // INTERNAL error code
            message: "Lỗi lấy danh sách bác sĩ: " + e.message
        });
    }
  },

  // Thuốc
  CreateDrug: async (call, callback) => {
    try {
      const result = await service.createDrug(call.request);
      callback(null, result);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },

  // Cập nhật thuốc - call.request chứa: id, name, specialty_id...
  UpdateDrug: async (call, callback) => {
    try {
      const result = await service.updateDrug(call.request);
      handleSingleResponse(callback, result);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },

  // Xóa thuốc - call.request.id chứa ID thuốc cần xóa
  DeleteDrug: async (call, callback) => {
    try {
      const result = await service.deleteDrug(call.request.id);
      callback(null, { success: result, message: "Xóa thành công" });
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },

  // Lấy chi tiết thuốc theo ID
  GetDrugById: async (call, callback) => {
    try {
      const result = await service.getDrugById(call.request.id);
      handleSingleResponse(callback, result);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },

  // Lấy danh sách thuốc (Có lọc theo chuyên khoa)
  GetAllDrugs: async (call, callback) => {
    try {
      // Truyền toàn bộ request (keyword, limit, specialty_id) xuống Service
      const result = await service.getAllDrugs(call.request);
      callback(null, result);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },

  // code hệ thống
  CreateAllCode: async (call, callback) => { try { const result = await service.createAllCode(call.request); callback(null, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  UpdateAllCode: async (call, callback) => { try { const result = await service.updateAllCode(call.request); handleSingleResponse(callback, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  DeleteAllCode: async (call, callback) => { try { const result = await service.deleteAllCode(call.request.id); callback(null, { success: result, message: "Xóa thành công" }); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetAllCodeById: async (call, callback) => { try { const result = await service.getAllCodeById(call.request.id); handleSingleResponse(callback, result); } catch (e) { callback({ code: 13, message: e.message }); } },
  GetAllCodes: async (call, callback) => { try { const result = await service.getAllCodes(call.request.type); callback(null, result); } catch (e) { callback({ code: 13, message: e.message }); } }
};