const doctorRepo = require("../repositories/doctor.repo");
const userRepo = require("../repositories/user.repo");
const masterDataRepo = require("../repositories/masterData.repo"); // Dùng kho tổng ở đây
const bcrypt = require("bcryptjs");

class DoctorService {
  // 1. Tạo bác sĩ (Giữ nguyên của ông)
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
    const doctorData = {
      user_id: userId,
      full_name: data.fullName,
      phone: data.phone,
      position: data.position,
      description: data.description,
      price: data.price,
      avatar: data.avatar,
      specialty_id: data.specialtyId,
      room_id: data.roomId
    };
    const doctorId = await doctorRepo.create(doctorData);
    return await this.getDoctorById(doctorId);
  }

  // 2. Lấy danh sách (Giữ nguyên của ông)
  async getAllDoctors(filter) {
    const safeFilter = {
      searchTerm: (filter && filter.searchTerm) ? filter.searchTerm : null,
      specialtyId: (filter && filter.specialtyId > 0) ? filter.specialtyId : 0,
      roomId: (filter && filter.roomId > 0) ? filter.roomId : 0
    };
    return await doctorRepo.findAll(safeFilter);
  }

  // 3. Lấy chi tiết (Giữ nguyên của ông)
  async getDoctorById(id) {
    const doctor = await doctorRepo.findById(id);
    if (!doctor) throw new Error("Không tìm thấy bác sĩ này!");
    return doctor;
  }

  // --- 4. HÀM ASSIGN SERVICES (Đã chỉnh theo MasterDataRepo) ---
  async assignServicesToDoctor(data) {
    const { doctorId, serviceIds } = data; // serviceIds: [1, 2, 3]

    // B1: Lấy thông tin bác sĩ (để lấy specialty_id của bác sĩ)
    const doctor = await doctorRepo.findById(doctorId);
    if (!doctor) throw new Error("Bác sĩ không tồn tại!");

    // B2: Lấy thông tin Master Data của các dịch vụ từ masterDataRepo
    // Tui đổi tên hàm thành getServicesByIds cho đúng với logic Master của ông
    const masterServices = await masterDataRepo.getServicesByIds(serviceIds);

    if (!masterServices || masterServices.length === 0) {
        throw new Error("Danh sách dịch vụ không hợp lệ hoặc đã bị xóa!");
    }

    // B3: Logic so khớp chuyên khoa từ Master Data
    for (const service of masterServices) {
      // Lưu ý: specialty_id là cột trong bảng services (Master Data)
      // doctor.specialty_id là cột trong bảng doctors
      if (service.specialty_id !== doctor.specialty_id) {
        throw new Error(
          `Cảnh báo chuyên môn: Dịch vụ "${service.name}" thuộc chuyên khoa khác. ` +
          `Bác sĩ ${doctor.full_name} không có quyền đảm nhận!`
        );
      }
    }

    // B4: Nếu hợp lệ hết thì mới lưu vào bảng trung gian thông qua doctorRepo
    await doctorRepo.assignServices(doctorId, serviceIds);
    
    return { success: true, message: "Gán dịch vụ hoàn tất!" };
  }

  async getDoctorServices(doctorId) {
    if (!doctorId) throw new Error("Thiếu ID bác sĩ!");
    
    // Kiểm tra bác sĩ có tồn tại không (optional nhưng nên có)
    const doctor = await this.getDoctorById(doctorId);
    if (!doctor) throw new Error("Bác sĩ không tồn tại!");

    const services = await doctorRepo.getServicesByDoctorId(doctorId);
    return {
        id: doctor.id,
        fullName: doctor.full_name, // <-- Có tên ở đây rồi nhé
        specialtyName: doctor.specialty_name, 
        services: services // Đây là mảng dịch vụ
    };
  }
}

module.exports = new DoctorService();