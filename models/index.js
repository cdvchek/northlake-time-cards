const User = require("./User.js");
const TimeCard = require("./TimeCard.js");
const TimeInOut = require("./TimeInOut.js");
const TimePeriod = require("./TimePeriod.js");
const Title = require("./Title.js");
const OffDay = require("./OffDay.js");

User.hasMany(TimeCard, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
TimeCard.belongsTo(User, { foreignKey: 'user_id' });

TimeCard.hasMany(TimeInOut, {
    foreignKey: 'timecard_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
TimeInOut.belongsTo(TimeCard, { foreignKey: 'timecard_id' });

TimePeriod.hasMany(TimeCard, {
    foreignKey: 'timeperiod_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
TimeCard.belongsTo(TimePeriod, { foreignKey: 'timeperiod_id' });

User.hasMany(Title, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Title.belongsTo(User, { foreignKey: 'user_id' });

Title.hasMany(TimeCard, {
    foreignKey: 'title_id',
    onDelete: 'CASCADE',
});
TimeCard.belongsTo(Title, { foreignKey: 'title_id' });

TimeCard.hasMany(OffDay, {
    foreignKey: 'timecard_id',
    onDelete: 'CASCADE',
});
OffDay.belongsTo(TimeCard, { foreignKey: 'timecard_id' });

module.exports = {
    User,
    TimeCard,
    TimeInOut,
    TimePeriod,
    Title,
    OffDay,
}