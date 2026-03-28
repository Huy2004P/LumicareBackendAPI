const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return appointment_records.init(sequelize, DataTypes);
}

class appointment_records extends Sequelize.Model {
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
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    symptoms: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    treatment_plan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    re_exam_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'appointment_records',
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
