// In your model file
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Stock extends Model {
    static associate(models) {
      // define association here
    }
  }

  Stock.init(
    {
      stockId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'stock_id',
      },
      stockUuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'stock_uuid',
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
      modelName: 'Stock',
      tableName: 'stock',
    }
  );

  return Stock;
};
