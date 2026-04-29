const bookingRepo = require("../repositories/booking.repo");
const profileRepo = require("../repositories/patientProfile.repo");
const notificationService = require("./notification.service");
const appointmentRepo = require("../repositories/appointment.repo");

class BookingService {
    // 1. Tạo lịch khám mới
  async createBooking(data) {
    const inputId = data.patient_id || data.patientId;
    let actualPatientId = await profileRepo.getPatientIdByUserId(inputId);
    if (!actualPatientId) actualPatientId = inputId;
    const paymentMethod = data.payment_method || data.paymentMethod || 'PAY1';
    const bookingId = await bookingRepo.createBookingTransaction({ 
      ...data, 
      patient_id: actualPatientId,
      payment_method: paymentMethod 
    });
    try {
        const doctorId = data.doctor_id || data.doctorId;
        const doctorInfo = await appointmentRepo.getDoctorUserById(doctorId);
        if (doctorInfo && doctorInfo.user_id) {
            const methodText = paymentMethod === 'PAY1' ? 'Tiền mặt' : (paymentMethod === 'PAY2' ? 'Chuyển khoản' : 'VietQR');
            await notificationService.sendNotification(
                doctorInfo.user_id, 
                `Bạn có yêu cầu khám mới! 📅 Thanh toán: ${methodText}. Vui lòng kiểm tra lịch hẹn.`, 
                'booking',
                'Yêu cầu đặt lịch'
            );
        }
        if (inputId) {
        await notificationService.sendNotification(
            inputId,
            `Bạn đã đặt lịch thành công! 📅 Phương thức thanh toán: ${methodText}. Vui lòng chờ xác nhận từ bác sĩ.`,
            'booking',
            'Đặt lịch thành công'
        );
    }
    } catch (e) { 
        console.error(">>> [Notification Error] Báo tin cho bác sĩ thất bại:", e.message); 
    }
    return bookingId;
  }
  // 2. Lấy lịch sử khám của bệnh nhân
  async getHistory(patientId) {
    let actualId = await profileRepo.getPatientIdByUserId(patientId);
    if (!actualId) actualId = patientId;
    const res = await bookingRepo.getHistory(actualId);
    return res || [];
  }
  // 3. Hủy lịch khám
  async cancelBooking(bookingId, patientId, reason) {
    const isSuccess = await bookingRepo.cancelBooking(bookingId, patientId, reason);
    if (isSuccess) {
        try {
            const bookingInfo = await appointmentRepo.getBookingById(bookingId);
            if (bookingInfo && bookingInfo.doctor_user_id) {
                const notificationMessage = `Lịch hẹn đã bị hủy. Lý do: ${reason || 'Không có lý do cụ thể'} ⚠️`;
                await notificationService.sendNotification(
                    bookingInfo.doctor_user_id, 
                    notificationMessage, 
                    'booking',
                    'Lịch hẹn bị hủy'
                );
            }
        } catch (e) { 
            console.error(">>> [Cancel Notification Error]:", e.message); 
        }
    }
    return isSuccess;
  }
  // 4. Xóa lịch khám (dành cho admin)
  async deleteBooking(bookingId) {
    return await bookingRepo.deleteBooking(bookingId);
  }
}

module.exports = new BookingService();