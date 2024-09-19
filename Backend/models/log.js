module.exports = (sequelize, DataTypes) => {
    const Log = sequelize.define('logs', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE', // Optional: if the referenced user is deleted, the log entry will be deleted too
        },
        api: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        ip:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY, // For date only (YYYY-MM-DD)
            allowNull: false,
        },
        time: {
            type: DataTypes.STRING, // For time only (HH:MM:SS)
            allowNull: false,
        },
    }, {
        tableName: 'logs', // Change this to the name you want for your table
        timestamps: false, // No automatic timestamps (createdAt, updatedAt)
    });

    Log.associate = (models) => {
        Log.belongsTo(models.users, { foreignKey: 'user_id', as: 'userDetails' });
    };

    return Log;
};
