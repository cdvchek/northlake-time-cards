const createTimecard = require("./createTimecard.js");
const findPeriodsInOrder = require("./findPeriodsInOrder.js");
const findPeriodNames = require("./findPeriodNames.js");
const findAllDates = require("./findAllDates.js");

// Useful arrays that are used multiple times
const weekArrLower = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const periodIdentifiers = ["current", "previous", "twoPrevious"];

module.exports = {
    createTimecard,
    findPeriodsInOrder,
    findPeriodNames,
    findAllDates,
    weekArrLower,
    periodIdentifiers,
}