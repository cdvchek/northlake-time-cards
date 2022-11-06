const express = require('express');
const router = express.Router();
const { TimeCard, TimeInOut, TimePeriod, Title } = require('../../models');
const { DateTime } = require('luxon');


function compareTimeInOuts(a, b) {
    return a.order - b.order;
}

// User Current Time Card - RESTR
router.get("/", async (req, res) => {
    try {
        // Check to see if the user is registered
        if (req.session.user) {

            // Grabbing the current timeperiod
            const timeperiod = await TimePeriod.findOne({
                where: {
                    isCurrent: true,
                }
            });

            // CHECKING TO SEE IF WE NEED A NEW TIMEPERIOD

            // Checking to see if time periods have been initialized
            if (timeperiod !== null) {

                // Creating date objects
                const startDateObj = DateTime.fromISO(timeperiod.dataValues.date_start);
                const endDateObj = DateTime.fromISO(startDateObj.plus({ days: 14 }).toISODate());
                const newStartDate = endDateObj.plus({ days: 1 }).toISODate();
                const nowDateObj = DateTime.now();

                // Comparing the end of the current time period with todays date
                if (endDateObj.startOf("day") < nowDateObj.startOf("day")) {

                    // If we need a new time period, update the old time periods and make a new one

                    // Destroying the old time period
                    await TimePeriod.destroy({
                        where: {
                            isTwoPrevious: true,
                        }
                    });

                    // Updating the previous timeperiod to now be the twoprevious timeperiod
                    await TimePeriod.update({
                        isPrevious: false,
                        isTwoPrevious: true,
                    }, {
                        where: {
                            isPrevious: true,
                        }
                    });

                    // Updating the current timeperiod to now be the previous timeperiod
                    await TimePeriod.update({
                        isCurrent: false,
                        isPrevious: true,
                    }, {
                        where: {
                            isCurrent: true,
                        }
                    });

                    // Creating the new current timeperiod
                    const newTimeperiod = await TimePeriod.create({
                        date_start: newStartDate,
                        isCurrent: true,
                        isPrevious: false,
                        isTwoPrevious: false,
                    });

                    // Creating a new set of timecards for each user for the new timeperiod

                    // Grabbing all the titles
                    const titles = (await Title.findAll()).map((title) => title.dataValues);

                    // Looping over each title and creating a new timecard
                    titles.forEach(async (title) => {

                        // Create a new timecard associated with the new time period
                        const newTimeCard = await TimeCard.create({
                            timeperiod_id: newTimeperiod.timeperiod_id,
                            user_id: title.user_id,
                            title_id: title.title_id,
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
                    });
                }
            }

            // END OF CHECKING FOR NEW TIME PERIODS

            // Declaring the handlebars object
            let hbsObj = {};

            // Grabbing the current timeperiod
            const currentTimePeriodRaw = (await TimePeriod.findOne({
                where: {
                    isCurrent: true,
                }
            }));

            // Checking that there is a current timeperiod
            if (currentTimePeriodRaw !== null) {

                // Grabbing the useful data from the current timeperiod
                const currentTimePeriod = currentTimePeriodRaw.dataValues;

                // Grabbing the previous timeperiod
                const previousTimePeriod = (await TimePeriod.findOne({
                    where: {
                        isPrevious: true,
                    }
                })).dataValues;

                // Grabbing the two previous timeperiod
                const twoPreviousTimePeriod = (await TimePeriod.findOne({
                    where: {
                        isTwoPrevious: true,
                    }
                })).dataValues;

                // Grabbing the user's current timecard(s)
                const currentTimeCards = (await TimeCard.findAll({
                    where: {
                        user_id: req.session.user.user_id,
                        timeperiod_id: currentTimePeriod.timeperiod_id,
                    },
                    include: TimeInOut,
                })).map((timecard) => timecard.dataValues);

                // If the user has current timecards
                if (currentTimeCards) {

                    // Grabbing the user's previous timecard(s)
                    const previousTimeCards = (await TimeCard.findAll({
                        where: {
                            user_id: req.session.user.user_id,
                            timeperiod_id: previousTimePeriod.timeperiod_id,
                        },
                        include: TimeInOut,
                    })).map((timecard) => timecard.dataValues);

                    // Grabbing the user's two previous timecard(s)
                    const twoPreviousTimeCards = (await TimeCard.findAll({
                        where: {
                            user_id: req.session.user.user_id,
                            timeperiod_id: twoPreviousTimePeriod.timeperiod_id,
                        },
                        include: TimeInOut,
                    })).map((timecard) => timecard.dataValues);

                    // Putting all the timecards into an array (ordered)
                    const allTimeCards = [...currentTimeCards, ...previousTimeCards, ...twoPreviousTimeCards];

                    // Getting rid of unwanted data
                    allTimeCards.forEach((timecard) => {
                        timecard.TimeInOuts = timecard.TimeInOuts.map((timeinout) => timeinout.dataValues);
                    });

                    // Constant utility array
                    const week = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

                    // Declaring a variable
                    let firstTitleId;

                    // For each time card we want to prepare its data for the handlebars template
                    allTimeCards.forEach(async (timecard, i) => {

                        // Mapping the timeinouts for the timecard
                        const timeInOuts = timecard.TimeInOuts.map((timeinout) => {

                            // Declaring variables
                            const times_in = [];
                            const times_out = [];

                            // Looping through a time_in and a time_out and 7 days a week
                            for (let j = 0; j < 2; j++) { // j = 0, time in // j = 1, time out
                                for (let i = 0; i < week.length; i++) { // 7 days in a week

                                    // Grabbing the day string from the utility array
                                    const day = week[i];

                                    // Deciding if its a time in or a time out
                                    let valueType;
                                    if (j == 0) {
                                        valueType = "in"
                                    } else {
                                        valueType = "out"
                                    }

                                    // Data prepared for the handlebars template
                                    const obj = {
                                        name: `${timeinout.order}_${day}_${valueType}_${timeinout.week}_${timecard.timecard_id}`,
                                        value: timeinout[day + "_" + valueType],
                                        cellsClass: `edit-time-${timeinout.week}-${timecard.timecard_id}`
                                    };

                                    // Pushing to the correct array
                                    if (j == 0) {
                                        times_in.push(obj);
                                    } else {
                                        times_out.push(obj);
                                    }
                                }
                            }

                            // Mapping return
                            return {
                                ...timeinout,
                                times_in,
                                times_out,
                            }
                        });

                        // Filtering the timeinouts we want into the 2 weeks
                        const timeInOuts1 = timeInOuts.filter((timeinout) => (timeinout.week === 1));
                        timeInOuts1.sort(compareTimeInOuts);
                        const timeInOuts2 = timeInOuts.filter((timeinout) => (timeinout.week === 2));
                        timeInOuts2.sort(compareTimeInOuts);

                        // Adding the 2 weeks of timeinouts to the timecard object
                        timecard.timeInOuts1 = timeInOuts1;
                        timecard.timeInOuts2 = timeInOuts2;

                        // Assigning a timeperiod to the timecard
                        if (timecard.timeperiod_id === currentTimePeriod.timeperiod_id) {
                            timecard.period = "current";

                            // Letting the handlebars template know which timecard to display
                            if (i === 0) {
                                timecard.isFirst = true;
                                firstTitleId = timecard.title_id;
                            }
                        }

                        // Assigning a timeperiod to the timecard
                        if (timecard.timeperiod_id === previousTimePeriod.timeperiod_id) {
                            timecard.period = "previous";
                        }

                        // Assigning a timeperiod to the timecard
                        if (timecard.timeperiod_id === twoPreviousTimePeriod.timeperiod_id) {
                            timecard.period = "twoprevious";
                        }

                        timecard.title = (await Title.findByPk(timecard.title_id)).dataValues.name.replaceAll(" ", "@");
                        timecard.titlename = timecard.title.replace("@", " ");
                        timecard.dataid = `${timecard.title}-${timecard.period}`;

                        const startString = (await TimePeriod.findByPk(timecard.timeperiod_id)).dataValues.date_start;
                        const startObj = DateTime.fromISO(startString);
                        const endString = DateTime.fromISO(startObj.plus({ days: 13 }).toISODate()).toISODate();
                        const [endYear, endMonth, endDay] = endString.split("-");
                        const [startYear, startMonth, startDay] = startString.split("-");

                        timecard.startdate = `${startMonth}/${startDay}/${startYear}`;
                        timecard.enddate = `${endMonth}/${endDay}/${endYear}`;
                        for (let i = 1; i <= 13; i++) {
                            const day = DateTime.fromISO(startObj.plus({ days: i }).toISODate()).toISODate();
                            const [dayYear, dayMonth, dayDay] = day.split("-");
                            timecard[`day${i}`] = `${dayMonth}/${dayDay}/${dayYear}`;
                        }
                    });
                    const titles = (await Title.findAll({
                        where: {
                            user_id: req.session.user.user_id,
                        }
                    })).map((title) => {
                        return {
                            ...title.dataValues,
                            dataname: title.dataValues.name.replaceAll(" ", "@"),
                        }
                    });
                    const firstTitleIndex = titles.findIndex((title) => title.title_id == firstTitleId);
                    const firstTitle = titles[firstTitleIndex];
                    titles.splice(firstTitleIndex, 1);
                    titles.unshift(firstTitle);

                    const isFirstTimeCardReady = allTimeCards[0].isReadyToBeApproved;
                    hbsObj = {
                        hasTimeCard: true,
                        userName: req.session.user.name,
                        isAdmin: req.session.user.isAdmin,
                        isSuper: req.session.user.isSuper,
                        timecards: allTimeCards,
                        titles,
                        isFirstTimeCardReady,
                    }
                } else {
                    hbsObj = {
                        hasTimeCard: false,
                        userName: req.session.user.name,
                        isAdmin: req.session.user.isAdmin,
                        isSuper: req.session.user.isSuper,
                    }
                }
            } else {
                hbsObj = {
                    hasTimeCard: false,
                    userName: req.session.user.name,
                    isAdmin: req.session.user.isAdmin,
                    isSuper: req.session.user.isSuper,
                }
            }
            res.render("user-timecard", hbsObj);
        } else {
            res.render("signin")
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;