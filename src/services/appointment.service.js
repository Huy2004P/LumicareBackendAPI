const appointmentRepo = require("../repositories/appointment.repo");
const notificationService = require("./notification.service");

class AppointmentService {
  // 1. Lấy danh sách bệnh nhân cho bác sĩ
  async getListPatient(doctorId, date) {
    if (!doctorId || !date) {
      throw new Error("Thiếu thông tin bác sĩ hoặc ngày khám!");
    }
    return await appointmentRepo.getListPatientForDoctor(doctorId, date);
  }

  // 2. Duyệt/Cập nhật trạng thái lịch hẹn
  async verifyBooking(doctorId, bookingId, status) {
    if (!bookingId) throw new Error("Thiếu ID lịch hẹn!");
    const finalStatus = status || 'confirmed';
    const isUpdated = await appointmentRepo.verifyBooking(bookingId, finalStatus);
    
    if (!isUpdated) throw new Error("Lịch hẹn không tồn tại hoặc lỗi cập nhật!");

    try {
      const bookingInfo = await appointmentRepo.getBookingById(bookingId);
      if (bookingInfo && bookingInfo.user_id) {
        const statusMessages = {
          'confirmed': "Lịch khám của bạn đã được bác sĩ xác nhận! ✅",
          'arrived': "Bác sĩ đã đến địa chỉ của bạn. Vui lòng chuẩn bị! 🏠",
          'canceled': `Rất tiếc, bác sĩ đã hủy lịch khám vì lý do khách quan. ❌`,
          'finished': "Buổi khám đã kết thúc. Chúc bạn sớm bình phục! ✨"
        };

        const msg = statusMessages[finalStatus];
        if (msg) {
          await notificationService.sendNotification(bookingInfo.user_id, msg, 'booking', 'Cập nhật lịch hẹn');
        }
      }
    } catch (notiError) { 
      console.error(">>> [Notification Error] verifyBooking:", notiError.message); 
    }
    return true;
  }

  // 3. Hoàn tất khám (Trả kết quả)
  async finishAppointment(data) {
    if (!data.booking_id || !data.doctor_id) throw new Error("Thiếu ID!");
    if (!data.diagnosis) throw new Error("Vui lòng nhập chẩn đoán bệnh!");

    // --- LOGIC FIX: KHÔNG ĐỂ MẤT DỮ LIỆU TREATMENTS ---
    // Nếu Client gửi 'treatments' (như cái JSON nãy ông log) thì giữ nguyên nó
    if (data.treatments && data.treatments.length > 0) {
        console.log(">>> [SERVICE] Giữ nguyên treatments từ Client:", data.treatments.length);
    } 
    // Nếu không có 'treatments' nhưng có 'prescriptions' (để tương thích ngược)
    else if (data.prescriptions && data.prescriptions.length > 0) {
        console.log(">>> [SERVICE] Chuyển đổi từ prescriptions sang treatments");
        data.treatments = data.prescriptions.map(item => ({
          name: item.medicine_name || item.name,
          times: item.times_per_day || 2,
          instruction: item.instruction || "Uống sau khi ăn",
          repeat_days: item.days || 7
        }));
    } 
    // Nếu cả hai đều rỗng thì mới gán mảng rỗng
    else {
        data.treatments = [];
    }
    // ------------------------------------------------

    // Gọi Repo thực hiện Transaction
    const recordId = await appointmentRepo.finishAppointmentTransaction(data);

    // Gửi tin cho bệnh nhân kèm lời dặn sơ bộ
    try {
      const bookingInfo = await appointmentRepo.getBookingById(data.booking_id);
      if (bookingInfo && bookingInfo.user_id) {
        await notificationService.sendNotification(
          bookingInfo.user_id, 
          `Bác sĩ đã có kết quả chẩn đoán: ${data.diagnosis}. Hãy xem chi tiết đơn thuốc và lời dặn ngay! 💊`, 
          'treatment',
          'Kết quả điều trị'
        );
      }
    } catch (e) { 
      console.error(">>> [Notification Error] finishAppointment:", e.message); 
    }

    return recordId;
  }
}

module.exports = new AppointmentService();