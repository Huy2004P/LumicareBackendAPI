const db = require("../config/database");

class UserRepository {
  // 1. Tìm user theo email
  async findByEmail(email) {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND is_deleted = 0", 
      [email]
    );
    return rows[0];
  }

  // 2. Tạo User + Profile tương ứng (Transaction)
  // 2. Tạo User + Bản ghi Patient Gốc (Transaction)
  async create(userData) {
    const { email, password, role, fullName, phone } = userData;
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Bước 1: Tạo tài khoản đăng nhập
      const [userResult] = await connection.query(
        "INSERT INTO users (email, password, role, active, is_deleted, created_at, updated_at) VALUES (?, ?, ?, 1, 0, NOW(), NOW())",
        [email, password, role]
      );
      const newUserId = userResult.insertId;

      // Bước 2: Tự động tạo bản ghi gốc trong bảng role tương ứng
      if (role === 'patient') {
        // Chèn vào bảng patients y hệt bảng doctors
        // Tên cột khớp với ảnh image_a55f23.png: user_id, full_name, phone
        await connection.query(
          "INSERT INTO patients (user_id, full_name, phone, created_at, updated_at, is_deleted) VALUES (?, ?, ?, NOW(), NOW(), 0)",
          [newUserId, fullName || "Bệnh nhân mới", phone || ""]
        );
      } else if (role === 'admin') {
        await connection.query(
          "INSERT INTO admin_profiles (user_id, full_name) VALUES (?, ?)",
          [newUserId, fullName || "Admin"]
        );
      }
      // Lưu ý: Doctor không tạo ở đây vì ông nói Doctor tạo riêng

      await connection.commit();
      return newUserId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 3. Lấy thông tin Full (JOIN chuẩn theo từng role)
  async getUserFullInfo(userId, role) {
      let sql = "";
      if (role === 'doctor') {
        // Sửa d.fullName thành d.full_name theo đúng phpMyAdmin của ông
        sql = `SELECT u.id, u.email, u.role, 
                      d.full_name as fullName, 
                      d.phone, 
                      d.avatar 
              FROM users u 
              LEFT JOIN doctors d ON u.id = d.user_id 
              WHERE u.id = ? AND u.is_deleted = 0`;
      } else if (role === 'patient') {
        sql = `SELECT u.id, u.email, u.role, 
                      p.full_name as fullName, 
                      p.phone, 
                      p.avatar 
              FROM users u 
              LEFT JOIN patient_profiles p ON u.id = p.owner_patient_id 
              WHERE u.id = ? AND u.is_deleted = 0`;
      } else if (role === 'admin') {
        sql = `SELECT u.id, u.email, u.role, 
                      a.full_name as fullName, 
                      a.avatar 
              FROM users u 
              LEFT JOIN admin_profiles a ON u.id = a.user_id 
              WHERE u.id = ? AND u.is_deleted = 0`;
      } else {
        sql = "SELECT id, email, role FROM users WHERE id = ? AND is_deleted = 0";
      }

      const [rows] = await db.query(sql, [userId]);
      return rows[0];
  }

  // 4. Cập nhật mật khẩu
  async updatePasswordByEmail(email, hashedPassword) {
    const [result] = await db.query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE email = ? AND is_deleted = 0",
      [hashedPassword, email]
    );
    return result.affectedRows > 0;
  }

  // 5. Xóa ảo User
  async deleteUser(userId) {
    const [result] = await db.query(
      "UPDATE users SET is_deleted = 1, updated_at = NOW() WHERE id = ?",
      [userId]
    );
    return result.affectedRows > 0;
  }

  // 6. Lấy tất cả user (Dùng cho Admin)
  async getAllUsers() {
    const [rows] = await db.query(
      "SELECT id, email, role, active, created_at FROM users WHERE is_deleted = 0 ORDER BY created_at DESC"
    );
    return rows;
  }

  // 7. Tìm user theo ID (Để lấy Role phục vụ hàm getMyProfile)
  // File: user.repository.js
  async findById(userId) {
    const [rows] = await db.query(
      "SELECT id, email, role, created_at FROM users WHERE id = ? AND is_deleted = 0", 
      [userId]
    );
    return rows[0];
  }

  // 8. Lấy password cũ (Phục vụ hàm changePassword)
  async findPasswordById(userId) {
    const [rows] = await db.query(
      "SELECT password FROM users WHERE id = ? AND is_deleted = 0", 
      [userId]
    );
    return rows[0];
  }

  // 9. Cập nhật mật khẩu mới theo ID
  async updatePassword(userId, hashedPassword) {
    const [result] = await db.query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new UserRepository();