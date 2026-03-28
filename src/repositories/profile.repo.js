const db = require("../config/database");

class ProfileRepository {
  /**
   * 1. Lấy thông tin chi tiết Bệnh nhân
   * Bao gồm xử lý format ngày sinh để tránh lệch múi giờ UTC
   */
  async getPatientProfile(userId) {
    const sql = `
      SELECT full_name as fullName, phone, avatar, birthday 
      FROM patients 
      WHERE user_id = ? AND is_deleted = 0
    `;
    const [rows] = await db.execute(sql, [userId]);
    
    if (!rows[0]) return null;

    const profile = rows[0];

    // 🚀 XỬ LÝ ĐỊNH DẠNG NGÀY SINH (Tránh lệch ngày khi truyền qua gRPC)
    if (profile.birthday) {
      const d = new Date(profile.birthday);
      
      // Lấy trực tiếp Local Time để không bị nhảy sang ngày hôm trước do múi giờ
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      profile.birthday = `${year}-${month}-${day}`; 
      
      console.log(`✅ [REPO] Fixed birthday format: ${profile.birthday}`);
    } else {
      profile.birthday = ""; 
    }
    
    console.log("🚀 [REPO RETURN]:", profile);
    return profile; 
  }

  /**
   * 2. Lấy thông tin chi tiết Bác sĩ
   */
  async getDoctorProfile(userId) {
    const sql = `
      SELECT full_name as fullName, phone, avatar 
      FROM doctors 
      WHERE user_id = ? AND is_deleted = 0
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows[0] || null;
  }

  /**
   * 3. Cập nhật thông tin Bệnh nhân (Profile chủ tài khoản)
   */
  async updatePatient(userId, data) {
    const sql = `
      UPDATE patients 
      SET full_name = ?, phone = ?, avatar = ?, birthday = ?, updated_at = NOW()
      WHERE user_id = ? AND is_deleted = 0
    `;
    
    const [result] = await db.execute(sql, [
      data.fullName || null, 
      data.phone || null, 
      data.avatar || null, 
      data.birthday || null, 
      userId
    ]);
    
    return result.affectedRows > 0;
  }

  /**
   * 4. Cập nhật thông tin Bác sĩ
   */
  async updateDoctor(userId, data) {
    const sql = `
      UPDATE doctors 
      SET full_name = ?, phone = ?, avatar = ?, updated_at = NOW()
      WHERE user_id = ? AND is_deleted = 0
    `;
    
    const [result] = await db.execute(sql, [
      data.fullName || null, 
      data.phone || null, 
      data.avatar || null, 
      userId
    ]);
    
    return result.affectedRows > 0;
  }
}

module.exports = new ProfileRepository();