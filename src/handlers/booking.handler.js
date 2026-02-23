const bookingService = require("../services/booking.service");

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
  CreateBooking: (call, callback) => {
    safeCall(callback, async () => {
      const bookingId = await bookingService.createBooking(call.request);
      return { success: true, message: "Đặt lịch thành công!", booking_id: bookingId };
    });
  },

  GetBookingHistory: (call, callback) => {
    safeCall(callback, async () => {
      const history = await bookingService.getHistory(call.request.patient_id);
      const data = history.map(h => ({
        id: h.id,
        doctor_name: h.doctor_name,
        date: h.date instanceof Date ? h.date.toISOString().split('T')[0] : h.date,
        time_display: h.time_display,
        status: h.status,
        reason: h.reason,
        patient_name: h.patient_name || "Chính chủ"
      }));
      return { success: true, data };
    });
  },

  CancelBooking: (call, callback) => {
    safeCall(callback, async () => {
      // Lưu ý: call.request.booking_id (theo proto mới)
      const { booking_id, patient_id } = call.request; 
      await bookingService.cancelBooking(booking_id, patient_id);
      return { success: true, message: "Đã hủy lịch hẹn thành công.", booking_id };
    });
  },

  // BỔ SUNG: Handler cho việc Xóa ảo
  DeleteBooking: (call, callback) => {
    safeCall(callback, async () => {
      const { booking_id } = call.request;
      await bookingService.deleteBooking(booking_id);
      return { success: true, message: "Đã xóa đơn đặt lịch khỏi hệ thống.", booking_id };
    });
  }
};