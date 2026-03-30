const bookingRepo = require("../repositories/booking.repo");
const profileRepo = require("../repositories/patientProfile.repo");
const notificationService = require("./notification.service");
const appointmentRepo = require("../repositories/appointment.repo");

class BookingService {
  // 1. Tạo lịch hẹn mới
  async createBooking(data) {
    const inputId = data.patient_id || data.patientId;
    let actualPatientId = await profileRepo.getPatientIdByUserId(inputId);
    
    if (!actualPatientId) {
        actualPatientId = inputId;
    }

    const bookingId = await bookingRepo.createBookingTransaction({ 
      ...data, 
      patient_id: actualPatientId 
    });

    // Báo tin cho bác sĩ: "Có khách sộp tới nhà nè"
    try {
        const doctorId = data.doctor_id || data.doctorId;
        const doctorInfo = await appointmentRepo.getDoctorUserById(doctorId);
        
        if (doctorInfo && doctorInfo.user_id) {
            await notificationService.sendNotification(
                doctorInfo.user_id, 
                `Bạn có một yêu cầu khám tại nhà mới từ khách hàng! 📅`, 
                'booking',
                'Yêu cầu đặt lịch'
            );
        }
    } catch (e) { 
        console.error(">>> [Notification Error] Báo tin cho bác sĩ thất bại:", e.message); 
    }

    return bookingId;
  }

  // 2. Lịch sử khám
  async getHistory(patientId) {
      let actualId = await profileRepo.getPatientIdByUserId(patientId);
      if (!actualId) actualId = patientId;

      const res = await bookingRepo.getHistory(actualId);
      if (!res || res.length === 0) return []; // Không throw error để FE dễ xử lý mảng rỗng
      return res;
  }

  // 3. Bệnh nhân chủ động hủy lịch
  async cancelBooking(bookingId, patientId, reason) {
    const isSuccess = await bookingRepo.cancelBooking(bookingId, patientId, reason);
    
    if (isSuccess) {
        try {
            const bookingInfo = await appointmentRepo.getBookingById(bookingId);
            if (bookingInfo && bookingInfo.doctor_user_id) {
                // 🔔 Báo cho bác sĩ kèm lý do luôn cho nó "thật"
                await notificationService.sendNotification(
                    bookingInfo.doctor_user_id, 
                    `Lịch hẹn #${bookingId} đã bị hủy. Lý do: ${reason || 'Không có'} ⚠️`, 
                    'booking',
                    'Lịch hẹn bị hủy'
                );
            }
        } catch (e) { console.error(e); }
    }
    return isSuccess;
  }

  async deleteBooking(bookingId) {
    return await bookingRepo.deleteBooking(bookingId);
  }
}

module.exports = new BookingService();