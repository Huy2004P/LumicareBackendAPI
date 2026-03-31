const searchRepo = require("../repositories/search.repo");

class SearchService {
  async globalSearch(query, limit) {
    // Ông có thể thêm logic xử lý chuỗi ở đây nếu cần
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

  async getSuggestions(query, limit) {
    const keywords = await searchRepo.getSuggestions(query, limit || 10);
    // Ở đây ông có thể thêm logic lọc trùng hoặc sắp xếp alphabet nếu thích
    return keywords;
  }
}

module.exports = new SearchService();