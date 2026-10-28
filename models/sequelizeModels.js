/**
 * CareBridge — Sequelize ORM Model Definitions
 * File: models/sequelizeModels.js
 * 
 * Demonstrates:
 * - Defining models with sequelize.define() (PDF Page 2)
 * - Specifying data types, validation constraints, and defaults
 * - Defining relational associations (hasMany, belongsTo)
 * - Performing programmatic CRUD and JOIN queries
 */

/**
 * Factory to initialize Sequelize models against a given Sequelize instance.
 * @param {object} sequelize - Sequelize connection instance
 * @param {object} DataTypes - Sequelize DataTypes object
 */
export function initSequelizeModels(sequelize, DataTypes) {
  // 1. Department Model
  const Department = sequelize.define('Department', {
    code: {
      type: DataTypes.STRING(16),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    floor: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    emergencyCapable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'departments',
    timestamps: true
  });

  // 2. Patient Model
  const Patient = sequelize.define('Patient', {
    id: {
      type: DataTypes.STRING(32),
      primaryKey: true
    },
    mrn: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      validate: {
        is: /^MRN-\d{4,6}$/i
      }
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: [2, 150]
      }
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 125
      }
    },
    painLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10
      }
    },
    priority: {
      type: DataTypes.ENUM('urgent', 'priority', 'routine'),
      allowNull: false,
      defaultValue: 'routine'
    },
    arrivalTime: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT
    },
    discharged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'patients',
    timestamps: true,
    indexes: [
      { fields: ['priority'] },
      { fields: ['mrn'] }
    ]
  });

  // 3. Prescription Model
  const Prescription = sequelize.define('Prescription', {
    id: {
      type: DataTypes.STRING(32),
      primaryKey: true
    },
    drugName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    dosage: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    scheduledTime: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    mealTiming: {
      type: DataTypes.ENUM('before', 'with', 'after'),
      defaultValue: 'after'
    },
    doctor: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    taken: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastTakenAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'prescriptions',
    timestamps: true
  });

  // Relational Associations (Foreign Keys & Joins)
  Department.hasMany(Patient, { foreignKey: 'departmentId', as: 'patients' });
  Patient.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

  Patient.hasMany(Prescription, { foreignKey: 'patientId', as: 'prescriptions' });
  Prescription.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

  return { Department, Patient, Prescription };
}

export default initSequelizeModels;

