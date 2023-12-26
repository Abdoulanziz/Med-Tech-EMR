// In your model file
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    static associate(models) {
      // define association here
      Expense.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Expense.init(
    {
      expenseId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'expense_id',
      },
      expenseUuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'expense_uuid',
      },
      expenseCategory: {
        type: DataTypes.ENUM('utilities', 'rent', 'others'),
        defaultValue: 'utilities',
        allowNull: false,
        field: 'expense_category',
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
      modelName: 'Expense',
      tableName: 'expenses',
    }
  );

  return Expense;
};
