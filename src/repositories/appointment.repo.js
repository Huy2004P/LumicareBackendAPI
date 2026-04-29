const db = require("../config/database");

class AppointmentRepository {
  // 1. Lấy danh sách bệnh nhân chờ khám theo ngày (Dành cho bác sĩ)
  async getDoctorUserById(doctorId) {
    const sql = `
    SELECT 
      u.id as user_id, 
      u.email, 
      d.full_name,  -- Đã sửa thành full_name theo ảnh DB
      d.id as doctor_id 
    FROM users u
    JOIN doctors d ON u.id = d.user_id
    WHERE d.id = ? AND u.is_deleted = 0
    LIMIT 1
  `;
    const [rows] = await db.execute(sql, [doctorId]);
    return rows.length > 0 ? rows[0] : null;
  }
  // 1. Lấy danh sách bệnh nhân chờ khám theo ngày (Dành cho bác sĩ)
  async getListPatientForDoctor(doctorId, date) {
    const sql = `
      SELECT b.id as booking_id, b.patient_id, b.status, b.reason, b.time as time_type,
             p.full_name as patient_name, 
             p.phone, 
             p.gender, p.birthday, p.address,
             a.value_vi as time_display
      FROM bookings b
      JOIN patient_profiles p ON b.profile_id = p.id 
      JOIN allcodes a ON b.\`time\` = a.\`key\` AND a.type = 'TIME' 
      WHERE b.doctor_id = ? AND b.\`date\` = ? 
      AND b.status IN ('pending', 'confirmed') 
      ORDER BY a.\`key\` ASC
    `;
    const [rows] = await db.execute(sql, [doctorId, date]);
    return rows;
  }
  // 2. Xác nhận hoặc hủy lịch khám (Dành cho bác sĩ)
  async verifyBooking(bookingId, status) {
    const sql = "UPDATE bookings SET status = ? WHERE id = ?";
    const [result] = await db.execute(sql, [status, bookingId]);
    return result.affectedRows > 0;
  }
  // 3. Hoàn tất quá trình khám và lưu thông tin bệnh án (Dành cho bác sĩ)
  async finishAppointmentTransaction(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // B1: Lưu vào appointments
      const [appRes] = await connection.execute(
        "INSERT INTO appointments (booking_id, doctor_id, status) VALUES (?, ?, 'done')",
        [data.booking_id, data.doctor_id]
      );
      const appointmentId = appRes.insertId;
      // B2: LOGIC MỚI - Gom treatments thành chuỗi văn bản
      let fullTreatmentPlan = data.treatment_plan || "";
      if (data.treatments && data.treatments.length > 0) {
        const treatmentLines = data.treatments.map(t =>
          `- ${t.name}: ${t.times}. Hướng dẫn: ${t.instruction}. (Nhắc lại: ${t.repeat_days})`
        ).join("\n");
        fullTreatmentPlan = `[LIỆU TRÌNH ĐIỀU TRỊ]:\n${treatmentLines}\n\n[GHI CHÚ]:\n${fullTreatmentPlan}`;
      }
      // B3: Lưu vào appointment_records (Dùng fullTreatmentPlan và thêm re_exam_date)
      // Thay vì INSERT giá trị trực tiếp, mình dùng SELECT từ bảng bookings
      // B3: Lưu vào appointment_records (Thêm data.reason vào)
      await connection.execute(
        `INSERT INTO appointment_records (appointment_id, reason, symptoms, diagnosis, treatment_plan, re_exam_date) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          appointmentId,
          data.reason,
          data.symptoms,
          data.diagnosis,
          fullTreatmentPlan,
          data.re_exam_date || null
        ]
      );
      //Lưu treatments vào bảng treatments (Nếu có)
      if (data.treatments && data.treatments.length > 0) {
        console.log(">>> [DEBUG] Đang lưu vào bảng treatments:", data.treatments.length, "dòng");
        for (const t of data.treatments) {
          await connection.execute(
            `INSERT INTO treatments (appointment_id, name, times, instruction, repeat_days) 
       VALUES (?, ?, ?, ?, ?)`,
            [
              appointmentId,
              t.name,
              t.times || '',
              t.instruction || '',
              t.repeat_days || ''
            ]
          );
        }
        console.log(">>> [DEBUG] Lưu bảng treatments THÀNH CÔNG");
      } else {
        console.log(">>> [DEBUG] Mảng data.treatments bị RỖNG hoặc UNDEFINED nên không lưu!");
      }
      // B4: Lưu đơn thuốc (Giữ nguyên logic cũ của ông)
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
      // B5: Cập nhật status booking thành 'completed'
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
  // 3.5 Lấy thông tin booking để xác định user_id và payment_method (Dành cho Service)
  async getBookingById(booking_id) {
    const sql = `
      SELECT 
        b.id, 
        b.payment_method,
        p.user_id 
      FROM bookings b
      JOIN patients p ON b.patient_id = p.id
      WHERE b.id = ?
    `;
    const [rows] = await db.execute(sql, [booking_id]);
    if (rows[0]) {
      console.log(`>>> [Hệ Thống] Đã tìm thấy User ID: ${rows[0].user_id} - Method: ${rows[0].payment_method}`);
    } else {
      console.log(">>> [Hệ Thống] Không tìm thấy bệnh nhân cho booking này!");
    }

    return rows[0];
  }
  // 4. Lấy lịch sử khám bệnh của bệnh nhân (Dành cho bệnh nhân và bác sĩ)
  async getMedicalHistory(patientId, doctorId, keyword) {
    let sql = `
      SELECT 
        ar.id as record_id, a.booking_id, b.patient_id,
        p.full_name as patient_name, d.full_name as doctor_name,
        b.date, ar.symptoms, ar.diagnosis, ar.treatment_plan, ar.re_exam_date,
        a.id as appointment_id
      FROM appointment_records ar
      JOIN appointments a ON ar.appointment_id = a.id
      JOIN bookings b ON a.booking_id = b.id
      JOIN patient_profiles p ON b.profile_id = p.id
      JOIN doctors d ON b.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];
    if (patientId > 0) {
      sql += " AND b.patient_id = ?";
      params.push(patientId);
    }
    if (doctorId > 0) {
      sql += " AND b.doctor_id = ?";
      params.push(doctorId);
    }
    if (keyword) {
      sql += " AND (ar.diagnosis LIKE ? OR p.full_name LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    sql += " ORDER BY b.date DESC";
    const [rows] = await db.execute(sql, params);
    return rows;
  }
  // 5. Lấy đơn thuốc của một cuộc hẹn cụ thể
  async getPrescriptionByAppId(appId) {
    const sql = `
      SELECT dr.id as drug_id, dr.name as drug_name, pr.quantity, pr.instruction
      FROM prescriptions pr
      JOIN drugs dr ON pr.drug_id = dr.id
      WHERE pr.appointment_id = ?
    `;
    const [rows] = await db.execute(sql, [appId]);
    return rows;
  }
  // 6. Lấy liệu trình của một cuộc hẹn cụ thể
  async getTreatmentsByAppId(appId) {
    const sql = "SELECT name, times, instruction, repeat_days FROM treatments WHERE appointment_id = ?";
    const [rows] = await db.execute(sql, [appId]);
    return rows;
  }
}

module.exports = new AppointmentRepository();