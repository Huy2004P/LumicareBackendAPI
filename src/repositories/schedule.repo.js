const db = require("../config/database");

class ScheduleRepository {
  // 1. TẠO LỊCH HÀNG LOẠT (Thêm is_deleted = 0)
  async bulkCreate(scheduleDataArray) {
    // Thêm is_deleted = 0 vào cuối mỗi mảng con
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

  // 2. LẤY LỊCH KHÁM THEO NGÀY (Lọc Soft Delete 2 tầng)
  async getScheduleByDate(doctorId, date) {
    const sql = `
      SELECT s.id, s.time_type, s.max_booking, s.current_booking, a.value_vi as time_display
      FROM schedules s
      LEFT JOIN allcodes a ON s.time_type = a.\`key\` AND a.type = 'TIME'
      JOIN doctors d ON s.doctor_id = d.id
      WHERE s.doctor_id = ? AND s.date = ? 
      AND s.is_deleted = 0 AND d.is_deleted = 0 -- Chỉ lấy lịch nếu cả lịch và bác sĩ đều chưa xóa
      ORDER BY s.time_type ASC
    `;
    const [rows] = await db.execute(sql, [doctorId, date]);
    return rows;
  }
  
  // 3. XÓA ẢO LỊCH KHÁM (Mới bổ sung)
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

    // Soft delete những slot CHƯA có người đặt và KHÔNG nằm trong danh sách mới gửi lên
    async softDeleteOldSlots(doctorId, date, newTimeTypes) {
        let sql = `UPDATE schedules SET is_deleted = 1 
                   WHERE doctor_id = ? AND date = ? AND current_booking = 0`;
        const params = [doctorId, date];

        if (newTimeTypes.length > 0) {
            sql += ` AND time_type NOT IN (?)`;
            params.push(newTimeTypes);
        }
        return await db.query(sql, params);
    }
}

module.exports = new ScheduleRepository();