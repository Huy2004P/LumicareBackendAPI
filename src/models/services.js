const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return services.init(sequelize, DataTypes);
}

class services extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0.00
    },
    specialty_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'specialties',
        key: 'id'
      }
    },
    content_html: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content_markdown: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'services',
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
        name: "fk_service_specialty",
        using: "BTREE",
        fields: [
          { name: "specialty_id" },
        ]
      },
    ]
  });
  }
}
