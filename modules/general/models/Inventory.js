// In your model file
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      // define association here
    }
  }

  Inventory.init(
    {
      inventoryd: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'inventory_id',
      },
      inventoryuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'inventory_uuid',
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'location',
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'department',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'Inventory',
      tableName: 'inventory',
    }
  );

  return Inventory;
};
