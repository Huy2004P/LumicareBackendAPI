const { verifyToken } = require("./jwt.util");

const checkAuth = (handler) => {
  return async (call, callback) => {
    try {
      const metadata = call.metadata.getMap();
      const authHeader = metadata["authorization"];

      // 1. Kiểm tra sự tồn tại của Token
      if (!authHeader) {
        console.log("❌ [Auth] Missing Token");
        return callback({ code: 16, details: "Bạn cần đăng nhập để thực hiện thao tác này!" });
      }

      // 2. Tách chuỗi Bearer (Xử lý cả viết hoa/thường và dấu cách)
      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        console.log("❌ [Auth] Invalid Format");
        return callback({ code: 16, details: "Định dạng Token không đúng (Bearer <token>)" });
      }

      const token = parts[1].trim();

      // 3. Xác thực Token
      const decoded = verifyToken(token);
      if (!decoded) {
        console.log("❌ [Auth] Token Expired or Invalid");
        return callback({ code: 16, details: "Phiên đăng nhập hết hạn hoặc không hợp lệ!" });
      }

      // 4. Gắn thông tin người dùng vào call để các Service phía sau sử dụng
      console.log(`✅ [Auth] Success! User ID: ${decoded.id} - Role: ${decoded.role}`);
      call.user = decoded;

      // 5. Cho phép chạy tiếp vào Handler
      return handler(call, callback);

    } catch (error) {
      console.error("🔥 [Auth Error]:", error);
      return callback({ code: 13, details: "Lỗi xác thực hệ thống!" });
    }
  };
};

module.exports = checkAuth;