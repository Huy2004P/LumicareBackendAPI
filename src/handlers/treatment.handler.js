const treatmentService = require("../services/treatment.service");

const TreatmentHandler = {
  // Lấy chi tiết ca khám (Có kèm thuốc và lời dặn)
  GetTreatmentByBooking: async (call, callback) => {
    try {
      const { booking_id } = call.request;
      const data = await treatmentService.getTreatmentDetail(booking_id);

      callback(null, {
        success: true,
        message: "Lấy thông tin điều trị thành công",
        data: {
          diagnosis: data.diagnosis,
          symptoms: data.symptoms,
          treatment_plan: data.treatment_plan,
          re_exam_date: data.re_exam_date,
          instructions: data.instructions || [], // Lời dặn (bảng treatments)
          medicines: data.medicines || []       // THÊM DÒNG NÀY: Thuốc (bảng prescriptions)
        }
      });
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  },

  // Lấy danh sách kết quả khám (Giữ nguyên cái này của ông)
  GetUserMedicalRecords: async (call, callback) => {
    try {
      const { user_id } = call.request;
      const records = await treatmentService.getMedicalRecords(user_id);

      callback(null, {
        success: true,
        message: "Lấy danh sách hồ sơ khám thành công",
        data: records.map(r => ({
          booking_id: r.booking_id,
          exam_date: r.exam_date,
          doctor_name: r.doctor_name,
          diagnosis: r.diagnosis || "Chưa có chẩn đoán",
          specialty_name: r.specialty_name
        }))
      });
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  }
};

module.exports = TreatmentHandler;