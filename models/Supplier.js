// In your model file
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      // define association here
    }
  }

  Supplier.init(
    {
      supplierId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'supplier_id',
      },
      supplierUuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'supplier_uuid',
      },
      supplierName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'supplier_name',
      },
      contactPerson: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'contact_person',
      },
      contactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'contact_number',
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'contact_email',
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
      modelName: 'Supplier',
      tableName: 'suppliers',
    }
  );

  return Supplier;
};
