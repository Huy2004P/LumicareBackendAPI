const db = require("../config/database");

class BookingRepository {
  
  // 1. TẠO BOOKING (Transaction: Check chỗ -> Tạo đơn -> Trừ chỗ)
  async createBookingTransaction(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction(); // Bắt đầu khóa dòng dữ liệu

      // B1: Check xem lịch có tồn tại và còn chỗ không?
      // "FOR UPDATE" giúp khóa dòng này lại, không cho ai khác đặt chen ngang lúc này
      const [schedules] = await connection.execute(
        "SELECT * FROM schedules WHERE doctor_id=? AND date=? AND time_type=? FOR UPDATE",
        [data.doctor_id, data.date, data.time_type]
      );

      if (schedules.length === 0) {
        throw new Error("Lịch khám không tồn tại!");
      }

      const schedule = schedules[0];
      if (schedule.current_booking >= schedule.max_booking) {
        throw new Error("Lịch khám này đã đầy!");
      }

      // B2: Tạo Booking mới (Status mặc định là pending)
      const sqlBooking = `
        INSERT INTO bookings (status, doctor_id, patient_id, profile_id, date, time_type, reason, created_at, updated_at) 
        VALUES ('pending', ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const [res] = await connection.execute(sqlBooking, [
        data.doctor_id,
        data.patient_id,
        data.profile_id,
        data.date,
        data.time_type,
        data.reason
      ]);

      // B3: Tăng số lượng đã đặt trong bảng schedules lên 1
      await connection.execute(
        "UPDATE schedules SET current_booking = current_booking + 1 WHERE id = ?",
        [schedule.id]
      );

      await connection.commit(); // Lưu tất cả
      return res.insertId;

    } catch (error) {
      await connection.rollback(); // Nếu lỗi thì hoàn tác sạch sẽ
      throw error;
    } finally {
      connection.release(); // Trả kết nối về hồ
    }
  }

  // 2. LẤY LỊCH SỬ KHÁM
  async getHistory(patientId) {
    // Join 3 bảng: bookings, doctors, allcodes (lấy giờ đẹp), patient_profiles (lấy tên người khám)
    const sql = `
      SELECT b.id, b.status, b.date, b.reason, 
             d.full_name as doctor_name, 
             a.value_vi as time_display,
             p.full_name as patient_name
      FROM bookings b
      JOIN doctors d ON b.doctor_id = d.id
      JOIN allcodes a ON b.time_type = a.\`key\` AND a.type = 'TIME'
      LEFT JOIN patient_profiles p ON b.profile_id = p.id 
      WHERE b.patient_id = ?
      ORDER BY b.created_at DESC
    `;
    const [rows] = await db.execute(sql, [patientId]);
    return rows;
  }

  // 3. HỦY LỊCH
  async cancelBooking(bookingId, patientId) {
    // Chỉ hủy được khi đang chờ (pending) hoặc đã xác nhận (confirmed)
    const sql = `
      UPDATE bookings SET status = 'cancelled' 
      WHERE id = ? AND patient_id = ? AND status IN ('pending', 'confirmed')
    `;
    const [result] = await db.execute(sql, [bookingId, patientId]);
    return result.affectedRows > 0;
  }
}

module.exports = new BookingRepository();