const scheduleService = require("../services/schedule.service");

module.exports = {
  // 1. Tạo lịch khám hàng loạt (Bulk Create)
  BulkCreateSchedule: async (call, callback) => {
    try {
      const { doctor_id, date, time_types, max_booking } = call.request;
      
      const result = await scheduleService.bulkCreateSchedule({
        doctor_id,
        date,
        time_types,
        max_booking
      });

      // Trả về kết quả (thành công/thất bại và danh sách khung giờ bị xung đột nếu có)
      callback(null, {
        success: result.success,
        message: result.message,
        conflict_times: result.conflict_times || []
      });
    } catch (e) {
      console.error(">>> Error BulkCreateSchedule:", e);
      callback({ code: 13, message: e.message });
    }
  },

  // 2. Lấy danh sách lịch khám theo ngày
  GetScheduleByDate: async (call, callback) => {
    try {
      const { doctor_id, date } = call.request;
      const schedules = await scheduleService.getScheduleByDate(doctor_id, date);

      // Map lại dữ liệu cho khớp với Repeated Message trong Proto
      const data = schedules.map(item => ({
        id: item.id,
        time_type: item.time_type || item.timeType,
        time_display: item.time_display || item.timeDisplay,
        max_booking: item.max_booking || 0,
        current_booking: item.current_booking || 0,
        is_available: item.is_available
      }));

      callback(null, { data });
    } catch (e) {
      console.error(">>> Error GetScheduleByDate:", e);
      callback({ code: 13, message: e.message });
    }
  }
};