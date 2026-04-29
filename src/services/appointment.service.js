const appointmentRepo = require("../repositories/appointment.repo");
const notificationService = require("./notification.service");

class AppointmentService {
  // 1. Lấy danh sách bệnh nhân theo bác sĩ và ngày khám
  async getListPatient(doctorId, date) {
    if (!doctorId || !date) {
      throw new Error("Thiếu thông tin bác sĩ hoặc ngày khám!");
    }
    return await appointmentRepo.getListPatientForDoctor(doctorId, date);
  }
  // 2. Duyệt/Cập nhật trạng thái lịch hẹn
  async verifyBooking(doctorId, bookingId, status) {
    if (!bookingId) throw new Error("Thiếu ID lịch hẹn!");
    const finalStatus = status || 'confirmed';
    const isUpdated = await appointmentRepo.verifyBooking(bookingId, finalStatus);
    if (!isUpdated) throw new Error("Lịch hẹn không tồn tại hoặc lỗi cập nhật!");
    try {
      const bookingInfo = await appointmentRepo.getBookingById(bookingId);
      if (bookingInfo && bookingInfo.user_id) {
        const statusMessages = {
          'confirmed': "Lịch khám của bạn đã được bác sĩ xác nhận! ✅",
          'arrived': "Bác sĩ đã đến địa chỉ của bạn. Vui lòng chuẩn bị! 🏠",
          'canceled': `Rất tiếc, bác sĩ đã hủy lịch khám vì lý do khách quan. ❌`,
          'finished': "Buổi khám đã kết thúc. Chúc bạn sớm bình phục! ✨"
        };
        const msg = statusMessages[finalStatus];
        if (msg) {
          await notificationService.sendNotification(bookingInfo.user_id, msg, 'booking', 'Cập nhật lịch hẹn');
        }
      }
    } catch (notiError) {
      console.error(">>> [Notification Error] verifyBooking:", notiError.message);
    }
    return true;
  }
  // 3. Hoàn tất khám (Trả kết quả)
  async finishAppointment(data) {
    if (!data.booking_id || !data.doctor_id) throw new Error("Thiếu ID!");
    if (!data.diagnosis) throw new Error("Vui lòng nhập chẩn đoán bệnh!");
    if (data.treatments && data.treatments.length > 0) {
      console.log(">>> [SERVICE] Giữ nguyên treatments từ Client:", data.treatments.length);
    }
    else if (data.prescriptions && data.prescriptions.length > 0) {
      console.log(">>> [SERVICE] Chuyển đổi từ prescriptions sang treatments");
      data.treatments = data.prescriptions.map(item => ({
        name: item.medicine_name || item.name,
        times: item.times_per_day || 2,
        instruction: item.instruction || "Uống sau khi ăn",
        repeat_days: item.days || 7
      }));
    }
    else {
      data.treatments = [];
    }
    const recordId = await appointmentRepo.finishAppointmentTransaction(data);
    try {
      const bookingInfo = await appointmentRepo.getBookingById(data.booking_id);
      if (bookingInfo && bookingInfo.user_id) {
        await notificationService.sendNotification(
          bookingInfo.user_id,
          `Bác sĩ đã có kết quả chẩn đoán: ${data.diagnosis}. Hãy xem chi tiết đơn thuốc và lời dặn ngay! 💊`,
          'treatment',
          'Kết quả điều trị'
        );
      }
    } catch (e) {
      console.error(">>> [Notification Error] finishAppointment:", e.message);
    }
    return recordId;
  }

  // 4. Xem lại lịch sử bệnh án
  async getMedicalHistory(patientId, doctorId, keyword) {
    const records = await appointmentRepo.getMedicalHistory(patientId, doctorId, keyword);
    const detailedRecords = await Promise.all(records.map(async (rec) => {
      const [medicines, treatments] = await Promise.all([
        appointmentRepo.getPrescriptionByAppId(rec.appointment_id),
        appointmentRepo.getTreatmentsByAppId(rec.appointment_id)
      ]);
      return {
        ...rec,
        date: rec.date ? rec.date.toISOString().split('T')[0] : "",
        re_exam_date: rec.re_exam_date ? rec.re_exam_date.toISOString().split('T')[0] : "",
        medicines: medicines.map(m => ({
          drug_id: m.drug_id,
          drug_name: m.drug_name,
          quantity: m.quantity,
          instruction: m.instruction
        })),
        treatments: treatments
      };
    }));

    return detailedRecords;
  }
}

module.exports = new AppointmentService();