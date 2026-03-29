const bookingService = require("../services/booking.service");

module.exports = {
  // 1. Đặt lịch khám mới
  CreateBooking: async (call, callback) => {
    try {
      // call.request lúc này đã có .location_id từ Proto truyền xuống
      // Service sẽ tự xử lý việc convert userId sang patientId và locationId sang chuỗi address
      const id = await bookingService.createBooking(call.request);
      
      callback(null, { 
        success: true, 
        message: "Đặt lịch khám thành công!", 
        booking_id: id 
      });
    } catch (e) { 
      console.error(">>> [Booking Handler Error]:", e.message);
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
          // BỔ SUNG: Trả thêm address về cho App hiển thị (địa chỉ dạng chuỗi đã lưu trong DB)
          address: i.address || "" 
        }))
      });
    } catch (e) { 
      console.error(">>> [Booking History Handler Error]:", e.message);
      callback({ code: 13, message: e.message }); 
    }
  },

  // 3. Hủy đơn hàng (Bệnh nhân thực hiện)
  CancelBooking: async (call, callback) => {
    try {
      const bookingId = call.request.booking_id || call.request.bookingId; 
      const userId = call.request.patient_id || call.request.patientId;
      
      await bookingService.cancelBooking(bookingId, userId);
      
      callback(null, { 
        success: true, 
        message: "Đã hủy lịch khám thành công!",
        booking_id: bookingId 
      });
    } catch (e) { 
      console.error(">>> [Cancel Booking Handler Error]:", e.message);
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
      console.error(">>> [Delete Booking Handler Error]:", e.message);
      callback({ code: 13, message: e.message }); 
    }
  }
};