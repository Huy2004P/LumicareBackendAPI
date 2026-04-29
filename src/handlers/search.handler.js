const searchService = require("../services/search.service");

const SearchHandler = {
  // Handler cho tìm kiếm toàn cục
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
      callback({ code: 13, message: e.message });
    }
  },

  // Handler cho gợi ý tìm kiếm
  GetSuggestions: async (call, callback) => {
    try {
      const { query, limit } = call.request;
      console.log(`💡 [Suggestion] Query: "${query}"`);
      const keywords = await searchService.getSuggestions(query, limit);
      callback(null, { 
        success: true, 
        keywords: keywords 
      });
    } catch (e) {
      callback({ code: 13, message: e.message });
    }
  }
};

module.exports = SearchHandler;