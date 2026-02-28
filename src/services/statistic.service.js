const statisticRepo = require("../repositories/statistic.repo");

class StatisticService {
  async getDoctorDashboard(data) {
    const res = await statisticRepo.getDoctorDashboard(data.doctor_id, data.from_date, data.to_date);
    return {
      total_patients_today: res.today_count,
      pending_bookings: res.pending,
      completed_bookings: res.completed,
      cancelled_bookings: res.cancelled,
      total_revenue: parseFloat(res.revenue),
      average_rating: parseFloat(res.avg_rating),
      weekly_activity: res.weekly.map(w => ({ label: w.label, value: parseFloat(w.value) })),
      recent_bookings: res.recent.map(r => ({ patient_name: r.patient_name, time: r.time, status: r.status }))
    };
  }

  async getAdminDashboard(data) {
    const res = await statisticRepo.getAdminDashboard(data.from_date, data.to_date);
    return {
      total_doctors: res.total_docs,
      total_patients: res.total_pats,
      total_bookings: res.total_books,
      total_revenue: parseFloat(res.total_rev),
      cancelled_bookings: res.total_can,
      growth_rate: 15.5, 
      revenue_by_month: res.monthly.map(m => ({ label: m.label, value: parseFloat(m.value) })),
      top_doctors: res.topDocs.map(t => ({ name: t.name, total_done: t.total_done, revenue: parseFloat(t.revenue) })),
      top_services: res.topServices.map(s => ({ name: s.name, usage_count: s.usage_count }))
    };
  }
}

module.exports = new StatisticService();