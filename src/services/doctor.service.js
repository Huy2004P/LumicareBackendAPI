const doctorRepo = require("../repositories/doctor.repo");
const userRepo = require("../repositories/user.repo"); // Cần ông này để tạo Account
const bcrypt = require("bcryptjs");

class DoctorService {
  
  // --- LOGIC TẠO BÁC SĨ (Quan trọng nhất) ---
  async createDoctor(data) {
    // data: Là cục dữ liệu từ Client gửi lên (email, password, fullName...)

    // B1: Kiểm tra Email đã tồn tại chưa? (Gọi User Repo)
    const existingUser = await userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email này đã được sử dụng!");
    }

    // B2: Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // B3: Tạo Tài khoản User trước (Role = 'doctor') -> Gọi User Repo
    const userId = await userRepo.create({
      email: data.email,
      password: hashedPassword,
      role: 'doctor'
    });

    // B4: Chuẩn bị dữ liệu để lưu vào bảng Doctors
    // (Map từ camelCase của Client sang snake_case của Database)
    const doctorData = {
      user_id: userId,          // ID lấy từ bước 3
      full_name: data.fullName, // Client gửi fullName -> DB lưu full_name
      phone: data.phone,
      position: data.position,
      description: data.description,
      price: data.price,
      avatar: data.avatar,
      specialty_id: data.specialtyId,
      room_id: data.roomId
    };

    // B5: Tạo Hồ sơ Doctor -> Gọi Doctor Repo
    const doctorId = await doctorRepo.create(doctorData);

    // B6: Trả về thông tin chi tiết bác sĩ vừa tạo (để hiện lên UI Admin)
    return await this.getDoctorById(doctorId);
  }

  // --- LOGIC LẤY DANH SÁCH ---
  async getAllDoctors(filter) {
    // Xử lý nếu filter bị null
    const safeFilter = {
      searchTerm: filter.searchTerm || "",
      specialtyId: filter.specialtyId || 0,
      roomId: filter.roomId || 0
    };
    return await doctorRepo.findAll(safeFilter);
  }

  // --- LOGIC LẤY CHI TIẾT ---
  async getDoctorById(id) {
    const doctor = await doctorRepo.findById(id);
    if (!doctor) {
      throw new Error("Không tìm thấy bác sĩ này!");
    }
    return doctor;
  }
}

module.exports = new DoctorService();