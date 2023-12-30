'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Patient.hasMany(models.Visit, { foreignKey: 'patientId' });
    }
  }
  Patient.init({ 
    patientId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'patient_id',
    },
    patientUuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      field: 'patient_uuid',
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
    nationalIDNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'national_id_number',
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
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'contact_number',
    },
    alternativeContactNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'alternative_contact_number',
    },
    homeAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'home_address',
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
      field: 'email_address',
    },
    nokFirstName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'nok_first_name',
    },
    nokLastName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'nok_last_name',
    },
    nokRelationship: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'nok_relationship',
    },
    nokContactNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'nok_contact_number',
    },
    nokHomeAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'nok_home_address',
    },
    insuranceProviderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'insurance_provider_id',
    },
    billingMethodId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'billing_method_id',
    },
    bloodType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'blood_type',
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
    modelName: 'Patient',
    tableName: 'patients',
  });
  return Patient;
};