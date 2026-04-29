const feedbackService = require("../services/feedback.service");

module.exports = {
  // Gửi feedback
  SendFeedback: async (call, callback) => {
    try {
      await feedbackService.sendFeedback(call.request);
      callback(null, { success: true, message: "Cam on ban da danh gia" });
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },
  // Lấy feedback bác sĩ
  GetDoctorFeedbacks: async (call, callback) => {
    try {
      const result = await feedbackService.getDoctorFeedbacks(call.request.doctor_id);
      callback(null, result);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },
  // Lấy đánh giá cơ sở y tế.
  GetClinicFeedbacks: async (call, callback) => {
    try {
      const result = await feedbackService.getClinicFeedbacks(call.request.clinic_id);
      callback(null, result);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },
  // Lấy đánh giá bác sĩ.
  GetServiceFeedbacks: async (call, callback) => {
    try {
      const result = await feedbackService.getServiceFeedbacks(call.request.service_id);
      callback(null, result);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },
  // Lấy tất cả feedback
  GetAllFeedbacks: async (call, callback) => {
    try {
      const result = await feedbackService.getAllFeedbacks();
      callback(null, result);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  }
};