const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/connection");

class TimePeriod extends Model { }

TimePeriod.init(
    {
        timeperiod_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        date_start: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isCurrent: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isPrevious: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isTwoPrevious: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        }
    },
    {
        sequelize,
    }
)

module.exports = TimePeriod;