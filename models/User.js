const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/connection');

class User extends Model { }

User.init(
    {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isSuper: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        supervisees: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        }
    },
    {
        hooks: {
            beforeCreate: async (newData) => {
                newData.password = await bcrypt.hash(newData.password, 6);
                return newData;
            },
            beforeUpdate: async (newData) => {
                newData.password = await bcrypt.hash(newData.password, 6);
                return newData;
            }
        },
        sequelize,
    },
)

module.exports = User;