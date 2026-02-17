const db = require("../config/database");

class UserRepository {
  // 1. Tìm user theo email (Dùng cho Login, Register, ForgotPassword)
  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  }

  // 2. Tạo tài khoản mới (Dùng cho Register)
  async create(userData) {
    const { email, password, role } = userData;
    const [result] = await db.query(
      "INSERT INTO users (email, password, role, active, created_at, updated_at) VALUES (?, ?, ?, 1, NOW(), NOW())",
      [email, password, role]
    );
    return result.insertId;
  }

  // 3. Cập nhật mật khẩu (Dùng cho ResetPassword)
  async updatePasswordByEmail(email, newPassword) {
    const [result] = await db.query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?",
      [newPassword, email]
    );
    return result.affectedRows > 0;
  }

  // 4. Lấy thông tin User + Patient/Doctor để trả về Token (Full Info)
  async getUserFullInfo(userId, role) {
    let sql = "";
    if (role === 'patient') {
      sql = `
        SELECT u.id, u.email, u.role, p.full_name, p.phone, p.avatar 
        FROM users u 
        LEFT JOIN patient_profiles p ON u.id = p.user_id 
        WHERE u.id = ?`;
    } else if (role === 'doctor') {
      sql = `
        SELECT u.id, u.email, u.role, d.full_name, d.phone, d.avatar 
        FROM users u 
        LEFT JOIN doctors d ON u.id = d.user_id 
        WHERE u.id = ?`;
    } else {
      // Admin
      sql = "SELECT id, email, role FROM users WHERE id = ?";
    }
    
    const [rows] = await db.query(sql, [userId]);
    return rows[0];
  }
}

module.exports = new UserRepository();