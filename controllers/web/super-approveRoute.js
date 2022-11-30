const express = require('express');
const router = express.Router();
const { User, Title, TimePeriod} = require('../../models');
const { DateTime } = require('luxon');

// Supervisor Approve - RESTR: SUPER
router.get("/", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isSuper) {
            const week = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const periods = [];
            const periodIdentifiers = ["current", "previous", "twoPrevious"];
            const datesObj = {
                current: {},
                previous: {},
                twoPrevious: {},
            }

            for (let i = 0; i < 3; i++) {
                const whereObj = {};

                const periodIdentifierCapitalized = periodIdentifiers[i].charAt(0).toUpperCase() + periodIdentifiers[i].slice(1);
                const whereIdentifier = `is${periodIdentifierCapitalized}`;
                whereObj[whereIdentifier] = true;
                const period = (await TimePeriod.findOne({ where: whereObj })).dataValues;
                periods.push(period);
            }

            const periodNames = [];
            const periodNamesLong = [];

            for (let i = 0; i < periods.length; i++) {
                const period = periods[i];
                const startDateObj = DateTime.fromISO(period.date_start);
                const startDateString = startDateObj.toISODate();
                const [startYear, startMonth, startDay] = startDateString.split("-");
                const endDateString = startDateObj.plus({ days: 13 }).toISODate();
                const [endYear, endMonth, endDay] = endDateString.split("-");
                const periodName = `${startMonth}/${startDay}/${startYear}-${endMonth}/${endDay}/${endYear}`;
                const periodNameLong = `${startMonth}/${startDay}/${startYear} - ${endMonth}/${endDay}/${endYear}`;
                periodNames.push(periodName);
                periodNamesLong.push(periodNameLong);

                const dates = [`${startMonth}/${startDay}/${startYear}`];
                for (let j = 1; j < 14; j++) {
                    const date = startDateObj.plus({ days: j }).toISODate();
                    const [dateYear, dateMonth, dateDay] = date.split("-");
                    const dateString = `${dateMonth}/${dateDay}/${dateYear}`;
                    dates.push(dateString);
                }
                for (let j = 0; j < week.length; j++) {
                    const day = week[j];
                    const week1date = dates[j];
                    const week2date = dates[j + 7];
                    
                    datesObj[periodIdentifiers[i]][`${day}_1`] = week1date;
                    datesObj[periodIdentifiers[i]][`${day}_2`] = week2date;
                }
            }
            const [currentPeriod, previousPeriod, twoPreviousPeriod] = periodNames;
            const [currentPeriodLong, previousPeriodLong, twoPreviousPeriodLong] = periodNamesLong;
            const user = (await User.findByPk(req.session.user.user_id)).dataValues;
            let superviseesIds = user.supervisees.split(",");
            superviseesIds.splice(0, 1);
            const supervisees = [];
            for (let i = 0; i < superviseesIds.length; i++) {
                const [superviseeId, titleId] = superviseesIds[i].split("-");
                const supervisee = (await User.findByPk(superviseeId, { include: Title })).dataValues;
                for (let i = 0; i < supervisee.Titles.length; i++) {
                    const title = supervisee.Titles[i].dataValues;
                    if (Number(titleId) === title.title_id) {
                        supervisee.titleName = supervisee.name;
                        if (supervisee.Titles.length > 1) {
                            supervisee.titleName = supervisee.name + " - " + title.name;
                        }
                        supervisee.title_id = title.title_id;
                        supervisees.push(supervisee);
                    }
                }
            }
            const hbsObj = {
                currentPeriod,
                currentPeriodLong,
                previousPeriod,
                previousPeriodLong,
                twoPreviousPeriod,
                twoPreviousPeriodLong,
                userName: req.session.user.name,
                supervisees: supervisees,
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
            }

            for (let k = 0; k < periodIdentifiers.length; k++) {
                const periodIdentifier = periodIdentifiers[k];
                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < week.length; j++) {
                        const day = week[j];
                        hbsObj[`${periodIdentifier.toLowerCase()}_${day}_${i + 1}`] = datesObj[periodIdentifier][`${day}_${i + 1}`];
                    }                
                }
            }
            
            console.log(hbsObj);
            res.render("super-approve", hbsObj);
        } else {
            req.session.destroy();
            res.render("signin");
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;