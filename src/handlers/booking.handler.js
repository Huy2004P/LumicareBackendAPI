const bookingService = require("../services/booking.service");

module.exports = {
  // 1. Đặt lịch khám mới
  CreateBooking: async (call, callback) => {
    try {
      // call.request lúc này đã có .location_id từ Proto truyền xuống
      // Service sẽ tự xử lý việc convert userId sang patientId và locationId sang chuỗi address
      console.log("=======================================");
  console.log("📥 [gRPC] NHẬN REQUEST ĐẶT LỊCH");
  console.log("Dữ liệu chi tiết:", JSON.stringify(call.request, null, 2));
  console.log("=======================================");
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

  GetBookingHistory: async (call, callback) => {
    try {
      const userId = call.request.user_id || call.request.patient_id || call.request.patientId || call.request.userId;

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
          // 🎯 MỚI THÊM: Trả về thông tin thanh toán cho Flutter
          payment_method: i.payment_method || "PAY1", 
          payment_status: i.payment_status || 0
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

  // 3. Hủy đơn hàng (Bệnh nhân thực hiện)
  CancelBooking: async (call, callback) => {
    try {
      const bookingId = call.request.booking_id || call.request.bookingId; 
      const userId = call.request.patient_id || call.request.patientId;
      const reason = call.request.reason || "Người dùng không cung cấp lý do";
      
      await bookingService.cancelBooking(bookingId, userId, reason);
      
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
      s
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