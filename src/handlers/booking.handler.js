const bookingService = require("../services/booking.service");

module.exports = {
  //Tạo lịch đặt mới
  CreateBooking: async (call, callback) => {
    try {
      const id = await bookingService.createBooking(call.request);
      callback(null, { 
        success: true, 
        message: "Đặt lịch khám thành công!", 
        booking_id: id 
      });
    } catch (e) { 
      callback({ code: 13, message: e.message }); 
    }
  },
  //Lấy lịch sử đặt lịch
  GetBookingHistory: async (call, callback) => {
    try {
      const userId = call.request.patient_id || call.request.userId;
      if (!userId) throw new Error("Thiếu ID người dùng!");
      const res = await bookingService.getHistory(userId);
      const formattedData = res.map(i => {
        return {
          id: i.id,
          doctor_name: i.doctor_name || "Bác sĩ",
          date: i.date ? (i.date instanceof Date ? i.date.toISOString().split('T')[0] : String(i.date)) : "",
          time_display: i.time_display || "Chưa xác định",
          status: i.status || "pending",
          reason: i.reason || "",
          patient_name: i.patient_name || "Bản thân",
          service_name: i.service_name || "Dịch vụ y tế",
          price: parseFloat(i.price || 0),
          address: i.address || i.address_detail || "",
          cancel_reason: i.cancel_reason || "",
          payment_method: i.payment_method || "PAY1", 
          payment_status: i.payment_status || 0,
          doctor_id: i.doctor_id,
        patient_id: i.patient_id,
        clinic_id: i.clinic_id || 0,
        service_id: i.service_id || 0
        };
      });
      callback(null, { 
        success: true, 
        message: "Lấy lịch sử thành công",
        data: formattedData 
      });
    } catch (e) {
      callback({ code: 13, message: e.message }); 
    }
  },

  //Huỷ đặt lịch
  CancelBooking: async (call, callback) => {
    try {
      const bookingId = call.request.booking_id; 
      const userId = call.request.patient_id;
      const reason = call.request.reason || "Người dùng không cung cấp lý do";
      await bookingService.cancelBooking(bookingId, userId, reason);
      callback(null, { 
        success: true, 
        message: "Đã hủy lịch khám thành công!",
        booking_id: bookingId 
      });
    } catch (e) { 
      callback({ code: 13, message: e.message }); 
    }
  },
  //Xoá đặt lịch
  DeleteBooking: async (call, callback) => {
    try {
      const bookingId = call.request.booking_id;
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