'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Diagnosis extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Diagnosis.belongsTo(models.Visit, { foreignKey: 'visitId' });
    }
  }
  Diagnosis.init({ 
    diagnosisId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'diagnosis_id',
    },
    diagnosisUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'diagnosis_uuid',
    },
    testName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'test_name',
    },
    clinicalNotes: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'clinical_notes',
    },
    fees: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'fees',
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
    modelName: 'Diagnosis',
    tableName: 'diagnoses',
  });
  return Diagnosis;
};