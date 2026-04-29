require("dotenv").config({ quiet: true });
const notificationService = require("./src/services/notification.service");

async function runTest() {
    console.log("🚀 [TEST SYSTEM] Đang bắt đầu trigger hệ thống thông báo...");

    // 🎯 SỬA ID Ở ĐÂY: Thay bằng ID tài khoản ông đang login trên điện thoại (Ví dụ: 22)
    const TARGET_USER_ID = 22; 

    const testData = {
        userId: TARGET_USER_ID, 
        message: "Lịch khám tại BookingCare của bạn đã được xác nhận! 🎉",
        title: "Xác nhận lịch hẹn",
        type: "BOOKING_SUCCESS"
    };

    try {
        console.log(`1. Đang gọi NotificationService để gửi tới User: ${TARGET_USER_ID}...`);
        
        // Hàm này của ông thường sẽ thực hiện 2 việc:
        // - Lưu vào Database
        // - PUBLISH vào Redis (để nổ chuông khi đang mở App)
        // - Gửi OneSignal Push (để nổ Banner khi tắt App)
        const result = await notificationService.sendNotification(
            testData.userId, 
            testData.message, 
            testData.type,
            testData.title
        );

        console.log("------------------------------------------");
        if (result && result.success) {
            console.log("✅ KẾT QUẢ: Server đã xử lý lệnh gửi thành công!");
            console.log("🔹 Nội dung:", testData.message);
            console.log("\n💡 BÂY GIỜ HÃY KIỂM TRA ĐIỆN THOẠI:");
            console.log("- Nếu đang mở App: Cái chuông phải tự nhảy số đỏ.");
            console.log("- Nếu tắt App: Phải có thông báo đẩy (Push) hiện lên.");
        } else {
            console.log("❌ KẾT QUẢ: Gửi thất bại!", result ? result.message : "Không có phản hồi từ Service");
        }
        console.log("------------------------------------------");

    } catch (error) {
        console.error("💥 Lỗi chí mạng khi chạy file test:", error);
    } finally {
        // Đợi 2 giây để các tiến trình Async (Redis/OneSignal) kịp hoàn tất
        setTimeout(() => {
            console.log("👋 Kết thúc phiên test. Nhấn Ctrl+C để thoát.");
            process.exit(0);
        }, 2000);
    }
}
runTest();s