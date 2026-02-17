const db = require("../config/database");

class PatientProfileRepository {
  
  // 1. Lấy danh sách hồ sơ (Theo owner_patient_id)
  async getAllByOwnerId(ownerId) {
    // Map cột phone -> phone_number cho khớp logic
    const sql = `
      SELECT id, owner_patient_id, full_name, birthday, gender, 
             phone, address, relationship 
      FROM patient_profiles 
      WHERE owner_patient_id = ? 
      ORDER BY id DESC
    `;
    const [rows] = await db.execute(sql, [ownerId]);
    return rows;
  }

  // 2. Lấy chi tiết 1 hồ sơ
  async getById(id) {
    const sql = "SELECT * FROM patient_profiles WHERE id = ?";
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }

  // 3. Tạo hồ sơ mới
  async create(data) {
    // Lưu ý: Trong DB cột là 'owner_patient_id' và 'phone'
    const sql = `
      INSERT INTO patient_profiles (owner_patient_id, full_name, birthday, gender, phone, address, relationship, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.execute(sql, [
      data.user_id, // Proto gọi là user_id, map vào owner_patient_id
      data.full_name, 
      data.birthday, 
      data.gender, 
      data.phone_number, // Map vào cột phone
      data.address, 
      data.relationship
    ]);
    return result.insertId;
  }

  // 4. Sửa hồ sơ
  async update(id, ownerId, data) {
    const sql = `
      UPDATE patient_profiles 
      SET full_name=?, birthday=?, gender=?, phone=?, address=?, relationship=?, updated_at=NOW()
      WHERE id=? AND owner_patient_id=?
    `;
    const [result] = await db.execute(sql, [
      data.full_name, data.birthday, data.gender, 
      data.phone_number, data.address, data.relationship,
      id, ownerId
    ]);
    return result.affectedRows > 0;
  }

  // 5. Xóa hồ sơ
  async delete(id, ownerId) {
    const sql = "DELETE FROM patient_profiles WHERE id = ? AND owner_patient_id = ?";
    const [result] = await db.execute(sql, [id, ownerId]);
    return result.affectedRows > 0;
  }
}

module.exports = new PatientProfileRepository();