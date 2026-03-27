const db = require("../config/database");

class PatientProfileRepository {
  // Tìm ID Patient xịn từ User ID (Dùng xuyên suốt)
  async getPatientIdByUserId(userId) {
    const sql = "SELECT id FROM patients WHERE user_id = ?";
    const [rows] = await db.execute(sql, [userId]);
    return rows[0] ? rows[0].id : null;
  }

  async getAllByOwnerId(ownerId) {
    const sql = `
        SELECT id, owner_patient_id, full_name, 
               DATE_FORMAT(birthday, '%Y-%m-%d') as birthday, 
               gender, phone, address, relationship 
        FROM patient_profiles 
        WHERE owner_patient_id = ? AND is_deleted = 0 
        ORDER BY created_at DESC
      `;
    const [rows] = await db.execute(sql, [ownerId]);
    return rows;
  }

  // Hàm gốc của ông
  async getByIdAndOwner(id, ownerId) {
    const sql = `
        SELECT id, owner_patient_id, full_name, 
               DATE_FORMAT(birthday, '%Y-%m-%d') as birthday, 
               gender, phone, address, relationship, is_deleted
        FROM patient_profiles 
        WHERE id = ? AND owner_patient_id = ? AND is_deleted = 0
      `;
    const [rows] = await db.execute(sql, [id, ownerId]);
    return rows[0];
  }

  // 🎯 THÊM ALIAS: Để Service gọi getById(id, ownerId) không bị crash
  async getById(id, ownerId) {
    return this.getByIdAndOwner(id, ownerId);
  }

  async create(data) {
    const sql = `
      INSERT INTO patient_profiles (owner_patient_id, full_name, birthday, gender, phone, address, relationship, is_deleted, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
    `;
    const [result] = await db.execute(sql, [
      data.owner_patient_id, // Đã đổi tên cho đúng ý nghĩa
      data.full_name,
      data.birthday,
      data.gender,
      data.phone,
      data.address,
      data.relationship,
    ]);
    return result.insertId;
  }

  async update(id, ownerId, data) {
    const sql = `
      UPDATE patient_profiles 
      SET full_name=?, birthday=?, gender=?, phone=?, address=?, relationship=?, updated_at=NOW()
      WHERE id=? AND owner_patient_id=? AND is_deleted = 0
    `;
    const params = [
      data.full_name || null,
      data.birthday || null,
      data.gender || null,
      data.phone || null,
      data.address || null,
      data.relationship || null,
      id,
      ownerId,
    ];
    const [result] = await db.execute(sql, params);
    return result.affectedRows > 0;
  }

  async delete(id, ownerId) {
    const sql = `
      UPDATE patient_profiles 
      SET is_deleted = 1, updated_at = NOW() 
      WHERE id = ? AND owner_patient_id = ?
    `;
    const [result] = await db.execute(sql, [id, ownerId]);
    return result.affectedRows > 0;
  }
}

module.exports = new PatientProfileRepository();