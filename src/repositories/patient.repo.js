const db = require("../config/database");

class PatientRepository {
  // 1. Tạo thông tin patient mới (gắn với user_id vừa tạo)
  async create(userId, fullName, phone = null) {
    const [result] = await db.query(
      `INSERT INTO patients (user_id, full_name, phone, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), NOW())`,
      [userId, fullName, phone]
    );
    return result.insertId;
  }

  // 2. Tìm patient theo user_id (Dùng khi login để lấy Avatar/Tên)
  async findByUserId(userId) {
    const [rows] = await db.query("SELECT * FROM patients WHERE user_id = ?", [
      userId,
    ]);
    return rows[0];
  }

  // 3. Cập nhật thông tin cá nhân
  async update(userId, data) {
    const { full_name, phone, avatar } = data;
    // Chỉ update những trường có giá trị (tránh null đè lên dữ liệu cũ)
    const [result] = await db.query(
      `UPDATE patients 
       SET full_name = COALESCE(?, full_name), 
           phone = COALESCE(?, phone), 
           avatar = COALESCE(?, avatar),
           updated_at = NOW() 
       WHERE user_id = ?`,
      [full_name, phone, avatar, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new PatientRepository();
