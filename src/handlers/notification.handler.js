const notificationService = require("../services/notification.service");

module.exports = {
  StreamNotifications: (call) => {
    const { user_id } = call.request;
    notificationService.subscribeNotifications(user_id, call);
  },

  GetMyNotifications: async (call, callback) => {
    try {
      const response = await notificationService.getMyNotifications(call.request.user_id);
      callback(null, response);
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },

  MarkAsRead: async (call, callback) => {
    const { id, user_id } = call.request;
    const response = await notificationService.markAsRead(id, user_id);
    callback(null, response);
  },

  MarkAllAsRead: async (call, callback) => {
    const response = await notificationService.markAllAsRead(call.request.user_id);
    callback(null, response);
  },

  CreateNotification: async (call, callback) => {
    const { user_id, message, type, title } = call.request;
    const response = await notificationService.sendNotification(user_id, message, type, title);
    callback(null, { success: response.success, message: response.message });
  }
};