const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return appointments.init(sequelize, DataTypes);
}

class appointments extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id'
      },
      unique: "appointments_ibfk_1"
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('waiting','examining','done','cancelled'),
      allowNull: true,
      defaultValue: "waiting"
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'appointments',
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
        name: "booking_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "booking_id" },
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
