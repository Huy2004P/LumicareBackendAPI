const doctorService = require("../services/doctor.service");

// Hàm bọc lỗi (Try/Catch)
const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("Doctor Handler Error:", error);
    callback({ code: 13, message: error.message || "Lỗi Server" });
  }
};

// Hàm Helper: Chuyển đổi dữ liệu DB (snake_case) thành Proto (camelCase)
const mapToProto = (d) => ({
  id: d.id,
  fullName: d.full_name,       // DB: full_name -> Proto: fullName
  email: d.email || "",        // Lấy từ bảng users (đã join)
  phone: d.phone || "",
  position: d.position || "",
  description: d.description || "",
  price: d.price || 0,
  avatar: d.avatar || "",
  specialtyName: d.specialty_name || "", // Lấy từ bảng specialties
  roomName: d.room_name || "",           // Lấy từ bảng rooms
  clinicName: d.clinic_name || "",       // Lấy từ bảng clinics
  active: d.active === 1
});

module.exports = {
  // 1. Tạo bác sĩ
  CreateDoctor: (call, callback) => {
    safeCall(callback, async () => {
      // call.request chứa: email, password, fullName, specialtyId...
      const newDoctor = await doctorService.createDoctor(call.request);
      
      // Map kết quả trả về đúng định dạng DoctorResponse
      return mapToProto(newDoctor);
    });
  },

  // 2. Lấy danh sách
  GetAllDoctors: (call, callback) => {
    safeCall(callback, async () => {
      // call.request chứa: searchTerm, specialtyId...
      const doctors = await doctorService.getAllDoctors(call.request);
      
      return { 
        doctors: doctors.map(mapToProto) 
      };
    });
  },

  // 3. Lấy chi tiết
  GetDoctorById: (call, callback) => {
    safeCall(callback, async () => {
      const doctor = await doctorService.getDoctorById(call.request.id);
      return mapToProto(doctor);
    });
  }
};