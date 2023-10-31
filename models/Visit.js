'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Visit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Visit.belongsTo(models.Doctor, { foreignKey: 'doctorId' });
      Visit.belongsTo(models.Patient, { foreignKey: 'patientId' });
    }
  }
  Visit.init({ 
    visitId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'visit_id',
    },
    visitUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'visit_uuid',
    },
    visitDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'visit_date',
    },
    visitCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'visit_category_id',
    },
    visitStatus: {
      type: DataTypes.ENUM('Scheduled', 'Cancelled', 'Completed'),
      allowNull: false,
      defaultValue: 'Scheduled',
      field: 'visit_status',
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'patient_id',
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'doctor_id',
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
    modelName: 'Visit',
    tableName: 'visits',
  });
  return Visit;
};