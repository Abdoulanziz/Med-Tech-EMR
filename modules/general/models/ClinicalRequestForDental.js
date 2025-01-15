'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClinicalRequestForDental extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ClinicalRequestForDental.belongsTo(models.Visit, { foreignKey: 'visitId' });
    }
  }
  ClinicalRequestForDental.init({ 
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
    visitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'visit_id',
    },
    toothType: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tooth_type',
    },
    diagnosis: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'diagnosis',
    },
    procedure: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'procedure',
    },
    serviceFee: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'service_fee',
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
    modelName: 'ClinicalRequestForDental',
    tableName: 'clinical_requests_for_dental',
  });
  return ClinicalRequestForDental;
};