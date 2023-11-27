'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClinicalRequestForEye extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ClinicalRequestForEye.belongsTo(models.Visit, { foreignKey: 'visitId' });
    }
  }
  ClinicalRequestForEye.init({ 
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
    specificEye: {
      type: DataTypes.ENUM('right', 'left'),
      allowNull: true,
      field: 'specific_eye',
    },
    diagnosis: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'diagnosis',
    },
    serviceFee: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'service_fee',
    },
    observationNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'observation_notes',
    },
    descriptionNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description_notes',
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
    modelName: 'ClinicalRequestForEye',
    tableName: 'clinical_requests_for_eye',
  });
  return ClinicalRequestForEye;
};