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

      // Map DB -> Proto
      return {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        fullName: profile.full_name || "",
        phone: profile.phone || "",
        avatar: profile.avatar || "",
        createdAt: profile.created_at ? new Date(profile.created_at).toISOString() : ""
      };
    });
  },

  // 2. Cập nhật Profile
  UpdateProfile: (call, callback) => {
    safeCall(callback, async () => {
      const userId = getUserIdFromContext(call);
      
      // call.request chứa: fullName, phone, avatar
      const updatedProfile = await profileService.updateProfile(userId, call.request);
      
      return {
        id: updatedProfile.id,
        email: updatedProfile.email,
        role: updatedProfile.role,
        fullName: updatedProfile.full_name || "",
        phone: updatedProfile.phone || "",
        avatar: updatedProfile.avatar || "",
        createdAt: updatedProfile.created_at ? new Date(updatedProfile.created_at).toISOString() : ""
      };
    });
  },

  // 3. Đổi mật khẩu
  ChangePassword: (call, callback) => {
    safeCall(callback, async () => {
      const userId = getUserIdFromContext(call);
      const { oldPassword, newPassword } = call.request;

      await profileService.changePassword(userId, oldPassword, newPassword);
      
      return { success: true, message: "Đổi mật khẩu thành công!" };
    });
  }
};