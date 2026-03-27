const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return rooms.init(sequelize, DataTypes);
}

class rooms extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clinics',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'rooms',
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
        name: "fk_room_clinic",
        using: "BTREE",
        fields: [
          { name: "clinic_id" },
        ]
      },
    ]
  });
  }
}
