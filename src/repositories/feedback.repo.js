const db = require("../config/database");

class FeedbackRepository {
  // Lưu đánh giá mới
  async create(data) {
    const sql = `
      INSERT INTO feedbacks (booking_id, patient_id, doctor_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      data.booking_id,
      data.patient_id,
      data.doctor_id,
      data.rating,
      data.comment
    ]);
    return result.insertId;
  }

  // Lấy danh sách + AVG Rating
  async getByDoctorId(doctorId) {
    const sql = `
      SELECT f.*, p.full_name as patient_name 
      FROM feedbacks f
      JOIN patients p ON f.patient_id = p.id
      WHERE f.doctor_id = ?
      ORDER BY f.created_at DESC
    `;
    const [rows] = await db.execute(sql, [doctorId]);
    return rows;
  }
}

module.exports = new FeedbackRepository();