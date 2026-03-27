const bookingService = require("../services/booking.service");

module.exports = {
  // 1. Đặt lịch khám mới
  CreateBooking: async (call, callback) => {
    try {
      // call.request lúc này đã có .address từ Proto truyền xuống
      const id = await bookingService.createBooking(call.request);
      callback(null, { success: true, message: "Đặt lịch thành công!", booking_id: id });
    } catch (e) { 
      callback({ code: 13, message: e.message }); 
    }
  },

  // 2. Lấy danh sách lịch sử đặt lịch
  GetBookingHistory: async (call, callback) => {
    try {
      const userId = call.request.patient_id || call.request.patientId;
      const res = await bookingService.getHistory(userId);

      callback(null, { 
        success: true, 
        data: res.map(i => ({
          id: i.id,
          doctor_name: i.doctor_name,
          // Format lại ngày cho đẹp yyyy-mm-dd
          date: i.date instanceof Date ? i.date.toISOString().split('T')[0] : i.date.toString(),
          time_display: i.time_display,
          status: i.status,
          reason: i.reason,
          patient_name: i.patient_name || "Bản thân",
          service_name: i.service_name || "Khám lẻ",
          price: parseFloat(i.booking_price) || 0,
          // BỔ SUNG: Trả thêm address về cho App hiển thị
          address: i.address || "" 
        }))
      });
    } catch (e) { 
      callback({ code: 13, message: e.message }); 
    }
  },

  // 3. Hủy đơn hàng (Bệnh nhân thực hiện)
  CancelBooking: async (call, callback) => {
    try {
      const bookingId = call.request.booking_id || call.request.bookingId; 
      
      await bookingService.cancelBooking(bookingId, call.request.patient_id);
      
      callback(null, { 
        success: true, 
        message: "Đã hủy lịch khám thành công!",
        booking_id: bookingId 
      });
    } catch (e) { 
      callback({ code: 13, message: e.message }); 
    }
  },

  // 4. Xóa đơn hàng (Admin/Xóa ảo)
  DeleteBooking: async (call, callback) => {
    try {
      const bookingId = call.request.booking_id || call.request.bookingId;
      
      await bookingService.deleteBooking(bookingId);
      
      callback(null, { 
        success: true, 
        message: "Đã xóa lịch sử đơn hàng thành công!", 
        booking_id: bookingId 
      });
    } catch (e) { 
      callback({ code: 13, message: e.message }); 
    }
  }
};