'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Medicine extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Medicine.init({ 
    medicineId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'medicine_id',
    },
    medicineUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'medicine_uuid',
    },
    medicineName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'medicine_name',
    },
    medicineType: {
      type: DataTypes.ENUM('tablet', 'syrap', 'cream'),
      allowNull: false,
      field: 'medicine_type',
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'dosage',
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'manufacturer',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  }, {
    sequelize,
    modelName: 'Medicine',
    tableName: 'medicines',
  });
  return Medicine;
};