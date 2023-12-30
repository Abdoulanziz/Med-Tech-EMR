// In your model file
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Facility extends Model {
    static associate(models) {
      // define association here
    }
  }

  Facility.init(
    {
      facilityId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'facility_id',
      },
      facilityUuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'facility_uuid',
      },
      facilityName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'facility_name',
      },
      facilityAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'facility_address',
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'contact_email',
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'phone_number',
      },
      facilityLogo: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'facility_logo',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'Facility',
      tableName: 'facilities',
    }
  );

  return Facility;
};
