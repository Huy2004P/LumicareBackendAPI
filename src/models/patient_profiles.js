const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return patient_profiles.init(sequelize, DataTypes);
}

class patient_profiles extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    owner_patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'patients',
        key: 'id'
      }
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    relationship: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'patient_profiles',
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
        name: "owner_patient_id",
        using: "BTREE",
        fields: [
          { name: "owner_patient_id" },
        ]
      },
    ]
  });
  }
}
