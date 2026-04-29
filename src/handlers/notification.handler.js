const notificationService = require("../services/notification.service");

module.exports = {
  // Notifications
  StreamNotifications: (call) => {
    const { user_id } = call.request;
    notificationService.subscribeNotifications(user_id, call);
  },
  // Lấy danh sách thông báo của người dùng
  GetMyNotifications: async (call, callback) => {
    try {
      const response = await notificationService.getMyNotifications(call.request.user_id);
      callback(null, response);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },
  // Đánh dấu một thông báo là đã đọc
  MarkAsRead: async (call, callback) => {
    const { id, user_id } = call.request;
    const response = await notificationService.markAsRead(id, user_id);
    callback(null, response);
  },
  // Đánh dấu tất cả thông báo của người dùng là đã đọc
  MarkAllAsRead: async (call, callback) => {
    const response = await notificationService.markAllAsRead(call.request.user_id);
    callback(null, response);
  },
  // Tạo một thông báo mới cho người dùng
  CreateNotification: async (call, callback) => {
    const { user_id, message, type, title } = call.request;
    const response = await notificationService.sendNotification(user_id, message, type, title);
    callback(null, { success: response.success, message: response.message });
  }
};