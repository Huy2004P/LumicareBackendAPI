const db = require("../config/database");

class FeedbackRepository {
  // Tạo feedback mới
  async create(data) {
    const sql = `
      INSERT INTO feedbacks (
        booking_id, patient_id, doctor_id, clinic_id, service_id, 
        rating_doctor, rating_clinic, rating_service, rating_booking, comment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      data.booking_id, data.patient_id,
      data.doctor_id || null, data.clinic_id || null, data.service_id || null,
      data.rating_doctor || 0, data.rating_clinic || 0, data.rating_service || 0,
      data.rating_booking || 0, data.comment || ""
    ]);
    return result.insertId;
  }
  // Lấy feedback theo điều kiện (doctor_id, clinic_id, service_id)
  async getByTarget(columnName, targetId) {
    const sql = `
      SELECT f.*, p.full_name as patient_name, u.avatar as patient_avatar
      FROM feedbacks f
      JOIN patients p ON f.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE f.${columnName} = ?
      ORDER BY f.created_at DESC
    `;
    const [rows] = await db.execute(sql, [targetId]);
    return rows;
  }
  // Lấy tất cả feedback
  async getAll() {
    const sql = `
      SELECT f.*, p.full_name as patient_name, d.full_name as doctor_name
      FROM feedbacks f
      JOIN patients p ON f.patient_id = p.id
      LEFT JOIN doctors d ON f.doctor_id = d.id
      ORDER BY f.created_at DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }
}

module.exports = new FeedbackRepository();