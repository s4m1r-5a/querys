'use strict';

module.exports = (sequelize, DataTypes) => {
  const Usury = sequelize.define(
    'Usury',
    {
      annualRate: {
        type: DataTypes.DECIMAL(11, 4),
        allowNull: false
      },
      monthlyRate: {
        type: DataTypes.DECIMAL(11, 4),
        allowNull: true
      },
      dailyRate: {
        type: DataTypes.DECIMAL(11, 4),
        allowNull: true
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      }
    },
    { tableName: 'usurys', timestamps: false }
  );

  Usury.associate = function (models) {
    //User.hasOne(models.Person, { as: 'person', foreignKey: 'user_id' });
  };

  return Usury;
};
