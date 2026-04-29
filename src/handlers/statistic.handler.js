const statisticService = require("../services/statistic.service");

module.exports = {
  // Lấy dữ liệu cho dashboard admin
  GetAdminDashboard: async (call, callback) => {
    try {
      const result = await statisticService.getAdminDashboard(call.request);
      callback(null, result);
    } catch (e) {
      console.error("Statistic Handler Error:", e);
      callback({ code: 13, message: e.message });
    }
  }
};