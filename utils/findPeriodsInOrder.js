const { TimePeriod } = require("../models");

const findPeriodsInOrder = async () => {

    // Find the thre periods
    const currentPeriod = (await TimePeriod.findOne({ where: { isCurrent: true } })).dataValues;
    const previousPeriod = (await TimePeriod.findOne({ where: { isPrevious: true } })).dataValues;
    const twoPreviousPeriod = (await TimePeriod.findOne({ where: { isTwoPrevious: true } })).dataValues;
    
    // Put them in an array in order
    const periods = [ currentPeriod, previousPeriod, twoPreviousPeriod ];

    // Return the array
    return periods;
}

module.exports = findPeriodsInOrder;