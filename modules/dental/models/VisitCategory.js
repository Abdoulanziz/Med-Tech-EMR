'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VisitCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      VisitCategory.hasMany(models.Visit, { foreignKey: 'visitCategoryId' });
    }
  }
  VisitCategory.init({ 
    visitCategoryId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'visit_category_id',
    },
    visitCategoryUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'visit_category_uuid',
    },
    visitCategoryName: {
      type: DataTypes.ENUM('Consultation', 'Treatment', 'Other'),
      allowNull: false,
      defaultValue: 'Consultation',
      unique: true,
      field: 'visit_category_name',
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
    modelName: 'VisitCategory',
    tableName: 'visit_categories',
  });
  return VisitCategory;
};