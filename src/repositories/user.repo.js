const db = require("../config/database");

class UserRepository {
  //LOGIN
  async findByEmail(email) {
    // Thêm log ở đây
    console.log(`[REPO] Đang tìm email: ${email} trong DB...`);

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    // Log kết quả thô từ MySQL
    console.log(`[REPO] Kết quả MySQL trả về:`, rows);

    return rows[0];
  }

  async create(userData) {
    const { email, password, role } = userData;
    const [result] = await db.query(
      "INSERT INTO users (email, password, role, active, created_at, updated_at) VALUES (?, ?, ?, 1, NOW(), NOW())",
      [email, password, role]
    );
    return result.insertId;
  }

  //USER-PROFILE
  async findById(id) {
    const [rows] = await db.query(
      "SELECT id, email, role, active, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  async updatePassword(id, newPassword) {
    const [result] = await db.query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
      [newPassword, id]
    );
    return result.affectedRows > 0;
  }

  async updatePasswordByEmail(email, newPassword) {
    const [result] = await db.query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?",
      [newPassword, email]
    );
    return result.affectedRows > 0;
  }

  async findPasswordById(id) {
    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }
}

module.exports = new UserRepository();
