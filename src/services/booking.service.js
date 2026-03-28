const bookingRepo = require("../repositories/booking.repo");
const profileRepo = require("../repositories/patientProfile.repo");
const notificationService = require("./notification.service");
const appointmentRepo = require("../repositories/appointment.repo");

class BookingService {
  async createBooking(data) {
    const inputId = data.patient_id || data.patientId;
    
    // 1. Tìm PatientId chuẩn từ UserId (để khớp với bảng profiles/patients)
    let actualPatientId = await profileRepo.getPatientIdByUserId(inputId);
    if (!actualPatientId) actualPatientId = inputId;

    // 2. Gọi Repo thực hiện Transaction (Bao gồm cả address nhe Huy)
    const bookingId = await bookingRepo.createBookingTransaction({ 
      ...data, 
      patient_id: actualPatientId 
    });

    // 3. --- GỬI TIN CHO BÁC SĨ (REALTIME) ---
    try {
        // Lấy UserID của bác sĩ để bắn Socket/Notification
        const doctorInfo = await appointmentRepo.getDoctorUserById(data.doctor_id || data.doctorId);
        if (doctorInfo && doctorInfo.user_id) {
            await notificationService.sendNotification(
                doctorInfo.user_id, 
                `Bạn có một lịch hẹn khám tại nhà mới từ bệnh nhân! 📅`, 
                'booking'
            );
        }
    } catch (e) { 
        console.error("Lỗi báo tin cho bác sĩ:", e); 
    }

    return bookingId;
  }

  // Lấy lịch sử khám
  async getHistory(patientId) {
      const res = await bookingRepo.getHistory(patientId);

      if (!res || res.length === 0) {
        // Ném lỗi về Handler để Kreya hiện thông báo đỏ cho dễ debug
        throw new Error(`Bệnh nhân ID ${patientId} không tồn tại hoặc chưa có lịch sử khám!`);
      }

      return res;
  }

  // Hủy lịch hẹn
  async cancelBooking(bookingId, patientId) {
    const isCanceled = await bookingRepo.cancelBooking(bookingId, patientId);
    
    // Nếu hủy thành công thì báo cho bác sĩ biết để trống lịch
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
        } catch (e) { 
            console.error("Lỗi báo hủy cho bác sĩ:", e); 
        }
    }
    return isCanceled;
  }

  // Xóa đơn (Xóa ảo)
  async deleteBooking(bookingId) {
    return await bookingRepo.deleteBooking(bookingId);
  }
}

module.exports = new BookingService();