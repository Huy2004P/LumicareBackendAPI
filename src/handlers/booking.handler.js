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

  GetBookingHistory: async (call, callback) => {
    try {
      // 🕵️‍♂️ BƯỚC 1: SOI TẬN GỐC DỮ LIỆU GỬI LÊN
      console.log("-----------------------------------------");
      console.log("📅 [DEBUG] Flutter đang gọi GetBookingHistory");
      console.log(">>> FULL REQUEST:", JSON.stringify(call.request, null, 2));

      // BƯỚC 2: TRÍCH XUẤT ID (Thử mọi trường hợp tên biến)
      const userId = call.request.user_id || 
                     call.request.patient_id || 
                     call.request.patientId || 
                     call.request.userId;

      console.log(">>> [Xác định] ID sẽ dùng để Query:", userId);

      if (!userId) {
        console.error("❌ [LỖI] Flutter không gửi bất kỳ ID nào lên!");
        throw new Error("Thiếu ID người dùng để lấy lịch sử!");
      }

      // BƯỚC 3: GỌI SERVICE
      const res = await bookingService.getHistory(userId);
      console.log(`✅ [DB] Tìm thấy ${res.length} bản ghi cho User ${userId}`);

      // BƯỚC 4: MAP DATA VỀ PROTO (Cực kỳ cẩn thận với kiểu dữ liệu)
      const formattedData = res.map(i => {
        // Log thử 1 dòng đầu tiên để xem tên cột từ DB trả về
        // console.log(">>> Record thô từ DB:", JSON.stringify(i)); 

        return {
          id: i.id,
          doctor_name: i.doctor_name || "Bác sĩ hệ thống",
          // Xử lý Date: Tránh lỗi nếu date bị null hoặc không phải kiểu Date
          date: i.date ? (i.date instanceof Date ? i.date.toISOString().split('T')[0] : String(i.date)) : "",
          time_display: i.time_display || "Chưa xác định",
          status: i.status || "pending",
          reason: i.reason || "",
          patient_name: i.patient_name || "Bản thân",
          service_name: i.service_name || "Dịch vụ y tế",
          price: parseFloat(i.booking_price || i.price || 0),
          address: i.address || i.address_detail || "" 
        };
      });

      console.log("🚀 [DONE] Đã gửi dữ liệu về cho Flutter");
      console.log("-----------------------------------------");

      callback(null, { 
        success: true, 
        message: "Lấy lịch sử thành công",
        data: formattedData 
      });

    } catch (e) { 
      console.error("-----------------------------------------");
      console.error("❌ [Booking History Handler Error]:", e.message);
      console.error("-----------------------------------------");
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