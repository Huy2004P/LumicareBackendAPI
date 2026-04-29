// File: src/interceptors/auth.interceptor.js
const { verifyToken } = require("../utils/jwt.util"); // Lùi ra 1 cấp để vào utils

const checkAuth = (handler) => {
  return async (call, callback) => {
    try {
      // 1. Lấy metadata
      const metadata = call.metadata.getMap();
      const authHeader = metadata["authorization"];
      if (!authHeader) {
        return callback({ code: 16, details: "Missing Authorization Token" });
      }
      // 2. Cắt chuỗi Bearer
      const token = authHeader.replace("Bearer ", "");
      // 3. Verify
      const decoded = verifyToken(token);
      if (!decoded) {
        return callback({ code: 16, details: "Invalid or Expired Token" });
      }
      // 4. OK -> Gắn user vào call
      call.user = decoded;
      await handler(call, callback);
    } catch (error) {
      console.error("Auth Interceptor Error:", error);
      callback({ code: 16, details: "Auth Failed" });
    }
  };
};

module.exports = checkAuth;
