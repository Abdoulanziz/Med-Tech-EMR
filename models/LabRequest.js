'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LabRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LabRequest.belongsTo(models.LabTest, { foreignKey: 'testId' });
      LabRequest.belongsTo(models.Visit, { foreignKey: 'visitId' });
    }
  }
  LabRequest.init({ 
    requestId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'request_id',
    },
    requestUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'request_uuid',
    },
    testId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'test_id',
    },
    visitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'visit_id',
    },
    testFees: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'test_fees',
    },
    clinicalNotes: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'clinical_notes',
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'paid'),
      defaultValue: 'unpaid',
      allowNull: false,
      field: 'payment_status',
    },
    requestStatus: {
      type: DataTypes.ENUM('pending', 'complete', 'canceled'),
      defaultValue: 'pending',
      allowNull: false,
      field: 'request_status',
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
    modelName: 'LabRequest',
    tableName: 'lab_requests',
  });
  return LabRequest;
};