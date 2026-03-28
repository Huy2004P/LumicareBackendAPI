const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "phathuy2004h@gmail.com",
    pass: "tbde igub dxap nvhc", 
  },
});

/**
 * HÀM HELPER: Thiết kế một Layout Gradient duy nhất
 * @param {string} title - Tiêu đề chính trong Body
 * @param {string} message - Nội dung chi tiết
 * @param {string} badge - Mã OTP hoặc Trạng thái nổi bật
 */
const renderGradientTemplate = (title, message, badge) => {
  const mainColor = "#0D47A1"; // Xanh đậm
  const gradient = "linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
      <div style="background: ${gradient}; padding: 35px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 30px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;">BookingCare</h1>
      </div>
      
      <div style="padding: 40px 30px; background-color: white; text-align: center;">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">${title}</h2>
        <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 25px;">${message}</p>
        
        ${badge ? `
          <div style="margin: 30px 0;">
            <div style="display: inline-block; background: #f8f9fa; padding: 15px 45px; border-radius: 10px; border: 2px dashed ${mainColor};">
              <span style="font-size: 34px; font-weight: bold; color: ${mainColor}; letter-spacing: 6px;">${badge}</span>
            </div>
          </div>
        ` : ""}
        
        <p style="color: #999; font-size: 13px; margin-top: 30px;">
          Đây là email bảo mật từ hệ thống. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua thư này.
        </p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #888; font-size: 12px; margin: 0; font-weight: bold;">© 2024 BookingCare System - Phát Huy AGU</p>
      </div>
    </div>
  `;
};

// 1. Hàm cũ: Đăng ký thành công
const sendWelcomeEmail = async (toEmail, fullName) => {
  const title = "Chào mừng thành viên mới!";
  const message = `Chào <b>${fullName}</b>, chúc mừng bạn đã gia nhập hệ thống đặt lịch khám <b>BookingCare</b>. Hãy bắt đầu chăm sóc sức khỏe của mình ngay hôm nay!`;
  const html = renderGradientTemplate(title, message, "✓ XÁC NHẬN");

  return transporter.sendMail({
    from: '"BookingCare" <phathuy2004h@gmail.com>',
    to: toEmail,
    subject: "Đăng ký thành công",
    html
  });
};

// 2. Hàm cũ: OTP Quên mật khẩu
const sendOTPEmail = async (toEmail, otpCode) => {
  const title = "Khôi phục mật khẩu";
  const message = "Bạn vừa gửi yêu cầu khôi phục mật khẩu. Vui lòng nhập mã OTP dưới đây để tiếp tục. Mã có hiệu lực trong 5 phút.";
  const html = renderGradientTemplate(title, message, otpCode);

  return transporter.sendMail({
    from: '"BookingCare Support" <phathuy2004h@gmail.com>',
    to: toEmail,
    subject: `[${otpCode}] Mã xác thực khôi phục`,
    html
  });
};

// 3. Hàm mới: OTP Đổi mật khẩu trong App
const sendOTPChangePassword = async (toEmail, otpCode) => {
  const title = "Xác nhận đổi mật khẩu";
  const message = "Để đảm bảo an toàn, vui lòng nhập mã OTP dưới đây để xác nhận việc thay đổi mật khẩu của bạn.";
  const html = renderGradientTemplate(title, message, otpCode);

  return transporter.sendMail({
    from: '"BookingCare Security" <phathuy2004h@gmail.com>',
    to: toEmail,
    subject: `[${otpCode}] Xác nhận đổi mật khẩu`,
    html
  });
};

// 4. Hàm mới: Thông báo thành công
const sendChangePasswordNotification = async (toEmail, fullName) => {
  const title = "Đổi mật khẩu thành công";
  const message = `Chào <b>${fullName}</b>, mật khẩu tài khoản của bạn đã được thay đổi thành công vào lúc ${new Date().toLocaleString('vi-VN')}.`;
  const html = renderGradientTemplate(title, message, "● THÀNH CÔNG");

  return transporter.sendMail({
    from: '"BookingCare Security" <phathuy2004h@gmail.com>',
    to: toEmail,
    subject: "Thông báo bảo mật",
    html
  });
};

module.exports = { 
  sendWelcomeEmail, 
  sendOTPEmail, 
  sendOTPChangePassword, 
  sendChangePasswordNotification 
};