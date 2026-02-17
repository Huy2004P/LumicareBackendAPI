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
const mapToProto = (p) => ({
  id: p.id,
  user_id: p.owner_patient_id, // DB là owner_patient_id
  full_name: p.full_name,
  birthday: p.birthday ? new Date(p.birthday).toISOString().split('T')[0] : "", // Format YYYY-MM-DD
  gender: p.gender,
  phone_number: p.phone,       // DB là phone -> Proto là phone_number
  address: p.address,
  relationship: p.relationship
});

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
      const profile = await service.getProfileById(call.request.id);
      return mapToProto(profile);
    });
  }
};