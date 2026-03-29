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
      console.error(">>> Error BulkCreateSchedule:", e);
      callback({ code: 13, message: e.message });
    }
  },

  // 2. Lấy danh sách lịch khám theo ngày - FIX Ở ĐÂY
  GetScheduleByDate: async (call, callback) => {
    try {
      const { doctor_id, date } = call.request;
      const schedules = await scheduleService.getScheduleByDate(doctor_id, date);

      // In log ra để Huy kiểm tra lần cuối trước khi đẩy lên App
      console.log(`>>> [Handler] Đang gửi về App ${schedules.length} slot lịch.`);

      // Map lại dữ liệu cho khớp với Repeated Message trong Proto
      const dataMapping = schedules.map(item => ({
        id: item.id,
        time_type: item.time_type,
        time_display: item.time_display, // Cái này đã được Repo lấy từ allcodes rồi
        max_booking: item.max_booking || 0,
        current_booking: item.current_booking || 0,
        is_available: (item.max_booking > item.current_booking)
      }));

      // QUAN TRỌNG: Phải có success: true thì App mới chịu nhận data
      callback(null, { 
        success: true, 
        data: dataMapping 
      });

    } catch (e) {
      console.error(">>> Error GetScheduleByDate:", e);
      callback({ code: 13, message: e.message });
    }
  }
};