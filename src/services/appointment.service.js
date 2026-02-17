const appointmentRepo = require("../repositories/appointment.repo");

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

    return true;
  }

  // Logic hoàn tất khám
  async finishAppointment(data) {
    // 1. Validate dữ liệu
    if (!data.booking_id || !data.doctor_id) {
      throw new Error("Dữ liệu không hợp lệ (Thiếu ID)!");
    }
    if (!data.diagnosis) {
      throw new Error("Vui lòng nhập chẩn đoán bệnh!");
    }

    // 2. Gọi Transaction bên Repo
    const recordId = await appointmentRepo.finishAppointmentTransaction(data);
    
    return recordId;
  }
}

module.exports = new AppointmentService();