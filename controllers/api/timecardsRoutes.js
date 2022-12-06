const express = require('express');
const router = express.Router();
const { TimeCard, TimeInOut, TimePeriod, Title, OffDay } = require('../../models');
const { DateTime } = require('luxon');
const { createTimecard } = require("../../utils");

// API Get Time Card by timecard ID
router.get("/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const timecard = await TimeCard.findByPk(req.params.id, { include: [TimeInOut, OffDay] });
            res.json(timecard);
        } else {
            res.status(401).json({ msg: "You cannot access this data", msg_type: "UNAUTHORIZED_DATA_ACCESS" });
        }
    } catch (error) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Get Time Card by user ID, title ID, and Period
router.get("/timecard-period/:combo", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isSuper) {
            const [userId, titleId, period] = req.params.combo.split("-");
            let whereObj = {};
            if (period === "current") {
                whereObj.isCurrent = true;
            } else if (period === "previous") {
                whereObj.isPrevious = true;
            } else {
                whereObj.isTwoPrevious = true;
            }
            const currentTimePeriodId = (await TimePeriod.findOne({
                where: whereObj,
            })).dataValues.timeperiod_id;
            const timecards = (await TimeCard.findAll({
                where: {
                    user_id: userId,
                    timeperiod_id: currentTimePeriodId,
                },
                include: [TimeInOut, OffDay],
            })).map((timecard) => timecard.dataValues);

            for (let i = 0; i < timecards.length; i++) {
                const timecard = timecards[i];
                timecard.titleName = (await Title.findByPk(timecard.title_id)).dataValues.name;
            }

            let selectedTimeCard;
            let otherTimecards;
            for (let i = 0; i < timecards.length; i++) {
                const timecard = timecards[i];
                if (timecard.title_id === Number(titleId)) {
                    selectedTimeCard = timecard;
                    timecards.splice(i, 1);
                    otherTimecards = timecards;
                }
            }

            const responseObj = {
                selectedTimeCard,
                otherTimecards
            }
            res.json(responseObj);
        } else {
            res.status(401).json({ msg: "You cannot access this data", msg_type: "UNAUTHORIZED_DATA_ACCESS" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.get("/create-new/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            // find all the timecards
            const timecards = await TimeCard.findAll({ where: { user_id: req.params.id } });
            // if there are timecards, delete them
            if (timecards.length > 0) {
                for (let i = 0; i < timecards.length; i++) {
                    const timecard = timecards[i].dataValues;
                    await TimeCard.destroy({ where: { timecard_id: timecard.timecard_id } });
                }
            }
            // make new timecards
            const userTitles = await Title.findAll({ where: {user_id: req.params.id } });
            const currentPeriodId = (await TimePeriod.findOne({ where: { isCurrent: true } })).dataValues.timeperiod_id;
            const previousPeriodId = (await TimePeriod.findOne({ where: { isPrevious: true } })).dataValues.timeperiod_id;
            const twoPreviousPeriodId = (await TimePeriod.findOne({ where: { isTwoPrevious: true } })).dataValues.timeperiod_id;
            const periodIds = [currentPeriodId, previousPeriodId, twoPreviousPeriodId];
            for (let i = 0; i < periodIds.length; i++) {
                const periodId = periodIds[i];
                for (let j = 0; j < userTitles.length; j++) {
                    const title = userTitles[j].dataValues;
                    await createTimecard(periodId, req.params.id, title.title_id);
                }
            }
            res.json({ msg: "timecards created" });
        } else {
            res.status(401).json({ msg: "You cannot access this data", msg_type: "UNAUTHORIZED_DATA_ACCESS" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Update Time Card Route
router.put("/timecard", async (req, res) => {
    try {
        if (req.session.user) {
            const timecardRaw = await TimeCard.findByPk(req.body.timecardId, {
                include: TimeInOut,
            });
            const timecard = timecardRaw.dataValues;
            let timeInOutId = 0;
            for (let i = 0; i < timecard.TimeInOuts.length; i++) {
                const timeInOut = timecard.TimeInOuts[i].dataValues;
                if ((timeInOut.week === Number(req.body.week)) && (timeInOut.order === Number(req.body.order))) {
                    timeInOutId = Number(timeInOut.timeinout_id);
                    break;
                }
            }
            const updateObj = {};
            updateObj[req.body.key] = req.body.value;
            await TimeInOut.update(updateObj, {
                where: {
                    timeinout_id: timeInOutId,
                }
            });
            res.status(200).json({ msg: "You have updated your time card" });
        } else {
            res.status(401).json({ msg: "Please log in before you update your timecard." });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Update OffDay Route
router.put("/timecard-offday", async (req, res) => {
    try {
        if (req.session.user) {
            const updateObj = {};
            updateObj[req.body.key] = Number(req.body.value);
            await OffDay.update(updateObj, {
                where: {
                    timecard_id: req.body.timecardId,
                }
            });
            res.status(200).json({ msg: "You have updated your time card" });
        } else {
            res.status(401).json({ msg: "Please log in before you update your timecard." });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})

// API Update Time Card approved
router.put("/timecard-status/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isSuper) {
            let canApprove = false;
            const timeCardsTitleId = (await TimeCard.findOne({
                where: {
                    timecard_id: req.params.id,
                },
            })).dataValues.title_id;
            const timeCardsUserId = (await Title.findByPk(timeCardsTitleId)).dataValues.supervisor_id;
            if (req.session.user.user_id === timeCardsUserId) {
                canApprove = true;
            }
            if ((canApprove)) {
                const updateTimeCardObj = req.body.updateTimeCardObj;
                const updatedTimeCard = await TimeCard.update(updateTimeCardObj, {
                    where: {
                        timecard_id: req.params.id,
                    }
                });
                res.json(updatedTimeCard)
            } else {
                res.status(200).json({ msg: "You cannot manipulate this data", msg_type: "UNAUTHORIZED_DATA_MANIPULATE" });
            }
        } else {
            res.status(200).json({ msg: "You cannot manipulate this data", msg_type: "UNAUTHORIZED_DATA_MANIPULATE" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.put("/timecard-ready/:id", async (req, res) => {
    try {
        if (req.session.user) {
            let canReady = false;
            const readyingTimeCard = (await TimeCard.findByPk(req.params.id)).dataValues;
            if (readyingTimeCard.user_id === req.session.user.user_id) {
                canReady = true;
            }
            if ((canReady)) {
                const updateTimeCardObj = req.body.updateTimeCardObj;
                const updatedTimeCard = await TimeCard.update(updateTimeCardObj, {
                    where: {
                        timecard_id: req.params.id,
                    }
                });
                res.json(updatedTimeCard)
            } else {
                res.status(401).json({ msg: "You cannot manipulate this data", msg_type: "UNAUTHORIZED_DATA_MANIPULATE" });
            }
        } else {
            res.status(401).json({ msg: "You cannot manipulate this data", msg_type: "UNAUTHORIZED_DATA_MANIPULATE" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;