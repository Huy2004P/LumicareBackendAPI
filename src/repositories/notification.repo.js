const db = require("../config/database");
const redisClient = require("../config/redis"); // Import file redis ông đã tạo

class NotificationRepository {
  
  async create(data) {
    // 1. Lưu vào MySQL (Lưu trữ lâu dài)
    const sql = `
      INSERT INTO notifications (user_id, message, type, is_read, created_at) 
      VALUES (?, ?, ?, 0, NOW())
    `;
    const [result] = await db.execute(sql, [data.user_id, data.message, data.type]);
    const insertId = result.insertId;

    // 2. Cấu trúc Object để lưu vào Redis (Khớp với Proto)
    const notification = {
      id: insertId,
      user_id: data.user_id,
      title: data.title || "Thông báo mới",
      message: data.message,
      type: data.type,
      is_read: false,
      created_at: new Date().toISOString()
    };

    const redisKey = `notifications:user:${data.user_id}`;
    
    // 3. Đẩy vào đầu List trong Redis
    await redisClient.lPush(redisKey, JSON.stringify(notification));
    
    // 4. Chỉ giữ lại 50 tin mới nhất trong Redis để tiết kiệm RAM
    await redisClient.lTrim(redisKey, 0, 49);

    return insertId;
  }

  async getByUserId(userId) {
    const redisKey = `notifications:user:${userId}`;
    
    // 1. Thử lấy từ Redis trước (Ưu tiên RAM)
    const cachedData = await redisClient.lRange(redisKey, 0, -1);
    
    if (cachedData.length > 0) {
      console.log(`⚡ Lấy thông báo User ${userId} từ Redis`);
      return cachedData.map(item => JSON.parse(item));
    }

    // 2. Nếu Redis trống (mới restart hoặc data cũ), lấy từ MySQL
    console.log(`🏠 Lấy thông báo User ${userId} từ MySQL`);
    const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50";
    const [rows] = await db.execute(sql, [userId]);
    
    // 3. Đổ ngược lại vào Redis để lần sau lấy cho nhanh
    if (rows.length > 0) {
      for (const row of rows.reverse()) { // Đảo ngược để lPush đúng thứ tự
        await redisClient.lPush(redisKey, JSON.stringify(row));
      }
    }
    
    return rows;
  }

  async markAsRead(id) {
    // Xử lý đơn giản: Update DB, sau đó Clear Cache Redis để User tự load lại bản mới
    const sql = "UPDATE notifications SET is_read = 1 WHERE id = ?";
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new NotificationRepository();