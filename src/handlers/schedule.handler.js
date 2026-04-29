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
      // Trả về kết quả
      callback(null, {
        success: result.success,
        message: result.message,
        conflict_times: result.conflict_times || []
      });
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },

  // 2. Lấy danh sách lịch khám theo ngày - FIX Ở ĐÂY
  GetScheduleByDate: async (call, callback) => {
    try {
      const { doctor_id, date } = call.request;
      const schedules = await scheduleService.getScheduleByDate(doctor_id, date);
      const dataMapping = schedules.map(item => ({
        id: item.id,
        time_type: item.time_type,
        time_display: item.time_display,
        max_booking: item.max_booking || 0,
        current_booking: item.current_booking || 0,
        is_available: (item.max_booking > item.current_booking)
      }));
      callback(null, { 
        success: true, 
        data: dataMapping 
      });

    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  }
};