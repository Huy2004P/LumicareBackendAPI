const db = require("../config/database");

class PatientProfileRepository {
  async getAllByOwnerId(ownerId) {
      const sql = `
        SELECT id, owner_patient_id, full_name, birthday, gender, phone, address, relationship 
        FROM patient_profiles 
        WHERE owner_patient_id = ? AND is_deleted = 0 
        ORDER BY created_at DESC
      `;
      const [rows] = await db.execute(sql, [ownerId]);
      return rows;
  }

  async getByIdAndOwner(id, ownerId) {
      const sql = `
        SELECT * FROM patient_profiles 
        WHERE id = ? AND owner_patient_id = ? AND is_deleted = 0
      `;
      const [rows] = await db.execute(sql, [id, ownerId]);
      return rows[0];
  }

  async create(data) {
    const sql = `
      INSERT INTO patient_profiles (owner_patient_id, full_name, birthday, gender, phone, address, relationship, is_deleted, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
    `;
    const [result] = await db.execute(sql, [data.user_id, data.full_name, data.birthday, data.gender, data.phone_number, data.address, data.relationship]);
    return result.insertId;
  }

  async update(id, ownerId, data) {
    const sql = `
      UPDATE patient_profiles 
      SET full_name=?, birthday=?, gender=?, phone=?, address=?, relationship=?, updated_at=NOW()
      WHERE id=? AND owner_patient_id=? AND is_deleted = 0
    `;
    
    // Dùng toán tử || để đảm bảo nếu data.xxx không có thì truyền null hoặc chuỗi rỗng
    const params = [
      data.full_name || null,
      data.birthday || null,
      data.gender || null,
      data.phone || null, // Chú ý: Service phải truyền data.phone cho Repo
      data.address || null,
      data.relationship || null,
      id,
      ownerId
    ];

    const [result] = await db.execute(sql, params);
    return result.affectedRows > 0;
  }

  async delete(id, ownerId) {
    // Soft Delete: Chuyển is_deleted thành 1
    const sql = `
      UPDATE patient_profiles 
      SET is_deleted = 1, updated_at = NOW() 
      WHERE id = ? AND owner_patient_id = ?
    `;
    const [result] = await db.execute(sql, [id, ownerId]);
    return result.affectedRows > 0;
  }

  // Thêm hàm này vào class PatientProfileRepository
  async getPatientIdByUserId(userId) {
    const sql = "SELECT id FROM patients WHERE user_id = ?";
    const [rows] = await db.execute(sql, [userId]);
    return rows[0] ? rows[0].id : null;
  }
}

module.exports = new PatientProfileRepository();