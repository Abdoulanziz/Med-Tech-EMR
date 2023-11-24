const {AuditLog} = require('../models');

async function createAuditLog(entityName, entityId, action, oldValue, newValue, userId) {
  try {
    const auditLogData = {
      entityName,
      entityId,
      action,
      oldValue: oldValue || {},
      newValue,
      userId,
    };

    await AuditLog.create(auditLogData);
    
  } catch (error) {
    console.error('Error creating audit log:', error.message);
  }
}

module.exports = createAuditLog;
