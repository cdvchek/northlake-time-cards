const { TimeCard, TimeInOut, OffDay } = require('../models');

const createTimecard = async (timeperiod_id, user_id, title_id) => {
    // Create a new timecard associated with the new time period
    const newTimeCard = await TimeCard.create({
        timeperiod_id: timeperiod_id,
        user_id: user_id,
        title_id: title_id,
    });

    // Create the vacation/sick offday for the timecard
    await OffDay.create({
        timecard_id: newTimeCard.timecard_id,
    });

    // Creating 8 timeinouts for the new timecard
    // 2 weeks per timecard and each week has a default of 4 timeinouts
    for (let j = 0; j < 2; j++) { // 2 weeks
        for (let k = 0; k < 4; k++) { // 4 timeinouts per week
            await TimeInOut.create({
                timecard_id: newTimeCard.timecard_id,
                week: j + 1,
                order: k + 1,
            });
        }
    }
}

module.exports = createTimecard;