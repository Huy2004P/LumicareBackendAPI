const paymentService = require("../services/payment.service");

// Hàm bổ trợ bắt lỗi
const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("❌ [Payment Error]:", error);
    callback({ code: 13, message: error.message || "Lỗi nội bộ" });
  }
};

// Hàm xử lý lấy hướng dẫn thanh toán (QR code hoặc thông tin chuyển khoản)
const GetPaymentInstruction = async (call, callback) => {
  const { bookingId, paymentMethod, totalPrice } = call.request;
  await safeCall(callback, async () => {
    return await paymentService.getPaymentInstruction({
      bookingId,
      paymentMethod,
      totalPrice
    });
  });
};

// Hàm xử lý xác nhận đã chuyển khoản từ phía bệnh nhân
const PatientConfirmTransfer = async (call, callback) => {
  const { bookingId, transactionId } = call.request;
  await safeCall(callback, () => paymentService.patientConfirmTransfer(bookingId, transactionId));
};


// Hàm xử lý xác nhận thanh toán từ phía admin
const AdminVerifyPayment = async (call, callback) => {
  await safeCall(callback, () => paymentService.adminVerifyPayment(call.request.bookingId));
};


// Hàm xử lý lấy trạng thái thanh toán
const GetPaymentStatus = async (call, callback) => {
  await safeCall(callback, () => paymentService.getPaymentStatus(call.request.bookingId));
};

// Hàm xử lý lấy danh sách thanh toán (dành cho admin)
const GetPaymentList = async (call, callback) => {
  await safeCall(callback, () => paymentService.getPaymentList(call.request));
};

// Export các hàm xử lý để sử dụng trong server
module.exports = {
  GetPaymentInstruction,
  PatientConfirmTransfer,
  AdminVerifyPayment,
  GetPaymentStatus,
  GetPaymentList
};