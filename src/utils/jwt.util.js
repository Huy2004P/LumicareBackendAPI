const jwt = require("jsonwebtoken");
require("dotenv").config();

// 1. Tạo Access Token
const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    console.error("❌ [JWT Error] JWT_SECRET is not defined in .env");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1h",
  });
};

// 2. Tạo Refresh Token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

// 3. Xác thực Access Token
const verifyToken = (token) => {
  try {
    console.log("🔑 [DEBUG] Chìa khóa Server đang giữ:", process.env.JWT_SECRET);
    // Không dùng fallback string để tránh sai lệch Key giữa các môi trường
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Log lỗi chi tiết để Huy biết tại sao Token tạch
    console.log("❌ [JWT Verify Error]:", error.message); 
    // Các lỗi phổ biến: "jwt expired" (hết hạn), "invalid signature" (sai key)
    return null;
  }
};

// 4. Xác thực Refresh Token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    console.log("❌ [Refresh Token Error]:", error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};