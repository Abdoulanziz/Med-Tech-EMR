'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      Role.hasMany(models.User, { foreignKey: 'roleId' });
    }
  }
  Role.init(
    {
      roleId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
        field: 'role_id',
      },
      roleUuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'role_uuid',
      },
      roleName: {
        type: DataTypes.ENUM('superadmin', 'admin', 'doctor', 'nurse', 'receptionist'),
        allowNull: false,
        unique: true,
        field: 'role_name',
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
      modelName: 'Role',
      tableName: 'roles',
    }
  );
  return Role;
};