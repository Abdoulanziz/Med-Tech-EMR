// In your model file
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FacilitySetting extends Model {
    static associate(models) {
      // define association here
      FacilitySetting.belongsTo(models.Facility, { foreignKey: 'facilityId' });
    }
  }

  FacilitySetting.init(
    {
      facilitySettingId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'facility_setting_id',
      },
      facilitySettingUuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'facility_setting_uuid',
      },
      facilityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'facility_id',
      },
      facilitySettingName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'facility_setting_name',
      },
      facilitySettingValue: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'facility_setting_value',
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
      modelName: 'FacilitySetting',
      tableName: 'facility_settings',
    }
  );

  return FacilitySetting;
};
