const db = require("../config/database");

class ScheduleRepository {
  // 1. TẠO LỊCH HÀNG LOẠT
  async bulkCreate(scheduleDataArray) {
    const finalData = scheduleDataArray.map(item => [...item, 0]); 
    const sql = `
        INSERT INTO schedules (doctor_id, date, time_type, max_booking, current_booking, created_at, updated_at, is_deleted)
        VALUES ?
        ON DUPLICATE KEY UPDATE 
            max_booking = VALUES(max_booking),
            updated_at = VALUES(updated_at),
            is_deleted = 0
    `;
    const [result] = await db.query(sql, [finalData]);
    return result.affectedRows;
  }

  // 2. LẤY LỊCH KHÁM - FIX CỘT 'key' TRONG ALLCODES
  async getScheduleByDate(doctorId, date) {
    console.log(`\n🔍 [DB Query] Đang tìm lịch cho Doctor: ${doctorId} vào ngày: ${date}`);

    const sql = `
      SELECT 
        s.id, 
        s.time_type, 
        s.max_booking, 
        s.current_booking, 
        a.value_vi as time_display 
      FROM schedules s
      /* Sửa từ key_map thành \`key\` (có dấu backtick) */
      LEFT JOIN allcodes a ON s.time_type = a.\`key\` AND a.type = 'TIME'
      JOIN doctors d ON s.doctor_id = d.id
      WHERE s.doctor_id = ? AND s.date = ? 
      AND s.is_deleted = 0 AND d.is_deleted = 0
      ORDER BY s.time_type ASC
    `;

    try {
      const [rows] = await db.execute(sql, [doctorId, date]);

      if (rows.length > 0) {
        console.log(`✅ [DB Result] Tìm thấy ${rows.length} slot:`);
        console.table(rows); 
      } else {
        console.log("⚠️ [DB Result] Không có lịch nào!");
      }

      return rows;
    } catch (error) {
      console.error("❌ [DB Error] Lỗi khi lấy lịch:", error.message);
      throw error;
    }
  }
  
  // 3. XÓA ẢO
  async deleteSchedule(id) {
    await db.execute("UPDATE schedules SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  async getBookedTimeTypes(doctorId, date) {
    const sql = `SELECT time_type FROM schedules 
                 WHERE doctor_id = ? AND date = ? AND current_booking > 0 AND is_deleted = 0`;
    const [rows] = await db.execute(sql, [doctorId, date]);
    return rows.map(row => row.time_type);
  }

  async softDeleteOldSlots(doctorId, date, newTimeTypes) {
    let sql = `UPDATE schedules SET is_deleted = 1 
               WHERE doctor_id = ? AND date = ? AND current_booking = 0`;
    const params = [doctorId, date];

    if (newTimeTypes && newTimeTypes.length > 0) {
        sql += ` AND time_type NOT IN (?)`;
        params.push(newTimeTypes);
    }
    return await db.query(sql, params);
  }
}

module.exports = new ScheduleRepository();