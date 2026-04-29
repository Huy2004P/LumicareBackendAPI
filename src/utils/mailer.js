const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * HÀM HELPER: Thiết kế một Layout Gradient duy nhất
 * @param {string} title - Tiêu đề chính trong Body
 * @param {string} message - Nội dung chi tiết
 * @param {string} badge - Mã OTP hoặc Trạng thái nổi bật
 */
const renderAppleTemplate = (title, message, badge) => {
  return `
  <div style="
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
    background:#f5f5f7;
    padding:40px 16px;
  ">

    <div style="
      max-width:520px;
      margin:0 auto;
      background:#ffffff;
      border-radius:18px;
      overflow:hidden;
      border:1px solid #e0e0e0;
    ">

      <!-- HEADER -->
      <div style="
        background:#000;
        padding:14px 20px;
        text-align:center;
      ">
        <span style="
          color:#fff;
          font-size:14px;
          letter-spacing:0.5px;
          font-weight:600;
        ">
          Lumicare
        </span>
      </div>

      <!-- CONTENT -->
      <div style="
        padding:48px 32px;
        text-align:center;
      ">

        <div style="
          font-size:28px;
          font-weight:600;
          color:#1d1d1f;
          letter-spacing:-0.3px;
          margin-bottom:12px;
        ">
          ${title}
        </div>

        <div style="
          font-size:17px;
          line-height:1.5;
          color:#1d1d1f;
          font-weight:400;
          margin-bottom:28px;
        ">
          ${message}
        </div>

        ${
          badge
            ? `
          <div style="margin:28px 0;">
            <span style="
              display:inline-block;
              padding:12px 22px;
              border-radius:999px;
              background:#0066cc;
              color:#fff;
              font-size:17px;
              font-weight:500;
              letter-spacing:2px;
            ">
              ${badge}
            </span>
          </div>
        `
            : ""
        }

        <a href="#" style="
          display:inline-block;
          margin-top:10px;
          padding:12px 22px;
          border-radius:999px;
          background:#0066cc;
          color:#fff;
          text-decoration:none;
          font-size:14px;
          font-weight:500;
        ">
          Tiếp tục
        </a>

        <div style="
          margin-top:32px;
          font-size:12px;
          color:#6e6e73;
          line-height:1.4;
        ">
          Email này được gửi tự động từ hệ thống Lumicare. Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.
        </div>

      </div>

      <div style="
        background:#f5f5f7;
        padding:16px;
        text-align:center;
        font-size:11px;
        color:#86868b;
      ">
        © Lumicare System
      </div>

    </div>
  </div>
  `;
};

// 1. Hàm cũ: Đăng ký thành công
const sendWelcomeEmail = async (toEmail, fullName) => {
  const title = "Chào mừng bạn đến với Lumicare";
  const message = `Chào <b>${fullName}</b>, bạn đã đăng ký thành công hệ thống Lumicare. Hãy bắt đầu hành trình chăm sóc sức khỏe của bạn ngay hôm nay!`;

  const html = renderAppleTemplate(title, message, "✓ VERIFIED");

  return transporter.sendMail({
    from: '"Lumicare" <lumicare.cskh@gmail.com>',
    to: toEmail,
    subject: "Đăng ký thành công - Lumicare",
    html
  });
};

// 2. Hàm cũ: OTP Quên mật khẩu
const sendOTPEmail = async (toEmail, otpCode) => {
  const title = "Khôi phục mật khẩu Lumicare";
  const message = "Nhập mã OTP bên dưới để tiếp tục quá trình khôi phục mật khẩu. Mã có hiệu lực trong 5 phút.";

  const html = renderAppleTemplate(title, message, otpCode);

  return transporter.sendMail({
    from: '"Lumicare Support" <lumicare.cskh@gmail.com>',
    to: toEmail,
    subject: `[${otpCode}] Mã xác thực Lumicare`,
    html
  });
};

// 3. Hàm mới: OTP Đổi mật khẩu trong App
const sendOTPChangePassword = async (toEmail, otpCode) => {
  const title = "Xác nhận đổi mật khẩu";
  const message = "Để đảm bảo an toàn tài khoản Lumicare, vui lòng nhập mã OTP để xác nhận thay đổi mật khẩu.";

  const html = renderAppleTemplate(title, message, otpCode);

  return transporter.sendMail({
    from: '"Lumicare Security" <lumicare.cskh@gmail.com>',
    to: toEmail,
    subject: `[${otpCode}] Xác nhận bảo mật Lumicare`,
    html
  });
};

// 4. Hàm mới: Thông báo thành công
const sendChangePasswordNotification = async (toEmail, fullName) => {
  const title = "Mật khẩu đã được thay đổi";
  const message = `Chào <b>${fullName}</b>, mật khẩu tài khoản Lumicare của bạn vừa được thay đổi thành công. Nếu không phải bạn thực hiện, hãy liên hệ ngay hỗ trợ.`;

  const html = renderAppleTemplate(title, message, "SECURED");

  return transporter.sendMail({
    from: '"Lumicare Security" <lumicare.cskh@gmail.com>',
    to: toEmail,
    subject: "Thông báo bảo mật - Lumicare",
    html
  });
};

module.exports = { 
  sendWelcomeEmail, 
  sendOTPEmail, 
  sendOTPChangePassword, 
  sendChangePasswordNotification 
};