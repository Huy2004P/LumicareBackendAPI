const bookingRepo = require("../repositories/booking.repo");
const profileRepo = require("../repositories/patientProfile.repo");
const notificationService = require("./notification.service");
const appointmentRepo = require("../repositories/appointment.repo");

class BookingService {
  // 1. Đặt lịch khám mới (Xử lý User ID -> Patient ID)
  async createBooking(data) {
    console.log(">>> [Booking Service] Nhận request đặt lịch. Location ID:", data.location_id);
    
    // Lấy ID gửi từ Frontend (có thể là User ID 22)
    const inputId = data.patient_id || data.patientId;
    
    // Tìm PatientId chuẩn từ UserId (để khớp với bảng profiles/patients trong DB)
    let actualPatientId = await profileRepo.getPatientIdByUserId(inputId);
    
    // Nếu không tìm thấy trong bảng patients, tạm thời dùng chính nó (hoặc báo lỗi tùy Huy)
    if (!actualPatientId) {
        console.warn(`>>> [Warning] Không tìm thấy Patient ID cho User ${inputId}, dùng ID gốc.`);
        actualPatientId = inputId;
    }

    // Gọi Repo thực hiện Transaction (Repo này sẽ tự tra cứu chuỗi địa chỉ từ location_id)
    const bookingId = await bookingRepo.createBookingTransaction({ 
      ...data, 
      patient_id: actualPatientId 
    });

    // --- GỬI TIN CHO BÁC SĨ (REALTIME) ---
    try {
        const doctorId = data.doctor_id || data.doctorId;
        const doctorInfo = await appointmentRepo.getDoctorUserById(doctorId);
        
        if (doctorInfo && doctorInfo.user_id) {
            await notificationService.sendNotification(
                doctorInfo.user_id, 
                `Bạn có một lịch hẹn khám tại nhà mới! 📅`, 
                'booking'
            );
        }
    } catch (e) { 
        console.error(">>> [Socket Error] Lỗi báo tin cho bác sĩ:", e.message); 
    }

    return bookingId;
  }

  // 2. Lấy lịch sử khám
  async getHistory(patientId) {
      // Trước khi lấy lịch sử, cũng cần convert User ID sang Patient ID nếu cần
      let actualId = await profileRepo.getPatientIdByUserId(patientId);
      if (!actualId) actualId = patientId;

      const res = await bookingRepo.getHistory(actualId);

      if (!res || res.length === 0) {
        throw new Error(`Bệnh nhân ID ${patientId} chưa có lịch sử khám!`);
      }

      return res;
  }

  // 3. Hủy lịch hẹn
  async cancelBooking(bookingId, patientId) {
    // Tương tự, tìm ID chuẩn để verify quyền sở hữu đơn hàng
    let actualId = await profileRepo.getPatientIdByUserId(patientId);
    if (!actualId) actualId = patientId;

    const isCanceled = await bookingRepo.cancelBooking(bookingId, actualId);
    
    if (isCanceled) {
        try {
            const bookingInfo = await appointmentRepo.getBookingById(bookingId);
            if (bookingInfo && bookingInfo.doctor_user_id) {
                await notificationService.sendNotification(
                    bookingInfo.doctor_user_id, 
                    "Một bệnh nhân đã hủy lịch hẹn khám. Vui lòng kiểm tra lại! ⚠️", 
                    'system'
                );
            }
        } catch (e) { 
            console.error(">>> [Socket Error] Lỗi báo hủy cho bác sĩ:", e); 
        }
    }
    return isCanceled;
  }

  // 4. Xóa đơn (Xóa ảo)
  async deleteBooking(bookingId) {
    return await bookingRepo.deleteBooking(bookingId);
  }
}

module.exports = new BookingService();