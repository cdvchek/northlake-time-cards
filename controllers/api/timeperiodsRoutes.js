const express = require('express');
const router = express.Router();
const { DateTime } = require('luxon');
const { User, TimePeriod, Title } = require('../../models');
const { createTimecard } = require('../../utils');

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
                        createTimecard(timePeriods[i].timeperiod_id, title.user_id, title.title_id);
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