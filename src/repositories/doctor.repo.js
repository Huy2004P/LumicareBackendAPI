const db = require("../config/database");

class DoctorRepository {
  
  // 1. Tạo Hồ sơ Bác sĩ (Chạy sau khi đã tạo User)
  async create(data) {
    // Lưu ý: data ở đây đã được chuẩn hóa key (snake_case) từ Service gửi sang
    const sql = `
      INSERT INTO doctors (user_id, full_name, phone, position, description, 
      price, avatar, specialty_id, room_id, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
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

  // 2. Lấy danh sách (Có Filter tìm kiếm)
  async findAll(filter) {
    // JOIN 4 bảng để lấy đầy đủ tên Chuyên khoa, Phòng, Phòng khám, Email
    let sql = `
      SELECT d.*, u.email, s.name as specialty_name, r.name as room_name, c.name as clinic_name
      FROM doctors d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      LEFT JOIN rooms r ON d.room_id = r.id
      LEFT JOIN clinics c ON r.clinic_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Tìm theo tên
    if (filter.searchTerm) {
      sql += " AND d.full_name LIKE ?";
      params.push(`%${filter.searchTerm}%`);
    }
    // Tìm theo chuyên khoa
    if (filter.specialtyId > 0) {
      sql += " AND d.specialty_id = ?";
      params.push(filter.specialtyId);
    }
    // Tìm theo phòng
    if (filter.roomId > 0) {
      sql += " AND d.room_id = ?";
      params.push(filter.roomId);
    }

    sql += " ORDER BY d.created_at DESC";

    const [rows] = await db.execute(sql, params);
    return rows;
  }

  // 3. Lấy chi tiết 1 bác sĩ
  async findById(id) {
    const sql = `
      SELECT d.*, u.email, s.name as specialty_name, r.name as room_name, c.name as clinic_name
      FROM doctors d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      LEFT JOIN rooms r ON d.room_id = r.id
      LEFT JOIN clinics c ON r.clinic_id = c.id
      WHERE d.id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
}

module.exports = new DoctorRepository();