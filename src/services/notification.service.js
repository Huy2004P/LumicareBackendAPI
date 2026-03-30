const notificationRepo = require("../repositories/notification.repo");
const redisClient = require("../config/redis");
const OneSignal = require('onesignal-node');

const oneSignalClient = new OneSignal.Client(process.env.ONESIGNAL_APP_ID, process.env.ONESIGNAL_REST_API_KEY);

class NotificationService {
  async subscribeNotifications(userId, call) {
    const subscriber = redisClient.duplicate();
    await subscriber.connect();

    const channel = `channel:user:${userId}`;
    console.log(`📡 [gRPC Stream] User ${userId} đang lắng nghe kênh: ${channel}`);

    try {
      await subscriber.subscribe(channel, (message) => {
        const notificationData = JSON.parse(message);
        // Đẩy dữ liệu trực tiếp xuống Flutter qua stream
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

      // Xử lý khi Flutter ngắt kết nối (tắt App)
      call.on('cancelled', async () => {
        await subscriber.unsubscribe(channel);
        await subscriber.quit();
        console.log(`🔌 [gRPC Stream] User ${userId} đã ngắt kết nối.`);
      });

    } catch (error) {
      console.error("❌ Subscribe Error:", error);
      call.end(); // Đóng stream nếu lỗi
    }
  }

  async sendNotification(userId, message, type = 'system', title = null) {
    try {
      const finalTitle = title || this._generateTitle(type);
      const notificationData = await notificationRepo.create({
        user_id: userId,
        message,
        type,
        title: finalTitle
      });

      // Bắn OneSignal Push
      oneSignalClient.createNotification({
        contents: { 'vi': message, 'en': message },
        headings: { 'vi': finalTitle, 'en': finalTitle },
        include_external_user_ids: [userId.toString()],
        data: notificationData
      }).catch(e => console.error("OneSignal Error:", e.body));

      // Bắn Redis Pub/Sub
      await redisClient.publish(`channel:user:${userId}`, JSON.stringify(notificationData));

      return { success: true, message: "Sent", data: notificationData };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getMyNotifications(userId) {
    const data = await notificationRepo.getByUserId(userId);
    return { success: true, message: "Success", data };
  }

  async markAsRead(id, userId) {
    const success = await notificationRepo.markAsRead(id, userId);
    return { success, message: success ? "Updated" : "Failed" };
  }

  async markAllAsRead(userId) {
    const success = await notificationRepo.markAllAsRead(userId);
    return { success, message: success ? "All updated" : "Failed" };
  }

  _generateTitle(type) {
    const titles = { 'booking': 'Lịch hẹn mới 📅', 'treatment': 'Cập nhật điều trị 💊', 'system': 'Hệ thống 🔔' };
    return titles[type] || 'Thông báo mới';
  }
}

module.exports = new NotificationService();