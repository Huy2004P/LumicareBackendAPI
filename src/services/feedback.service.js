const feedbackRepo = require("../repositories/feedback.repo");
const notificationService = require("./notification.service");
const appointmentRepo = require("../repositories/appointment.repo");

class FeedbackService {
  async sendFeedback(data) {
    if (data.rating < 1 || data.rating > 5) throw new Error("Rating từ 1-5 sao thôi ông giáo!");
    
    const newFeedback = await feedbackRepo.create(data);

    // Bắn tin cho bác sĩ khi có đánh giá mới
    try {
        const bookingInfo = await appointmentRepo.getBookingById(data.booking_id);
        if (bookingInfo && bookingInfo.doctor_user_id) {
            await notificationService.sendNotification(
                bookingInfo.doctor_user_id,
                `Bạn vừa nhận được đánh giá ${data.rating}⭐ từ bệnh nhân: "${data.comment || 'Không có bình luận'}"`,
                'system',
                'Đánh giá mới'
            );
        }
    } catch (e) {
        console.error(">>> [Notification Error] Feedback alert:", e.message);
    }

    return newFeedback;
  }

  async getDoctorFeedbacks(doctorId) {
    const feedbacks = await feedbackRepo.getByDoctorId(doctorId);
    const totalRating = feedbacks.reduce((sum, item) => sum + item.rating, 0);
    const avg = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 5.0;

    return {
      success: true,
      data: feedbacks.map(f => ({
        id: f.id,
        patient_name: f.patient_name,
        rating: f.rating,
        comment: f.comment,
        created_at: f.created_at ? f.created_at.toISOString() : new Date().toISOString()
      })),
      average_rating: parseFloat(avg)
    };
  }

  async getAllFeedbacks() {
    const feedbacks = await feedbackRepo.getAll();
    return {
      success: true,
      data: feedbacks.map(f => ({
        id: f.id,
        patient_name: f.patient_name,
        doctor_name: f.doctor_name,
        booking_id: f.booking_id,
        rating: f.rating,
        comment: f.comment,
        created_at: f.created_at ? f.created_at.toISOString() : null
      }))
    };
  }
}

module.exports = new FeedbackService();