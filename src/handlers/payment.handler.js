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

// 🎯 ĐẶT TÊN HÀM VIẾT HOA CHỮ ĐẦU CHO KHỚP VỚI PROTO
const GetPaymentInstruction = async (call, callback) => {
  const { bookingId, paymentMethod, totalPrice } = call.request;

  console.log("=======================================");
  console.log("🚀 [BACKEND] NHẬN REQUEST LẤY QR");
  console.log(`   - ID: ${bookingId}`);
  console.log(`   - Method: ${paymentMethod}`);
  console.log(`   - Price: ${totalPrice}`);
  console.log("=======================================");

  await safeCall(callback, async () => {
    return await paymentService.getPaymentInstruction({
      bookingId,
      paymentMethod,
      totalPrice
    });
  });
};

const PatientConfirmTransfer = async (call, callback) => {
  const { bookingId, transactionId } = call.request;
  await safeCall(callback, () => paymentService.patientConfirmTransfer(bookingId, transactionId));
};

const AdminVerifyPayment = async (call, callback) => {
  await safeCall(callback, () => paymentService.adminVerifyPayment(call.request.bookingId));
};

const GetPaymentStatus = async (call, callback) => {
  await safeCall(callback, () => paymentService.getPaymentStatus(call.request.bookingId));
};

const GetPaymentList = async (call, callback) => {
  await safeCall(callback, () => paymentService.getPaymentList(call.request));
};

// 🎯 EXPORT PHẢI VIẾT HOA CHỮ ĐẦU ĐỂ KHỚP VỚI SERVER.JS
module.exports = {
  GetPaymentInstruction,
  PatientConfirmTransfer,
  AdminVerifyPayment,
  GetPaymentStatus,
  GetPaymentList
};