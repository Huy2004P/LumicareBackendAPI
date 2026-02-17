const bookingService = require("../services/booking.service");

// Helper bọc lỗi
const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("Booking Handler Error:", error);
    callback({ code: 13, message: error.message || "Lỗi Server" });
  }
};

module.exports = {
  // 1. Tạo lịch hẹn
  CreateBooking: (call, callback) => {
    safeCall(callback, async () => {
      const bookingId = await bookingService.createBooking(call.request);
      return { 
        success: true, 
        message: "Đặt lịch thành công!", 
        booking_id: bookingId 
      };
    });
  },

  // 2. Xem lịch sử
  GetBookingHistory: (call, callback) => {
    safeCall(callback, async () => {
      const history = await bookingService.getHistory(call.request.patient_id);
      
      // Map data sang Proto
      const data = history.map(h => ({
        id: h.id,
        doctor_name: h.doctor_name,
        date: h.date instanceof Date ? h.date.toISOString().split('T')[0] : h.date, // Xử lý ngày
        time_display: h.time_display,
        status: h.status,
        reason: h.reason,
        patient_name: h.patient_name || "Chính chủ" // Nếu không có profile phụ thì là chính chủ
      }));

      return { success: true, data };
    });
  },

  // 3. Hủy lịch
  CancelBooking: (call, callback) => {
    safeCall(callback, async () => {
      const { id, patient_id } = call.request;
      await bookingService.cancelBooking(id, patient_id);
      return { success: true, message: "Đã hủy lịch hẹn thành công." };
    });
  }
};