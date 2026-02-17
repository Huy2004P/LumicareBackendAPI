const db = require("../config/database");

class ScheduleRepository {
  
  // 1. TẠO LỊCH HÀNG LOẠT (Bulk Insert)
  async bulkCreate(scheduleDataArray) {
    // scheduleDataArray là mảng 2 chiều: [[docId, date, 'T1', ...], [docId, date, 'T2', ...]]
    
    // Dùng INSERT IGNORE để nếu trùng lịch (Doctor + Date + TimeType) thì bỏ qua, không lỗi
    const sql = `
      INSERT IGNORE INTO schedules (doctor_id, date, time_type, max_booking, current_booking, created_at, updated_at)
      VALUES ?
    `;
    
    // Với thư viện mysql2, truyền mảng 2 chiều vào dấu ? sẽ tự động map thành (v1), (v2)...
    const [result] = await db.query(sql, [scheduleDataArray]);
    return result.affectedRows;
  }

  // 2. LẤY LỊCH KHÁM THEO NGÀY
  async getScheduleByDate(doctorId, date) {
    // Join với bảng allcodes để lấy text hiển thị (VD: "8:00 - 9:00") thay vì chỉ lấy "T1"
    const sql = `
      SELECT s.id, s.time_type, s.max_booking, s.current_booking, 
             a.value_vi as time_display
      FROM schedules s
      LEFT JOIN allcodes a ON s.time_type = a.keyMap AND a.type = 'TIME'
      WHERE s.doctor_id = ? AND s.date = ?
      ORDER BY s.time_type ASC
    `;
    // Lưu ý: Tùy database của ông cột trong allcodes là 'key' hay 'keyMap'. 
    // Theo file master_data.proto thì là 'key', nhưng trong DB thực tế thường là 'keyMap'. 
    // Tui để 'keyMap' theo chuẩn chung, nếu lỗi ông đổi thành 'key' nhé.
    
    const [rows] = await db.execute(sql, [doctorId, date]);
    return rows;
  }
  
  // 3. Kiểm tra xem lịch đã tồn tại chưa (Optional - dùng nếu không thích INSERT IGNORE)
  async checkExist(doctorId, date, timeType) {
    const [rows] = await db.execute(
        "SELECT id FROM schedules WHERE doctor_id=? AND date=? AND time_type=?", 
        [doctorId, date, timeType]
    );
    return rows.length > 0;
  }
}

module.exports = new ScheduleRepository();