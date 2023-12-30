'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RolePermission.init(
    {
      rolePermissionId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
        field: 'role_permission_id',
      },
      rolePermissionUuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'role_permission_uuid',
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'role_id',
      },
      permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'permission_id',
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
      modelName: 'RolePermission',
      tableName: 'role_permissions',
    }
  );

  return RolePermission;
};