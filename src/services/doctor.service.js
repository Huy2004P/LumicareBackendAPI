const doctorRepo = require("../repositories/doctor.repo");
const userRepo = require("../repositories/user.repo");
const masterDataRepo = require("../repositories/masterData.repo");
const bcrypt = require("bcryptjs");

class DoctorService {
  // Tạo mới bác sĩ và tài khoản người dùng liên quan
  async createDoctor(data) {
    const existingUser = await userRepo.findByEmail(data.email);
    if (existingUser) throw new Error("Email này đã được sử dụng!");
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userId = await userRepo.create({
      email: data.email,
      password: hashedPassword,
      role: 'doctor',
      fullName: data.fullName
    });
    const doctorId = await doctorRepo.create({
      user_id: userId,
      full_name: data.fullName,
      phone: data.phone,
      position: data.position,
      description: data.description,
      price: data.price,
      avatar: data.avatar,
      specialty_id: data.specialtyId,
      room_id: data.roomId
    });
    return await this.getDoctorById(doctorId);
  }
  // Lấy danh sách bác sĩ với bộ lọc an toàn
  async getAllDoctors(filter) {
    const safeFilter = {
      searchTerm: filter?.searchTerm || null,
      specialtyId: filter?.specialtyId || 0,
      roomId: filter?.roomId || 0
    };
    return await doctorRepo.findAll(safeFilter);
  }
  // Lấy thông tin chi tiết bác sĩ theo ID
  async getDoctorById(id) {
    const doctor = await doctorRepo.findById(id);
    if (!doctor) throw new Error("Không tìm thấy bác sĩ trong hệ thống!");
    return doctor;
  }
  // Gán dịch vụ cho bác sĩ với kiểm tra chuyên khoa chặt chẽ
  async assignServicesToDoctor(data) {
    const { doctorId, serviceIds } = data;
    const doctor = await doctorRepo.findById(doctorId);
    if (!doctor) throw new Error("Bác sĩ không tồn tại!");
    const masterServices = await masterDataRepo.getServicesByIds(serviceIds);
    if (!masterServices || masterServices.length === 0) {
      throw new Error("Danh sách dịch vụ cung cấp không hợp lệ!");
    }
    for (const service of masterServices) {
      if (service.specialty_id !== doctor.specialty_id) {
        throw new Error(`Dịch vụ "${service.name}" không thuộc chuyên khoa của bác sĩ ${doctor.full_name}!`);
      }
    }
    await doctorRepo.assignServices(doctorId, serviceIds);
    return { success: true, message: "Cập nhật danh sách dịch vụ thành công!" };
  }
  // Lấy danh sách dịch vụ mà bác sĩ đang cung cấp
  async getDoctorServices(doctorId) {
    const doctor = await this.getDoctorById(doctorId);
    const services = await doctorRepo.getServicesByDoctorId(doctorId);
    return {
      doctorName: doctor.full_name,
      data: services
    };
  }
  // Tìm kiếm bác sĩ theo tên hoặc chuyên khoa với giới hạn kết quả
  async globalSearch(query, limit) {
    if (!query || query.trim() === "") return [];
    return await doctorRepo.globalSearch(query, limit);
  }
  // Cập nhật thông tin bác sĩ với kiểm tra tồn tại chặt chẽ
  async updateDoctor(data) {
    const doctor = await doctorRepo.findById(data.id);
    if (!doctor) throw new Error("Không tìm thấy bác sĩ để cập nhật!");
    await doctorRepo.update(data.id, data);
    return await this.getDoctorById(data.id);
  }
  // Xóa bác sĩ với logic xóa mềm chặt chẽ
  async deleteDoctor(id) {
    const doctor = await doctorRepo.findById(id);
    if (!doctor) throw new Error("Bác sĩ không tồn tại hoặc đã bị xóa!");
    return await doctorRepo.softDeleteDoctor(id);
  }
  // Cập nhật mật khẩu bác sĩ với kiểm tra tồn tại và hash mật khẩu an toàn
  async updateDoctorPassword(id, newPassword) {
    const doctor = await doctorRepo.findById(id);
    if (!doctor) throw new Error("Bác sĩ không tồn tại!");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const success = await userRepo.updatePassword(doctor.user_id, hashedPassword);
    return { success, message: success ? "Cập nhật mật khẩu thành công" : "Thất bại" };
  }
  // Reset mật khẩu bác sĩ về mặc định với kiểm tra tồn tại và hash mật khẩu an toàn
  async resetDoctorPassword(id) {
    const doctor = await doctorRepo.findById(id);
    if (!doctor) throw new Error("Bác sĩ không tồn tại!");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Password123@", salt);
    const success = await userRepo.updatePassword(doctor.user_id, hashedPassword);
    return { 
      success, 
      message: success ? "Mật khẩu đã được reset về: Password123@" : "Thất bại" 
    };
  }
}

module.exports = new DoctorService();