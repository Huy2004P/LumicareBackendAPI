const feedbackService = require("../services/feedback.service");

module.exports = {
  SendFeedback: async (call, callback) => {
    try {
      await feedbackService.sendFeedback(call.request);
      callback(null, { success: true, message: "Cảm ơn ông đã đánh giá!" });
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },

  GetDoctorFeedbacks: async (call, callback) => {
    try {
      const result = await feedbackService.getDoctorFeedbacks(call.request.doctor_id);
      callback(null, result);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  }
};