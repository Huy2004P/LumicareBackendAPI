const db = require("../config/database");

class ProfileRepository {
  
  // 1. Lấy thông tin Bệnh nhân (Join Users + Patients)
  async getPatientProfile(userId) {
    const sql = `
      SELECT u.id, u.email, u.role, u.created_at,
             p.full_name, p.phone, p.avatar
      FROM users u
      LEFT JOIN patients p ON u.id = p.user_id
      WHERE u.id = ?
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows[0];
  }

  // 2. Lấy thông tin Bác sĩ (Join Users + Doctors)
  async getDoctorProfile(userId) {
    const sql = `
      SELECT u.id, u.email, u.role, u.created_at,
             d.full_name, d.phone, d.avatar
      FROM users u
      LEFT JOIN doctors d ON u.id = d.user_id
      WHERE u.id = ?
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows[0];
  }

  // 3. Lấy thông tin Admin (Chỉ có bảng Users)
  async getAdminProfile(userId) {
    const sql = `SELECT id, email, role, created_at FROM users WHERE id = ?`;
    const [rows] = await db.execute(sql, [userId]);
    return rows[0];
  }

  // 4. Cập nhật thông tin Bệnh nhân
  async updatePatient(userId, data) {
    const sql = `
      UPDATE patients 
      SET full_name = ?, phone = ?, avatar = ?, updated_at = NOW()
      WHERE user_id = ?
    `;
    const [result] = await db.execute(sql, [data.fullName, data.phone, data.avatar, userId]);
    return result.affectedRows > 0;
  }

  // 5. Cập nhật thông tin Bác sĩ
  async updateDoctor(userId, data) {
    const sql = `
      UPDATE doctors 
      SET full_name = ?, phone = ?, avatar = ?, updated_at = NOW()
      WHERE user_id = ?
    `;
    const [result] = await db.execute(sql, [data.fullName, data.phone, data.avatar, userId]);
    return result.affectedRows > 0;
  }
}

module.exports = new ProfileRepository();