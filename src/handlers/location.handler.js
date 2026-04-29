const locationService = require('../services/location.service');

const locationHandler = {
    //Thêm địa chỉ mới
    addNewLocation: async (call, callback) => {
        try {
            const req = call.request;
            const userId = req.user_id || req.userId;
            const data = {
                label: req.label || "Địa chỉ",
                address_detail: req.address_detail || req.addressDetail,
                province: req.province || null,
                district: req.district || null,
                ward: req.ward || null,
                latitude: parseFloat(req.latitude) || 0,
                longitude: parseFloat(req.longitude) || 0,
                is_default: (req.is_default || req.isDefault) ? 1 : 0
            };
            const result = await locationService.addNewLocation(data, userId);
            callback(null, { success: true, message: "OK", location_id: result.location_id });
        } catch (e) { callback({ code: 13, message: e.message }); }
    },
    //Lấy danh sách địa chỉ
    getPatientLocations: async (call, callback) => {
        try {
            const userId = call.request.user_id || call.request.userId;
            const locations = await locationService.getListByUserId(userId);
            const formatted = locations.map(loc => ({
                id: loc.id, user_id: userId, label: loc.label, address_detail: loc.address_detail,
                province: loc.province, district: loc.district, ward: loc.ward,
                latitude: parseFloat(loc.latitude), longitude: parseFloat(loc.longitude), is_default: !!loc.is_default
            }));
            callback(null, { locations: formatted });
        } catch (e) { callback({ code: 13, message: e.message }); }
    },
    // Xoá địa chỉ
    removeLocation: async (call, callback) => {
        try {
            await locationService.removeLocation(call.request.location_id || call.request.locationId);
            callback(null, {});
        } catch (e) { callback({ code: 13, message: e.message }); }
    },

    // đặt địa chỉ làm mặc định
    setDefaultLocation: async (call, callback) => {
        try {
            const locId = call.request.location_id || call.request.locationId;
            const success = await locationService.makeDefault(locId);
            if (success) {
                callback(null, {});
            } else {
                callback({ code: 5, message: "Không tìm thấy địa chỉ" });
            }
        } catch (e) { callback({ code: 13, message: e.message }); }
    }
};

module.exports = locationHandler;