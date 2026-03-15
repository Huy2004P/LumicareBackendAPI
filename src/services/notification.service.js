const notificationRepo = require("../repositories/notification.repo");
const { sendRealtimeNotification } = require("../utils/notification.util");

class NotificationService {
  
  // --- INTERNAL USE: Các Service khác gọi để thông báo cho User ---
  async sendNotification(userId, message, type = 'system') {
    if (!userId) return; 
    
    try {
      // 1. Lưu vào Database (Lịch sử để xem lại)
      await notificationRepo.create({
        user_id: userId,
        message: message,
        type: type
      });

      // 2. Tự động xác định tiêu đề dựa trên loại (cho chuyên nghiệp)
      const title = this._generateTitle(type);

      // 3. Gửi tin thời gian thực qua Socket.io
      sendRealtimeNotification(userId, title, message, type);

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

  // --- API USE: Cho gRPC Handler gọi ---
  async getMyNotifications(userId) {
    if (!userId) throw new Error("Thiếu User ID!");
    return await notificationRepo.getByUserId(userId);
  }

  async markAsRead(id) {
    if (!id) throw new Error("Thiếu ID thông báo!");
    return await notificationRepo.markAsRead(id);
  }
}

module.exports = new NotificationService();