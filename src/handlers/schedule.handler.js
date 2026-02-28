const scheduleService = require("../services/schedule.service");

// Helper bọc lỗi
const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("Schedule Handler Error:", error);
    callback({ code: 13, message: error.message || "Lỗi Server" });
  }
};

module.exports = {
  // 1. Tạo lịch hàng loạt
  BulkCreateSchedule: (call, callback) => {
      safeCall(callback, async () => {
          console.log("📅 Dữ liệu thô từ Kreya:", call.request.date); // Soi thử date truyền vào
          const result = await scheduleService.bulkCreateSchedule(call.request);
          // Trả về đúng message ScheduleResponse trong proto
          return { 
              success: result.success, 
              message: result.message,
              conflict_times: result.conflict_times || [] 
          };
      });
  },

  // 2. Lấy danh sách lịch theo ngày
  GetScheduleByDate: (call, callback) => {
    safeCall(callback, async () => {
      const { doctor_id, date } = call.request;
      const data = await scheduleService.getScheduleByDate(doctor_id, date);
      
      // Map sang Proto
      const mappedData = data.map(item => ({
        id: item.id,
        time_type: item.time_type,
        time_display: item.time_display || "N/A", // Phòng hờ join không ra
        max_booking: item.max_booking,
        current_booking: item.current_booking,
        is_available: item.is_available
      }));

      return { success: true, data: mappedData };
    });
  }
};