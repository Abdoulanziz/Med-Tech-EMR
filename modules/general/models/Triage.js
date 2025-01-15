'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Triage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Triage.belongsTo(models.Visit, { foreignKey: 'visitId' });
    }
  }
  Triage.init({ 
    triageId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'triage_id',
    },
    triageUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'triage_uuid',
    },
    bloodPressure: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'blood_pressure',
    },
    heartRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'heart_rate',
    },
    respiratoryRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'respiratory_rate',
    },
    signsAndSymptoms: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'signs_and_symptoms',
    },
    injuryDetails: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'injury_details',
    },
    visitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'visit_id',
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
    modelName: 'Triage',
    tableName: 'triages',
  });
  return Triage;
};