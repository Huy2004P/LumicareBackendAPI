const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return allcodes.init(sequelize, DataTypes);
}

class allcodes extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    key: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    value_vi: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    value_en: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'allcodes',
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
        name: "unique_type_key",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "type" },
          { name: "key" },
        ]
      },
    ]
  });
  }
}
