const statisticService = require("../services/statistic.service");

module.exports = {
  GetDoctorDashboard: async (call, callback) => {
    try {
      const result = await statisticService.getDoctorDashboard(call.request);
      callback(null, result);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },
  GetAdminDashboard: async (call, callback) => {
    try {
      const result = await statisticService.getAdminDashboard(call.request);
      callback(null, result);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  }
};