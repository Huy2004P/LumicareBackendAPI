const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return doctors.init(sequelize, DataTypes);
}

class doctors extends Sequelize.Model {
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
      },
      unique: "doctors_ibfk_1"
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    position: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    specialty_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'specialties',
        key: 'id'
      }
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'rooms',
        key: 'id'
      }
    },
    active: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'doctors',
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
        name: "user_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "specialty_id",
        using: "BTREE",
        fields: [
          { name: "specialty_id" },
        ]
      },
      {
        name: "room_id",
        using: "BTREE",
        fields: [
          { name: "room_id" },
        ]
      },
    ]
  });
  }
}
