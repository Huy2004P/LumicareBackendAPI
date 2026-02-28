const notificationService = require("../services/notification.service");

// Helper bọc lỗi
const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("Notification Handler Error:", error);
    callback({ code: 13, message: error.message || "Lỗi Server" });
  }
};

module.exports = {
  // 1. Lấy danh sách thông báo
  GetMyNotifications: (call, callback) => {
    safeCall(callback, async () => {
      const notifications = await notificationService.getMyNotifications(call.request.user_id);
      
      // Map data DB -> Proto
      const data = notifications.map(n => ({
        id: n.id,
        user_id: n.user_id,
        message: n.message,
        type: n.type,
        is_read: n.is_read === 1, // Convert tinyint (0/1) sang boolean
        created_at: n.created_at ? new Date(n.created_at).toISOString() : ""
      }));

      return { success: true, data };
    });
  },

  // 2. Đánh dấu đã đọc
  MarkAsRead: (call, callback) => {
    safeCall(callback, async () => {
      await notificationService.markAsRead(call.request.id);
      return { success: true, message: "Đã đánh dấu đã đọc" };
    });
  }
};