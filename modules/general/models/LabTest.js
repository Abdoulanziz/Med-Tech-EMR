'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LabTest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LabTest.init({ 
    testId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'test_id',
    },
    testUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'test_uuid',
    },
    testName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'test_name',
    },
    testFees: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'test_fees',
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
    modelName: 'LabTest',
    tableName: 'lab_tests',
  });
  return LabTest;
};