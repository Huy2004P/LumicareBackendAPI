const authService = require("../services/auth.service");

const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("Auth Handler Error:", error);
    callback({ code: 13, message: error.message || "Lỗi Server" }); 
  }
};

const register = (call, callback) => safeCall(callback, () => authService.register(call.request));
const login = (call, callback) => safeCall(callback, () => authService.login(call.request.email, call.request.password));
const refreshToken = (call, callback) => safeCall(callback, () => authService.refreshToken(call.request.refreshToken));
const logout = (call, callback) => safeCall(callback, () => authService.logout());

const forgotPassword = (call, callback) => {
  safeCall(callback, async () => {
    const msg = await authService.forgotPassword(call.request.email);
    return { success: true, message: msg };
  });
};

const resetPassword = (call, callback) => {
  safeCall(callback, async () => {
    // PHẢI LÀ new_password ĐÚNG THEO FILE .PROTO CỦA ÔNG
    const { email, otp, new_password } = call.request;
    const msg = await authService.resetPassword(email, otp, new_password);
    return { success: true, message: msg };
  });
};

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword };