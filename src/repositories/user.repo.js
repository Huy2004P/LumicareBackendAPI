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
  async create(userData) {
    const { email, password, role, fullName, phone, gender, address } = userData;
    const finalName = fullName || "Người dùng mới";
    const finalGender = gender ? gender.charAt(0).toLowerCase() : null;
    
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Lưu bảng users
      const [userResult] = await connection.query(
        "INSERT INTO users (email, password, role, active, is_deleted, created_at, updated_at) VALUES (?, ?, ?, 1, 0, NOW(), NOW())",
        [email, password, role]
      );
      const newUserId = userResult.insertId;

      // CHIA LUỒNG CHUẨN: Role nào vào bảng đó
      if (role === 'patient') {
        await connection.query(
          "INSERT INTO patient_profiles (owner_patient_id, full_name, phone, gender, address, is_deleted, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())",
          [newUserId, finalName, phone || '', finalGender, address || '']
        );
      } else if (role === 'doctor') {
        await connection.query(
          "INSERT INTO doctors (id, full_name, phone, is_deleted, created_at, updated_at) VALUES (?, ?, ?, 0, NOW(), NOW())",
          [newUserId, finalName, phone || '']
        );
      } else if (role === 'admin') {
        // Tui thêm user_id vào đây vì bảng của ông yêu cầu cột này
        await connection.query(
          "INSERT INTO admin_profiles (id, user_id, full_name) VALUES (?, ?, ?)",
          [newUserId, newUserId, finalName] // Truyền newUserId vào cả 2 cột cho chắc
        );
      }

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
    if (role === 'patient') {
      sql = `SELECT u.id, u.email, u.role, p.full_name as fullName, p.phone, p.avatar 
             FROM users u LEFT JOIN patient_profiles p ON u.id = p.owner_patient_id 
             WHERE u.id = ? AND u.is_deleted = 0`;
    } else if (role === 'doctor') {
      sql = `SELECT u.id, u.email, u.role, d.full_name as fullName, d.phone, d.avatar 
             FROM users u LEFT JOIN doctors d ON u.id = d.id 
             WHERE u.id = ? AND u.is_deleted = 0`;
    } else if (role === 'admin') {
      sql = `SELECT u.id, u.email, u.role, a.full_name as fullName, a.avatar 
             FROM users u LEFT JOIN admin_profiles a ON u.id = a.id 
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
}

module.exports = new UserRepository();