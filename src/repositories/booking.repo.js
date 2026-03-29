const db = require("../config/database");

class BookingRepository {
  async createBookingTransaction(data) {
    console.log(">>> Repository Check Data:", data);
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Lấy dữ liệu linh hoạt (Support cả snake_case và camelCase từ FE)
      const patientId = data.patient_id || data.patientId;
      const profileId = data.profile_id || data.profileId;
      const doctorIdReq = data.doctor_id || data.doctorId;
      const timeVal = data.time_type || data.timeType;
      const bookingDate = data.date;
      const serviceId = (data.service_id || data.serviceId) > 0 ? (data.service_id || data.serviceId) : null;
      const locationId = data.location_id || data.locationId; // Đây là ID quan trọng

      // 2. Kiểm tra sự tồn tại của locationId trong bảng locations
      if (locationId) {
        const [locCheck] = await connection.execute(
          "SELECT id FROM locations WHERE id = ?", 
          [locationId]
        );
        if (locCheck.length === 0) {
          throw new Error("Địa chỉ (Location ID) không tồn tại trên hệ thống!");
        }
      }

      let finalDoctorId = doctorIdReq;
      let finalPrice = 0;

      // 3. Lấy giá của bác sĩ
      const [docData] = await connection.execute("SELECT price FROM doctors WHERE id = ?", [finalDoctorId]);
      if (docData.length === 0) throw new Error("Bác sĩ không tồn tại!");
      const doctorPrice = Number(docData[0].price || 0);

      // 4. Tính tổng giá (Bác sĩ + Dịch vụ)
      if (serviceId) {
        const [mapping] = await connection.execute(
          `SELECT s.price FROM services s WHERE s.id = ? AND s.is_deleted = 0`, [serviceId]
        );
        if (mapping.length > 0) {
          finalPrice = doctorPrice + Number(mapping[0].price || 0);
        }
      } else {
        finalPrice = doctorPrice; 
      }

      // 5. Kiểm tra Slots (Schedules) - Bỏ qua nếu là giờ tự chọn
      let scheduleId = null;
      if (timeVal !== 'TIME_CUSTOM') {
        const [schedules] = await connection.execute(
          `SELECT id, current_booking, max_booking FROM schedules 
            WHERE doctor_id=? AND date=? AND time_type=? AND is_deleted = 0 FOR UPDATE`,
          [finalDoctorId, bookingDate, timeVal]
        );

        if (schedules.length === 0) {
          throw new Error("Không tìm thấy lịch khám phù hợp cho khung giờ cố định này!");
        }
        if (schedules[0].current_booking >= schedules[0].max_booking) {
          throw new Error("Khung giờ này đã đầy chỗ!");
        }
        scheduleId = schedules[0].id;
      }

      // 6. LƯU VÀO BẢNG BOOKINGS - FIX TÊN CỘT THÀNH locationId
      const sqlBooking = `
        INSERT INTO bookings (
          patient_id, profile_id, doctor_id, service_id, price, 
          date, time, reason, locationId, status, is_deleted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, NOW(), NOW())`;
      
      const [res] = await connection.execute(sqlBooking, [
        Number(patientId), 
        Number(profileId), 
        Number(finalDoctorId), 
        serviceId, 
        finalPrice, 
        bookingDate, 
        timeVal, 
        data.reason || "",
        locationId // Truyền ID vào cột locationId
      ]);
      
      const newBookingId = res.insertId;

      // 7. Lưu ảnh
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

      // 8. Cập nhật slot
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

  async getHistory(patientId) {
    // Join với bảng locations bằng cột locationId (CamelCase)
    const sql = `
      SELECT b.*, d.name as doctor_name, p.name as patient_name, s.name as service_name,
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

  async cancelBooking(bookingId, patientId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [bookings] = await connection.execute(
        "SELECT * FROM bookings WHERE id=? AND patient_id=? AND is_deleted=0 FOR UPDATE", 
        [bookingId, patientId]
      );

      if (bookings.length === 0) throw new Error("Không tìm thấy đơn hàng!");
      if (bookings[0].status !== 'pending') throw new Error("Chỉ có thể hủy đơn hàng ở trạng thái chờ!");

      await connection.execute(
        "UPDATE bookings SET status='cancelled', updated_at=NOW() WHERE id=?", 
        [bookingId]
      );

      if (bookings[0].time !== 'TIME_CUSTOM') {
          await connection.execute(
            `UPDATE schedules 
              SET current_booking = GREATEST(0, current_booking - 1) 
              WHERE doctor_id=? AND date=? AND time_type=?`, 
            [bookings[0].doctor_id, bookings[0].date, bookings[0].time]
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

  async deleteBooking(bookingId) {
    await db.execute("UPDATE bookings SET is_deleted = 1, updated_at=NOW() WHERE id = ?", [bookingId]);
    return true;
  }
}

module.exports = new BookingRepository();