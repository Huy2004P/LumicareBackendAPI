const notificationRepo = require("../repositories/notification.repo");
const redisClient = require("../config/redis");
const OneSignal = require('onesignal-node');

const oneSignalClient = new OneSignal.Client(process.env.ONESIGNAL_APP_ID, process.env.ONESIGNAL_REST_API_KEY);

class NotificationService {
  // Đăng kí gRPC stream để gửi thông báo thời gian thực
  async subscribeNotifications(userId, call) {
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    const channel = `channel:user:${userId}`;
    try {
      await subscriber.subscribe(channel, (message) => {
        const notificationData = JSON.parse(message);
        call.write({
          id: notificationData.id,
          user_id: notificationData.user_id,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          is_read: notificationData.is_read,
          created_at: notificationData.created_at
        });
      });
      call.on('cancelled', async () => {
        await subscriber.unsubscribe(channel);
        await subscriber.quit();
        console.log(`🔌 [gRPC Stream] User ${userId} đã ngắt kết nối.`);
      });
    } catch (error) {
      call.end(); // Đóng stream nếu lỗi
    }
  }
  // Gửi thông báo mới đến người dùng
  async sendNotification(userId, message, type = 'system', title = null) {
    try {
      const finalTitle = title || this._generateTitle(type);
      const notificationData = await notificationRepo.create({
        user_id: userId,
        message,
        type,
        title: finalTitle
      });
      // 1. OneSignal cho Mobile
      oneSignalClient.createNotification({
        contents: { 'vi': message, 'en': message },
        headings: { 'vi': finalTitle, 'en': finalTitle },
        include_external_user_ids: [userId.toString()],
        data: notificationData
      }).catch(e => console.error(e.body));
      await redisClient.publish(`channel:user:${userId}`, JSON.stringify(notificationData));
      if (global._io) {
        global._io.to(`user_${userId}`).emit("NEW_NOTIFICATION_EVENT", {
          title: finalTitle,
          message: message,
          type: type
        });
      }
      return { success: true, data: notificationData };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  // Lấy danh sách thông báo của người dùng
  async getMyNotifications(userId) {
    const data = await notificationRepo.getByUserId(userId);
    return { success: true, message: "Success", data };
  }
  // Đánh dấu thông báo đã đọc
  async markAsRead(id, userId) {
    const success = await notificationRepo.markAsRead(id, userId);
    return { success, message: success ? "Updated" : "Failed" };
  }
  // Đánh dấu tất cả thông báo của người dùng đã đọc
  async markAllAsRead(userId) {
    const success = await notificationRepo.markAllAsRead(userId);
    return { success, message: success ? "All updated" : "Failed" };
  }
  // Hàm phụ để tạo tiêu đề mặc định dựa trên loại thông báo
  _generateTitle(type) {
    const titles = { 'booking': 'Lịch hẹn mới 📅', 'treatment': 'Cập nhật điều trị 💊', 'system': 'Hệ thống 🔔' };
    return titles[type] || 'Thông báo mới';
  }
}

module.exports = new NotificationService();