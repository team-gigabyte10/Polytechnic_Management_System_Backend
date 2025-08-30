const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import all models
const User = require('./User');
const Department = require('./Department');
const Course = require('./Course');
const Student = require('./Student');
const Teacher = require('./Teacher');
const GuestTeacher = require('./GuestTeacher');
const Subject = require('./Subject');
const Class = require('./Class');
const Attendance = require('./Attendance');
const Mark = require('./Mark');
const Announcement = require('./Announcement');
const Salary = require('./Salary');
const StudentPayment = require('./StudentPayment');
const Expense = require('./Expense');
const AttendanceRewardFine = require('./AttendanceRewardFine');
const TeachingSession = require('./TeachingSession');

// Initialize models
const models = {
  User: User(sequelize, DataTypes),
  Department: Department(sequelize, DataTypes),
  Course: Course(sequelize, DataTypes),
  Student: Student(sequelize, DataTypes),
  Teacher: Teacher(sequelize, DataTypes),
  GuestTeacher: GuestTeacher(sequelize, DataTypes),
  Subject: Subject(sequelize, DataTypes),
  Class: Class(sequelize, DataTypes),
  Attendance: Attendance(sequelize, DataTypes),
  Mark: Mark(sequelize, DataTypes),
  Announcement: Announcement(sequelize, DataTypes),
  Salary: Salary(sequelize, DataTypes),
  StudentPayment: StudentPayment(sequelize, DataTypes),
  Expense: Expense(sequelize, DataTypes),
  AttendanceRewardFine: AttendanceRewardFine(sequelize, DataTypes),
  TeachingSession: TeachingSession(sequelize, DataTypes)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;

module.exports = models;