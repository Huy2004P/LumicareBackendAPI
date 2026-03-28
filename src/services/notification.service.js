const notificationRepo = require("../repositories/notification.repo");
const redisClient = require("../config/redis");

class NotificationService {
  
  async sendNotification(userId, message, type = 'system') {
    if (!userId) return; 
    
    try {
      const title = this._generateTitle(type);

      // 1. Repo xử lý lưu DB và Cache vào Redis List
      const insertId = await notificationRepo.create({
        user_id: userId,
        message: message,
        type: type,
        title: title
      });

      // 2. Phát tín hiệu Pub/Sub (Real-time)
      const pubMessage = JSON.stringify({
        id: insertId,
        user_id: userId,
        title: title,
        message: message,
        type: type,
        created_at: new Date().toISOString()
      });

      await redisClient.publish(`channel:user:${userId}`, pubMessage);

    } catch (error) {
      console.error(">>> [Notification Service Error]:", error);
    }
  }

  _generateTitle(type) {
    const titles = {
      'booking': 'Lịch hẹn mới 📅',
      'treatment': 'Cập nhật điều trị 💊',
      'system': 'Thông báo hệ thống 🔔'
    };
    return titles[type] || 'Thông báo mới';
  }

  async getMyNotifications(userId) {
    return await notificationRepo.getByUserId(userId);
  }

  async markAsRead(id) {
    // Lưu ý: Khi markAsRead, ông nên xóa key Redis của User đó để nó sync lại từ DB
    const success = await notificationRepo.markAsRead(id);
    return success;
  }
}

module.exports = new NotificationService();