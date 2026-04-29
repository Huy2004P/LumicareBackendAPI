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
  let displayGender = p.gender;
  if (p.gender === 'M') displayGender = 'Nam';
  else if (p.gender === 'F') displayGender = 'Nữ';
  else if (p.gender === 'O') displayGender = 'Khác';

  return {
    id: p.id,
    user_id: p.owner_patient_id, 
    full_name: p.full_name,
    birthday: p.birthday ? new Date(p.birthday).toISOString().split('T')[0] : "",
    gender: displayGender,
    phone_number: p.phone,
    address: p.address,
    relationship: p.relationship
  };
};

module.exports = {
  // 1. Get List Profiles
  GetAllProfiles: (call, callback) => {
    safeCall(callback, async () => {
      const profiles = await service.getAllProfiles(call.request.user_id);
      return { success: true, data: profiles.map(mapToProto) };
    });
  },

  // 2. Create Profile
  CreateProfile: (call, callback) => {
    safeCall(callback, async () => {
      const newProfile = await service.createProfile(call.request);
      return mapToProto(newProfile);
    });
  },

  // 3. Update Profile
  UpdateProfile: (call, callback) => {
    safeCall(callback, async () => {
      const updatedProfile = await service.updateProfile(call.request);
      return mapToProto(updatedProfile, call.request.user_id);
    });
  },

  // 4. Delete Profile
  DeleteProfile: (call, callback) => {
    safeCall(callback, async () => {
      await service.deleteProfile(call.request.id, call.request.user_id);
      return { success: true, message: "Đã xóa hồ sơ thành công" };
    });
  },

  // 5. Get Detail Profile
  GetProfileById: (call, callback) => {
    safeCall(callback, async () => {
      const id = call.request.id;
      const userId = call.request.user_id || call.request.userId; 
      const profile = await service.getProfileDetail(id, userId);
      return mapToProto(profile);
    });
  },
};