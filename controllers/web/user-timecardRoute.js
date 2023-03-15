const express = require('express');
const router = express.Router();
const { TimeCard, TimeInOut, TimePeriod, Title, OffDay } = require('../../models');
const { DateTime } = require('luxon');
const { createTimecard } = require("../../utils");

// User Current Time Card - RESTR
router.get("/", async (req, res) => {
    try {
        // Check to see if the user is registered
        if (req.session.user) {
            let hbsObj;

            // Grabbing the current timeperiod
            const timeperiodRaw = (await TimePeriod.findOne({
                where: {
                    isCurrent: true,
                }
            }));

            let timeperiod;
            if (timeperiodRaw) {
                timeperiod = timeperiodRaw.dataValues;
            }

            // CHECKING TO SEE IF WE NEED A NEW TIMEPERIOD

            // Checking to see if time periods have been initialized
            if (timeperiodRaw !== null) {
                
                // Creating date objects
                const startDateObj = DateTime.fromISO(timeperiod.date_start);
                const endDateObj = DateTime.fromISO(startDateObj.plus({ days: 13 }).toISODate());
                const newStartDate = endDateObj.plus({ days: 1 }).toISODate();
                const nowDateObj = DateTime.now();
                // Grabbing all the titles for use in the next if
                const titles = (await Title.findAll()).map((title) => title.dataValues);
                
                // Comparing the end of the current time period with todays date
                let newTimeperiods = false;
                if (endDateObj.startOf("day") < nowDateObj.startOf("day")) {
                    newTimeperiods = true;

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

                    // Looping over each title and creating a new timecard
                    for (let i = 0; i < titles.length; i++) {
                        const title = titles[i];
                        await createTimecard(newTimeperiod.timeperiod_id, title.user_id, title.title_id);
                    }
                }

                if (newTimeperiods) {
                    timeperiod = (await TimePeriod.findOne({
                        where: {
                            isCurrent: true,
                        }
                    })).dataValues;
                }

                // END OF CHECKING FOR NEW TIME PERIODS

                // Grabbing the users timecards
                const allTimeCards = (await TimeCard.findAll({
                    where: {
                        user_id: req.session.user.user_id,
                    },
                    include: TimeInOut,
                })).map((timecard) => timecard.dataValues);

                for (let i = 0; i < allTimeCards.length; i++) {
                    const timecard = allTimeCards[i];
                    timecard.TimeInOuts = timecard.TimeInOuts.map((timeinout) => timeinout.dataValues);
                }

                let timecards;
                let isFirstReady;

                // Checking to see if the user has timecards
                if (allTimeCards) {

                    // Grabbing the other two periods
                    const previousTimeperiod = (await TimePeriod.findOne({
                        where: {
                            isPrevious: true,
                        }
                    })).dataValues;
                    const twoPreviousTimeperiod = (await TimePeriod.findOne({
                        where: {
                            isTwoPrevious: true,
                        }
                    })).dataValues;

                    const currentTimecards = allTimeCards.filter((timecard) => (timecard.timeperiod_id === timeperiod.timeperiod_id));
                    const previousTimecards = allTimeCards.filter((timecard) => (timecard.timeperiod_id === previousTimeperiod.timeperiod_id));
                    const twoPreviousTimecards = allTimeCards.filter((timecard) => (timecard.timeperiod_id === twoPreviousTimeperiod.timeperiod_id));

                    const userTitles = (await Title.findAll({
                        where: {
                            user_id: req.session.user.user_id,
                        }
                    })).map((title) => title.dataValues);
                    
                    const usableTitles = userTitles.map((title) => {
                        return {
                            title_id: title.title_id,
                            name: title.name,
                        }
                    });
                    
                    const periods = [timeperiod, previousTimeperiod, twoPreviousTimeperiod];

                    const usablePeriods = periods.map((period) => {
                        const startDateObj = DateTime.fromISO(period.date_start);
                        const startDate = startDateObj.toISODate();
                        const endDate = startDateObj.plus({ days: 13 }).toISODate();
                        const [startYear, startMonth, startDay] = startDate.split("-");
                        const [endYear, endMonth, endDay] = endDate.split("-");
                        let periodIdentifier = "Current Period";
                        if (period.isPrevious) {
                            periodIdentifier = "Previous Period";
                        } else if (period.isTwoPrevious) {
                            periodIdentifier = "Two Periods Ago"
                        }
                        const periodName = `${startMonth}/${startDay}/${startYear} - ${endMonth}/${endDay}/${endYear} | ${periodIdentifier}`;
                        
                        return {
                            timeperiod_id: period.timeperiod_id,
                            periodName,
                        }
                    });

                    timecards = [...currentTimecards, ...previousTimecards, ...twoPreviousTimecards];

                    timecards = await Promise.all(timecards.map(async (timecard) => {
                        // Finding the title
                        const title = await (await Title.findByPk(timecard.title_id)).dataValues;

                        // Is First or Not
                        let isFirst = false;
                        if ((timecard.title_id === usableTitles[0].title_id) && (timecard.timeperiod_id === periods[0].timeperiod_id)) {
                            isFirst = true;
                            isFirstReady = timecard.isReadyToBeApproved;
                        }

                        // Finding the dates
                        let thisTimePeriod;
                        if (timecard.timeperiod_id === timeperiod.timeperiod_id) {
                            thisTimePeriod = timeperiod;
                        } else if (timecard.timeperiod_id === previousTimeperiod.timeperiod_id) {
                            thisTimePeriod = previousTimeperiod;
                        } else {
                            thisTimePeriod = twoPreviousTimeperiod;
                        }

                        const startDateObj = DateTime.fromISO(thisTimePeriod.date_start);
                        const dates = [];
                        for (let i = 0; i < 14; i++) {
                            const date = startDateObj.plus({ days: i }).toISODate();
                            const dateArr = date.split("-");
                            const day = dateArr[2];
                            const month = dateArr[1];
                            const year = dateArr[0];
                            const dateString = `${month}/${day}/${year}`;
                            dates.push(dateString);
                        }

                        const weekOneInOuts = timecard.TimeInOuts.filter((timeinout) => (timeinout.week === 1));
                        const weekTwoInOuts = timecard.TimeInOuts.filter((timeinout) => (timeinout.week === 2));
                        
                        const allInOuts = [weekOneInOuts, weekTwoInOuts];

                        // Preparing the data for the table
                        const week = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

                        const weeks = [];
                        const isNotApproved = !timecard.isApproved;

                        for (let i = 0; i < 2; i++) {
                            const weekObj = {
                                timecard_id: timecard.timecard_id,
                                week: `${i + 1}`,
                                trs: [],
                                isNotApproved,
                            }
                            // Header Row
                            const headerTrObj = {
                                cells: [
                                    {   
                                        cellType: "th",
                                        cellValue: `Week ${i + 1}`,
                                        justText: true,
                                    },
                                    {
                                        cellType: "th",
                                        cellValue: "Weekly Total",
                                        justText: true,
                                    }
                                ],
                            }     
                            for (let j = 0; j < week.length; j++) {
                                const weekDay = week[j];
                                const weekDayCapitalized = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
                                let lastValue;
                                if (i === 0) {
                                    lastValue = dates[j];
                                } else {
                                    lastValue = dates[j + 7];
                                }
                                const cellObj = {
                                    cellType: "th",
                                    class: true,
                                    classValue: "week-day",
                                    breaks: true,
                                    cellValues: [{ miniValue: weekDayCapitalized }],
                                    lastValue: lastValue,
                                }
                                headerTrObj.cells.splice(headerTrObj.cells.length - 1, 0, cellObj);
                            }
                            weekObj.trs.push(headerTrObj);

                            // InOut Rows
                            for (let j = 0; j < allInOuts[i].length; j++) {
                                for (let k = 0; k < 2; k++) {
                                    const inout = ["in", "out"][k];
                                    const inoutCapitalized = inout.charAt(0).toUpperCase() + inout.slice(1);
                                    const timeinout = allInOuts[i][j];
                                    const trObj = {
                                        cells: [
                                            {
                                                cellType: "td",
                                                cellValue: `Time ${inoutCapitalized}`,
                                                justText: true,
                                            },
                                            {
                                                cellType: "td",
                                                cellValue: "",
                                                justText: true,
                                            }
                                        ],
                                        isInOut: true,
                                        inout: `tr-${inout}`,
                                    }
                                    for (let l = 0; l < week.length; l++) {
                                        const weekDay = week[l];
                                        const cellObj = {
                                            cellType: "td",
                                            inputDataAttributes: [
                                                { data: "order", dataValue: timeinout.order },
                                                { data: "day", dataValue: weekDay },
                                                { data: "week", dataValue: timeinout.week },
                                                { data: "inout", dataValue: inout },
                                                { data: "timecardid", dataValue: timecard.timecard_id }
                                            ],
                                            cellValue: timeinout[`${week[l]}_${inout}`],
                                            isInOut: true,
                                            classValue: `${i + 1}-${timecard.timecard_id}`,
                                        }
                                        if (timecard.isApproved) {
                                            cellObj.isNotApproved = false;
                                            cellObj.justText = true;
                                            cellObj.isInOut = false;
                                            cellObj.class = true;
                                        } else {
                                            cellObj.isNotApproved = true;
                                        }
                                        trObj.cells.splice(trObj.cells.length - 1, 0, cellObj);
                                    }
                                    weekObj.trs.push(trObj);
                                }
                            }

                            const extraRows = ["vacation", "sick", "overtime", "total"];
                            const ptoTypes = ["None", "Vacation", "Sick", "Holiday", "Sabbatical", "Jury Duty", "Benevolence"];
                            
                            // Vaction, Sick, Overtime, Total Rows
                            const offDay = (await OffDay.findOne({
                                where: {
                                    timecard_id: timecard.timecard_id,
                                }
                            })).dataValues;
                            for (let j = 0; j < extraRows.length; j++) {
                                const extraRow = extraRows[j];
                                let extraRowCapitalized; 
                                if (j === 0) {
                                    extraRowCapitalized = "PTO Type";
                                } else if (j === 1) {
                                    extraRowCapitalized = "PTO";
                                } else {
                                    extraRowCapitalized = extraRow.charAt(0).toUpperCase() + extraRow.slice(1);
                                }
                                const trObj = {
                                    cells: [
                                        {
                                            cellType: "td",
                                            cellValue: `${extraRowCapitalized}`,
                                            justText: true,
                                        },
                                        {
                                            cellType: "td",
                                            cellValue: "",
                                            id: true,
                                            idValue: `weekly-${extraRow}-${i + 1}-${timecard.timecard_id}`, // "weekly-type-week-timecardId"
                                            justText: true,
                                        }
                                    ]
                                }
                                for (let k = 0; k < week.length; k++) {
                                    const weekDay = week[k];
                                    if (j === 0) {
                                        // make it a select with the correct option first
                                        let cellValue = offDay[`${weekDay}_${extraRow}_${i + 1}`];
                                        const ptoValues = [];
                                        for (let l = 0; l < ptoTypes.length; l++) {
                                            const ptoType = ptoTypes[l];
                                            const ptoValue = {
                                                value: l,
                                                type: ptoType,
                                            }
                                            ptoValues.push(ptoValue);
                                        }
                                        if (cellValue) {
                                            const selectedValue = ptoValues.splice(cellValue, 1);
                                            ptoValues.unshift(selectedValue[0]);
                                        }
                                        const cellObj = {
                                            cellType: "td",
                                            id: true,
                                            idValue: `${weekDay}_${extraRow}_${i + 1}`, // "weekDay-extrarow-week"
                                            isSelect: true,
                                            options: ptoValues,
                                            classValue: `${extraRow}-${i + 1}-${timecard.timecard_id}`,
                                            inputDataAttributes: [
                                                { data: "extratype", dataValue: extraRow },
                                                { data: "timecardid", dataValue: timecard.timecard_id },
                                            ],
                                        }
                                        trObj.cells.splice(trObj.cells.length - 1, 0, cellObj);
                                    } else {
                                        let isNotApproved = !timecard.isApproved;
                                        let justText = !isNotApproved;
                                        let cellValue;
                                        if (j < 2) {
                                            cellValue = offDay[`${weekDay}_${extraRow}_${i + 1}`];
                                        } else {
                                            isNotApproved = false;
                                            justText = true;
                                            cellValue = "";
                                        }
                                        const cellObj = {
                                            cellType: "td",
                                            isSelect: false,
                                            id: true,
                                            idValue: `${extraRow}-${i + 1}-${weekDay}-${timecard.timecard_id}`, // "type-week-day-timecardId"
                                            cellValue,
                                            justText,
                                            isNotApproved,
                                            isExtraRow: true,
                                            inputDataAttributes: [
                                                { data: "extratype", dataValue: extraRow },
                                                { data: "timecardid", dataValue: timecard.timecard_id },
                                            ],
                                            classValue: `${extraRow}-${i + 1}-${timecard.timecard_id}`,
                                        }
                                        if (isNotApproved) {
                                            cellObj.idValue = `${weekDay}_${extraRow}_${i + 1}`;
                                        } else {
                                            cellObj.class = true;
                                        }
                                        trObj.cells.splice(trObj.cells.length - 1, 0, cellObj);
                                    }
                                }
                                weekObj.trs.push(trObj);
                            }
                            weeks.push(weekObj)
                        }

                        return {
                            weeks,
                            day0: dates[0],
                            day13: dates[13],
                            isFirst,
                            isApproved: timecard.isApproved,
                            period_id: timecard.timeperiod_id,
                            title_id: title.title_id,
                            titlename: title.name,
                            timecard_id: timecard.timecard_id,
                            isReadyToBeApproved: timecard.isReadyToBeApproved,
                        }
                    }));

                    let readyStatus = "show";
                    let unreadyStatus = "hide";
                    if (isFirstReady) {
                        readyStatus = "hide";
                        unreadyStatus = "show";
                    }

                    hbsObj = {
                        readyStatus,
                        unreadyStatus,
                        hasTimeCard: true,
                        userName: req.session.user.name,
                        isAdmin: req.session.user.isAdmin,
                        isSuper: req.session.user.isSuper,
                        timecards,
                        titles: usableTitles,
                        periods: usablePeriods,
                    }
                } else {
                    hbsObj = {
                        userName: req.session.user.name,
                        isAdmin: req.session.user.isAdmin,
                        isSuper: req.session.user.isSuper,
                        hasTimeCard: false,
                    }
                }
            } else {
                hbsObj = {
                    userName: req.session.user.name,
                    isAdmin: req.session.user.isAdmin,
                    isSuper: req.session.user.isSuper,
                    hasTimeCard: false,
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