const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/connection");

class OffDay extends Model { }

OffDay.init(
    {
        offday_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        date: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isSick: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        isVacation: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
    },
    {
        sequelize,
    }
)

module.exports = OffDay;