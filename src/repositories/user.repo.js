const db = require("../config/database");

class UserRepository {
  async findByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ? AND is_deleted = 0", [email]);
    return rows[0];
  }

  // 1. Hàm Tạo User + Profile gốc (Chỉ có birthday, KHÔNG CÓ address)
  async create(userData) {
    const { email, password, role, fullName, phone, birthday } = userData;
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Bước 1: Tạo tài khoản users
      const [userResult] = await connection.execute(
        "INSERT INTO users (email, password, role, active, is_deleted, created_at, updated_at) VALUES (?, ?, ?, 1, 0, NOW(), NOW())",
        [email, password, role]
      );
      const newUserId = userResult.insertId;

      // Bước 2: Tạo profile gốc (Bảng patients - Theo đúng hình image_fc9831.png)
      if (role === 'patient') {
        const sqlPatient = `
          INSERT INTO patients (user_id, full_name, phone, birthday, created_at, updated_at, is_deleted) 
          VALUES (?, ?, ?, ?, NOW(), NOW(), 0)
        `;
        await connection.execute(sqlPatient, [
          newUserId, 
          fullName || "Người dùng mới", 
          phone || "", 
          birthday || null
        ]);
      } else if (role === 'admin') {
        await connection.query(
          "INSERT INTO admin_profiles (user_id, full_name) VALUES (?, ?)",
          [newUserId, fullName || "Admin"]
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

  // 2. Lấy thông tin Full (KHÔNG CÓ address)
  async getUserFullInfo(userId, role) {
    let sql = "";
    if (role === 'doctor') {
      sql = `SELECT u.id, u.email, u.role, d.full_name as fullName, d.phone, d.avatar 
             FROM users u LEFT JOIN doctors d ON u.id = d.user_id 
             WHERE u.id = ? AND u.is_deleted = 0`;
    } else if (role === 'patient') {
      // Lấy đúng các cột: id, email, role, fullName, phone, avatar, birthday
      sql = `SELECT u.id, u.email, u.role, p.full_name as fullName, p.phone, p.avatar, p.birthday 
             FROM users u 
             LEFT JOIN patients p ON u.id = p.user_id 
             WHERE u.id = ? AND u.is_deleted = 0`;
    } else {
      sql = "SELECT id, email, role FROM users WHERE id = ? AND is_deleted = 0";
    }

    const [rows] = await db.execute(sql, [userId]);
    
    // Format ngày sinh cho gRPC (nếu có)
    if (rows[0] && rows[0].birthday) {
        rows[0].birthday = new Date(rows[0].birthday).toISOString().split('T')[0];
    }
    
    return rows[0];
  }

  // --- Các hàm hỗ trợ còn lại giữ nguyên ---
  async findById(userId) {
    const [rows] = await db.execute("SELECT id, email, role, created_at FROM users WHERE id = ? AND is_deleted = 0", [userId]);
    return rows[0];
  }

  async findPasswordById(userId) {
    const [rows] = await db.execute("SELECT password FROM users WHERE id = ? AND is_deleted = 0", [userId]);
    return rows[0];
  }

  async updatePassword(userId, hashedPassword) {
    const [result] = await db.execute("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?", [hashedPassword, userId]);
    return result.affectedRows > 0;
  }

  async updateOTP(email, code, expiredAt) {
    return db.execute("UPDATE users SET otp_code = ?, otp_expired_at = ? WHERE email = ?", [code, expiredAt, email]);
  }

  async findOTPByEmail(email) {
    const [rows] = await db.execute("SELECT id, email, otp_code, otp_expired_at FROM users WHERE email = ?", [email]);
    return rows[0];
  }

  async updatePasswordByEmail(email, hashedPassword) {
    return db.execute("UPDATE users SET password = ?, otp_code = NULL, otp_expired_at = NULL WHERE email = ?", [hashedPassword, email]);
  }

  async clearOTP(email) {
    return db.execute("UPDATE users SET otp_code = NULL, otp_expired_at = NULL WHERE email = ?", [email]);
  }

  // 3. Lấy tất cả user kèm tên từ profile (Doctor/Patient/Admin)
  async findAll(searchTerm = "", role = "") {
    let params = [];
    let sql = `
      SELECT u.id, u.email, u.role, u.active, u.created_at as createdAt,
             COALESCE(p.full_name, d.full_name, a.full_name) as fullName
      FROM users u
      LEFT JOIN patients p ON u.id = p.user_id
      LEFT JOIN doctors d ON u.id = d.user_id
      LEFT JOIN admin_profiles a ON u.id = a.user_id
      WHERE u.is_deleted = 0
    `;

    if (searchTerm) {
      sql += ` AND (u.email LIKE ? OR p.full_name LIKE ? OR d.full_name LIKE ?)`;
      const wrap = `%${searchTerm}%`;
      params.push(wrap, wrap, wrap);
    }

    if (role) {
      sql += ` AND u.role = ?`;
      params.push(role);
    }

    sql += " ORDER BY u.id DESC";
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  // 4. Đảo ngược trạng thái Active (Ban/Unban)
  async toggleStatus(userId) {
    const [result] = await db.execute(
      "UPDATE users SET active = NOT active, updated_at = NOW() WHERE id = ?", 
      [userId]
    );
    return result.affectedRows > 0;
  }

  // 5. Xóa mềm (Soft Delete)
  async softDelete(userId) {
    const [result] = await db.execute(
      "UPDATE users SET is_deleted = 1, updated_at = NOW() WHERE id = ?", 
      [userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new UserRepository();