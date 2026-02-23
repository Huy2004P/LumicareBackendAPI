const db = require("../config/database");

class PatientProfileRepository {
  async getAllByOwnerId(ownerId) {
    const sql = `
      SELECT id, owner_patient_id, full_name, birthday, gender, phone, address, relationship 
      FROM patient_profiles 
      WHERE owner_patient_id = ? AND is_deleted = 0 
      ORDER BY id DESC
    `;
    const [rows] = await db.execute(sql, [ownerId]);
    return rows;
  }

  async getById(id) {
    const sql = "SELECT * FROM patient_profiles WHERE id = ? AND is_deleted = 0";
    const [rows] = await db.execute(sql, [id]);
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
    const [result] = await db.execute(sql, [data.full_name, data.birthday, data.gender, data.phone_number, data.address, data.relationship, id, ownerId]);
    return result.affectedRows > 0;
  }

  async delete(id, ownerId) {
    // ĐỔI SANG SOFT DELETE
    const sql = "UPDATE patient_profiles SET is_deleted = 1 WHERE id = ? AND owner_patient_id = ?";
    const [result] = await db.execute(sql, [id, ownerId]);
    return result.affectedRows > 0;
  }
}

module.exports = new PatientProfileRepository();