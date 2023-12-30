// In your model file
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Income extends Model {
    static associate(models) {
      // define association here
      Income.belongsTo(models.Patient, { foreignKey: 'patientId' });
      Income.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Income.init(
    {
      incomeId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'income_id',
      },
      incomeUuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'income_uuid',
      },
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'patient_id',
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'amount',
      },
      paymentMethod: {
        type: DataTypes.ENUM('cash', 'insurance', 'account'),
        defaultValue: 'cash',
        allowNull: false,
        field: 'payment_method',
      },
      narration: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'narration',
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
      modelName: 'Income',
      tableName: 'income',
    }
  );

  return Income;
};
