'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DiagnosisReport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DiagnosisReport.belongsTo(models.Diagnosis, { foreignKey: 'diagnosisId' });
    }
  }
  DiagnosisReport.init({ 
    diagnosisReportId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'diagnosis_report_id',
    },
    diagnosisReportUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'diagnosis_report_uuid',
    },
    diagnosisReport: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'diagnosis_report',
    },
    diagnosisId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'diagnosis_id',
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
    modelName: 'DiagnosisReport',
    tableName: 'diagnosis_reports',
  });
  return DiagnosisReport;
};