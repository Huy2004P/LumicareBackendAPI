const feedbackRepo = require("../repositories/feedback.repo");

class FeedbackService {
  async sendFeedback(data) {
    return await feedbackRepo.create(data);
  }

  async getDoctorFeedbacks(id) {
    const data = await feedbackRepo.getByTarget('doctor_id', id);
    return this._formatResponse(data, 'rating_doctor');
  }

  async getClinicFeedbacks(id) {
    const data = await feedbackRepo.getByTarget('clinic_id', id);
    return this._formatResponse(data, 'rating_clinic');
  }

  async getServiceFeedbacks(id) {
    const data = await feedbackRepo.getByTarget('service_id', id);
    return this._formatResponse(data, 'rating_service');
  }

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

  async getAllFeedbacks() {
    const rows = await feedbackRepo.getAll();
    return { success: true, data: rows };
  }
}

module.exports = new FeedbackService();