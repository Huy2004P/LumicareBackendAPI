const treatmentRepo = require("../repositories/treatment.repo");

class TreatmentService {
  // 1. Lấy chi tiết (Đã có)
  async getTreatmentDetail(bookingId) {
    const data = await treatmentRepo.getByBookingId(bookingId);
    if (!data) throw new Error("Chưa có kết quả điều trị cho lịch hẹn này!");
    return data;
  }

  // 2. Lấy danh sách (Thêm mới nè)
  async getMedicalRecords(userId) {
    const records = await treatmentRepo.getUserMedicalRecords(userId);
    return records; // Trả về mảng các dòng từ Repo
  }
}

module.exports = new TreatmentService();