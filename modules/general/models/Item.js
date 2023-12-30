// In your model file
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    static associate(models) {
      // define association here
    }
  }

  Item.init(
    {
      itemId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'item_id',
      },
      itemUuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'item_uuid',
      },
      itemName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'item_name',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'description',
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'category_id',
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
      modelName: 'Item',
      tableName: 'items',
    }
  );

  return Item;
};
