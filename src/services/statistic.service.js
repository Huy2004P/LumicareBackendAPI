const statisticRepo = require("../repositories/statistic.repo");

class StatisticService {
  // --- MAPPING CHO DOCTOR DASHBOARD ---
  async getDoctorDashboard(data) {
    const res = await statisticRepo.getDoctorDashboard(data.doctor_id, data.from_date, data.to_date);
    
    // Hàm helper để ép kiểu số an toàn
    const safeFloat = (val) => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    return {
      success: true,
      total_patients_today: res.today_count || 0,
      pending_bookings: res.pending || 0,
      completed_bookings: res.completed || 0,
      cancelled_bookings: res.cancelled || 0,
      total_revenue: safeFloat(res.actual_revenue),
      average_rating: safeFloat(res.avg_rating),
      total_feedbacks: res.total_feedbacks || 0,
      
      // Biểu đồ hoạt động hàng tuần
      weekly_activity: (res.weekly || []).map(w => ({ 
        label: w.label, 
        value: safeFloat(w.value) 
      })),
      
      // Danh sách lịch hẹn gần đây
      recent_bookings: (res.recent || []).map(r => ({ 
        patient_name: r.patient_name, 
        time: r.time, 
        status: r.status,
        service_name: r.service_name 
      })),
      
      // Phân khúc độ tuổi
      patient_age_groups: (res.ageGroups || []).map(a => ({ 
        group_name: a.group_name, 
        count: a.count 
      }))
    };
  }

  // --- MAPPING CHO ADMIN DASHBOARD ---
  async getAdminDashboard(data) {
    const res = await statisticRepo.getAdminDashboard(data.from_date, data.to_date);
    
    // Hàm helper để ép kiểu số an toàn
    const safeFloat = (val) => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    return {
      success: true,
      // 1. Chỉ số tổng quát (Cards)
      total_doctors: res.total_docs || 0,
      total_patients: res.total_pats || 0,
      total_bookings: res.total_books || 0,
      total_revenue: safeFloat(res.total_revenue),
      growth_rate: 12.8, // Tạm thời để fix cứng hoặc tính toán thêm

      // 2. Trạng thái vận hành (Pie Chart)
      booking_status_breakdown: {
        pending: res.pending_cnt || 0,
        confirmed: res.confirmed_cnt || 0,
        finished: res.finished_cnt || 0,
        cancelled: res.cancelled_cnt || 0
      },

      // 3. Phân bổ chuyên khoa (Table/Bar Chart)
      specialty_stats: (res.specialtyStats || []).map(s => ({
        specialty_name: s.specialty_name,
        doctor_count: s.doctor_count || 0,
        booking_count: s.booking_count || 0,
        revenue: safeFloat(s.revenue)
      })),

      // 4. Biểu đồ doanh thu theo tháng (Line Chart)
      revenue_by_month: (res.monthly || []).reverse().map(m => ({ 
        label: m.label, 
        value: safeFloat(m.value) 
      })),

      // 5. Xếp hạng bác sĩ (Table)
      top_doctors: (res.topDocs || []).map(t => ({ 
        name: t.name, 
        total_done: t.total_done || 0, 
        revenue: safeFloat(t.revenue),
        rating: safeFloat(t.rating)
      })),

      // 6. Nhân khẩu học & Chất lượng
      demographics: {
        male_count: res.demographics.male || 0,
        female_count: res.demographics.female || 0,
        other_count: res.demographics.other || 0
      },
      overall_satisfaction_rate: safeFloat(res.satisfactionRate)
    };
  }
}

module.exports = new StatisticService();