const db = require("../config/database");

class BookingRepository {
  /**
   * 1. TẠO LỊCH HẸN TRONG TRANSACTION
   * Đảm bảo tính nhất quán: Trừ slot, lưu đơn, lưu ảnh phải đi cùng nhau.
   */
  async createBookingTransaction(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // --- BƯỚC 1: TRÍCH XUẤT DỮ LIỆU ---
      const patientId = data.patient_id || data.patientId;
      const profileId = data.profile_id || data.profileId;
      const doctorIdReq = data.doctor_id || data.doctorId;
      const timeVal = data.time_type || data.timeType;
      const bookingDate = data.date;
      const serviceId = (data.service_id || data.serviceId) > 0 ? (data.service_id || data.serviceId) : null;
      const locationId = data.location_id || data.locationId;
      // 🎯 Lấy phương thức thanh toán từ Flutter (PAY1, PAY2, PAY3)
      const paymentMethod = data.payment_method || data.paymentMethod || 'PAY1';

      // --- BƯỚC 2: KIỂM TRA ĐỊA CHỈ ---
      if (locationId) {
        const [locCheck] = await connection.execute(
          "SELECT id FROM locations WHERE id = ?", 
          [locationId]
        );
        if (locCheck.length === 0) throw new Error("Địa chỉ không tồn tại!");
      }

      // --- BƯỚC 3: TÍNH TỔNG GIÁ ---
      const [docData] = await connection.execute("SELECT price FROM doctors WHERE id = ?", [doctorIdReq]);
      if (docData.length === 0) throw new Error("Bác sĩ không tồn tại!");
      const doctorPrice = Number(docData[0].price || 0);

      let finalPrice = doctorPrice;
      if (serviceId) {
        const [serviceData] = await connection.execute(
          "SELECT price FROM services WHERE id = ? AND is_deleted = 0", [serviceId]
        );
        if (serviceData.length > 0) {
          finalPrice += Number(serviceData[0].price || 0);
        }
      }

      // --- BƯỚC 4: KIỂM TRA VÀ GIỮ CHỖ (SLOTS) ---
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

      // --- BƯỚC 5: LƯU VÀO BẢNG BOOKINGS ---
      // Tui thêm cột payment_method và payment_status (mặc định 0)
      const sqlBooking = `
        INSERT INTO bookings (
          patient_id, profile_id, doctor_id, service_id, price, 
          date, time, reason, locationId, status, 
          payment_method, payment_status, -- 🎯 Cột mới
          is_deleted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 0, 0, NOW(), NOW())`;
      
      const [res] = await connection.execute(sqlBooking, [
        Number(patientId), 
        Number(profileId), 
        Number(doctorIdReq), 
        serviceId, 
        finalPrice, 
        bookingDate, 
        timeVal, 
        data.reason || "",
        locationId,
        paymentMethod // 🚀 Lưu PAY1, PAY2 hoặc PAY3
      ]);
      
      const newBookingId = res.insertId;

      // --- BƯỚC 6: LƯU ẢNH (NẾU CÓ) ---
      const photosArray = data.photosList || data.photos;
      if (photosArray && Array.isArray(photosArray)) {
        for (const url of photosArray) {
          if (url && url.trim() !== "") {
            await connection.execute(
              "INSERT INTO booking_photos (booking_id, url) VALUES (?, ?)", 
              [newBookingId, url]
            );
          }
        }
      }

      // --- BƯỚC 7: CẬP NHẬT TĂNG SLOT ---
      if (scheduleId) {
        await connection.execute(
          "UPDATE schedules SET current_booking = current_booking + 1 WHERE id = ?",
          [scheduleId]
        );
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

  /**
   * 2. LẤY LỊCH SỬ KHÁM
   */
  async getHistory(patientId) {
    const sql = `
      SELECT b.*, d.full_name as doctor_name, p.full_name as patient_name, s.name as service_name,
      l.address_detail, l.ward, l.district, l.province,
      IF(b.time = 'TIME_CUSTOM', 'Giờ theo yêu cầu', ac.value_vi) as time_display
      FROM bookings b
      LEFT JOIN doctors d ON b.doctor_id = d.id
      LEFT JOIN patient_profiles p ON b.profile_id = p.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN locations l ON b.locationId = l.id
      LEFT JOIN allcodes ac ON b.time = ac.\`key\` AND ac.type = 'TIME'
      WHERE b.patient_id = ? AND b.is_deleted = 0 
      ORDER BY b.created_at DESC`;

    const [rows] = await db.execute(sql, [patientId]);
    return rows;
  }

  /**
   * 3. HỦY LỊCH HẸN
   */
  async cancelBooking(bookingId, inputId, reason) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.execute(
        "SELECT id, patient_id, status, doctor_id, date, time FROM bookings WHERE id = ? AND is_deleted = 0 FOR UPDATE",
        [bookingId]
      );

      if (rows.length === 0) throw new Error("Không tìm thấy đơn hàng!");
      const booking = rows[0];

      // Logic kiểm tra status và hoàn trả slot
      const currentStatus = String(booking.status || "").trim().toLowerCase();
      if (currentStatus !== 'pending') throw new Error("Chỉ có thể hủy lịch khi đang ở trạng thái Chờ duyệt!");

      await connection.execute(
        "UPDATE bookings SET status = 'cancelled', cancel_reason = ?, updated_at = NOW() WHERE id = ?", 
        [reason, bookingId]
      );

      // Hoàn trả slot nếu không phải giờ tự chọn
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

  /**
   * 4. XÓA ĐƠN HÀNG (XÓA ẢO)
   */
  async deleteBooking(bookingId) {
    await db.execute("UPDATE bookings SET is_deleted = 1, updated_at=NOW() WHERE id = ?", [bookingId]);
    return true;
  }
}

module.exports = new BookingRepository();