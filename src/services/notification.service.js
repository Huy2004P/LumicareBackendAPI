const notificationRepo = require("../repositories/notification.repo");

class NotificationService {
  
  // --- INTERNAL USE (Các Service khác gọi hàm này) ---
  // Ví dụ: bookingService gọi await notificationService.sendNotification(...)
  async sendNotification(userId, message, type = 'system') {
    if (!userId) return; 
    
    // Gọi Repo lưu vào DB
    // Lưu ý: Ta gộp tiêu đề và nội dung vào cột 'message' vì DB chỉ có 1 cột
    await notificationRepo.create({
      user_id: userId,
      message: message,
      type: type
    });
    
    console.log(`[NOTI] Sent to User ${userId}: ${message}`);
  }

  // --- API USE (Cho Handler gọi) ---
  
  // 1. Lấy danh sách
  async getMyNotifications(userId) {
    if (!userId) throw new Error("Thiếu User ID!");
    return await notificationRepo.getByUserId(userId);
  }

  // 2. Đánh dấu đã xem
  async markAsRead(id) {
    if (!id) throw new Error("Thiếu ID thông báo!");
    await notificationRepo.markAsRead(id);
    return true;
  }
}

module.exports = new NotificationService();