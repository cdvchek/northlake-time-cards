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
        sunday_vacation_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        monday_vacation_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        tuesday_vacation_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        wednesday_vacation_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        thursday_vacation_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        friday_vacation_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        saturday_vacation_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sunday_sick_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        monday_sick_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        tuesday_sick_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        wednesday_sick_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        thursday_sick_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        friday_sick_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        saturday_sick_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sunday_vacation_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        monday_vacation_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        tuesday_vacation_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        wednesday_vacation_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        thursday_vacation_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        friday_vacation_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        saturday_vacation_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sunday_sick_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        monday_sick_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        tuesday_sick_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        wednesday_sick_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        thursday_sick_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        friday_sick_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        saturday_sick_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        }
    },
    {
        sequelize,
    }
)

module.exports = OffDay;