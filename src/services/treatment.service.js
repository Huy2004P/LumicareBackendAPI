const treatmentRepo = require("../repositories/treatment.repo");

class TreatmentService {
  // Lấy chi tiết điều trị theo bookingId
  async getTreatmentDetail(bookingId) {
    const data = await treatmentRepo.getByBookingId(bookingId);
    if (!data) throw new Error("Chưa có kết quả điều trị cho lịch hẹn này!");
    return data;
  }
  // Lấy tất cả hồ sơ y tế của người dùng
  async getMedicalRecords(userId) {
    const records = await treatmentRepo.getUserMedicalRecords(userId);
    return records;
  }
}

module.exports = new TreatmentService();