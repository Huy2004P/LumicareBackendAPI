const paymentRepo = require("../repositories/payment.repo");
const notificationService = require("./notification.service");
const appointmentRepo = require("../repositories/appointment.repo");

class PaymentService {
    async getPaymentInstruction(data) {
        let price = 0;
        let transCode = "THANH TOAN DAT LICH";
        let bookingId = data.bookingId;

        if (bookingId === 0 || !bookingId) {
            price = data.totalPrice || 0;
            transCode = "THANH TOAN DICH VU";
        } else {
            const info = await paymentRepo.getBookingForPayment(bookingId);
            if (!info) throw new Error("Không tìm thấy đơn hàng!");
            
            price = info.price;
            transCode = `BK${info.id}`;
        }

        let qrUrl = "";
        let bankInfo = "";
        let message = "Vui lòng hoàn tất thanh toán";

        if (data.paymentMethod === 'PAY3') {
            qrUrl = `https://img.vietqr.io/image/vcb-0123456789-compact.jpg?amount=${price}&addInfo=${encodeURIComponent(transCode)}`;
            message = "Quét mã QR để thanh toán nhanh qua ứng dụng Ngân hàng";
        } 
        else if (data.paymentMethod === 'PAY2') {
            bankInfo = `Ngân hàng: VCB\nSTK: 0123456789\nChủ TK: VĂN BÁ PHÁT HUY\nNội dung: ${transCode}\nSố tiền: ${price}đ`;
            message = "Chuyển khoản thủ công qua số tài khoản bên dưới";
        } 
        else {
            message = "Bạn đã chọn thanh toán tiền mặt trực tiếp.";
        }

        return { 
            success: true, 
            qrUrl: qrUrl, 
            bankInfo: bankInfo, 
            message: message 
        };
    }

    async patientConfirmTransfer(bookingId, transactionId) {
        const ok = await paymentRepo.updatePaymentStatus(bookingId, 2, transactionId);
        
        if (ok) {
            try {
                const adminId = 1; 
                await notificationService.sendNotification(
                    adminId, 
                    `Yêu cầu duyệt thanh toán mới cho đơn #${bookingId}. Mã GD: ${transactionId} 💸`, 
                    'payment', 
                    'Xác nhận thanh toán'
                );
            } catch (e) { 
                console.error(">>> [Payment Notification Error]:", e.message); 
            }
        }
        
        return { success: ok, message: ok ? "Yêu cầu đã gửi! Vui lòng chờ xác nhận." : "Thất bại" };
    }

    async adminVerifyPayment(bookingId) {
    const ok = await paymentRepo.updatePaymentStatus(bookingId, 1);
    
    if (ok) {
        try {
            const bookingInfo = await appointmentRepo.getBookingById(bookingId);
            
            if (bookingInfo && bookingInfo.patient_user_id) {
                // 🎯 Kiểm tra nếu là PAY1 (Tiền mặt) thì thông báo kiểu khác
                let msg = `Thanh toán cho lịch hẹn #${bookingId} đã được xác nhận thành công. 🎉`;
                
                if (bookingInfo.payment_method === 'PAY1') {
                    msg = `Bác sĩ đã xác nhận thu tiền mặt cho lịch hẹn #${bookingId}. Cảm ơn bạn đã sử dụng dịch vụ! ✅`;
                }

                await notificationService.sendNotification(
                    bookingInfo.patient_user_id, 
                    msg, 
                    'payment', 
                    'Xác nhận thanh toán'
                );
            }
        } catch (e) { 
            console.error(">>> [Payment Notification Error]:", e.message); 
        }
    }
    
    return { success: ok, message: ok ? "Đã xác nhận thanh toán thành công!" : "Lỗi hệ thống" };
}

    async getPaymentStatus(bookingId) {
        const data = await paymentRepo.getStatus(bookingId);
        if (!data) throw new Error("Dữ liệu không tồn tại");
        return { status: data.payment_status, message: "Trạng thái đơn hàng" };
    }

    async getPaymentList(data) {
        const rows = await paymentRepo.getPaymentList(data.searchTerm, data.status);
        return { payments: rows };
    }
}

module.exports = new PaymentService();