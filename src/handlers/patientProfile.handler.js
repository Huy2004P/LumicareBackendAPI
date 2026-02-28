const service = require("../services/patientProfile.service");

// Helper bọc lỗi
const safeCall = async (callback, func) => {
  try {
    const result = await func();
    callback(null, result);
  } catch (error) {
    console.error("Profile Handler Error:", error);
    callback({ code: 13, message: error.message || "Lỗi Server" });
  }
};

// Hàm map DB Object -> Proto Object (Quan trọng để khớp tên cột)
const mapToProto = (p) => {
  // Logic chuyển đổi giới tính từ ký tự sang chữ
  let displayGender = p.gender;
  if (p.gender === 'M') displayGender = 'Nam';
  else if (p.gender === 'F') displayGender = 'Nữ';
  else if (p.gender === 'O') displayGender = 'Khác';

  return {
    id: p.id,
    user_id: p.owner_patient_id, 
    full_name: p.full_name,
    birthday: p.birthday ? new Date(p.birthday).toISOString().split('T')[0] : "",
    gender: displayGender, // Trả về "Nam" hoặc "Nữ" ở đây nè Huy!
    phone_number: p.phone,
    address: p.address,
    relationship: p.relationship
  };
};

module.exports = {
  // 1. Get List
  GetAllProfiles: (call, callback) => {
    safeCall(callback, async () => {
      const profiles = await service.getAllProfiles(call.request.user_id);
      // Map mảng kết quả
      return { success: true, data: profiles.map(mapToProto) };
    });
  },

  // 2. Create
  CreateProfile: (call, callback) => {
    safeCall(callback, async () => {
      const newProfile = await service.createProfile(call.request);
      return mapToProto(newProfile);
    });
  },

  // 3. Update
  UpdateProfile: (call, callback) => {
    safeCall(callback, async () => {
      const updatedProfile = await service.updateProfile(call.request);
      return mapToProto(updatedProfile);
    });
  },

  // 4. Delete
  DeleteProfile: (call, callback) => {
    safeCall(callback, async () => {
      await service.deleteProfile(call.request.id, call.request.user_id);
      return { success: true, message: "Đã xóa hồ sơ thành công" };
    });
  },

  // 5. Get One
  GetProfileById: (call, callback) => {
    safeCall(callback, async () => {
      // 🔍 DEBUG: Ông thêm dòng này để xem thực tế Node.js đang nhận tên trường là gì
      console.log(">>> Dữ liệu Kreya gửi lên thực tế:", call.request);

      // Thử đổi sang cách bóc tách an toàn cho cả 2 trường hợp (snake_case và camelCase)
      const id = call.request.id;
      const userId = call.request.user_id || call.request.userId; 

      const profile = await service.getProfileDetail(id, userId);
      return mapToProto(profile);
    });
  },
};