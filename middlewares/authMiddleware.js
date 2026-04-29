const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');

const verifyAccount = async (req, res, next) => {
    try {
        // 1. Lấy token từ Header
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
        }

        // 2. Giải mã token để lấy userId
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // 3. 🎯 TRUY QUÉT DATABASE: Kiểm tra xem active còn bằng 1 hay không
        const isActive = await userRepository.isAccountActive(userId);

        if (!isActive) {
            // Nếu active = 0, trả về 403 để Client tự động đá người dùng ra
            return res.status(403).json({
                success: false,
                code: "ACCOUNT_LOCKED",
                message: "Tài khoản đã bị khóa. Vui lòng liên hệ Admin!"
            });
        }

        // Nếu mọi thứ ổn, kẹp userId vào request để xài ở Controller
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Phiên đăng nhập hết hạn!" });
    }
};

module.exports = { verifyAccount };