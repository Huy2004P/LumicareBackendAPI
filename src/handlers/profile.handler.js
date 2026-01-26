// src/handlers/profile.handler.js
const profileService = require("../services/profile.service");

// 1. Xem Profile
const getMyProfile = async (call, callback) => {
  try {
    // call.user lấy từ Interceptor (Token)
    const userId = call.user.id;

    const data = await profileService.getProfile(userId);

    // Mapping data từ Service sang Proto (đề phòng service trả về dư/thiếu trường)
    const response = {
      id: data.id,
      email: data.email,
      role: data.role,
      fullName: data.fullName,
      phone: data.phone,
      avatar: data.avatar,
      createdAt: data.createdAt ? data.createdAt.toString() : "",
    };

    callback(null, response);
  } catch (error) {
    callback({ code: 13, details: error.message });
  }
};

// 2. Cập nhật Profile
const updateProfile = async (call, callback) => {
  try {
    const userId = call.user.id;
    const { fullName, phone, avatar } = call.request;

    // Gọi service update
    await profileService.updateProfile(userId, {
      full_name: fullName,
      phone,
      avatar,
    });

    // Lấy lại data mới nhất để trả về
    const newData = await profileService.getProfile(userId);

    callback(null, {
      id: newData.id,
      email: newData.email,
      role: newData.role,
      fullName: newData.fullName,
      phone: newData.phone,
      avatar: newData.avatar,
      createdAt: newData.createdAt ? newData.createdAt.toString() : "",
    });
  } catch (error) {
    callback({ code: 13, details: error.message });
  }
};

// 3. Đổi mật khẩu
const changePassword = async (call, callback) => {
  try {
    const userId = call.user.id;
    const { oldPassword, newPassword } = call.request;

    await profileService.changePassword(userId, { oldPassword, newPassword });

    callback(null, { success: true, message: "Password changed successfully" });
  } catch (error) {
    // Nếu sai pass cũ, trả về lỗi Invalid Argument (code 3) hoặc Internal (13)
    callback({ code: 3, details: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  changePassword,
};
