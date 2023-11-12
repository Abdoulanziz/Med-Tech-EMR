'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LabResultForCompleteBloodCount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LabResultForCompleteBloodCount.belongsTo(models.LabRequest, { foreignKey: 'requestId' });
    }
  }
  LabResultForCompleteBloodCount.init({ 
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
    whiteBloodCellCount: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'white_blood_cell_count',
    },
    lymphocyteAbsolute: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'lymphocyte_absolute',
    },
    mid: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'mid',
    },
    gran: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'gran',
    },
    lymphocytePercentage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'lymphocyte_percentage',
    },
    midPercentage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'mid_percentage',
    },
    granPercentage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'gran_percentage',
    },
    haemoglobin: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'haemoglobin',
    },
    redBloodCellCount: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'red_blood_cell_count',
    },
    packedCellVolume: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'packed_cell_volume',
    },
    meanCellVolume: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'mean_cell_volume',
    },
    meanCellHaemoglobin: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'mean_cell_haemoglobin',
    },
    mchc: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'mchc',
    },
    rdwCv: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'rdwCv',
    },
    rdwSd: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'rdwSd',
    },
    plateleteCount: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'platelete_count',
    },
    mpv: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'mpv',
    },
    pwd: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'pwd',
    },
    pct: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'pct',
    },
    erythrocyteSedimentationRate: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'erythrocyte_sedimentation_rate',
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
    modelName: 'LabResultForCompleteBloodCount',
    tableName: 'lab_results_for_complete_blood_count',
  });
  return LabResultForCompleteBloodCount;
};