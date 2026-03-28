const profileService = require("../services/profile.service");

// Helper bọc lỗi
const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("Profile Handler Error:", error);
    callback({ code: 13, message: error.message || "Lỗi Server" });
  }
};

// Hàm lấy User ID từ call (Giả định Auth Interceptor đã chạy và gán user vào call)
const getUserIdFromContext = (call) => {
  // Cách 1: Nếu dùng grpc-js và interceptor gán vào call.user
  if (call.user && call.user.id) return call.user.id;
  
  // Cách 2: Nếu gửi qua metadata với key 'user_id' (Dùng khi test Postman)
  const meta = call.metadata.get('user_id');
  if (meta && meta.length > 0) return parseInt(meta[0]);

  throw new Error("Không tìm thấy thông tin xác thực (User ID)!");
};

module.exports = {
  // 1. Xem Profile
  GetMyProfile: (call, callback) => {
    safeCall(callback, async () => {
      const userId = getUserIdFromContext(call);
      const profile = await profileService.getMyProfile(userId);

      return {
        id: Number(profile.id),
        email: profile.email,
        role: profile.role,
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        avatar: profile.avatar || "",
        birthday: profile.birthday || "",
        createdAt: profile.createdAt || ""
      };
    });
  },

  // 2. Cập nhật Profile
  UpdateProfile: (call, callback) => {
    safeCall(callback, async () => {
      const userId = getUserIdFromContext(call);
      const updated = await profileService.updateProfile(userId, call.request);
      
      return {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        fullName: updated.fullName, // <--- PHẢI LÀ fullName
        phone: updated.phone,
        avatar: updated.avatar,
        birthday: updated.birthday,
        createdAt: updated.createdAt
      };
    });
  },

  // 1. Yêu cầu gửi OTP đổi mật khẩu
  RequestChangePasswordOTP: (call, callback) => {
    safeCall(callback, async () => {
      const userId = getUserIdFromContext(call);
      return await profileService.requestChangePasswordOTP(userId);
    });
  },

  // 2. Đổi mật khẩu
  ChangePassword: (call, callback) => {
    safeCall(callback, async () => {
      const userId = getUserIdFromContext(call);
      const { oldPassword, newPassword, otp } = call.request;

      await profileService.changePassword(userId, oldPassword, newPassword, otp);
      
      return { success: true, message: "Đổi mật khẩu thành công!" };
    });
  }
};