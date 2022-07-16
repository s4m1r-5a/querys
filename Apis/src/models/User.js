'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }
    },
    { tableName: 'users' }
  );

  User.associate = function (models) {
    //User.hasOne(models.Person, { as: 'person', foreignKey: 'user_id' });
  };

  return User;
};
