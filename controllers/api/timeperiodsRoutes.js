const express = require('express');
const router = express.Router();
const { DateTime } = require('luxon');
const { User, TimeCard, TimeInOut, TimePeriod, Title } = require('../../models');

// API Initialize Time Periods Route
router.post("/init-timeperiods", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const startDate = req.body.startDate;

            const startDateObj = DateTime.fromISO(startDate);
            const secondDate = startDateObj.minus({ days: 14 }).toISODate();
            const thirdDate = startDateObj.minus({ days: 28 }).toISODate();

            await TimePeriod.destroy({
                where: {
                    isCurrent: true,
                }
            });
            await TimePeriod.destroy({
                where: {
                    isPrevious: true,
                }
            });
            await TimePeriod.destroy({
                where: {
                    isTwoPrevious: true,
                }
            });
            const timePeriodCurrent = await TimePeriod.create({
                date_start: startDate,
                isCurrent: true,
                isPrevious: false,
                isTwoPrevious: false,
            });
            const timePeriodPrevious = await TimePeriod.create({
                date_start: secondDate,
                isCurrent: false,
                isPrevious: true,
                isTwoPrevious: false,
            });
            const timePeriodTwoPrevious = await TimePeriod.create({
                date_start: thirdDate,
                isCurrent: false,
                isPrevious: false,
                isTwoPrevious: true,
            });
            const timePeriods = [timePeriodCurrent, timePeriodPrevious, timePeriodTwoPrevious];

            const usersRaw = await User.findAll({ include: Title });
            const users = usersRaw.map((user) => user.dataValues);
            users.forEach(async (user) => {
                const titles = user.Titles;
                titles.forEach(async (title) => {
                    for (let i = 0; i < timePeriods.length; i++) {
                        const timeCard = await TimeCard.create({
                            timeperiod_id: timePeriods[i].timeperiod_id,
                            user_id: user.user_id,
                            title_id: title.title_id,
                        });
                        for (let j = 0; j < 2; j++) { // Number of Weeks
                            for (let k = 0; k < 4; k++) { // Number of TimeInOuts per week
                                await TimeInOut.create({
                                    timecard_id: timeCard.timecard_id,
                                    week: j + 1,
                                    order: k + 1,
                                });
                            }
                        }
                    }
                });
            });

            res.status(200).json({ msg: "Everything went fine" });
        } else {
            res.status(401).json({ msg: "You do not have the authority to initialize time periods", msg_type: "CANNOT_INIT_TIMEPERIODS" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;