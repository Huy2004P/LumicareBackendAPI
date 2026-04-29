const authService = require("../services/auth.service");

//hàm bọc lỗi
const safeCall = async (callback, func) => {
  try {
    const result = await func(); 
    callback(null, result);
  } catch (error) {
    console.error("Auth Handler Error:", error);
    callback({ code: 13, message: error.message || "Lỗi Server" }); 
  }
};

module.exports = {
  // 1. Đăng ký
  register: (call, callback) => {
    safeCall(callback, async () => await authService.register(call.request));
  },

  // 2. Đăng nhập
  login: (call, callback) => {
    const { email, password } = call.request;
    safeCall(callback, async () => await authService.login(email, password));
  },

  // 3. Refresh Token
  refreshToken: (call, callback) => {
    const { refreshToken } = call.request;
    safeCall(callback, async () => await authService.refreshToken(refreshToken));
  },

  // 4. Đăng xuất
  logout: (call, callback) => {
    safeCall(callback, async () => await authService.logout());
  },

  // 5. Quên mật khẩu
  forgotPassword: (call, callback) => {
    safeCall(callback, async () => {
      // Đảm bảo authService.forgotPassword trả về { success, message }
      return await authService.forgotPassword(call.request.email);
    });
  },

  // 6. Xác thực mã OTP (Fix lỗi response rỗng)
  VerifyOTP: (call, callback) => {
    const { email, otp } = call.request;
    safeCall(callback, async () => {
      return await authService.verifyOTP(email, otp);
    });
  },

  // 7. Reset Password
  resetPassword: (call, callback) => {
    safeCall(callback, async () => {
      const { email, otp, new_password } = call.request;
      // Truyền new_password xuống Service
      return await authService.resetPassword(email, otp, new_password);
    });
  }
};