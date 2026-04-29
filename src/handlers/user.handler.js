const userService = require("../services/user.service");

const userHandler = {
  getAllUsers: async (call, callback) => {
    try {
      const users = await userService.listUsers(call.request);
      callback(null, { users });
    } catch (e) { callback(e); }
  },

  toggleUserStatus: async (call, callback) => {
    try {
      const success = await userService.toggleActive(call.request.id);
      callback(null, { success, message: success ? "Đã thay đổi trạng thái" : "Thất bại" });
    } catch (e) { callback(null, { success: false, message: e.message }); }
  },

  resetPassword: async (call, callback) => {
    try {
      const success = await userService.resetPass(call.request.id);
      callback(null, { success, message: success ? "Mật khẩu đã reset về Password123@" : "Thất bại" });
    } catch (e) { callback(null, { success: false, message: e.message }); }
  },

  deleteUser: async (call, callback) => {
    try {
      const success = await userService.removeUser(call.request.id);
      callback(null, { success, message: "Đã xóa user thành công" });
    } catch (e) { callback(null, { success: false, message: e.message }); }
  },

  changePassword: async (call, callback) => {
    try {
      const { userId, oldPassword, newPassword, email } = call.request;
      const result = await userService.changePassword(userId, oldPassword, newPassword, email);
      
      callback(null, result);
    } catch (e) {
      callback(null, { success: false, message: e.message });
    }
  }
};

module.exports = userHandler;