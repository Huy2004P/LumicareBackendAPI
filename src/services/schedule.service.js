const scheduleRepo = require("../repositories/schedule.repo");
const notificationService = require("./notification.service");
const appointmentRepo = require("../repositories/appointment.repo");
const moment = require("moment");

class ScheduleService {
  // Tạo hoặc cập nhật lịch khám hàng loạt cho bác sĩ (Dùng chung 1 endpoint, nếu đã có sẽ xóa ảo và tạo mới)
  async bulkCreateSchedule(data) {
    let { doctor_id, date, time_types, max_booking } = data;
    const formattedDate = moment(date, ["YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY"]).format("YYYY-MM-DD");
    const today = moment().startOf('day');
    const inputDate = moment(formattedDate).startOf('day');
    if (inputDate.isBefore(today)) {
        throw new Error("Không thể tạo hoặc cập nhật lịch khám cho các ngày trong quá khứ!");
    }
    if (!time_types || time_types.length === 0) {
      throw new Error("Vui lòng chọn ít nhất một khung giờ!");
    }
    const bookedSlots = await scheduleRepo.getBookedTimeTypes(doctor_id, formattedDate);
    const conflicts = bookedSlots.filter(t => !time_types.includes(t));
    if (conflicts.length > 0) {
      return {
        success: false,
        message: "Không thể xóa khung giờ đã có bệnh nhân đặt lịch!",
        conflict_times: conflicts
      };
    }
    await scheduleRepo.softDeleteOldSlots(doctor_id, formattedDate, time_types);
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    const scheduleData = time_types.map(timeType => [
      doctor_id, formattedDate, timeType, max_booking || 10, 0, now, now
    ]);
    await scheduleRepo.bulkCreate(scheduleData);
    try {
        const doctorInfo = await appointmentRepo.getBookingById(null, doctor_id);         
        if (doctorInfo && doctorInfo.user_id) {
            await notificationService.sendNotification(
                doctorInfo.user_id, 
                `Hệ thống: Bạn đã cập nhật thành công ${time_types.length} khung giờ khám cho ngày ${formattedDate}. 📅`, 
                'system'
            );
        }
    } catch (e) { 
        console.error(">>> [Lỗi Thông Báo] Không gửi được tin cho bác sĩ:", e.message); 
    }
    return { success: true, message: "Cập nhật lịch khám thành công!" };
  }
  // Lấy lịch khám của bác sĩ theo ngày (Hiển thị cả thông tin đã đặt và còn trống)
  async getScheduleByDate(doctorId, date) {
    if (!doctorId || !date) {
      throw new Error("Thiếu thông tin bác sĩ hoặc ngày khám!");
    }
    const formattedDate = moment(date, ["YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY"]).format("YYYY-MM-DD");
    const schedules = await scheduleRepo.getScheduleByDate(doctorId, formattedDate);
    return schedules.map(item => ({
      ...item,
      is_available: item.current_booking < item.max_booking
    }));
  }
}

module.exports = new ScheduleService();