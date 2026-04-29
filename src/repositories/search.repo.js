const db = require("../config/database");

class SearchRepository {
  // Tìm kiếm tổng quát: Bác sĩ, Chuyên khoa, Dịch vụ
  async globalSearch(query, limit = 15) {
    const searchTerm = `%${query}%`;
    const sql = `
      SELECT 
        d.id as id, 
        'DOCTOR' as type, 
        d.full_name as title, 
        s.name as subtitle, 
        d.avatar as image --
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      WHERE d.full_name LIKE ? AND u.is_deleted = 0
      UNION ALL
      SELECT 
        id, 'SPECIALTY' as type, name as title, 
        'Chuyên khoa' as subtitle, image as image
      FROM specialties
      WHERE name LIKE ? AND is_deleted = 0
      UNION ALL
      SELECT 
        id, 'SERVICE' as type, name as title, 
        'Dịch vụ y tế' as subtitle, image as image
      FROM services
      WHERE name LIKE ? AND is_deleted = 0
      LIMIT ?
    `;
    try {
      const [rows] = await db.execute(sql, [searchTerm, searchTerm, searchTerm, limit]);
      return rows;
    } catch (err) {
      console.error("[SQL Error] Lỗi trong Search Repo:", err.message);
      throw err;
    }
  }
  // Lấy gợi ý tìm kiếm (chỉ trả về tên, không có hình ảnh hay subtitle)
  async getSuggestions(query, limit = 5) {
      const searchTerm = `%${query}%`;
      const sql = `
        SELECT d.full_name as keyword FROM doctors d WHERE d.full_name LIKE ?
        UNION
        SELECT name as keyword FROM specialties WHERE name LIKE ?
        UNION
        SELECT name as keyword FROM services WHERE name LIKE ?
        LIMIT ?
      `;
      const [rows] = await db.execute(sql, [searchTerm, searchTerm, searchTerm, limit]);
      return rows.map(r => r.keyword);
  }
}

module.exports = new SearchRepository();