const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return doctor_services.init(sequelize, DataTypes);
}

class doctor_services extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'doctors',
        key: 'id'
      }
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'services',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'doctor_services',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "doctor_id" },
          { name: "service_id" },
        ]
      },
      {
        name: "service_id",
        using: "BTREE",
        fields: [
          { name: "service_id" },
        ]
      },
    ]
  });
  }
}
