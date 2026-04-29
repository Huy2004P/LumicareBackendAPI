const feedbackRepo = require("../repositories/feedback.repo");

class FeedbackService {
  // Gửi phản hồi của bệnh nhân về bác sĩ, phòng khám, dịch vụ hoặc đặt lịch
  async sendFeedback(data) {
    return await feedbackRepo.create(data);
  }
  // Lấy phản hồi của bệnh nhân về bác sĩ, phòng khám, dịch vụ hoặc đặt lịch
  async getDoctorFeedbacks(id) {
    const data = await feedbackRepo.getByTarget('doctor_id', id);
    return this._formatResponse(data, 'rating_doctor');
  }
  // Lấy phản hồi của bệnh nhân về phòng khám
  async getClinicFeedbacks(id) {
    const data = await feedbackRepo.getByTarget('clinic_id', id);
    return this._formatResponse(data, 'rating_clinic');
  }
  // Lấy phản hồi của bệnh nhân về dịch vụ
  async getServiceFeedbacks(id) {
    const data = await feedbackRepo.getByTarget('service_id', id);
    return this._formatResponse(data, 'rating_service');
  }
  // Điều chỉnh phản hồi của bệnh nhân về bác sĩ, phòng khám, dịch vụ hoặc đặt lịch
  _formatResponse(rows, ratingCol) {
    const count = rows.length;
    const avg = count > 0 ? (rows.reduce((s, i) => s + i[ratingCol], 0) / count).toFixed(1) : 5.0;
    return {
      success: true,
      data: rows.map(f => ({
        id: f.id,
        patient_name: f.patient_name,
        patient_avatar: f.patient_avatar,
        rating_doctor: f.rating_doctor,
        rating_clinic: f.rating_clinic,
        rating_service: f.rating_service,
        rating_booking: f.rating_booking,
        comment: f.comment,
        created_at: f.created_at ? f.created_at.toISOString() : ""
      })),
      avg_rating: parseFloat(avg)
    };
  }
  // Lấy tất cả phản hồi (dành cho admin)
  async getAllFeedbacks() {
    const rows = await feedbackRepo.getAll();
    return { success: true, data: rows };
  }
}

module.exports = new FeedbackService();