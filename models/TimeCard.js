const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/connection");

class TimeCard extends Model { }

TimeCard.init(
    {
        timecard_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        isApproved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isReadyToBeApproved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    },
    {
        sequelize,
    }
)

module.exports = TimeCard;