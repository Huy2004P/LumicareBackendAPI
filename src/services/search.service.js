const searchRepo = require("../repositories/search.repo");

class SearchService {
  // Tìm kiếm toàn cục trên nhiều loại dữ liệu (bài viết, sản phẩm, người dùng, v.v.)
  async globalSearch(query, limit) {
    const results = await searchRepo.globalSearch(query, limit || 15);    
    return results.map(item => ({
      id: String(item.id),
      type: item.type,
      title: item.title,
      subtitle: item.subtitle,
      // Fix link ảnh nếu trong DB chỉ lưu tên file
      image: item.image ? item.image : "" 
    }));
  }
  // Lấy gợi ý tìm kiếm dựa trên từ khóa đã nhập
  async getSuggestions(query, limit) {
    const keywords = await searchRepo.getSuggestions(query, limit || 10);
    return keywords;
  }
}

module.exports = new SearchService();