// In your model file
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Doctor extends Model {
    static associate(models) {
      // define association here
      Doctor.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Doctor.init(
    {
      doctorId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'doctor_id',
      },
      doctorUuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'doctor_uuid',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id',
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name',
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name',
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'date_of_birth',
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'gender',
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
        field: 'email',
      },
      contactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'contact_number',
      },
      specialtyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'specialty_id',
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'department',
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
      modelName: 'Doctor',
      tableName: 'doctors',
    }
  );

  return Doctor;
};
