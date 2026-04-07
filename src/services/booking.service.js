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

    // 🚀 Đảm bảo bốc đúng payment_method từ Flutter gửi qua Proto
    // Nếu Flutter gửi snake_case (payment_method) hoặc camelCase (paymentMethod) đều nhận hết
    const paymentMethod = data.payment_method || data.paymentMethod || 'PAY1';

    const bookingId = await bookingRepo.createBookingTransaction({ 
      ...data, 
      patient_id: actualPatientId,
      payment_method: paymentMethod // 🎯 Chốt hạ phương thức thanh toán truyền xuống Repo
    });

    // Báo tin cho bác sĩ
    try {
        const doctorId = data.doctor_id || data.doctorId;
        const doctorInfo = await appointmentRepo.getDoctorUserById(doctorId);
        
        if (doctorInfo && doctorInfo.user_id) {
            await notificationService.sendNotification(
                doctorInfo.user_id, 
                `Bạn có một yêu cầu khám tại nhà mới! 📅 Phương thức: ${paymentMethod === 'PAY1' ? 'Tiền mặt' : 'Chuyển khoản'}`, 
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
      
      // 🎯 Trả về list, nếu null thì trả mảng rỗng để FE map ko bị crash
      if (!res) return []; 
      return res;
  }

  // 3. Bệnh nhân chủ động hủy lịch
  async cancelBooking(bookingId, patientId, reason) {
    // Lưu ý: patientId ở đây thường là userId từ token, Repo nãy tui viết đã có logic convert rồi
    const isSuccess = await bookingRepo.cancelBooking(bookingId, patientId, reason);
    
    if (isSuccess) {
        try {
            const bookingInfo = await appointmentRepo.getBookingById(bookingId);
            if (bookingInfo && bookingInfo.doctor_user_id) {
                await notificationService.sendNotification(
                    bookingInfo.doctor_user_id, 
                    `Lịch hẹn #${bookingId} đã bị hủy. Lý do: ${reason || 'Khách thay đổi ý định'} ⚠️`, 
                    'booking',
                    'Lịch hẹn bị hủy'
                );
            }
        } catch (e) { console.error(">>> [Cancel Notification Error]:", e.message); }
    }
    return isSuccess;
  }

  // 4. Xóa lịch sử (Xóa ảo)
  async deleteBooking(bookingId) {
    return await bookingRepo.deleteBooking(bookingId);
  }
}

module.exports = new BookingService();