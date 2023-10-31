'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Service.belongsTo(models.Visit, { foreignKey: 'visitId' });
    }
  }
  Service.init({ 
    serviceId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'service_id',
    },
    serviceUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'service_uuid',
    },
    serviceName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'service_name',
    },
    serviceFees: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'service_fees',
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
    modelName: 'Service',
    tableName: 'services',
  });
  return Service;
};