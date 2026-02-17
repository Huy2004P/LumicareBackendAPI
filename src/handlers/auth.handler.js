const authService = require("../services/auth.service");

const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("Auth Handler Error:", error);
    // Mã lỗi 13 = INTERNAL ERROR trong gRPC
    callback({ code: 13, message: error.message || "Lỗi Server" }); 
  }
};

// --- ĐỊNH NGHĨA CÁC HÀM (Dùng camelCase cho chuẩn JS) ---

// 1. Register
const register = (call, callback) => {
  safeCall(callback, async () => {
    // call.request chứa: email, password, fullName, phone, role...
    console.log("Register Request:", call.request); // Log để debug
    const data = await authService.register(call.request);
    return data; 
  });
};

// 2. Login
const login = (call, callback) => {
  safeCall(callback, async () => {
    const { email, password } = call.request;
    const data = await authService.login(email, password);
    return data;
  });
};

// 3. Refresh Token
const refreshToken = (call, callback) => {
  callback(null, { 
      accessToken: "new_access_token_mock", 
      refreshToken: call.request.refreshToken 
  });
};

// 4. Logout
const logout = (call, callback) => {
  callback(null, { success: true, message: "Đăng xuất thành công" });
};

// 5. Forgot Password
const forgotPassword = (call, callback) => {
  safeCall(callback, async () => {
    const msg = await authService.forgotPassword(call.request.email);
    return { success: true, message: msg };
  });
};

// 6. Reset Password
const resetPassword = (call, callback) => {
  safeCall(callback, async () => {
    const { email, otp, new_password } = call.request;
    const msg = await authService.resetPassword(email, otp, new_password);
    return { success: true, message: msg };
  });
};

// --- XUẤT RA NGOÀI (Chỉ xuất 1 lần duy nhất) ---
module.exports = {
    register,
    login,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword
};