// File: src/utils/grpc.interceptor.js
const { verifyToken } = require("./jwt.util"); // Đảm bảo bạn đã có file jwt.util.js

const checkAuth = (handler) => {
  return async (call, callback) => {
    try {
      // 1. Lấy metadata (Header)
      const metadata = call.metadata.getMap();
      const authHeader = metadata["authorization"]; // gRPC key luôn là chữ thường

      if (!authHeader) {
        return callback({ code: 16, details: "Missing Authorization Token" });
      }

      // 2. Lấy token
      const token = authHeader.replace("Bearer ", "");

      // 3. Verify
      const decoded = verifyToken(token);
      if (!decoded) {
        return callback({ code: 16, details: "Invalid or Expired Token" });
      }

      // 4. Gắn user vào call và chạy tiếp
      call.user = decoded;
      await handler(call, callback);
    } catch (error) {
      console.error("Auth Error:", error);
      callback({ code: 16, details: "Auth Failed" });
    }
  };
};

module.exports = checkAuth;
