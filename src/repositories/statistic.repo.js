const db = require("../config/database");

class StatisticRepository {
  // Thống kê cho dashboard admin
  async getAdminDashboard() {
    const mainSql = `
      SELECT 
        (SELECT COUNT(*) FROM doctors WHERE is_deleted = 0) as total_docs,
        (SELECT COUNT(*) FROM patient_profiles WHERE is_deleted = 0) as total_pats,
        COUNT(CASE WHEN is_deleted = 0 THEN 1 END) as total_books,
        IFNULL(SUM(CASE WHEN status IN ('confirmed', 'completed', 'finished') AND is_deleted = 0 THEN price ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' AND is_deleted = 0 THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'confirmed' AND is_deleted = 0 THEN 1 END) as confirmed,
        COUNT(CASE WHEN status IN ('completed', 'finished') AND is_deleted = 0 THEN 1 END) as finished,
        COUNT(CASE WHEN status = 'cancelled' AND is_deleted = 0 THEN 1 END) as cancelled
      FROM bookings`;
    const [mainRes] = await db.execute(mainSql);
    const specialtySql = `
      SELECT 
        s.name as specialty_name, 
        COUNT(DISTINCT d.id) as doctor_count, 
        COUNT(CASE WHEN b.is_deleted = 0 THEN b.id END) as booking_count, 
        IFNULL(SUM(CASE WHEN b.status IN ('confirmed', 'finished') AND b.is_deleted = 0 THEN b.price ELSE 0 END), 0) as revenue
      FROM specialties s
      LEFT JOIN doctors d ON s.id = d.specialty_id AND d.is_deleted = 0
      LEFT JOIN bookings b ON d.id = b.doctor_id
      GROUP BY s.id 
      ORDER BY revenue DESC, doctor_count DESC`;
    const [specStats] = await db.execute(specialtySql);
    const monthlySql = `
      SELECT DATE_FORMAT(date, '%m/%Y') as label, SUM(price) as value
      FROM bookings 
      WHERE status IN ('confirmed', 'finished') AND is_deleted = 0
      GROUP BY label 
      ORDER BY MAX(date) ASC LIMIT 12`;
    const [monthlyRev] = await db.execute(monthlySql);
    const topDocSql = `
      SELECT d.id, d.full_name as name, 
      COUNT(CASE WHEN b.status IN ('confirmed', 'finished') AND b.is_deleted = 0 THEN 1 END) as total_done, 
      SUM(CASE WHEN b.status IN ('confirmed', 'finished') AND b.is_deleted = 0 THEN b.price ELSE 0 END) as revenue, 
      IFNULL(AVG(f.rating_doctor), 5.0) as rating
      FROM doctors d
      JOIN bookings b ON d.id = b.doctor_id
      LEFT JOIN feedbacks f ON d.id = f.doctor_id
      WHERE d.is_deleted = 0 AND b.is_deleted = 0
      GROUP BY d.id HAVING total_done > 0 ORDER BY revenue DESC LIMIT 5`;
    const [topDocs] = await db.execute(topDocSql);
    const genderSql = `SELECT COUNT(CASE WHEN gender = 'M' THEN 1 END) as male, COUNT(CASE WHEN gender = 'F' THEN 1 END) as female, COUNT(CASE WHEN gender NOT IN ('M', 'F') OR gender IS NULL THEN 1 END) as other FROM patient_profiles WHERE is_deleted = 0`;
    const [genderStats] = await db.execute(genderSql);
    return { ...mainRes[0], specialtyStats: specStats, revenueByMonth: monthlyRev, topDoctors: topDocs, demographics: genderStats[0] };
  }
}
module.exports = new StatisticRepository();