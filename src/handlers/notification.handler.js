const notificationService = require("../services/notification.service");

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
  GetMyNotifications: (call, callback) => {
    safeCall(callback, async () => {
      const notifications = await notificationService.getMyNotifications(call.request.user_id);
      
      const data = notifications.map(n => ({
        id: n.id,
        user_id: n.user_id,
        message: n.message,
        type: n.type,
        is_read: n.is_read === 1,
        created_at: n.created_at ? new Date(n.created_at).toISOString() : ""
      }));

      return { success: true, data };
    });
  },

  MarkAsRead: (call, callback) => {
    safeCall(callback, async () => {
      await notificationService.markAsRead(call.request.id);
      return { success: true, message: "Đã đánh dấu đã đọc" };
    });
  }
};