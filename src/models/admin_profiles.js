const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return admin_profiles.init(sequelize, DataTypes);
}

class admin_profiles extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "Quản trị viên"
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: ""
    }
  }, {
    sequelize,
    tableName: 'admin_profiles',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
