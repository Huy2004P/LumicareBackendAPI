const bookingRepo = require("../repositories/booking.repo");
const profileRepo = require("../repositories/patientProfile.repo");
const notificationService = require("./notification.service");
const appointmentRepo = require("../repositories/appointment.repo");

class BookingService {
  async createBooking(data) {
    const inputId = data.patient_id || data.patientId;
    
    // Tìm PatientId chuẩn
    let actualPatientId = await profileRepo.getPatientIdByUserId(inputId);
    if (!actualPatientId) actualPatientId = inputId;

    const bookingId = await bookingRepo.createBookingTransaction({ 
      ...data, 
      patient_id: actualPatientId 
    });

    // --- GỬI TIN CHO BÁC SĨ ---
    try {
        // Giả sử ông có hàm lấy UserID của bác sĩ từ DoctorID
        const doctorInfo = await appointmentRepo.getDoctorUserById(data.doctor_id);
        if (doctorInfo && doctorInfo.user_id) {
            await notificationService.sendNotification(
                doctorInfo.user_id, 
                `Bạn có một lịch hẹn khám tại nhà mới từ bệnh nhân! 📅`, 
                'booking'
            );
        }
    } catch (e) { console.error("Lỗi báo tin cho bác sĩ:", e); }

    return bookingId;
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
    const isCanceled = await bookingRepo.cancelBooking(bookingId, patientId);
    
    if (isCanceled) {
        try {
            const bookingInfo = await appointmentRepo.getBookingById(bookingId);
            if (bookingInfo && bookingInfo.doctor_user_id) {
                await notificationService.sendNotification(
                    bookingInfo.doctor_user_id, 
                    "Một bệnh nhân đã hủy lịch hẹn khám. Vui lòng kiểm tra lại danh sách! ⚠️", 
                    'system'
                );
            }
        } catch (e) { console.error("Lỗi báo hủy cho bác sĩ:", e); }
    }
    return isCanceled;
  }

  async deleteBooking(bookingId) {
    return await bookingRepo.deleteBooking(bookingId);
  }
}
module.exports = new BookingService();