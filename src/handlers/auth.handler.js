const authService = require("../services/auth.service");

// 1. ĐĂNG KÝ
const register = async (call, callback) => {
  try {
    // Lấy dữ liệu từ Postman gửi lên
    const { email, password, role, fullName, phone } = call.request;

    // Gọi Service xử lý
    const result = await authService.register({
      email,
      password,
      role,
      fullName,
      phone,
    });

    // SERVICE trả về: { id, email }
    // PROTO yêu cầu: { accessToken, refreshToken, user: {...} }
    // => Cần map dữ liệu (Vì đăng ký xong chưa có token ngay, nên để rỗng)
    callback(null, {
      accessToken: "",
      refreshToken: "",
      user: {
        id: result.id,
        email: result.email,
        role: role || "patient", // Mặc định là patient
        fullName: fullName || "",
        phone: phone || "",
        avatar: "",
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    // Code 3: INVALID_ARGUMENT (Lỗi input hoặc Email đã tồn tại)
    callback({ code: 3, details: error.message });
  }
};

// 2. ĐĂNG NHẬP
const login = async (call, callback) => {
  try {
    const { email, password } = call.request;

    // Gọi Service
    const result = await authService.login({ email, password });

    // SERVICE trả về: { accessToken, refreshToken, user }
    // PROTO yêu cầu: Y chang vậy
    // => Callback thẳng kết quả luôn
    callback(null, result);
  } catch (error) {
    console.error("Login Error:", error.message);
    // Code 16: UNAUTHENTICATED (Sai mật khẩu hoặc User không tồn tại)
    callback({ code: 16, details: error.message });
  }
};

// 3. REFRESH TOKEN
const refreshToken = async (call, callback) => {
  try {
    const { refreshToken } = call.request;

    // Gọi Service (lúc nãy đã sửa tên hàm trong service rồi nên giờ gọi ok)
    const result = await authService.refreshToken(refreshToken);

    // SERVICE trả về: { accessToken }
    // PROTO yêu cầu: { accessToken, refreshToken, user }
    callback(null, {
      accessToken: result.accessToken,
      refreshToken: refreshToken, // Trả lại token cũ (hoặc giữ nguyên luồng)
      user: null, // Refresh thì không cần trả về user info
    });
  } catch (error) {
    console.error("Refresh Token Error:", error.message);
    callback({ code: 16, details: error.message });
  }
};

// 4. ĐĂNG XUẤT
const logout = async (call, callback) => {
  // Logic đơn giản trả về thành công
  callback(null, { success: true, message: "Đăng xuất thành công" });
};

//5. QUÊN MẬT KHẨU.
const forgotPassword = async (call, callback) => {
  try {
    const { email } = call.request;
    console.log("Handler: Nhận yêu cầu quên mật khẩu cho:", email);

    //goi service login
    await authService.forgotPassword(email);

    //tra ve thanh cong
    callback(null, {
      success: true,
      message: "Mã OTP đã được gửi về email (Check Console Server)",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    callback({ code: 5, details: error.message });
  }
};

//6. ĐẶT LẠI MẬT KHẨU (CHECK OTP + ĐỔI PASSWORD)
const resetPassword = async (call, callback) => {
  try {
    const { email, otp, new_password } = call.request;
    console.log("Handler: Đang reset mật khẩu cho:", email);
    //map dữ liệu vào service (service đang đợi tham số là new_password)
    await authService.resetPassword({
      email,
      otp,
      newPassword: new_password, //chuyển từ proto sang service param.
    });

    callback(null, {
      success: true,
      message: "Đổi mật khẩu thành công, hãy đăng nhập lại.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    //code 3: invalid_argument (sai otp)
    callback({ code: 3, details: error.message });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};
