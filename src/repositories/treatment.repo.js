const db = require("../config/database");

class TreatmentRepository {
  async getByBookingId(bookingId) {
  try {
    // 1. Query lấy thông tin chung và danh sách chỉ dẫn (treatments)
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

    // 2. Query lấy danh sách thuốc (prescriptions) - JOIN với bảng drugs để lấy tên thuốc
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

    // 3. Gom tất cả lại thành một Object hoàn chỉnh
    return {
      diagnosis: firstRow.diagnosis || "",
      symptoms: firstRow.symptoms || "",
      treatment_plan: firstRow.treatment_plan || "",
      re_exam_date: firstRow.re_exam_date || "",
      
      // Mảng Lời dặn (từ bảng treatments)
      instructions: rows
        .filter(r => r.t_name !== null)
        .map(r => ({
          name: r.t_name,
          times: r.t_times,
          instruction: r.t_inst
        })),

      // Mảng Thuốc (từ bảng prescriptions + drugs)
      medicines: medicineRows.map(m => ({
        medicine_name: m.drug_name,
        quantity: m.quantity,
        instruction: m.drug_instruction
      }))
    };

  } catch (error) {
    console.error("❌ Error in Treatment Repo (Full):", error.message);
    throw error;
  }
}

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
    console.error("❌ SQL Error in getUserMedicalRecords:", error.message);
    throw error;
  }
}
}

module.exports = new TreatmentRepository();