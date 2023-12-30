'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LabResultForUrinalysis extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LabResultForUrinalysis.belongsTo(models.LabRequest, { foreignKey: 'requestId' });
    }
  }
  LabResultForUrinalysis.init({ 
    resultId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'result_id',
    },
    resultUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'result_uuid',
    },
    requestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'request_id',
    },
    appearance: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'appearance',
    },
    glucose: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'glucose',
    },
    ketone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ketone',
    },
    blood: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'blood',
    },
    ph: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ph',
    },
    protein: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'protein',
    },
    nitrites: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'nitrites',
    },
    leucocytes: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'leucocytes',
    },
    urobilinogen: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'urobilinogen',
    },
    bilirubin: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'bilirubin',
    },
    specificGravity: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'specific_gravity',
    },
    rbc: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'rbc',
    },
    pusCells: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'pus_cells',
    },
    epithelialCells: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'epithelial_cells',
    },
    cast: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'cast',
    },
    wbc: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'wbc',
    },
    parasite: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'parasite',
    },
    crystals: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'crystals',
    },
    tVaginalis: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 't_vaginalis',
    },
    yeastCells: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'yeast_cells',
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'comment',
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
    modelName: 'LabResultForUrinalysis',
    tableName: 'lab_results_for_urinalysis',
  });
  return LabResultForUrinalysis;
};