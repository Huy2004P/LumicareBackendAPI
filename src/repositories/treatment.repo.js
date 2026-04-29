const db = require("../config/database");

class TreatmentRepository {
  // Lấy thông tin điều trị dựa trên booking_id
  async getByBookingId(bookingId) {
    try {
      const sqlBase = `
        SELECT 
          a.id as appointment_id,
          ar.diagnosis, 
          ar.symptoms, 
          ar.treatment_plan,
          DATE_FORMAT(ar.re_exam_date, '%Y-%m-%d') as re_exam_date,
          t.name as t_name,         
          t.times as t_times,       
          t.instruction as t_inst   
        FROM appointments a
        JOIN appointment_records ar ON a.id = ar.appointment_id
        LEFT JOIN treatments t ON a.id = t.appointment_id
        WHERE a.booking_id = ?
      `;
      const [rows] = await db.execute(sqlBase, [bookingId]);
      if (!rows || rows.length === 0) return null;
      const firstRow = rows[0];
      const appointmentId = firstRow.appointment_id;
      const sqlMedicines = `
        SELECT 
          d.name as drug_name,
          p.quantity,
          p.instruction as drug_instruction
        FROM prescriptions p
        JOIN drugs d ON p.drug_id = d.id
        WHERE p.appointment_id = ?
      `;
      const [medicineRows] = await db.execute(sqlMedicines, [appointmentId]);
      return {
        diagnosis: firstRow.diagnosis || "",
        symptoms: firstRow.symptoms || "",
        treatment_plan: firstRow.treatment_plan || "",
        re_exam_date: firstRow.re_exam_date || "",
        instructions: rows
          .filter(r => r.t_name !== null)
          .map(r => ({
            name: r.t_name,
            times: r.t_times,
            instruction: r.t_inst
          })),
        medicines: medicineRows.map(m => ({
          medicine_name: m.drug_name,
          quantity: m.quantity,
          instruction: m.drug_instruction
        }))
      };
    } catch (error) {
      throw error;
    }
  }
  // Lấy lịch sử khám bệnh của người dùng
  async getUserMedicalRecords(userId) {
    const sql = `
      SELECT 
        a.booking_id,
        DATE_FORMAT(ar.created_at, '%d/%m/%Y') as exam_date,
        d.full_name as doctor_name,
        ar.diagnosis,
        s.name as specialty_name
      FROM patients p
      JOIN bookings b ON p.id = b.patient_id
      JOIN appointments a ON b.id = a.booking_id
      JOIN appointment_records ar ON a.id = ar.appointment_id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN specialties s ON d.specialty_id = s.id
      WHERE p.user_id = ? AND a.status = 'done'
      ORDER BY ar.created_at DESC
    `; 
    try {
      const [rows] = await db.execute(sql, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TreatmentRepository();