const db = require("../config/database");

class DoctorRepository {
  
  // 1. Tạo Hồ sơ Bác sĩ
  async create(data) {
    const sql = `
      INSERT INTO doctors (user_id, full_name, phone, position, description, 
      price, avatar, specialty_id, room_id, active, is_deleted, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())
    `;
    const [result] = await db.execute(sql, [
      data.user_id, 
      data.full_name, 
      data.phone, 
      data.position, 
      data.description,
      data.price, 
      data.avatar, 
      data.specialty_id, 
      data.room_id
    ]);
    return result.insertId;
  }

  // 2. Lấy danh sách (Có Filter tìm kiếm + Soft Delete lọc 4 tầng)
  async findAll(filter) {
    let sql = `
      SELECT d.*, u.email, s.name as specialty_name, r.name as room_name, c.name as clinic_name
      FROM doctors d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      LEFT JOIN rooms r ON d.room_id = r.id
      LEFT JOIN clinics c ON r.clinic_id = c.id
      WHERE d.is_deleted = 0 
      AND (u.is_deleted = 0 OR u.id IS NULL)
      AND (s.is_deleted = 0 OR s.id IS NULL)
      AND (r.is_deleted = 0 OR r.id IS NULL)
      AND (c.is_deleted = 0 OR c.id IS NULL)
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
    if (filter.roomId > 0) {
      sql += " AND d.room_id = ?";
      params.push(filter.roomId);
    }

    sql += " ORDER BY d.created_at DESC";

    const [rows] = await db.execute(sql, params);
    return rows;
  }

  // 3. Lấy chi tiết 1 bác sĩ (Lọc Soft Delete)
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

  // 4. Cập nhật hồ sơ bác sĩ (Mới bổ sung)
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

  // 5. Xóa ảo bác sĩ (Soft Delete)
  async delete(id) {
    await db.execute("UPDATE doctors SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }
}

module.exports = new DoctorRepository();