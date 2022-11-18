const express = require('express');
const router = express.Router();
const { TimeCard, TimeInOut, TimePeriod, Title, OffDay } = require('../../models');

// API Get Time Card by timecard ID
router.get("/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const timecard = await TimeCard.findByPk(req.params.id, { include: TimeInOut });
            res.json(timecard);
        } else {
            res.status(401).json({ msg: "You cannot access this data", msg_type: "UNAUTHORIZED_DATA_ACCESS" });
        }
    } catch (error) {
        console.log(err);
        res.status(500).json(err);
    }
});

const getTimecards = (period) => {

}

// API Get Current Time Card by user ID
router.get("/timecard-current/:combo", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isSuper) {
            const currentTimePeriodId = (await TimePeriod.findOne({
                where: {
                    isCurrent: true,
                }
            })).dataValues.timeperiod_id;
            const [userId, titleId] = req.params.combo.split("-");
            const timecards = (await TimeCard.findAll({
                where: {
                    user_id: userId,
                    timeperiod_id: currentTimePeriodId,
                },
                include: [TimeInOut, OffDay],
            })).map((timecard) => timecard.dataValues);

            let selectedTimeCard;
            let otherTimecards;
            for (let i = 0; i < timecards.length; i++) {
                const timecard = timecards[i];
                if (timecard.title_id === Number(titleId)) {
                    selectedTimeCard = timecard;
                    otherTimecards = timecards.splice(i, 1);
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

// API Get Previous Time Card by user ID
router.get("/timecard-previous/:combo", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isSuper) {
            const previousTimePeriodId = (await TimePeriod.findOne({
                where: {
                    isPrevious: true,
                }
            })).dataValues.timeperiod_id;
            const [userId, titleId] = req.params.combo.split("-");
            const timecards = (await TimeCard.findAll({
                where: {
                    user_id: userId,
                    timeperiod_id: previousTimePeriodId,
                },
                include: [TimeInOut, OffDay],
            })).map((timecard) => timecard.dataValues);

            let selectedTimeCard;
            let otherTimecards;
            for (let i = 0; i < timecards.length; i++) {
                const timecard = timecards[i];
                if (timecard.title_id === Number(titleId)) {
                    selectedTimeCard = timecard;
                    otherTimecards = timecards.splice(i, 1);
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

// API Get Two Previous Time Card by user ID
router.get("/timecard-twoprevious/:combo", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isSuper) {
            const twoPreviousTimePeriodId = (await TimePeriod.findOne({
                where: {
                    isTwoPrevious: true,
                }
            })).dataValues.timeperiod_id;
            const [userId, titleId] = req.params.combo.split("-");
            const timecards = (await TimeCard.findAll({
                where: {
                    user_id: userId,
                    timeperiod_id: twoPreviousTimePeriodId,
                },
                include: [TimeInOut, OffDay],
            })).map((timecard) => timecard.dataValues);

            let selectedTimeCard;
            let otherTimecards;
            for (let i = 0; i < timecards.length; i++) {
                const timecard = timecards[i];
                if (timecard.title_id === Number(titleId)) {
                    selectedTimeCard = timecard;
                    otherTimecards = timecards.splice(i, 1);
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

module.exports = router;