const doctorRepo = require("../repositories/doctor.repo");
const userRepo = require("../repositories/user.repo");
const { hashPassword } = require("../utils/hash.util");

class DoctorService {
  async createDoctor(data) {
    // 1. Check Email
    const existingUser = await userRepo.findByEmail(data.email);
    if (existingUser) throw new Error("Email đã tồn tại!");

    // 2. Tao moi User
    const hashedPassword = await hashPassword(data.password);
    const newUserId = await userRepo.create({
      email: data.email,
      password: hashedPassword,
      role: "doctor",
      fullName: data.fullName,
      phone: data.phone,
    });

    // 3. Tao Doctor (Truyen roomId)
    const newDoctor = await doctorRepo.create({
      userId: newUserId,
      ...data, // data bao gom: roomId, specialtyId, ...
    });

    return { ...newDoctor, email: data.email };
  }

  //lay toan bo bac si
  async getAllDoctors(filter) {
    return await doctorRepo.findAll(filter);
  }

  //lay bac si theo id
  async getDoctorById(id) {
    const doctor = await doctorRepo.findById(id);
    if (!doctor) throw new Error("Không tìm thấy bác sĩ");
    return doctor;
  }
}

module.exports = new DoctorService();
