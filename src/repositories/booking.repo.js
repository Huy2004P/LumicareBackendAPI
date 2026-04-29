const db = require("../config/database");

class BookingRepository {
  /// Tạo lịch khám mới với transaction để đảm bảo tính toàn vẹn dữ liệu
  async createBookingTransaction(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const patientId = data.patient_id;
      const profileId = data.profile_id;
      const doctorIdReq = data.doctor_id;
      const timeVal = data.time_type;
      const bookingDate = data.date;
      const serviceId = data.service_id > 0 ? data.service_id : null;
      const locationId = data.location_id;
      const paymentMethod = data.payment_method || 'PAY1';
      if (locationId) {
        const [locCheck] = await connection.execute("SELECT id FROM locations WHERE id = ?", [locationId]);
        if (locCheck.length === 0) throw new Error("Địa chỉ không tồn tại!");
      }
      const [docData] = await connection.execute("SELECT price FROM doctors WHERE id = ?", [doctorIdReq]);
      if (docData.length === 0) throw new Error("Bác sĩ không tồn tại!");
      const doctorPrice = Number(docData[0].price || 0);
      let finalPrice = doctorPrice;
      if (serviceId) {
        const [serviceData] = await connection.execute("SELECT price FROM services WHERE id = ? AND is_deleted = 0", [serviceId]);
        if (serviceData.length > 0) finalPrice += Number(serviceData[0].price || 0);
      }
      let scheduleId = null;
      if (timeVal !== 'TIME_CUSTOM') {
        const [schedules] = await connection.execute(
          `SELECT id, current_booking, max_booking FROM schedules 
            WHERE doctor_id=? AND date=? AND time_type=? AND is_deleted = 0 FOR UPDATE`,
          [doctorIdReq, bookingDate, timeVal]
        );
        if (schedules.length === 0) throw new Error("Không tìm thấy lịch khám!");
        if (schedules[0].current_booking >= schedules[0].max_booking) throw new Error("Khung giờ đã đầy!");
        scheduleId = schedules[0].id;
      }
      const sqlBooking = `
        INSERT INTO bookings (
          patient_id, profile_id, doctor_id, service_id, price, 
          date, time, reason, locationId, status, 
          payment_method, payment_status, is_deleted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 0, 0, NOW(), NOW())`;
      const [res] = await connection.execute(sqlBooking, [
        Number(patientId), Number(profileId), Number(doctorIdReq), serviceId, finalPrice, 
        bookingDate, timeVal, data.reason || "", locationId, paymentMethod
      ]);
      const newBookingId = res.insertId;
      if (data.photos && Array.isArray(data.photos)) {
        for (const url of data.photos) {
          if (url && url.trim() !== "") {
            await connection.execute("INSERT INTO booking_photos (booking_id, url) VALUES (?, ?)", [newBookingId, url]);
          }
        }
      }
      if (scheduleId) {
        await connection.execute("UPDATE schedules SET current_booking = current_booking + 1 WHERE id = ?", [scheduleId]);
      }
      await connection.commit();
      return newBookingId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  // Lấy lịch sử đặt khám của bệnh nhân, bao gồm thông tin bác sĩ, phòng khám, dịch vụ, địa điểm và hiển thị thời gian theo yêu cầu nếu có
  async getHistory(patientId) {
    const sql = `
      SELECT 
        b.*, 
        d.full_name as doctor_name, 
        r.clinic_id as clinic_id, 
        p.full_name as patient_name, 
        s.name as service_name,
        l.address_detail, l.ward, l.district, l.province,
        IF(b.time = 'TIME_CUSTOM', 'Giờ theo yêu cầu', ac.value_vi) as time_display
      FROM bookings b
      LEFT JOIN doctors d ON b.doctor_id = d.id
      LEFT JOIN rooms r ON d.room_id = r.id 
      LEFT JOIN patient_profiles p ON b.profile_id = p.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN locations l ON b.locationId = l.id
      LEFT JOIN allcodes ac ON b.time = ac.\`key\` AND ac.type = 'TIME'
      WHERE b.patient_id = ? AND b.is_deleted = 0 
      ORDER BY b.created_at DESC`;
    const [rows] = await db.execute(sql, [patientId]);
    return rows;
  }
  // Hủy lịch khám với transaction để đảm bảo cập nhật đồng bộ giữa bảng bookings và schedules
  async cancelBooking(bookingId, inputId, reason) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(
        "SELECT id, status, doctor_id, date, time FROM bookings WHERE id = ? AND is_deleted = 0 FOR UPDATE",
        [bookingId]
      );
      if (rows.length === 0) throw new Error("Không tìm thấy đơn hàng!");
      const booking = rows[0];
      if (String(booking.status).toLowerCase() !== 'pending') throw new Error("Chỉ có thể hủy lịch khi đang chờ duyệt!");
      const sqlUpdate = `
        UPDATE bookings 
        SET status = 'cancelled', 
            payment_status = 3, 
            cancel_reason = ?, 
            updated_at = NOW() 
        WHERE id = ?`;
      await connection.execute(sqlUpdate, [reason, bookingId]);
      if (booking.time !== 'TIME_CUSTOM') {
        await connection.execute(
          `UPDATE schedules SET current_booking = GREATEST(0, current_booking - 1) 
            WHERE doctor_id = ? AND date = ? AND time_type = ?`, 
          [booking.doctor_id, booking.date, booking.time]
        );
      }
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  // Xóa lịch khám (đánh dấu is_deleted = 1) mà không thực sự xóa bản ghi khỏi cơ sở dữ liệu
  async deleteBooking(bookingId) {
    await db.execute("UPDATE bookings SET is_deleted = 1, updated_at=NOW() WHERE id = ?", [bookingId]);
    return true;
  }
}

module.exports = new BookingRepository();