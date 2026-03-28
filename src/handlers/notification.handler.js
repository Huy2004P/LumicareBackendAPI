const notificationService = require("../services/notification.service");

module.exports = {
  GetMyNotifications: (call, callback) => {
    const safeCall = async () => {
      try {
        const notifications = await notificationService.getMyNotifications(call.request.user_id);
        
        const data = notifications.map(n => ({
          id: n.id,
          user_id: n.user_id,
          title: n.title || "Thông báo", // Thêm title
          message: n.message,
          type: n.type,
          is_read: n.is_read === 1 || n.is_read === true,
          created_at: n.created_at ? new Date(n.created_at).toISOString() : ""
        }));

        callback(null, { success: true, message: "Lấy danh sách thành công", data });
      } catch (error) {
        callback({ code: 13, message: error.message });
      }
    };
    safeCall();
  },

  MarkAsRead: (call, callback) => {
    notificationService.markAsRead(call.request.id)
      .then(() => callback(null, { success: true, message: "Đã đọc" }))
      .catch(e => callback({ code: 13, message: e.message }));
  }
};