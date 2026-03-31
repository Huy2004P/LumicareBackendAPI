require("dotenv").config();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const { Server } = require('socket.io');
const http = require("http");

// --- CẤU HÌNH SOCKET.IO ---
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log(">>> [Socket] Có thiết bị kết nối:", socket.id);

  socket.on("register", (userId) => {
    const cleanId = String(userId).replace(/['"]+/g, ''); 
    const roomName = `user_${cleanId}`;
    
    socket.join(roomName);
    console.log(`>>> [Socket] User ${cleanId} đã join phòng: ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log(">>> [Socket] Thiết bị ngắt kết nối.");
  });
});

const SOCKET_PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(SOCKET_PORT, () => {
  console.log(`Socket.io đang chạy tại port: ${SOCKET_PORT}`);
});

global._io = io;

// --- IMPORT HANDLERS ---
const authHandler = require("./handlers/auth.handler");
const profileHandler = require("./handlers/profile.handler");
const masterHandler = require("./handlers/master_data.handler");
const doctorHandler = require("./handlers/doctor.handler");
const scheduleHandler = require("./handlers/schedule.handler");
const bookingHandler = require("./handlers/booking.handler");
const appointmentHandler = require("./handlers/appointment.handler");
const patientProfileHandler = require("./handlers/patientProfile.handler");
const notificationHandler = require("./handlers/notification.handler");
const statisticHandler = require("./handlers/statistic.handler");
const feedbackHandler = require("./handlers/feedback.handler");
const locationHandler = require("./handlers/location.handler");
const checkAuth = require("./utils/grpc.interceptor");
const searchHandler = require("./handlers/search.handler");
const treatmentHandler = require("./handlers/treatment.handler");

const server = new grpc.Server();

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
  return grpc.loadPackageDefinition(packageDefinition);
};

// --- ĐĂNG KÝ CÁC SERVICE ---

// 1. AUTH SERVICE
const authPackage = loadProto("auth.proto").auth;
server.addService(authPackage.AuthService.service, {
  Register: authHandler.register,
  Login: authHandler.login,
  RefreshToken: authHandler.refreshToken,
  Logout: authHandler.logout,
  ForgotPassword: authHandler.forgotPassword,
  ResetPassword: authHandler.resetPassword,
  VerifyOTP: authHandler.VerifyOTP,
});

// 2. PROFILE SERVICE
const profilePackage = loadProto("profile.proto").profile;
server.addService(profilePackage.ProfileService.service, {
  GetMyProfile: checkAuth(profileHandler.GetMyProfile),
  UpdateProfile: checkAuth(profileHandler.UpdateProfile),
  RequestChangePasswordOTP: checkAuth(profileHandler.RequestChangePasswordOTP),
  ChangePassword: checkAuth(profileHandler.ChangePassword),
});

// 3. MASTER - DATA
const masterPackage = loadProto("master_data.proto").master_data;
server.addService(masterPackage.MasterDataService.service, {
  CreateSpecialty: masterHandler.CreateSpecialty,
  UpdateSpecialty: masterHandler.UpdateSpecialty,
  DeleteSpecialty: masterHandler.DeleteSpecialty,
  GetSpecialtyById: masterHandler.GetSpecialtyById,
  GetAllSpecialties: masterHandler.GetAllSpecialties,
  CreateClinic: masterHandler.CreateClinic,
  UpdateClinic: masterHandler.UpdateClinic,
  DeleteClinic: masterHandler.DeleteClinic,
  GetClinicById: masterHandler.GetClinicById,
  GetAllClinics: masterHandler.GetAllClinics,
  CreateRoom: masterHandler.CreateRoom,
  UpdateRoom: masterHandler.UpdateRoom,
  DeleteRoom: masterHandler.DeleteRoom,
  GetRoomById: masterHandler.GetRoomById,
  GetAllRooms: masterHandler.GetAllRooms,
  GetRoomsByClinicId: masterHandler.GetRoomsByClinicId,
  CreateService: masterHandler.CreateService,
  UpdateService: masterHandler.UpdateService,
  DeleteService: masterHandler.DeleteService,
  GetServiceById: masterHandler.GetServiceById,
  GetAllServices: masterHandler.GetAllServices,
  GetDoctorsByService: masterHandler.GetDoctorsByService,
  GetDoctorsByRoomId: masterHandler.GetDoctorsByRoomId,
  CreateDrug: masterHandler.CreateDrug,
  UpdateDrug: masterHandler.UpdateDrug,
  DeleteDrug: masterHandler.DeleteDrug,
  GetDrugById: masterHandler.GetDrugById,
  GetAllDrugs: masterHandler.GetAllDrugs,
  CreateAllCode: masterHandler.CreateAllCode,
  UpdateAllCode: masterHandler.UpdateAllCode,
  DeleteAllCode: masterHandler.DeleteAllCode,
  GetAllCodeById: masterHandler.GetAllCodeById,
  GetAllCodes: masterHandler.GetAllCodes, 
});

// 4. DOCTOR SERVICE
const doctorPackage = loadProto("doctor.proto").doctor;
server.addService(doctorPackage.DoctorService.service, {
  CreateDoctor: doctorHandler.CreateDoctor,
  GetAllDoctors: doctorHandler.GetAllDoctors,
  GetDoctorById: doctorHandler.GetDoctorById,
  AssignServiceToDoctor: doctorHandler.AssignServiceToDoctor,
  GetDoctorServices: doctorHandler.GetDoctorServices,
  GlobalSearch: doctorHandler.GlobalSearch,
});

// 5. SCHEDULE
const schedulePackage = loadProto("schedule.proto").schedule;
server.addService(schedulePackage.ScheduleService.service, {
  BulkCreateSchedule: checkAuth(scheduleHandler.BulkCreateSchedule),
  GetScheduleByDate: scheduleHandler.GetScheduleByDate,
});

// 6. BOOKING
const bookingPackage = loadProto("booking.proto").booking;
server.addService(bookingPackage.BookingService.service, {
  CreateBooking: checkAuth(bookingHandler.CreateBooking),
  GetBookingHistory: checkAuth(bookingHandler.GetBookingHistory),
  CancelBooking: checkAuth(bookingHandler.CancelBooking),
  DeleteBooking: checkAuth(bookingHandler.DeleteBooking),
});

// 7. APPOINTMENT
const appointmentPackage = loadProto("appointment.proto").appointment;
server.addService(appointmentPackage.AppointmentService.service, {
  GetListPatientForDoctor: checkAuth(appointmentHandler.GetListPatientForDoctor),
  VerifyBooking: checkAuth(appointmentHandler.VerifyBooking),
  FinishAppointment: checkAuth(appointmentHandler.FinishAppointment),
});

// 8. PATIENT PROFILE
const patientProfilePackage = loadProto("patientProfile.proto").patient_profile;
server.addService(patientProfilePackage.PatientProfileService.service, {
  GetAllProfiles: checkAuth(patientProfileHandler.GetAllProfiles),
  CreateProfile: checkAuth(patientProfileHandler.CreateProfile),
  UpdateProfile: checkAuth(patientProfileHandler.UpdateProfile),
  DeleteProfile: checkAuth(patientProfileHandler.DeleteProfile),
  GetProfileById: checkAuth(patientProfileHandler.GetProfileById),
});

// 9. NOTIFICATION
const notificationPackage = loadProto("notification.proto").notification;
server.addService(notificationPackage.NotificationService.service, {
  GetMyNotifications: notificationHandler.GetMyNotifications,
  MarkAsRead: notificationHandler.MarkAsRead,
  // 🎯 THÊM DÒNG NÀY VÀO NÈ HUY
  StreamNotifications: notificationHandler.StreamNotifications, 
  
  // Nếu ông có làm mấy hàm này thì thêm luôn cho đủ bộ
  MarkAllAsRead: notificationHandler.MarkAllAsRead,
  CreateNotification: notificationHandler.CreateNotification,
});

// 10. STATISTIC
const statisticPackage = loadProto("statistic.proto").statistic;
server.addService(statisticPackage.StatisticService.service, {
  GetAdminDashboard: statisticHandler.GetAdminDashboard,
  GetDoctorDashboard: statisticHandler.GetDoctorDashboard,
});

// 11. FEEDBACK
const feedbackPackage = loadProto("feedback.proto").feedback;
server.addService(feedbackPackage.FeedbackService.service, {
  SendFeedback: feedbackHandler.SendFeedback,
  GetDoctorFeedbacks: feedbackHandler.GetDoctorFeedbacks,
  GetAllFeedbacks: feedbackHandler.GetAllFeedbacks,
});

// 12. LOCATION
const locationPackage = loadProto("location.proto").location;
server.addService(locationPackage.LocationService.service, {
  GetPatientLocations: checkAuth(locationHandler.getPatientLocations), // Dùng interceptor để bảo mật
  AddNewLocation: checkAuth(locationHandler.addNewLocation),
  DeleteLocation: checkAuth(locationHandler.removeLocation),
  SetDefaultLocation: checkAuth(locationHandler.setDefaultLocation)
});

// 13. SEARCH
// Tạo hàm load cho search.proto
const searchPackage = loadProto("search.proto").search;
server.addService(searchPackage.SearchService.service, {
  GlobalSearch: searchHandler.GlobalSearch,
  GetSuggestions: searchHandler.GetSuggestions
});

// 14. TREATMENT
const treatmentProto = loadProto("treatment.proto").treatment;
server.addService(treatmentProto.TreatmentService.service, {
  GetTreatmentByBooking: treatmentHandler.GetTreatmentByBooking,
  GetUserMedicalRecords: treatmentHandler.GetUserMedicalRecords
});
// --- KHỞI ĐỘNG SERVER ---
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