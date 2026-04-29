const db = require("../config/database");
const redisClient = require("../config/redis");

class NotificationRepository {
    // Tạo mới một thông báo
    async create(data) {
        const sql = `INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())`;
        const [result] = await db.execute(sql, [data.user_id, data.title, data.message, data.type]);
        const notification = {
            id: result.insertId,
            user_id: data.user_id,
            title: data.title,
            message: data.message,
            type: data.type,
            is_read: false,
            created_at: new Date().toISOString()
        };
        const redisKey = `notifications:user:${data.user_id}`;
        await redisClient.lPush(redisKey, JSON.stringify(notification));
        await redisClient.lTrim(redisKey, 0, 49); 
        return notification;
    }
    // Lấy tất cả thông báo của một người dùng
    async getByUserId(userId) {
        const redisKey = `notifications:user:${userId}`;
        const cachedData = await redisClient.lRange(redisKey, 0, -1);
        if (cachedData.length > 0) {
            return cachedData.map(item => JSON.parse(item));
        }
        const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50";
        const [rows] = await db.execute(sql, [userId]);
        const formattedRows = rows.map(row => ({
            ...row,
            is_read: row.is_read === 1,
            created_at: new Date(row.created_at).toISOString()
        }));
        if (formattedRows.length > 0) {
            const pipeline = redisClient.multi();
            [...formattedRows].reverse().forEach(item => pipeline.lPush(redisKey, JSON.stringify(item)));
            await pipeline.exec();
        }
        return formattedRows;
    }
    // Đánh dấu một thông báo là đã đọc
    async markAsRead(id, userId) {
        const [result] = await db.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [id, userId]);
        if (result.affectedRows > 0) {
            const redisKey = `notifications:user:${userId}`;
            const list = await redisClient.lRange(redisKey, 0, -1);
            for (let i = 0; i < list.length; i++) {
                let item = JSON.parse(list[i]);
                if (item.id == id) {
                    item.is_read = true;
                    await redisClient.lSet(redisKey, i, JSON.stringify(item));
                    break;
                }
            }
            return true;
        }
        return false;
    }
    // Đánh dấu tất cả thông báo của một người dùng là đã đọc
    async markAllAsRead(userId) {
        await db.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [userId]);
        await redisClient.del(`notifications:user:${userId}`);
        return true;
    }
}

module.exports = new NotificationRepository();