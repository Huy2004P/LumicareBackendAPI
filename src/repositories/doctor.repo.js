const db = require("../config/database");

class DoctorRepository {
  // Tạo Hồ sơ Bác sĩ
  async create(data) {
    const sql = `
      INSERT INTO doctors (user_id, full_name, phone, position, description, 
      price, avatar, specialty_id, room_id, active, is_deleted, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())
    `;
    const [result] = await db.execute(sql, [
      data.user_id, data.full_name, data.phone, data.position, data.description,
      data.price, data.avatar, data.specialty_id, data.room_id
    ]);
    return result.insertId;
  }

  // Lấy danh sách (Giữ nguyên lọc 4 tầng của ông)
  async findAll(filter) {
  let sql = `
    SELECT d.*, u.email, s.name as specialty_name, r.name as room_name, c.name as clinic_name
    FROM doctors d
    LEFT JOIN users u ON d.user_id = u.id
    LEFT JOIN specialties s ON d.specialty_id = s.id
    LEFT JOIN rooms r ON d.room_id = r.id
    LEFT JOIN clinics c ON r.clinic_id = c.id
    WHERE d.is_deleted = 0
  `; // Kết thúc bằng khoảng trắng hoặc xuống dòng
  
  const params = [];

  // PHẢI CÓ KHOẢNG TRẮNG TRƯỚC CHỮ "AND"
  if (filter.searchTerm) {
    sql += " AND d.full_name LIKE ?"; 
    params.push(`%${filter.searchTerm}%`);
  }

  if (filter.specialtyId > 0) {
    sql += " AND d.specialty_id = ?";
    params.push(filter.specialtyId);
  }

  sql += " ORDER BY d.created_at DESC";

  // LOG RA ĐỂ SOi: Ông copy dòng này vào rồi nhìn Terminal lúc bấm Search
  console.log(">>> SQL Query:", sql);
  console.log(">>> Params:", params);

  const [rows] = await db.execute(sql, params);
  console.log("SỐ LƯỢNG KẾT QUẢ TÌM THẤY:", rows.length);
  return rows;
}

  async findById(id) {
    const sql = `
      SELECT d.*, u.email, s.name as specialty_name, r.name as room_name, c.name as clinic_name
      FROM doctors d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      LEFT JOIN rooms r ON d.room_id = r.id
      LEFT JOIN clinics c ON r.clinic_id = c.id
      WHERE d.id = ? AND d.is_deleted = 0
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }

  async update(id, data) {
    const sql = `
      UPDATE doctors SET 
      full_name=?, phone=?, position=?, description=?, 
      price=?, avatar=?, specialty_id=?, room_id=?, updated_at=NOW()
      WHERE id=? AND is_deleted = 0
    `;
    await db.execute(sql, [
      data.full_name, data.phone, data.position, data.description,
      data.price, data.avatar, data.specialty_id, data.room_id, id
    ]);
    return this.findById(id);
  }

  async delete(id) {
    await db.execute("UPDATE doctors SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  async assignServices(doctorId, serviceIds) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Xóa các dịch vụ cũ của ông bác sĩ này trước khi nạp mới
      await connection.query("DELETE FROM doctor_services WHERE doctor_id = ?", [doctorId]);

      if (serviceIds && serviceIds.length > 0) {
        // Chuẩn bị dữ liệu để INSERT nhiều dòng cùng lúc (Bulk Insert)
        const values = serviceIds.map(sId => [doctorId, sId]);
        await connection.query(
          "INSERT INTO doctor_services (doctor_id, service_id) VALUES ?",
          [values]
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

  async getServicesByDoctorId(doctorId) {
    const sql = `
      SELECT s.id, s.name, s.price, s.image, s.description, 
            sp.name as specialtyName 
      FROM services s
      INNER JOIN doctor_services ds ON s.id = ds.service_id
      LEFT JOIN specialties sp ON s.specialty_id = sp.id
      WHERE ds.doctor_id = ? AND s.is_deleted = 0
    `;
    const [rows] = await db.execute(sql, [doctorId]);
    return rows;
  }

  async findDoctorByServiceId(serviceId) {
    const sql = `
      SELECT ds.doctor_id, s.price, d.full_name
      FROM doctor_services ds
      JOIN services s ON ds.service_id = s.id
      JOIN doctors d ON ds.doctor_id = d.id
      WHERE ds.service_id = ? AND s.is_deleted = 0 AND d.is_deleted = 0
      LIMIT 1
    `;
    const [rows] = await db.execute(sql, [serviceId]);
    return rows[0]; // Trả về { doctor_id, price, full_name }
  }
}

module.exports = new DoctorRepository();