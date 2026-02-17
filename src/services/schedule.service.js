const scheduleRepo = require("../repositories/schedule.repo");

class ScheduleService {
  
  // LOGIC TẠO NHIỀU LỊCH CÙNG LÚC
  async bulkCreateSchedule(data) {
    // data gồm: doctor_id, date, time_types (mảng ['T1', 'T2']), max_booking
    
    if (!data.time_types || data.time_types.length === 0) {
      throw new Error("Vui lòng chọn ít nhất một khung giờ!");
    }

    // Biến đổi dữ liệu thành mảng 2 chiều để ném vào MySQL
    const scheduleData = data.time_types.map(timeType => {
      return [
        data.doctor_id,
        data.date,         // Lưu dạng string hoặc timestamp tùy DB (thường là string 'YYYY-MM-DD' hoặc timestamp số)
        timeType,
        data.max_booking,
        0,                 // current_booking khởi tạo = 0
        new Date(),        // created_at
        new Date()         // updated_at
      ];
    });

    // Gọi Repo
    await scheduleRepo.bulkCreate(scheduleData);
    
    return true;
  }

  // LOGIC LẤY LỊCH
  async getScheduleByDate(doctorId, date) {
    if (!doctorId || !date) {
      throw new Error("Thiếu thông tin bác sĩ hoặc ngày khám!");
    }

    const schedules = await scheduleRepo.getScheduleByDate(doctorId, date);
    
    // Tính toán thêm trường is_available (Còn slot hay không)
    return schedules.map(item => {
        return {
            ...item,
            is_available: item.current_booking < item.max_booking
        };
    });
  }
}

module.exports = new ScheduleService();