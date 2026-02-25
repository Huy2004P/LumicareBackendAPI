const db = require("../config/database");

class ProfileRepository {
  
  // 1. Lấy thông tin Bệnh nhân
  async getPatientProfile(userId) {
    const sql = `SELECT full_name as fullName, phone, avatar, gender FROM patient_profiles WHERE owner_patient_id = ?`;
    const [rows] = await db.query(sql, [userId]);
    return rows[0]; 
  }

  // 2. Lấy thông tin Bác sĩ
  async getDoctorProfile(userId) {
    const sql = `SELECT full_name as fullName, phone, avatar FROM doctors WHERE user_id = ?`;
    const [rows] = await db.query(sql, [userId]);
    return rows[0];
  }

  // 3. Lấy thông tin Admin
  async getAdminProfile(userId) {
    const sql = `SELECT full_name as fullName, avatar FROM admin_profiles WHERE user_id = ?`;
    const [rows] = await db.query(sql, [userId]);
    return rows[0];
  }

  // 1. Update cho Bệnh nhân (Có Gender)
  async updatePatient(userId, data) {
      const sql = `
          UPDATE patient_profiles 
          SET full_name = ?, phone = ?, avatar = ?, gender = ?, updated_at = NOW()
          WHERE owner_patient_id = ?
      `;
      const [result] = await db.query(sql, [data.fullName, data.phone, data.avatar, data.gender, userId]);
      return result.affectedRows > 0;
  }

  // 2. Update cho Bác sĩ (KHÔNG có Gender)
  async updateDoctor(userId, data) {
      const sql = `
          UPDATE doctors 
          SET full_name = ?, phone = ?, avatar = ?, updated_at = NOW()
          WHERE user_id = ?
      `;
      const [result] = await db.query(sql, [data.fullName, data.phone, data.avatar, userId]);
      return result.affectedRows > 0;
  }

  // 3. Update cho Admin (KHÔNG có Gender, KHÔNG có Phone)
  async updateAdmin(userId, data) {
      const sql = `
          UPDATE admin_profiles 
          SET full_name = ?, avatar = ?
          WHERE user_id = ?
      `;
      const [result] = await db.query(sql, [data.fullName, data.avatar, userId]);
      return result.affectedRows > 0;
  }
}

module.exports = new ProfileRepository();