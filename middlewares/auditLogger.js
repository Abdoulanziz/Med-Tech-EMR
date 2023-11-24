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

    console.log(auditLogData)

    const data = await AuditLog.create(auditLogData);
    console.log("------->>>>>>>>>>", data)

    console.log('Audit log created successfully:', auditLogData);
  } catch (error) {
    console.error('Error creating audit log:', error.message);
  }
}

module.exports = createAuditLog;
