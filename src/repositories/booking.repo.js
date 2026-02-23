const db = require("../config/database");

class BookingRepository {
  
  // 1. TẠO BOOKING (Transaction + Soft Delete Check)
  async createBookingTransaction(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // B1: Check lịch tồn tại, CHƯA XÓA và còn chỗ
      // Thêm is_deleted = 0 để không đặt nhầm vào lịch đã xóa ảo
      const [schedules] = await connection.execute(
        "SELECT * FROM schedules WHERE doctor_id=? AND date=? AND time_type=? AND is_deleted = 0 FOR UPDATE",
        [data.doctor_id, data.date, data.time_type]
      );

      if (schedules.length === 0) {
        throw new Error("Lịch khám không tồn tại hoặc đã bị gỡ bỏ!");
      }

      const schedule = schedules[0];
      if (schedule.current_booking >= schedule.max_booking) {
        throw new Error("Lịch khám này đã đầy!");
      }

      // B2: Tạo Booking mới (is_deleted mặc định = 0)
      const sqlBooking = `
        INSERT INTO bookings (status, doctor_id, patient_id, profile_id, date, time_type, reason, is_deleted, created_at, updated_at) 
        VALUES ('pending', ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
      `;
      const [res] = await connection.execute(sqlBooking, [
        data.doctor_id,
        data.patient_id,
        data.profile_id,
        data.date,
        data.time_type,
        data.reason
      ]);

      // B3: Tăng số lượng đã đặt
      await connection.execute(
        "UPDATE schedules SET current_booking = current_booking + 1 WHERE id = ?",
        [schedule.id]
      );

      await connection.commit();
      return res.insertId;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 2. LẤY LỊCH SỬ KHÁM (Lọc Soft Delete 3 tầng)
  async getHistory(patientId) {
    // Chỉ hiện những đơn chưa bị Admin xóa ảo (is_deleted = 0)
    // Phải check thêm doctor đó có bị xóa ảo không
    const sql = `
      SELECT b.id, b.status, b.date, b.reason, 
             d.full_name as doctor_name, 
             a.value_vi as time_display,
             p.full_name as patient_name
      FROM bookings b
      JOIN doctors d ON b.doctor_id = d.id
      JOIN allcodes a ON b.time_type = a.\`key\` AND a.type = 'TIME'
      LEFT JOIN patient_profiles p ON b.profile_id = p.id 
      WHERE b.patient_id = ? AND b.is_deleted = 0 AND d.is_deleted = 0
      ORDER BY b.created_at DESC
    `;
    const [rows] = await db.execute(sql, [patientId]);
    return rows;
  }

  // 3. HỦY LỊCH (Nghiệp vụ: Đổi status + Hoàn trả slot)
  async cancelBooking(bookingId, patientId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // B1: Tìm booking và khóa dòng để xử lý
      const [bookings] = await connection.execute(
        "SELECT * FROM bookings WHERE id = ? AND patient_id = ? AND is_deleted = 0 FOR UPDATE",
        [bookingId, patientId]
      );

      if (bookings.length === 0) throw new Error("Không tìm thấy đơn đặt lịch!");
      const booking = bookings[0];

      if (booking.status === 'cancelled') throw new Error("Đơn này đã được hủy trước đó!");

      // B2: Cập nhật status thành cancelled
      await connection.execute(
        "UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = ?",
        [bookingId]
      );

      // B3: Hoàn trả 1 slot cho bảng schedules
      await connection.execute(
        "UPDATE schedules SET current_booking = GREATEST(0, current_booking - 1) WHERE doctor_id = ? AND date = ? AND time_type = ?",
        [booking.doctor_id, booking.date, booking.time_type]
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

  // 4. XÓA ẢO ĐƠN HÀNG (Dành cho Admin dọn rác)
  async deleteBooking(bookingId) {
    await db.execute("UPDATE bookings SET is_deleted = 1 WHERE id = ?", [bookingId]);
    return true;
  }
}

module.exports = new BookingRepository();