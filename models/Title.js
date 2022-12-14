const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/connection");

class Title extends Model { }

Title.init(
    {
        title_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        supervisor_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    },
    {
        sequelize,
    }
)

module.exports = Title;