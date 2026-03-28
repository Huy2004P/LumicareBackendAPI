const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return schedules.init(sequelize, DataTypes);
}

class schedules extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    max_booking: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    current_booking: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'schedules',
    timestamps: true,
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
        name: "doctor_date_time_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "doctor_id" },
          { name: "date" },
          { name: "time_type" },
        ]
      },
      {
        name: "doctor_id",
        using: "BTREE",
        fields: [
          { name: "doctor_id" },
        ]
      },
    ]
  });
  }
}
