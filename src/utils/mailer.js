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
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
    background-color: #f5f5f7; /* {colors.canvas-parchment} */
    padding: 64px 16px;
    margin: 0;
  ">
    <div style="
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff; /* {colors.canvas} */
      border-radius: 18px; /* {rounded.lg} */
      overflow: hidden;
      /* Loại bỏ drop-shadow theo triết lý: shadow chỉ dành cho sản phẩm vật lý */
      border: 1px solid #e0e0e0; /* {colors.hairline} */
    ">

      <div style="
        background-color: #000000; /* {colors.surface-black} */
        padding: 12px 20px;
        text-align: center;
      ">
        <span style="
          color: #ffffff;
          font-size: 12px; /* {typography.nav-link} */
          font-weight: 400;
          letter-spacing: -0.12px;
        ">
          Lumicare
        </span>
      </div>

      <div style="padding: 64px 32px; text-align: center;">
        
        <h1 style="
          font-size: 28px; /* {typography.lead} */
          font-weight: 600; /* Apple headlines use 600 */
          color: #1d1d1f; /* {colors.ink} */
          margin: 0 0 16px 0;
          letter-spacing: -0.374px; /* Signature "Apple tight" tracking */
          line-height: 1.14;
        ">
          ${title}
        </h1>

        <p style="
          font-size: 17px; /* Apple runs paragraph at 17px */
          font-weight: 400;
          line-height: 1.47; /* Standard editorial leading */
          color: #1d1d1f;
          margin: 0 0 32px 0;
          letter-spacing: -0.374px;
        ">
          ${message}
        </p>

        ${
          badge
            ? `
          <div style="margin: 32px 0;">
            <div style="
              display: inline-block;
              padding: 14px 32px;
              border-radius: 9999px; /* {rounded.pill} */
              background-color: #f5f5f7; /* {colors.canvas-parchment} */
              color: #0066cc; /* {colors.primary} - Action Blue */
              font-size: 24px;
              font-weight: 600;
              letter-spacing: 4px;
              border: 1px solid #e0e0e0;
            ">
              ${badge}
            </div>
          </div>
        `
            : ""
        }

        <div style="
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid #f0f0f0;
          font-size: 12px; /* {typography.fine-print} */
          color: #7a7a7a; /* {colors.ink-muted-48} */
          line-height: 1.4;
        ">
          Email này được gửi tự động từ hệ thống bảo mật Lumicare. <br>
          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email để đảm bảo an toàn.
        </div>

      </div>

      <div style="
        background-color: #f5f5f7;
        padding: 24px;
        text-align: center;
        font-size: 10px; /* {typography.micro-legal} */
        color: #86868b;
      ">
        © 2026 Lumicare System. Bảo lưu mọi quyền.
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