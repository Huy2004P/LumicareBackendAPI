const bookingRepo = require("../repositories/booking.repo");

class BookingService {
  
  async createBooking(data) {
    // Validate cơ bản
    if (!data.doctor_id || !data.patient_id || !data.date || !data.time_type) {
      throw new Error("Thiếu thông tin đặt lịch!");
    }

    // Gọi Transaction bên Repo
    const bookingId = await bookingRepo.createBookingTransaction(data);
    
    // (Optional) Sau này có thể thêm logic gửi Email xác nhận ở đây
    
    return bookingId;
  }

  async getHistory(patientId) {
    if (!patientId) throw new Error("Thiếu ID bệnh nhân!");
    return await bookingRepo.getHistory(patientId);
  }

  async cancelBooking(bookingId, patientId) {
    const isCancelled = await bookingRepo.cancelBooking(bookingId, patientId);
    if (!isCancelled) {
      throw new Error("Không thể hủy lịch (Lịch không tồn tại hoặc đã hoàn thành/hủy rồi).");
    }
    return true;
  }

  async deleteBooking(bookingId) {
    if (!bookingId) throw new Error("Thiếu ID lịch hẹn để xóa!");
    return await bookingRepo.deleteBooking(bookingId);
  }
}

module.exports = new BookingService();