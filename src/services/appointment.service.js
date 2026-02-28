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
    
    // Nếu client không gửi status, mặc định là 'confirmed'
    const finalStatus = status || 'confirmed';
    
    // Gọi Repo update
    const isUpdated = await appointmentRepo.verifyBooking(bookingId, finalStatus);
    
    if (!isUpdated) {
      throw new Error("Lịch hẹn không tồn tại hoặc lỗi cập nhật!");
    }

    try {
      // Lấy thông tin booking để biết patient_id là ai
      const bookingInfo = await appointmentRepo.getBookingById(bookingId);
      
      if (bookingInfo && bookingInfo.user_id) {
        let msg = "";
        if (finalStatus === 'confirmed') msg = "Lịch khám tại nhà của bạn đã được bác sĩ xác nhận!";
        if (finalStatus === 'arrived') msg = "Bác sĩ đã đến địa chỉ của bạn. Vui lòng chuẩn bị!";
        
        if (bookingInfo && bookingInfo.user_id) {
          await notificationService.sendNotification(
            bookingInfo.user_id, // Bây giờ nó đã là ID chuẩn của bảng users rồi
            msg, 
            'booking'
          );
        }
      }
    } catch (notiError) {
      // Nếu lỗi bắn thông báo thì cũng kệ nó, đừng làm hỏng luồng verify chính
      console.error("Lỗi gửi thông báo:", notiError);
    }

    return true;
  }

  // Logic hoàn tất khám
  async finishAppointment(data) {
    if (!data.booking_id || !data.doctor_id) {
      throw new Error("Dữ liệu không hợp lệ (Thiếu ID)!");
    }
    if (!data.diagnosis) {
      throw new Error("Vui lòng nhập chẩn đoán bệnh!");
    }

    // Không cần xử lý gì thêm, truyền cục data (đã có re_exam_date từ proto) xuống Repo
    const recordId = await appointmentRepo.finishAppointmentTransaction(data);
    return recordId;
  }
}

module.exports = new AppointmentService();