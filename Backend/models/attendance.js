module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id',      },
    },
    in_time: DataTypes.STRING,
  
    out_time: DataTypes.STRING,
    
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    comment: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('Present', 'Absent', 'Halfday'),
    },
  }, {
    tableName: 'attendance',
    timestamps: false,
  });

  Attendance.associate = models => {
    Attendance.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Attendance;
};
