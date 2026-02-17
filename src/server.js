require("dotenv").config();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// 1. Import các Handler (Logic xử lý)
const authHandler = require("./handlers/auth.handler");
const profileHandler = require("./handlers/profile.handler");
const masterHandler = require("./handlers/master_data.handler");
const doctorHandler = require("./handlers/doctor.handler");
const scheduleHandler = require("./handlers/schedule.handler");
const bookingHandler = require("./handlers/booking.handler");
const appointmentHandler = require("./handlers/appointment.handler");

// 2. Import Interceptor (Để bảo vệ API cần đăng nhập)
// Đảm bảo bạn đã tạo file này trong src/utils/grpc.interceptor.js
const checkAuth = require("./interceptors/auth.interceptor");
const { resetPassword } = require("./services/auth.service");

const server = new grpc.Server();

// --- Hàm Helper để load file .proto cho gọn ---
const loadProto = (filename) => {
  const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, "protos", filename),
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    },
  );
  // Trả về package object (vd: auth, profile...)
  return grpc.loadPackageDefinition(packageDefinition);
};

// ĐĂNG KÝ CÁC SERVICE

// 1. AUTH SERVICE (Public - Không cần checkAuth)
// Load file src/protos/auth.proto
const authPackage = loadProto("auth.proto").auth;

server.addService(authPackage.AuthService.service, {
  Register: authHandler.register, // Map rpc Register -> hàm register
  Login: authHandler.login, // Map rpc Login -> hàm login
  RefreshToken: authHandler.refreshToken, // Map rpc RefreshToken
  Logout: authHandler.logout, // Map rpc Logout
  ForgotPassword: authHandler.forgotPassword,
  ResetPassword: authHandler.resetPassword,
});

// 2. PROFILE SERVICE (Private - Cần bọc checkAuth)
// Load file src/protos/profile.proto
const profilePackage = loadProto("profile.proto").profile;

server.addService(profilePackage.ProfileService.service, {
  // Bọc hàm handler bằng checkAuth để kiểm tra Token trước khi chạy
  GetMyProfile: checkAuth(profileHandler.getMyProfile),
  UpdateProfile: checkAuth(profileHandler.updateProfile),
  ChangePassword: checkAuth(profileHandler.changePassword),
});

// 3. MASTER - DATA
// Load file src/protos/master_data.proto
// --- 3. MASTER - DATA ---
const masterPackage = loadProto("master_data.proto").master_data;

server.addService(masterPackage.MasterDataService.service, {
  // --- 1. CHUYÊN KHOA ---
  CreateSpecialty: masterHandler.createSpecialty,
  UpdateSpecialty: masterHandler.updateSpecialty,
  DeleteSpecialty: masterHandler.deleteSpecialty,
  GetSpecialtyById: masterHandler.getSpecialtyById,
  GetAllSpecialties: masterHandler.getAllSpecialties,

  // --- 2. CƠ SỞ Y TẾ ---
  CreateClinic: masterHandler.createClinic,
  UpdateClinic: masterHandler.updateClinic,
  DeleteClinic: masterHandler.deleteClinic,
  GetClinicById: masterHandler.getClinicById,
  GetAllClinics: masterHandler.getAllClinics,

  // --- 3. PHÒNG KHÁM ---
  CreateRoom: masterHandler.createRoom,
  UpdateRoom: masterHandler.updateRoom,
  DeleteRoom: masterHandler.deleteRoom,
  GetAllRooms: masterHandler.getAllRooms,

  // --- 4. DỊCH VỤ ---
  CreateService: masterHandler.createService,
  UpdateService: masterHandler.updateService,
  DeleteService: masterHandler.deleteService,
  GetAllServices: masterHandler.getAllServices,

  // --- 5. THUỐC ---
  CreateDrug: masterHandler.createDrug,
  UpdateDrug: masterHandler.updateDrug,
  DeleteDrug: masterHandler.deleteDrug,
  GetDrugById: masterHandler.getDrugById,
  GetAllDrugs: masterHandler.getAllDrugs,

  // --- 6. ALLCODES ---
  CreateAllCode: masterHandler.createAllCode,
  UpdateAllCode: masterHandler.updateAllCode,
  DeleteAllCode: masterHandler.deleteAllCode,
  GetAllCodes: masterHandler.getAllCodes, // <-- Sửa từ getAllCode thành getAllCodes cho khớp Handler
});
// 4. DOCTOR
// Load file src/protos/doctor.proto
const doctorPackage = loadProto("doctor.proto").doctor;
server.addService(doctorPackage.DoctorService.service, {
  //tao bac si
  CreateDoctor: doctorHandler.createDoctor,

  //lay toan bo bac si
  GetAllDoctors: doctorHandler.getAllDoctors,

  //lay bac si theo id
  GetDoctorById: doctorHandler.getDoctorById,
});
// 5. SCHEDULE
// Load file src/protos/schedule.proto
const schedulePackage = loadProto("schedule.proto").schedule;
server.addService(schedulePackage.ScheduleService.service, {
  BulkCreateSchedule: scheduleHandler.BulkCreateSchedule,
  GetScheduleByDate: scheduleHandler.GetScheduleByDate,
});
// 6. BOOKING
// Load file src/protos/booking.proto
const bookingPackage = loadProto("booking.proto").booking;
server.addService(bookingPackage.BookingService.service, {
  CreateBooking: bookingHandler.CreateBooking,
  GetBookingHistory: bookingHandler.GetBookingHistory,
  CancelBooking: bookingHandler.CancelBooking,
});
// 7. APPOINTMENT
// Load file src/protos/appointment.proto
const appointmentPackage = loadProto("appointment.proto").appointment;
server.addService(appointmentPackage.AppointmentService.service, {
  GetListPatientForDoctor: appointmentHandler.GetListPatientForDoctor,
  VerifyBooking: appointmentHandler.VerifyBooking,
  FinishAppointment: appointmentHandler.FinishAppointment,
});
// KHỞI ĐỘNG SERVER

// gRPC thường chạy port 50051 (khác với 3000 của Web)
const PORT = process.env.PORT || 50051;

server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Lỗi khởi động gRPC Server:", error);
      return;
    }
    console.log(`gRPC Server đang chạy tại 0.0.0.0:${PORT}`);
  },
);
