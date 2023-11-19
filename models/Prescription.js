'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Prescription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Prescription.belongsTo(models.Medicine, { foreignKey: 'medicineId' });
      Prescription.belongsTo(models.Visit, { foreignKey: 'visitId' });
    }
  }
  Prescription.init({ 
    prescriptionId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'prescription_id',
    },
    prescriptionUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'prescription_uuid',
    },
    medicineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'medicine_id',
    },
    dosage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'dosage',
    },
    frequency: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'frequency',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'duration',
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
    modelName: 'Prescription',
    tableName: 'prescriptions',
  });
  return Prescription;
};