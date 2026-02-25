const bookingService = require("../services/booking.service");

module.exports = {
  CreateBooking: async (call, callback) => {
    try {
      const id = await bookingService.createBooking(call.request);
      callback(null, { success: true, message: "Thành công!", booking_id: id });
    } catch (e) { callback({ code: 13, message: e.message }); }
  },
  GetBookingHistory: async (call, callback) => {
    try {
      const userId = call.request.patient_id || call.request.patientId;
      const res = await bookingService.getHistory(userId);

      callback(null, { 
        success: true, 
        data: res.map(i => ({
          id: i.id,
          doctor_name: i.doctor_name,    // Sửa thành doctor_name (khớp .proto)
          date: i.date.toString(),
          time_display: i.time_display,  // Sửa thành time_display (khớp .proto)
          status: i.status,
          reason: i.reason,
          patient_name: i.patient_name || "Bản thân", // Sửa thành patient_name
          service_name: i.service_name || "Khám lẻ",  // Sửa thành service_name
          price: parseFloat(i.booking_price) || 0
        }))
      });
    } catch (e) { 
      callback({ code: 13, message: e.message }); 
    }
  },
  CancelBooking: async (call, callback) => {
    try {
      // Lấy ID từ request để trả ngược lại cho App biết đơn nào vừa hủy
      const bookingId = call.request.booking_id; 
      
      await bookingService.cancelBooking(bookingId, call.request.patient_id);
      
      callback(null, { 
        success: true, 
        message: "Đã hủy lịch!",
        booking_id: bookingId // ✅ Thêm dòng này để Kreya hiện đúng ID
      });
    } catch (e) { 
      callback({ code: 13, message: e.message }); 
    }
  },
  DeleteBooking: async (call, callback) => {
    try {
      // 1. Lấy ID từ request ra trước
      const bookingId = call.request.booking_id;
      
      // 2. Chạy logic xóa trong Service
      await bookingService.deleteBooking(bookingId);
      
      // 3. Trả về đúng cái ID vừa xóa để Kreya không bị hiện số 0
      callback(null, { 
        success: true, 
        message: "Đã xóa thành công!", 
        booking_id: bookingId 
      });
    } catch (e) { 
      callback({ code: 13, message: e.message }); 
    }
  }
};