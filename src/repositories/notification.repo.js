const db = require("../config/database");

class NotificationRepository {
  
  // 1. Tạo thông báo (Chỉ insert cột message, type)
  async create(data) {
    const sql = `
      INSERT INTO notifications (user_id, message, type, is_read, created_at) 
      VALUES (?, ?, ?, 0, NOW())
    `;
    // data.message sẽ chứa toàn bộ nội dung thông báo
    const [result] = await db.execute(sql, [
      data.user_id, 
      data.message, 
      data.type // 'booking', 'system'...
    ]);
    return result.insertId;
  }

  // 2. Lấy danh sách (Sắp xếp mới nhất lên đầu)
  async getByUserId(userId) {
    const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  }

  // 3. Đánh dấu đã đọc
  async markAsRead(id) {
    const sql = "UPDATE notifications SET is_read = 1 WHERE id = ?";
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new NotificationRepository();