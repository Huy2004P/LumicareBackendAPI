// src/utils/notification.util.js

/**
 * Gửi thông báo thời gian thực qua Socket.io
 */
const sendRealtimeNotification = (userId, title, message, type = 'system') => {
  try {
    if (global._io) {
      // Ép userId sang String ở đây luôn cho chắc
      const roomName = `user_${String(userId).replace(/['"]+/g, '')}`;
      global._io.to(roomName).emit("new_notification", {
        title: title,
        message: message,
        type: type,
        created_at: new Date().toISOString()
      });
      
      console.log(`>>> [Socket] Đang gửi vào phòng: ${roomName}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(">>> [Socket Error] Lỗi gửi tin:", error);
    return false;
  }
};

module.exports = { sendRealtimeNotification };