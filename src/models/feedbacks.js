const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return feedbacks.init(sequelize, DataTypes);
}

class feedbacks extends Sequelize.Model {
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
      unique: "fk_fb_booking"
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'patients',
        key: 'id'
      }
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'feedbacks',
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
        name: "unique_booking_feedback",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "booking_id" },
        ]
      },
      {
        name: "fk_fb_patient",
        using: "BTREE",
        fields: [
          { name: "patient_id" },
        ]
      },
      {
        name: "fk_fb_doctor",
        using: "BTREE",
        fields: [
          { name: "doctor_id" },
        ]
      },
    ]
  });
  }
}
