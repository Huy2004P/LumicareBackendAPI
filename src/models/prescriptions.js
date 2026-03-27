const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return prescriptions.init(sequelize, DataTypes);
}

class prescriptions extends Sequelize.Model {
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
    drug_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'drugs',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    instruction: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'prescriptions',
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
      {
        name: "drug_id",
        using: "BTREE",
        fields: [
          { name: "drug_id" },
        ]
      },
    ]
  });
  }
}
