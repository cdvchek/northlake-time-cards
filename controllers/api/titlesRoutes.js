const express = require('express');
const router = express.Router();
const { User, TimeCard, TimeInOut, TimePeriod, Title } = require('../../models');

// API Create Title
router.post("/title", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const userId = req.body.userId;
            const title = await Title.create({
                name: req.body.titleName,
                user_id: userId,
            });

            const timePeriodCurrent = (await TimePeriod.findOne({
                where: {
                    isCurrent: true,
                }
            })).dataValues;

            const timePeriodPrevious = (await TimePeriod.findOne({
                where: {
                    isPrevious: true,
                }
            })).dataValues;
            const timePeriodTwoPrevious = (await TimePeriod.findOne({
                where: {
                    isTwoPrevious: true,
                }
            })).dataValues;
            const timePeriods = [timePeriodCurrent, timePeriodPrevious, timePeriodTwoPrevious];

            for (let i = 0; i < timePeriods.length; i++) {
                const timeCard = await TimeCard.create({
                    timeperiod_id: timePeriods[i].timeperiod_id,
                    user_id: userId,
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

            res.json(title);
        } else {
            res.status(401).json({ msg: "You cannot create data", msg_type: "UNAUTHORIZED_DATA_CREATE" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Save Title
router.put("/title/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const updateObj = req.body.updateObj;
            const updatedTitle = await Title.update(updateObj, {
                where: {
                    title_id: req.params.id,
                }
            });
            res.json(updatedTitle);
        } else {
            res.status(401).json({ msg: "You cannot manipulate this data", msg_type: "UNAUTHORIZED_DATA_MANIPULATE" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Delete Title
router.delete("/title/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const title = (await Title.findByPk(req.params.id)).dataValues;
            const supervisorId = title.supervisor_id;
            const deletedTitle = await Title.destroy({
                where: {
                    title_id: req.params.id
                }
            });
            const supervisorRaw = (await User.findByPk(supervisorId));
            if (supervisorRaw !== null) {
                const supervisor = supervisorRaw.dataValues;
                const superviseesArray = supervisor.supervisees.split(",");
                for (let i = 0; i < superviseesArray.length; i++) {
                    const title_id = superviseesArray[i].split("-")[1];
                    if (title_id === req.params.id) {
                        superviseesArray.splice(i, 1);
                        break;
                    }
                }
                const newSupervisees = superviseesArray.join(",");
                const updatedSupervisor = await User.update({
                    supervisees: newSupervisees,
                }, {
                    where: {
                        user_id: supervisorId,
                    }
                });
                res.json({ deletedTitle: deletedTitle, updatedSupervisor: updatedSupervisor, });
            } else {
                res.json({ deletedTitle: deletedTitle });
            }
        } else {
            res.status(401).json({ msg: "You cannot delete data", msg_type: "UNAUTHORIZED_DATA_DELETE" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;