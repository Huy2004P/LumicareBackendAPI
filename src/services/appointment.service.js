const appointmentRepo = require("../repositories/appointment.repo");
const notificationService = require("./notification.service");
class AppointmentService {
  
  // Logic lấy danh sách
  async getListPatient(doctorId, date) {
    if (!doctorId || !date) {
      throw new Error("Thiếu thông tin bác sĩ hoặc ngày khám!");
    }
    // Gọi Repo lấy dữ liệu thô
    const patients = await appointmentRepo.getListPatientForDoctor(doctorId, date);
    return patients;
  }

  // Logic duyệt lịch
 async verifyBooking(doctorId, bookingId, status) {
    if (!bookingId) throw new Error("Thiếu ID lịch hẹn!");
    const finalStatus = status || 'confirmed';
    const isUpdated = await appointmentRepo.verifyBooking(bookingId, finalStatus);
    
    if (!isUpdated) throw new Error("Lịch hẹn không tồn tại hoặc lỗi cập nhật!");

    try {
      const bookingInfo = await appointmentRepo.getBookingById(bookingId);
      if (bookingInfo && bookingInfo.user_id) {
        let msg = "";
        if (finalStatus === 'confirmed') msg = "Lịch khám của bạn đã được bác sĩ xác nhận! ✅";
        if (finalStatus === 'arrived') msg = "Bác sĩ đã đến địa chỉ của bạn. Vui lòng chuẩn bị! 🏠";
        if (finalStatus === 'canceled') msg = "Rất tiếc, bác sĩ đã hủy lịch khám của bạn. ❌";

        // GỬI TIN CHO BỆNH NHÂN
        await notificationService.sendNotification(bookingInfo.user_id, msg, 'booking');
      }
    } catch (notiError) { console.error("Lỗi gửi thông báo:", notiError); }
    return true;
  }

  // Logic hoàn tất khám
  async finishAppointment(data) {
    if (!data.booking_id || !data.doctor_id) throw new Error("Thiếu ID!");
    if (!data.diagnosis) throw new Error("Vui lòng nhập chẩn đoán bệnh!");

    // Map prescriptions sang treatments (giữ nguyên logic của ông)
    if (data.prescriptions && data.prescriptions.length > 0) {
      data.treatments = data.prescriptions.map(item => ({
        name: item.medicine_name || item.name,
        times: item.times_per_day || 2,
        instruction: item.instruction || "Uống sau khi ăn",
        repeat_days: item.days || 7
      }));
    } else { data.prescriptions = []; }

    const recordId = await appointmentRepo.finishAppointmentTransaction(data);

    // GỬI TIN CHO BỆNH NHÂN SAU KHI KHÁM XONG
    try {
      const bookingInfo = await appointmentRepo.getBookingById(data.booking_id);
      if (bookingInfo && bookingInfo.user_id) {
        await notificationService.sendNotification(
          bookingInfo.user_id, 
          "Bác sĩ đã hoàn tất buổi khám. Bạn có thể xem đơn thuốc và lịch nhắc thuốc ngay bây giờ! 💊", 
          'treatment'
        );
      }
    } catch (e) { console.error("Lỗi gửi thông báo khám xong:", e); }

    return recordId;
  }
}

module.exports = new AppointmentService();