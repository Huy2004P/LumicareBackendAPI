const searchService = require("../services/search.service");

const SearchHandler = {
  GlobalSearch: async (call, callback) => {
    try {
      const { query, limit } = call.request;
      console.log(`🔍 [Search Request] Từ khóa: "${query}"`);

      if (!query || query.trim() === "") {
        return callback(null, { success: true, data: [] });
      }

      const data = await searchService.globalSearch(query, limit);

      callback(null, { 
        success: true, 
        message: `Tìm thấy ${data.length} kết quả`,
        data: data 
      });
    } catch (e) {
      console.error("❌ [Search Handler Error]:", e.message);
      callback({ code: 13, message: e.message });
    }
  },

  GetSuggestions: async (call, callback) => {
    try {
      const { query, limit } = call.request;
      console.log(`💡 [Suggestion] Query: "${query}"`);

      // Gọi qua Service
      const keywords = await searchService.getSuggestions(query, limit);

      callback(null, { 
        success: true, 
        keywords: keywords 
      });
    } catch (e) {
      console.error("❌ [Suggestion Handler Error]:", e.message);
      callback({ code: 13, message: e.message });
    }
  }
};

module.exports = SearchHandler;