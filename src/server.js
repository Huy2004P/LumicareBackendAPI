require("dotenv").config();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// 1. Import các Handler (Logic xử lý)
const authHandler = require("./handlers/auth.handler");
const profileHandler = require("./handlers/profile.handler");
const masterHandler = require("./handlers/master_data.handler");
const doctorHandler = require("./handlers/doctor.handler");

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
const masterPackage = loadProto("master_data.proto").master_data;

server.addService(masterPackage.MasterDataService.service, {
  // --- 1. CHUYÊN KHOA (SPECIALTY) ---
  CreateSpecialty: masterHandler.CreateSpecialty,
  UpdateSpecialty: masterHandler.UpdateSpecialty,
  DeleteSpecialty: masterHandler.DeleteSpecialty,
  GetSpecialtyById: masterHandler.GetSpecialtyById,
  GetAllSpecialties: masterHandler.GetAllSpecialties,

  // --- 2. CƠ SỞ Y TẾ (CLINIC) ---
  CreateClinic: masterHandler.CreateClinic,
  UpdateClinic: masterHandler.UpdateClinic,
  DeleteClinic: masterHandler.DeleteClinic,
  GetClinicById: masterHandler.GetClinicById,
  GetAllClinics: masterHandler.GetAllClinics,

  // --- 3. PHÒNG KHÁM (ROOM) ---
  CreateRoom: masterHandler.CreateRoom,
  UpdateRoom: masterHandler.UpdateRoom,
  DeleteRoom: masterHandler.DeleteRoom,
  GetAllRooms: masterHandler.GetAllRooms,

  // --- 4. DỊCH VỤ (SERVICE) ---
  CreateService: masterHandler.CreateService,
  UpdateService: masterHandler.UpdateService,
  DeleteService: masterHandler.DeleteService,
  GetAllServices: masterHandler.GetAllServices,

  // --- 5. THUỐC (DRUGS) - MỚI HOÀN TOÀN ---
  CreateDrug: masterHandler.CreateDrug,
  UpdateDrug: masterHandler.UpdateDrug,
  DeleteDrug: masterHandler.DeleteDrug,
  GetDrugById: masterHandler.GetDrugById,
  GetAllDrugs: masterHandler.GetAllDrugs,

  // --- 6. ALLCODES (MÃ CHUNG) - MỚI HOÀN TOÀN ---
  CreateAllCode: masterHandler.CreateAllCode,
  UpdateAllCode: masterHandler.UpdateAllCode,
  DeleteAllCode: masterHandler.DeleteAllCode,
  GetAllCodes: masterHandler.GetAllCodes,
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
// KHỞI ĐỘNG SERVER

// gRPC thường chạy port 50051 (khác với 3000 của Web)
const PORT = process.env.PORT || 50051;

server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("❌ Lỗi khởi động gRPC Server:", error);
      return;
    }
    console.log(`🚀 gRPC Server đang chạy tại 0.0.0.0:${PORT}`);

    // Lưu ý: Các phiên bản mới của @grpc/grpc-js tự động start sau khi bind,
    // nhưng nếu dùng bản cũ hoặc muốn chắc chắn thì gọi dòng dưới:
    // server.start();
  },
);
