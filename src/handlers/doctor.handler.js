const doctorService = require("../services/doctor.service");

const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("Doctor Handler Error:", error);
    callback({ code: 13, message: error.message || "Lỗi Server" });
  }
};

const mapToProto = (d) => ({
  id: d.id,
  fullName: d.full_name,
  email: d.email || "",
  phone: d.phone || "",
  position: d.position || "",
  description: d.description || "",
  price: d.price || 0,
  avatar: d.avatar || "",
  specialtyName: d.specialty_name || "",
  roomName: d.room_name || "",
  clinicName: d.clinic_name || "",
  active: d.active === 1
});

module.exports = {
  CreateDoctor: (call, callback) => {
    safeCall(callback, async () => {
      const newDoctor = await doctorService.createDoctor(call.request);
      return mapToProto(newDoctor);
    });
  },
  GetAllDoctors: (call, callback) => {
    console.log(">>> Dữ liệu Kreya gửi xuống:", JSON.stringify(call.request));
    safeCall(callback, async () => {
      const doctors = await doctorService.getAllDoctors(call.request);
      return { doctors: doctors.map(mapToProto) };
    });
  },
  GetDoctorById: (call, callback) => {
    safeCall(callback, async () => {
      const doctor = await doctorService.getDoctorById(call.request.id);
      return mapToProto(doctor);
    });
  },
  // --- THÊM KHÚC NÀY VÀO NÈ HUY ---
  AssignServiceToDoctor: (call, callback) => {
    console.log(">>> Request gán dịch vụ:", JSON.stringify(call.request));
    safeCall(callback, async () => {
      // Gọi đúng hàm assignServicesToDoctor bên Service
      return await doctorService.assignServicesToDoctor(call.request);
    });
  },
  GetDoctorServices: (call, callback) => {
    safeCall(callback, async () => {
        const result = await doctorService.getDoctorServices(call.request.id);
        
        // Dùng normalize('NFC') để chuẩn hóa tiếng Việt về đúng chuẩn UTF-8
        const cleanDoctorName = result.fullName ? String(result.fullName).normalize('NFC') : "Bác sĩ vô danh";

        return {
            success: true,
            doctorName: cleanDoctorName, // Gửi cái tên đã được làm sạch
            data: result.services.map(s => ({
                id: s.id,
                name: s.name ? String(s.name).normalize('NFC') : "",
                price: s.price
            }))
        };
    });
}
};