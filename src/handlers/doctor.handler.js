const doctorService = require("../services/doctor.service");

const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("Doctor Handler Error:", error);
    callback({ code: 13, message: error.message || "Lỗi Server nội bộ" });
  }
};

const mapToProto = (d) => ({
  id: d.id,
  fullName: String(d.full_name || "").normalize('NFC'),
  email: d.email || "",
  phone: d.phone || "",
  position: String(d.position || "").normalize('NFC'),
  description: String(d.description || "").normalize('NFC'),
  price: parseFloat(d.price) || 0.0,
  avatar: d.avatar || "",
  specialtyName: String(d.specialty_name || "").normalize('NFC'),
  roomName: String(d.room_name || "").normalize('NFC'),
  clinicName: String(d.clinic_name || "").normalize('NFC'),
  active: d.active === 1,
  specialtyId: parseInt(d.specialty_id) || 0,
  rating: parseFloat(d.rating) || 5.0,
  roomId: parseInt(d.room_id) || 0
});

module.exports = {
  //tạo thông tin bác sĩ
  CreateDoctor: (call, callback) => {
    safeCall(callback, async () => {
      const newDoctor = await doctorService.createDoctor(call.request);
      return mapToProto(newDoctor);
    });
  },
  //Lấy danh sách bác sĩ
  GetAllDoctors: (call, callback) => {
    safeCall(callback, async () => {
      const doctors = await doctorService.getAllDoctors(call.request);
      return { doctors: doctors.map(mapToProto) };
    });
  },
  //Lấy chi tiết bác sĩ
  GetDoctorById: (call, callback) => {
    safeCall(callback, async () => {
      const doctor = await doctorService.getDoctorById(call.request.id);
      return mapToProto(doctor);
    });
  },
  //Gán dịch vụ cho bác sĩ
  AssignServiceToDoctor: (call, callback) => {
    safeCall(callback, async () => {
      return await doctorService.assignServicesToDoctor(call.request);
    });
  },
  //Lấy dịch vụ của bác sĩ
  GetDoctorServices: (call, callback) => {
    safeCall(callback, async () => {
      const result = await doctorService.getDoctorServices(call.request.id);
      return {
        success: true,
        doctorName: String(result.doctorName).normalize('NFC'),
        data: result.data.map(s => ({
          id: s.id,
          name: String(s.name).normalize('NFC'),
          price: parseFloat(s.price),
          description: String(s.description || "").normalize('NFC'),
          image: s.image || ""
        }))
      };
    });
  },
  //Search bác sĩ
  GlobalSearch: (call, callback) => {
    safeCall(callback, async () => {
      const { query, limit } = call.request;
      const searchResult = await doctorService.globalSearch(query, limit || 10);
      return {
        success: true,
        results: searchResult.map(item => ({
          id: item.id,
          name: String(item.name).normalize('NFC'),
          subTitle: String(item.subTitle).normalize('NFC'),
          avatar: item.avatar || "",
          type: item.type
        }))
      };
    });
  },
  //Cập nhật thông tin bác sĩ
  UpdateDoctor: (call, callback) => {
    safeCall(callback, async () => {
      const updatedDoctor = await doctorService.updateDoctor(call.request);
      return mapToProto(updatedDoctor);
    });
  },
  //Xoá bác sĩ
  DeleteDoctor: (call, callback) => {
    safeCall(callback, async () => {
      return await doctorService.deleteDoctor(call.request.id);
    });
  },
  //Thay đổi mật khẩu bác sĩ
  UpdateDoctorPassword: (call, callback) => {
    safeCall(callback, async () => {
      const { id, newPassword } = call.request;
      return await doctorService.updateDoctorPassword(id, newPassword);
    });
  },
  //Reset mật khẩu bác sĩ
  ResetDoctorPassword: (call, callback) => {
    safeCall(callback, async () => {
      return await doctorService.resetDoctorPassword(call.request.id);
    });
  }
};