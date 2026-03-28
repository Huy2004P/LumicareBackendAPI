const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return treatments.init(sequelize, DataTypes);
}

class treatments extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'appointments',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    times: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    instruction: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    repeat_days: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'treatments',
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
        name: "appointment_id",
        using: "BTREE",
        fields: [
          { name: "appointment_id" },
        ]
      },
    ]
  });
  }
}
