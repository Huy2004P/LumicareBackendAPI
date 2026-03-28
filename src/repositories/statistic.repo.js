const db = require("../config/database");

class StatisticRepository {
  // --- DASHBOARD CHO BÁC SĨ (CHI TIẾT ĐẾN TỪNG ĐỒNG) ---
  async getDoctorDashboard(doctorId, from, to) {
    // 1. Chỉ số tổng quát, Đánh giá và Doanh thu cá nhân
    const mainSql = `
      SELECT 
        COUNT(CASE WHEN DATE(date) = CURDATE() THEN 1 END) as today_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        -- Tiền thực thu (Đã khám xong)
        IFNULL(SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END), 0) as actual_revenue,
        -- Tiền dự kiến (Đã xác nhận nhưng chưa khám)
        IFNULL(SUM(CASE WHEN status = 'confirmed' THEN price ELSE 0 END), 0) as expected_revenue,
        (SELECT IFNULL(AVG(rating), 5.0) FROM feedbacks WHERE doctor_id = ?) as avg_rating,
        (SELECT COUNT(*) FROM feedbacks WHERE doctor_id = ?) as total_feedbacks
      FROM bookings 
      WHERE doctor_id = ? AND date BETWEEN ? AND ?
    `;
    const [mainStats] = await db.execute(mainSql, [doctorId, doctorId, doctorId, from, to]);

    // 2. Phân khúc độ tuổi bệnh nhân (JOIN với patient_profiles qua profile_id)
    const ageSql = `
      SELECT 
        CASE 
          WHEN (YEAR(CURDATE()) - YEAR(pp.birthday)) < 18 THEN 'Nhi đồng (0-17)'
          WHEN (YEAR(CURDATE()) - YEAR(pp.birthday)) BETWEEN 18 AND 45 THEN 'Thanh niên (18-45)'
          ELSE 'Trung niên & Cao tuổi (45+)'
        END as group_name,
        COUNT(*) as count
      FROM bookings b
      JOIN patient_profiles pp ON b.profile_id = pp.id
      WHERE b.doctor_id = ?
      GROUP BY group_name
    `;
    const [ageGroups] = await db.execute(ageSql, [doctorId]);

    // 3. 5 ca khám gần nhất kèm tên từ profile và tên dịch vụ
    const recentSql = `
      SELECT pp.full_name as patient_name, b.time, b.status, IFNULL(s.name, 'Khám lẻ bác sĩ') as service_name
      FROM bookings b 
      JOIN patient_profiles pp ON b.profile_id = pp.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.doctor_id = ? 
      ORDER BY b.date DESC, b.time DESC LIMIT 5
    `;
    const [recent] = await db.execute(recentSql, [doctorId]);

    // 4. Hoạt động 7 ngày gần nhất (Số ca khám thành công)
    const weeklySql = `
      SELECT DATE_FORMAT(date, '%d/%m') as label, COUNT(*) as value
      FROM bookings 
      WHERE doctor_id = ? AND status = 'completed'
      AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY label ORDER BY date ASC
    `;
    const [weekly] = await db.execute(weeklySql, [doctorId]);

    return { ...mainStats[0], ageGroups, recent, weekly };
  }

  // --- DASHBOARD CHO ADMIN (SIÊU CẤP TÀI CHÍNH & VẬN HÀNH) ---
  async getAdminDashboard(from, to) {
    // 1. Chỉ số tổng quát, Trạng thái Booking và Phân tích dòng tiền
    const adminSql = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'doctor' AND is_deleted = 0) as total_docs,
        (SELECT COUNT(*) FROM patients WHERE is_deleted = 0) as total_pats,
        COUNT(*) as total_books,
        -- Tài chính Admin
        IFNULL(SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END), 0) as total_revenue,
        IFNULL(SUM(CASE WHEN status = 'cancelled' THEN price ELSE 0 END), 0) as lost_revenue,
        IFNULL(AVG(CASE WHEN status = 'completed' THEN price END), 0) as avg_revenue_per_booking,
        -- Trạng thái vận hành
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_cnt,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_cnt,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as finished_cnt,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_cnt
      FROM bookings WHERE date BETWEEN ? AND ?
    `;
    const [adminMain] = await db.execute(adminSql, [from, to]);

    // 2. Doanh thu và Phân bổ theo Chuyên khoa
    const specialtySql = `
      SELECT s.name as specialty_name, 
             COUNT(DISTINCT d.id) as doctor_count, 
             COUNT(b.id) as booking_count,
             IFNULL(SUM(CASE WHEN b.status = 'completed' THEN b.price ELSE 0 END), 0) as revenue
      FROM specialties s
      LEFT JOIN doctors d ON s.id = d.specialty_id
      LEFT JOIN bookings b ON d.id = b.doctor_id
      WHERE s.is_deleted = 0
      GROUP BY s.id
      ORDER BY revenue DESC
    `;
    const [specialtyStats] = await db.execute(specialtySql);

    // 3. Nhân khẩu học giới tính (Lấy từ bảng patient_profiles)
    const demographicSql = `
      SELECT 
        SUM(CASE WHEN gender IN ('Male', 'Nam') THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender IN ('Female', 'Nữ') THEN 1 ELSE 0 END) as female,
        SUM(CASE WHEN gender NOT IN ('Male', 'Female', 'Nam', 'Nữ') OR gender IS NULL THEN 1 ELSE 0 END) as other
      FROM patient_profiles
      WHERE is_deleted = 0
    `;
    const [demographics] = await db.execute(demographicSql);

    // 4. Top 5 Bác sĩ mang lại doanh thu cao nhất
    const topDocsSql = `
      SELECT d.full_name as name, 
             COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as total_done, 
             SUM(CASE WHEN b.status = 'completed' THEN b.price ELSE 0 END) as revenue, 
             IFNULL(AVG(f.rating), 5) as rating
      FROM doctors d
      JOIN bookings b ON d.id = b.doctor_id
      LEFT JOIN feedbacks f ON b.id = f.booking_id
      WHERE d.is_deleted = 0
      GROUP BY d.id 
      ORDER BY revenue DESC LIMIT 5
    `;
    const [topDocs] = await db.execute(topDocsSql);

    // 5. Doanh thu theo tháng (Line Chart doanh thu thực tế)
    const monthlySql = `
      SELECT DATE_FORMAT(date, '%m/%Y') as label, SUM(price) as value
      FROM bookings 
      WHERE status = 'completed' 
      GROUP BY label 
      ORDER BY MIN(date) ASC LIMIT 12
    `;
    const [monthly] = await db.execute(monthlySql);

    return { 
      ...adminMain[0], 
      specialtyStats, 
      demographics: demographics[0] || { male: 0, female: 0, other: 0 }, 
      topDocs, 
      monthly 
    };
  }
}

module.exports = new StatisticRepository();