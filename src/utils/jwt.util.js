// Tạo json web token cho người dùng, không sửa được, có hạn sử dụng.
// Cấu trúc là header.payload.signature
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 1. Create Access Token (Đổi tên từ signToken -> generateToken)
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "khoa_bi_mat_123", {
    expiresIn: process.env.JWT_EXPIRE || "1d",
  });
};

// 2. Create Refresh Token (Đổi tên từ signRefreshToken -> generateRefreshToken)
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || "khoa_refresh_456",
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
    }
  );
};

// 3. Verify Access Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "khoa_bi_mat_123");
  } catch (error) {
    return null;
  }
};

// 4. Verify Refresh Token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || "khoa_refresh_456"
    );
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken, // Export đúng tên này
  generateRefreshToken, // Export đúng tên này
  verifyToken,
  verifyRefreshToken,
};
