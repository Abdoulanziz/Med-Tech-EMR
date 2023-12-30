// In your model file
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    static associate(models) {
      // define association here
      AuditLog.belongsTo(models.User, { foreignKey: 'userId'});
    }
  }

  AuditLog.init(
    {
      auditLogId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'audit_log_id',
      },
      auditLogUuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'audit_log_uuid',
      },
      entityName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'entity_name',
      },
      entityId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'entity_id',
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'action',
      },
      oldValue: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'old_value',
      },
      newValue: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'new_value',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
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
      modelName: 'AuditLog',
      tableName: 'audit_logs',
    }
  );

  return AuditLog;
};
