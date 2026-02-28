const feedbackRepo = require("../repositories/feedback.repo");

class FeedbackService {
  async sendFeedback(data) {
    if (data.rating < 1 || data.rating > 5) throw new Error("Rating từ 1-5 sao thôi ông giáo!");
    return await feedbackRepo.create(data);
  }

  async getDoctorFeedbacks(doctorId) {
    const feedbacks = await feedbackRepo.getByDoctorId(doctorId);
    
    // Tính điểm trung bình
    const totalRating = feedbacks.reduce((sum, item) => sum + item.rating, 0);
    const avg = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 5.0;

    return {
      success: true,
      data: feedbacks.map(f => ({
        id: f.id,
        patient_name: f.patient_name,
        rating: f.rating,
        comment: f.comment,
        created_at: f.created_at.toISOString()
      })),
      average_rating: parseFloat(avg)
    };
  }
}

module.exports = new FeedbackService();