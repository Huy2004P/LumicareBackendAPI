const statisticRepo = require("../repositories/statistic.repo");

class StatisticService {
  // Lấy dữ liệu tổng hợp cho dashboard admin
  async getAdminDashboard(data) {
    try {
      const res = await statisticRepo.getAdminDashboard();
      const safe = (v) => parseFloat(v) || 0;
      return {
        success: true,
        total_doctors: res.total_docs || 0,
        total_patients: res.total_pats || 0,
        total_bookings: res.total_books || 0,
        total_revenue: safe(res.total_revenue),
        booking_status_breakdown: {
          pending: res.pending || 0,
          confirmed: res.confirmed || 0,
          finished: res.finished || 0,
          cancelled: res.cancelled || 0
        },
        specialty_stats: (res.specialtyStats || []).map(s => ({
          specialty_name: s.specialty_name,
          doctor_count: s.doctor_count,
          booking_count: s.booking_count,
          revenue: safe(s.revenue)
        })),
        revenue_by_month: (res.revenueByMonth || []).map(m => ({
          label: m.label,
          value: safe(m.value)
        })),
        top_doctors: (res.topDoctors || []).map(d => ({
          id: d.id,
          name: d.name,
          total_done: d.total_done,
          revenue: safe(d.revenue),
          rating: safe(d.rating)
        })),
        demographics: {
          male_count: res.male || 0,
          female_count: res.female || 0,
          other_count: res.other || 0
        }
      };
    } catch (error) {
      console.error("Error in StatisticService:", error);
      return { success: false };
    }
  }
}

module.exports = new StatisticService();