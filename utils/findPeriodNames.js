const { DateTime } = require('luxon');
const findPeriodsInOrder = require('./findPeriodsInOrder');

const findPeriodNames = async () => {
    
    // Get the periods
    const periods = await findPeriodsInOrder();

    // Initialize for returning
    const periodNames = [];
    const periodNamesLong = [];

    for (let i = 0; i < periods.length; i++) {

        // Get the starting date for the period and turn it into a luxon object
        const startDate = periods[i].date_start;
        const startDateObj = DateTime.fromISO(startDate);

        // Get a readable string for the start date and split it into the year, month, and day
        const startDateString = startDateObj.toISODate();
        const [startYear, startMonth, startDay] = startDateString.split("-");

        // Reform the starting date into a normal date string
        const normalStartString = `${startMonth}/${startDay}/${startYear}`;

        // Get a readable string for the end date and split it into the year, month, and day
        const endDateString = startDateObj.plus({ days: 13 }).toISODate();
        const [endYear, endMonth, endDay] = endDateString.split("-");

        // Reform the ending date into a normal date string
        const normalEndString = `${endMonth}/${endDay}/${endYear}`;



        // Reform the string into a normal date of month/day/year
        const periodName = `${normalStartString}-${normalEndString}`; // no space
        const periodNameLong = `${normalStartString} - ${normalEndString}`; // added spaces to look better
        
        // Pushing onto the correct array
        periodNames.push(periodName);
        periodNamesLong.push(periodNameLong);

    }

    return {
        periodNames,
        periodNamesLong,
    }
}

module.exports = findPeriodNames;