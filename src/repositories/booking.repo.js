const db = require("../config/database");

class BookingRepository {
  async createBookingTransaction(data) {
    console.log(">>> Repository Check Data:", data);
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Lấy dữ liệu cực kỳ linh hoạt (Bất kể camelCase hay snake_case)
      const patientId = data.patient_id || data.patientId; 
      const profileId = data.profile_id || data.profileId;
      const doctorIdReq = data.doctor_id || data.doctorId;
      const timeVal = data.time_type || data.timeType;
      const bookingDate = data.date;
      const serviceId = (data.service_id || data.serviceId) > 0 ? (data.service_id || data.serviceId) : null;

      let finalDoctorId = doctorIdReq;
      let finalPrice = 0;

      // 1. LUÔN LUÔN lấy giá của bác sĩ trước (Dù có gói hay không)
      const [docData] = await connection.execute("SELECT price FROM doctors WHERE id = ?", [finalDoctorId]);
      if (docData.length === 0) throw new Error("Bác sĩ không tồn tại!");
      const doctorPrice = Number(docData[0].price || 0);

      // 2. Logic xử lý Bác sĩ và Giá (Đoạn cũ của Huy)
      if (serviceId) {
        const [mapping] = await connection.execute(
          `SELECT ds.doctor_id, s.price FROM doctor_services ds 
           INNER JOIN services s ON ds.service_id = s.id 
           WHERE ds.service_id = ? AND s.is_deleted = 0 LIMIT 1`, [serviceId]
        );
        if (mapping.length > 0) {
          finalDoctorId = mapping[0].doctor_id;
          // CỘNG DỒN: Giá bác sĩ + Giá gói
          finalPrice = doctorPrice + Number(mapping[0].price || 0);
        } else {
          throw new Error("Gói khám chưa có bác sĩ!");
        }
      } else {
        // KHÁM LẺ: Chỉ lấy giá bác sĩ
        finalPrice = doctorPrice; 
      }
      // 3. Kiểm tra Lịch khám (Schedules)
      const [schedules] = await connection.execute(
        `SELECT id, current_booking, max_booking FROM schedules 
         WHERE doctor_id=? AND date=? AND time_type=? AND is_deleted = 0 FOR UPDATE`,
        [finalDoctorId, bookingDate, timeVal]
      );
      if (schedules.length === 0) throw new Error("Không tìm thấy lịch khám!");

      // 4. LƯU ĐƠN - Ép kiểu Number để chắc chắn khớp DB
      const sqlBooking = `
        INSERT INTO bookings (
          patient_id, profile_id, doctor_id, service_id, price, 
          date, time, reason, status, is_deleted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, NOW(), NOW())`;
      
      const [res] = await connection.execute(sqlBooking, [
        Number(patientId), 
        Number(profileId), 
        Number(finalDoctorId), 
        serviceId, 
        finalPrice, 
        bookingDate, 
        timeVal, 
        data.reason || ""
      ]);
      
      const newBookingId = res.insertId;

      // 5. LƯU ẢNH (Hứng cả photos từ JSON và photosList từ gRPC)
      const photosArray = data.photosList || data.photos;

      if (photosArray && Array.isArray(photosArray) && photosArray.length > 0) {
        console.log(">>> Đang thực hiện lưu ảnh cho booking:", newBookingId);
        for (const url of photosArray) {
          if (url && url.trim() !== "") {
            await connection.execute(
              "INSERT INTO booking_photos (booking_id, url) VALUES (?, ?)", 
              [newBookingId, url]
            );
          }
        }
      }

      // 6. Cập nhật slot
      await connection.execute(
        "UPDATE schedules SET current_booking = current_booking + 1 WHERE id = ?",
        [schedules[0].id]
      );

      await connection.commit();
      return newBookingId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // --- Các hàm History, Cancel, Delete giữ nguyên như bản trước của ông là chuẩn rồi ---
  async getHistory(patientId) {
    // Chỉ lấy những đơn chưa bị xóa ảo
    const sql = `SELECT * FROM view_booking_history 
                 WHERE patient_id = ? AND is_deleted = 0 
                 ORDER BY created_at DESC`;

    const [rows] = await db.execute(sql, [patientId]);
    return rows;
  }

  async cancelBooking(bookingId, patientId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Kiểm tra đơn hàng có đúng của ông này không và đang ở trạng thái pending mới cho hủy
      const [bookings] = await connection.execute(
        "SELECT * FROM bookings WHERE id=? AND patient_id=? AND is_deleted=0 FOR UPDATE", 
        [bookingId, patientId]
      );

      if (bookings.length === 0) throw new Error("Không tìm thấy đơn hàng hợp lệ để hủy!");
      if (bookings[0].status !== 'pending') throw new Error("Đơn hàng này không thể hủy (đã khám hoặc đã hủy trước đó)!");

      // 2. Cập nhật trạng thái thành 'cancelled'
      await connection.execute(
        "UPDATE bookings SET status='cancelled', updated_at=NOW() WHERE id=?", 
        [bookingId]
      );

      // 3. HOÀN SLOT: Giảm current_booking đi 1 trong bảng schedules
      await connection.execute(
        `UPDATE schedules 
         SET current_booking = GREATEST(0, current_booking - 1) 
         WHERE doctor_id=? AND date=? AND time_type=?`, 
        [bookings[0].doctor_id, bookings[0].date, bookings[0].time]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteBooking(bookingId) {
    await db.execute("UPDATE bookings SET is_deleted = 1, updated_at=NOW() WHERE id = ?", [bookingId]);
    return true;
  }
}
module.exports = new BookingRepository();