const bookingRepo = require("../repositories/booking.repo");
const profileRepo = require("../repositories/patientProfile.repo");

class BookingService {
  async createBooking(data) {
    const inputId = data.patient_id || data.patientId;
    
    // 1. Thử tìm PatientId thông qua UserId (Dành cho App truyền UserId lên)
    let actualPatientId = await profileRepo.getPatientIdByUserId(inputId);
    
    // 2. Nếu không tìm thấy (có thể ông đang truyền trực tiếp PatientId từ Kreya)
    // Thì dùng luôn cái inputId đó để đặt lịch
    if (!actualPatientId) {
        actualPatientId = inputId;
    }

    return await bookingRepo.createBookingTransaction({ 
      ...data, 
      patient_id: actualPatientId 
    });
  }

  // BookingService.js
  async getHistory(patientId) {
      const res = await bookingRepo.getHistory(patientId);

      if (!res || res.length === 0) {
        // Ném lỗi thẳng về Controller để hiện bảng đỏ bên Kreya
        throw new Error(`Bệnh nhân ID ${patientId} không tồn tại hoặc chưa có lịch sử khám!`);
      }

      return res;
  }

  async cancelBooking(bookingId, patientId) {
    return await bookingRepo.cancelBooking(bookingId, patientId);
  }

  async deleteBooking(bookingId) {
    return await bookingRepo.deleteBooking(bookingId);
  }
}
module.exports = new BookingService();