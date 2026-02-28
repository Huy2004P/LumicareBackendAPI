const appointmentService = require("../services/appointment.service");

// Hàm bọc lỗi (quan trọng để server không bị crash)
const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("Appointment Handler Error:", error);
    callback({ code: 13, message: error.message || "Lỗi Server" });
  }
};

module.exports = {
  // 1. Bác sĩ xem danh sách bệnh nhân
  GetListPatientForDoctor: (call, callback) => {
    safeCall(callback, async () => {
      const { doctor_id, date } = call.request;
      
      const data = await appointmentService.getListPatient(doctor_id, date);
      
      // Map dữ liệu từ DB sang định dạng Proto
      const mappedData = data.map(r => ({
        booking_id: r.booking_id,
        patient_id: r.patient_id,
        patient_name: r.patient_name,
        phone_number: r.phone,
        time_type: r.time_type,
        time_display: r.time_display,
        reason: r.reason,
        status: r.status,
        gender: r.gender,
        birthday: r.birthday ? r.birthday.toString() : "", // Convert ngày tháng sang string
        address: r.address
      }));

      return { success: true, message: "OK", data: mappedData };
    });
  },

  // 2. Bác sĩ xác nhận lịch
  VerifyBooking: (call, callback) => {
    safeCall(callback, async () => {
      const { doctor_id, booking_id, status } = call.request;
      await appointmentService.verifyBooking(doctor_id, booking_id, status);
      return { success: true, message: "Đã xác nhận lịch khám!" };
    });
  },

  // 3. Hoàn tất khám bệnh
  FinishAppointment: (call, callback) => {
    safeCall(callback, async () => {
      // Truyền nguyên cục request sang service xử lý
      const recordId = await appointmentService.finishAppointment(call.request);
      return { 
        success: true, 
        message: "Lưu bệnh án và đơn thuốc thành công!", 
        record_id: recordId 
      };
    });
  }
};