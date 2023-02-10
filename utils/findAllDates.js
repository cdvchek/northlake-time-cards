const { DateTime } = require('luxon');
const findPeriodsInOrder = require('./findPeriodsInOrder.js');

const weekArrLower = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const periodIdentifiers = ["current", "previous", "twoPrevious"];

const findAllDates = async () => {

    // Initialize for returning
    const datesObj = {
        current: {},
        previous: {},
        twoPrevious: {},
    }

    // Get the periods
    const periods = await findPeriodsInOrder();

    // Get the start dates of each period
    const startDates = [];
    for (let i = 0; i < periods.length; i++) {
        const period = periods[i];
        startDates.push(period.date_start);
    }

    // Get the rest of the dates
    for (let i = 0; i < startDates.length; i++) {
        const startDate = startDates[i];

        // Create a luxon object for the start date
        const startDateObj = DateTime.fromISO(startDate);

        // Initializing for returning
        const dates = [];

        for (let j = 0; j < 14; j++) {

            // Get the date for each day incrementing by j
            const date = startDateObj.plus({ days: j }).toISODate();

            // Split the date and reform into a normal date string
            const [dateYear, dateMonth, dateDay] = date.split("-");
            const dateString = `${dateMonth}/${dateDay}/${dateYear}`;

            // Push onto array for returning
            dates.push(dateString);
        }

        for (let j = 0; j < weekArrLower.length; j++) {
            const day = weekArrLower[j];
            const week1date = dates[j];
            const week2date = dates[j + 7];
            
            datesObj[periodIdentifiers[i]][`${day}_1`] = week1date;
            datesObj[periodIdentifiers[i]][`${day}_2`] = week2date;
        }
    }
    return datesObj;
}

module.exports = findAllDates;