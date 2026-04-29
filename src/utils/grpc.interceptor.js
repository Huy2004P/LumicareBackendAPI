const { verifyToken } = require("./jwt.util");
const db = require("../config/database");

const checkAuth = (handler) => {
  return async (call, callback) => {
    try {
      // 1. Lấy token từ metadata
      const metadata = call.metadata.getMap();
      const authHeader = metadata["authorization"];
      if (!authHeader) {
        console.log("[Auth] Missing Token");
        return callback({ code: 16, details: "Bạn cần đăng nhập để thực hiện thao tác này!" });
      }

      // 2. Tách chuỗi Bearer
      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        console.log("[Auth] Invalid Format");
        return callback({ code: 16, details: "Định dạng Token không đúng!" });
      }
      const token = parts[1].trim();
      // 3. Xác thực Token (Check xem token còn hạn không)
      const decoded = verifyToken(token);
      if (!decoded) {
        console.log("[Auth] Token Expired or Invalid");
        return callback({ code: 16, details: "Phiên đăng nhập hết hạn hoặc không hợp lệ!" });
      }
      // Kiểm tra trạng thái active của user trong DB
      const [rows] = await db.execute(
        "SELECT active FROM users WHERE id = ? AND is_deleted = 0 LIMIT 1", 
        [decoded.id]
      );
      // Nếu không tìm thấy user hoặc active = 0 thì chặn đứng tại đây
      if (rows.length === 0 || rows[0].active === 0) {
        console.log(`[Auth] Account Blocked: User ID ${decoded.id}`);
        return callback({ 
          code: 7, // PERMISSION_DENIED: Lỗi từ chối quyền truy cập
          details: "Tài khoản của bạn đã bị khóa hoặc không tồn tại. Vui lòng liên hệ Admin!" 
        });
      }
      // 5. Gắn thông tin người dùng vào call nếu mọi thứ đều XANH
      console.log(`[Auth] Success! User ID: ${decoded.id} - Role: ${decoded.role}`);
      call.user = decoded;
      // 6. Cho phép chạy tiếp vào Handler xử lý logic
      return handler(call, callback);
    } catch (error) {
      console.error("[Auth Error]:", error);
      return callback({ code: 13, details: "Lỗi xác thực hệ thống!" });
    }
  };
};

module.exports = checkAuth;