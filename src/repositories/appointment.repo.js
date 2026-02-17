const db = require("../config/database");

class AppointmentRepository {
  // 1. Lấy danh sách bệnh nhân (JOIN nhiều bảng để lấy tên, giờ, giới tính...)
  async getListPatientForDoctor(doctorId, date) {
    const sql = `
      SELECT b.id as booking_id, b.patient_id, b.status, b.reason, b.time_type,
             p.full_name as patient_name, p.phone_number, p.gender, p.birthday, p.address,
             a.value_vi as time_display
      FROM bookings b
      JOIN patient_profiles p ON b.profile_id = p.id 
      JOIN allcodes a ON b.time_type = a.\`key\` AND a.type = 'TIME'
      WHERE b.doctor_id = ? AND b.date = ? 
      AND b.status IN ('pending', 'confirmed') 
      ORDER BY b.created_at ASC
    `;
    const [rows] = await db.execute(sql, [doctorId, date]);
    return rows;
  }

  // 2. Update trạng thái booking (Duyệt/Hủy)
  async verifyBooking(bookingId, status) {
    const sql = "UPDATE bookings SET status = ? WHERE id = ?";
    const [result] = await db.execute(sql, [status, bookingId]);
    return result.affectedRows > 0;
  }

  // 3. Hoàn tất khám (Transaction: Lưu bệnh án + Kê đơn + Update trạng thái)
  async finishAppointmentTransaction(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // B1: Lưu vào bảng appointments (Đại diện cho ca khám đã xong)
      // Lưu ý: status trong bảng appointments là 'done'
      const [appRes] = await connection.execute(
        "INSERT INTO appointments (booking_id, doctor_id, status) VALUES (?, ?, 'done')",
        [data.booking_id, data.doctor_id]
      );
      const appointmentId = appRes.insertId;

      // B2: Lưu chi tiết bệnh án vào appointment_records
      await connection.execute(
        `INSERT INTO appointment_records (appointment_id, symptoms, diagnosis, treatment_plan) 
         VALUES (?, ?, ?, ?)`,
        [appointmentId, data.symptoms, data.diagnosis, data.treatment_plan]
      );

      // B3: Lưu đơn thuốc (nếu có)
      if (data.medicines && data.medicines.length > 0) {
        const drugPromises = data.medicines.map((drug) => {
          return connection.execute(
            `INSERT INTO prescriptions (appointment_id, drug_id, quantity, instruction) 
             VALUES (?, ?, ?, ?)`,
            [appointmentId, drug.drug_id, drug.quantity, drug.instruction]
          );
        });
        await Promise.all(drugPromises);
      }

      // B4: Cập nhật booking gốc thành 'completed' để không hiện trong danh sách chờ nữa
      await connection.execute(
        "UPDATE bookings SET status = 'completed' WHERE id = ?",
        [data.booking_id]
      );

      await connection.commit();
      return appointmentId;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new AppointmentRepository();