const db = require("../config/database");

class StatisticRepository {
  // --- DASHBOARD CHO BÁC SĨ (CHI TIẾT) ---
  async getDoctorDashboard(doctorId, from, to) {
    const mainSql = `
      SELECT 
        COUNT(CASE WHEN DATE(date) = CURDATE() THEN 1 END) as today_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        IFNULL(SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END), 0) as revenue,
        (SELECT IFNULL(AVG(rating), 5.0) FROM feedbacks WHERE doctor_id = ?) as avg_rating
      FROM bookings WHERE doctor_id = ? AND date BETWEEN ? AND ?
    `;
    const [mainStats] = await db.execute(mainSql, [doctorId, doctorId, from, to]);

    // 5 ca khám gần nhất kèm tên bệnh nhân
    const recentSql = `
      SELECT p.full_name as patient_name, b.time, b.status 
      FROM bookings b JOIN patients p ON b.patient_id = p.id
      WHERE b.doctor_id = ? ORDER BY b.date DESC, b.time DESC LIMIT 5
    `;
    const [recent] = await db.execute(recentSql, [doctorId]);

    // Hoạt động 7 ngày gần nhất (Biểu đồ)
    const weeklySql = `
      SELECT DATE_FORMAT(date, '%d/%m') as label, SUM(price) as value
      FROM bookings WHERE doctor_id = ? AND status = 'completed'
      AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY label ORDER BY date ASC
    `;
    const [weekly] = await db.execute(weeklySql, [doctorId]);

    return { ...mainStats[0], recent, weekly };
  }

  // --- DASHBOARD CHO ADMIN (KHỦNG) ---
  async getAdminDashboard(from, to) {
    const adminSql = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'doctor') as total_docs,
        (SELECT COUNT(*) FROM patients) as total_pats,
        (SELECT COUNT(*) FROM bookings WHERE date BETWEEN ? AND ?) as total_books,
        (SELECT IFNULL(SUM(price), 0) FROM bookings WHERE status = 'completed' AND date BETWEEN ? AND ?) as total_rev,
        (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled' AND date BETWEEN ? AND ?) as total_can
    `;
    const [adminMain] = await db.execute(adminSql, [from, to, from, to, from, to]);

    // Top 3 bác sĩ xuất sắc nhất (Sửa từ full_name thành email)
    const topDocsSql = `
      SELECT u.email as name, COUNT(b.id) as total_done, SUM(b.price) as revenue
      FROM bookings b 
      JOIN users u ON b.doctor_id = u.id
      WHERE b.status = 'completed' 
      GROUP BY b.doctor_id 
      ORDER BY revenue DESC 
      LIMIT 3
    `;
    const [topDocs] = await db.execute(topDocsSql);

    // Top 3 dịch vụ được đặt nhiều nhất
    const topServicesSql = `
      SELECT s.name, COUNT(b.id) as usage_count
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      GROUP BY b.service_id
      ORDER BY usage_count DESC
      LIMIT 3
    `;
    const [topServices] = await db.execute(topServicesSql);

    // Doanh thu theo tháng
    const monthlySql = `
      SELECT DATE_FORMAT(date, 'Tháng %m') as label, SUM(price) as value
      FROM bookings 
      WHERE status = 'completed' 
      GROUP BY label 
      ORDER BY date ASC 
      LIMIT 12
    `;
    const [monthly] = await db.execute(monthlySql);

    return { ...adminMain[0], topDocs, topServices, monthly };
  }
}

module.exports = new StatisticRepository();