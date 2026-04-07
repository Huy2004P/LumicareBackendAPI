const userRepository = require("../repositories/user.repo");
const bcrypt = require("bcryptjs");

class UserService {
  async listUsers(filter) {
    return await userRepository.findAll(filter.searchTerm, filter.role);
  }

  async toggleActive(id) {
    return await userRepository.toggleStatus(id);
  }

  async resetPass(id) {
    const salt = bcrypt.genSaltSync(10);
    const hashedDefault = bcrypt.hashSync("Password123@", salt);
    return await userRepository.updatePassword(id, hashedDefault);
  }

  async removeUser(id) {
    return await userRepository.softDelete(id);
  }
}

module.exports = new UserService();