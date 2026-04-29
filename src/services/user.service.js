const userRepository = require("../repositories/user.repo");
const bcrypt = require("bcryptjs");

class UserService {
  // Lấy danh sách User, có thể lọc theo searchTerm (tên hoặc email) và role
  async listUsers(filter) {
    return await userRepository.findAll(filter.searchTerm, filter.role);
  }
  //Chuyển đổi trạng thái active/inactive của User
  async toggleActive(id) {
    return await userRepository.toggleStatus(id);
  }
  // Reset mật khẩu về mặc định "Password123@"
  async resetPass(id) {
    const salt = bcrypt.genSaltSync(10);
    const hashedDefault = bcrypt.hashSync("Password123@", salt);
    return await userRepository.updatePassword(id, hashedDefault);
  }
  // Xóa mềm User (soft delete)
  async removeUser(id) {
    return await userRepository.softDelete(id);
  }
  // Đổi mật khẩu cho User, có thể dùng userId hoặc email để xác định User
  async changePassword(userId, oldPassword, newPassword, email) {
    try {
      let user;
      if (userId && userId > 0) {
        user = await userRepository.findPasswordById(userId);
      } else if (email) {
        user = await userRepository.findByEmail(email);
      }
      if (!user) {
        return { success: false, message: "Không tìm thấy tài khoản admin này!" };
      }
      const isMatch = bcrypt.compareSync(oldPassword, user.password);
      if (!isMatch) {
        return { success: false, message: "Mật khẩu hiện tại không đúng!" };
      }
      const salt = bcrypt.genSaltSync(10);
      const hashedNewPassword = bcrypt.hashSync(newPassword, salt);
      const success = await userRepository.updatePassword(user.id || userId, hashedNewPassword);
      return { 
        success, 
        message: success ? "Đổi mật khẩu thành công!" : "Lỗi khi cập nhật vào Database" 
      };
    } catch (error) {
      throw new Error("Lỗi Server: " + error.message);
    }
  }
}

module.exports = new UserService();