const db = require("../config/database");

class DoctorRepository {
  // Tạo mới bác sĩ, mặc định active = 1, is_deleted = 0
  async create(data) {
    const sql = `
      INSERT INTO doctors (user_id, full_name, phone, position, description, price, avatar, specialty_id, room_id, active, is_deleted, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())
    `;
    const [result] = await db.execute(sql, [
      data.user_id, data.full_name, data.phone, data.position, 
      data.description, data.price, data.avatar, data.specialty_id, data.room_id
    ]);
    return result.insertId;
  }
  // Lấy danh sách bác sĩ với filter: searchTerm (tìm theo tên), specialtyId (lọc theo chuyên khoa)
  async findAll(filter) {
    let sql = `
      SELECT 
        d.*, 
        u.email, 
        s.name as specialty_name, 
        r.name as room_name, 
        c.name as clinic_name,
        IFNULL(AVG(f.rating_doctor), 5.0) as rating
      FROM doctors d 
      LEFT JOIN users u ON d.user_id = u.id 
      LEFT JOIN specialties s ON d.specialty_id = s.id 
      LEFT JOIN rooms r ON d.room_id = r.id 
      LEFT JOIN clinics c ON r.clinic_id = c.id 
      LEFT JOIN feedbacks f ON d.id = f.doctor_id
      WHERE d.is_deleted = 0
    `;
    const params = [];
    if (filter.searchTerm) {
      sql += " AND d.full_name LIKE ?";
      params.push(`%${filter.searchTerm}%`);
    }
    if (filter.specialtyId > 0) {
      sql += " AND d.specialty_id = ?";
      params.push(filter.specialtyId);
    }
    sql += " GROUP BY d.id";
    sql += " ORDER BY d.created_at DESC";
    const [rows] = await db.execute(sql, params);
    return rows;
  }
  // Lấy thông tin chi tiết bác sĩ theo ID, bao gồm email, tên chuyên khoa, tên phòng, tên phòng khám và đánh giá trung bình
  async findById(id) {
    const sql = `
      SELECT 
        d.*, 
        u.email, 
        s.name as specialty_name, 
        r.name as room_name, 
        c.name as clinic_name,
        IFNULL(AVG(f.rating_doctor), 5.0) as rating
      FROM doctors d 
      LEFT JOIN users u ON d.user_id = u.id 
      LEFT JOIN specialties s ON d.specialty_id = s.id 
      LEFT JOIN rooms r ON d.room_id = r.id 
      LEFT JOIN clinics c ON r.clinic_id = c.id 
      LEFT JOIN feedbacks f ON d.id = f.doctor_id
      WHERE d.id = ? AND d.is_deleted = 0
      GROUP BY d.id`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
  // Cập nhật thông tin bác sĩ, chỉ cập nhật những trường được cung cấp (không cập nhật nếu trường đó không có trong data)
  async assignServices(doctorId, serviceIds) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query("DELETE FROM doctor_services WHERE doctor_id = ?", [doctorId]);
      if (serviceIds && serviceIds.length > 0) {
        const values = serviceIds.map(sId => [doctorId, sId]);
        await connection.query("INSERT INTO doctor_services (doctor_id, service_id) VALUES ?", [values]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  // Lấy danh sách dịch vụ mà bác sĩ cung cấp
  async getServicesByDoctorId(doctorId) {
    const sql = `
      SELECT s.id, s.name, s.price, s.description, s.image 
      FROM services s 
      INNER JOIN doctor_services ds ON s.id = ds.service_id 
      WHERE ds.doctor_id = ? AND s.is_deleted = 0
    `;
    const [rows] = await db.execute(sql, [doctorId]);
    return rows;
  }
  // Tìm kiếm tổng hợp: tìm kiếm bác sĩ, phòng khám và chuyên khoa theo tên, trả về kết quả có phân loại rõ ràng (type: doctor, clinic, specialty)
  async globalSearch(query, limit) {
    const term = `%${query}%`;
    const sql = `
      (SELECT d.id, d.full_name as name, s.name as subTitle, d.avatar, 'doctor' as type 
       FROM doctors d 
       LEFT JOIN specialties s ON d.specialty_id = s.id 
       WHERE d.full_name LIKE ? AND d.is_deleted = 0)
      UNION
      (SELECT id, name, 'Phòng khám' as subTitle, image as avatar, 'clinic' as type 
       FROM clinics 
       WHERE name LIKE ? AND is_deleted = 0)
      UNION
      (SELECT id, name, 'Chuyên khoa' as subTitle, image as avatar, 'specialty' as type 
       FROM specialties 
       WHERE name LIKE ? AND is_deleted = 0)
      LIMIT ?
    `;
    const [rows] = await db.execute(sql, [term, term, term, limit]);
    return rows;
  }
  // Cập nhật thông tin bác sĩ, chỉ cập nhật những trường được cung cấp (không cập nhật nếu trường đó không có trong data)
  async update(id, d) {
    const sql = `
      UPDATE doctors 
      SET full_name = ?, phone = ?, position = ?, description = ?, 
          price = ?, avatar = ?, specialty_id = ?, room_id = ?, 
          active = ?, updated_at = NOW()
      WHERE id = ? AND is_deleted = 0
    `;
    await db.execute(sql, [
      d.fullName, d.phone, d.position, d.description,
      d.price, d.avatar, d.specialtyId, d.roomId,
      d.active ? 1 : 0, id
    ]);
  }
  // Xóa mềm bác sĩ: đánh dấu is_deleted = 1, active = 0 trên bảng doctors và users, đồng thời xóa cứng các mối nối dịch vụ (bảng doctor_services)
  async softDeleteDoctor(doctorId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // 1. Lấy user_id liên quan
      const [doctor] = await connection.query("SELECT user_id FROM doctors WHERE id = ?", [doctorId]);
      const userId = doctor[0].user_id;

      // 2. KIỂM TRA CHẶT CHẼ: Bảng Appointments
      const [pending] = await connection.query(
        "SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND status IN ('PENDING', 'CONFIRMED')",
        [doctorId]
      );
      if (pending[0].count > 0) {
        throw new Error("Bác sĩ vẫn còn lịch hẹn chưa hoàn thành, không thể xóa!");
      }
      // --- THỰC HIỆN XÓA MỀM (is_deleted = 1) ---
      // 3. Vô hiệu hóa tài khoản Login
      await connection.query("UPDATE users SET is_deleted = 1, active = 0 WHERE id = ?", [userId]);
      // 4. Đánh dấu xóa Bác sĩ
      await connection.query("UPDATE doctors SET is_deleted = 1, active = 0, updated_at = NOW() WHERE id = ?", [doctorId]);
      // 5. Đánh dấu xóa Profile
      await connection.query("UPDATE profiles SET is_deleted = 1 WHERE doctor_id = ?", [doctorId]);
      // 6. Xóa mối nối dịch vụ (Bảng trung gian xóa cứng luôn)
      await connection.query("DELETE FROM doctor_services WHERE doctor_id = ?", [doctorId]);
      await connection.commit();
      return { success: true, message: "Đã xóa mềm bác sĩ và các dữ liệu liên quan thành công!" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new DoctorRepository();