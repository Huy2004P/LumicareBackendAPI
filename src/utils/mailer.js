const nodemailer = require("nodemailer");

// Cấu hình vận chuyển
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "phathuy2004h@gmail.com", // Email của ông
    pass: "tbde igub dxap nvhc",    // 16 ký tự App Password Google cấp
  },
});

const sendWelcomeEmail = async (toEmail, fullName) => {
  const mailOptions = {
    from: '"BookingCare System" <phathuy2004h@gmail.com>',
    to: toEmail,
    subject: "Đăng ký tài khoản thành công - BookingCare",
    html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #2D9CDB;">Chào mừng ${fullName} đến với BookingCare!</h2>
        <p>Chúc mừng bạn đã đăng ký tài khoản thành công trên hệ thống của chúng tôi.</p>
        <p><b>Thông tin tài khoản:</b></p>
        <ul>
          <li>Email: ${toEmail}</li>
          <li>Trạng thái: Đã kích hoạt</li>
        </ul>
        <p>Giờ đây bạn đã có thể đặt lịch khám với các bác sĩ hàng đầu ngay trên ứng dụng.</p>
        <hr />
        <p style="font-size: 12px; color: #888;">Đây là email tự động, vui lòng không phản hồi thư này.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Thêm vào file mailer.js của ông
const sendOTPEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    from: '"BookingCare Support" <phathuy2004h@gmail.com>',
    to: toEmail,
    subject: `[${otpCode}] Mã xác thực khôi phục mật khẩu`, // Đưa OTP lên tiêu đề để người dùng thấy ngay
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #2D9CDB; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">BookingCare</h1>
        </div>
        
        <div style="padding: 30px; background-color: white;">
          <h2 style="color: #333; text-align: center; margin-bottom: 10px;">Mã xác thực của bạn</h2>
          <p style="color: #666; text-align: center; line-height: 1.5;">
            Chào bạn, chúng tôi nhận được yêu cầu khôi phục mật khẩu. Vui lòng nhập mã dưới đây để tiếp tục:
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <div style="display: inline-block; background: #f4f7f9; padding: 15px 40px; border-radius: 8px; border: 2px dashed #2D9CDB;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2D9CDB;">${otpCode}</span>
            </div>
          </div>
          
          <div style="background-color: #fff9db; border-left: 4px solid #fcc419; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; color: #856404; font-size: 14px; text-align: center;">
              ⏱️ <b>Mã này sẽ hết hạn sau 5 phút</b>
            </p>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; line-height: 1.4;">
            Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này hoặc liên hệ bộ phận hỗ trợ nếu bạn lo ngại về bảo mật.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #aaa; font-size: 11px; margin: 0;">© 2024 BookingCare System - Phát Huy AGU</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Đừng quên export nó ra
module.exports = { sendWelcomeEmail, sendOTPEmail };