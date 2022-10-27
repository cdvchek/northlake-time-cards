const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/connection");

class TimeInOut extends Model { }

TimeInOut.init(
    {
        timeinout_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        week: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        notes_in: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        sunday_in: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        monday_in: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        tuesday_in: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        wednesday_in: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        thursday_in: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        friday_in: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        saturday_in: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        notes_out: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        sunday_out: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        monday_out: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        tuesday_out: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        wednesday_out: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        thursday_out: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        friday_out: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        saturday_out: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        }
    },
    {
        sequelize,
    }
)

module.exports = TimeInOut;