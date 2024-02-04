'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClinicalProcedureForDental extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ClinicalProcedureForDental.init({ 
    procedureId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'procedure_id',
    },
    procedureUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'procedure_uuid',
    },
    procedureName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'procedure_name',
    },
    procedureCategory: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'procedure_category',
    },
    procedureFees: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'procedure_fee',
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
    modelName: 'ClinicalProcedureForDental',
    tableName: 'clinical_procedures_for_dental',
  });
  return ClinicalProcedureForDental;
};