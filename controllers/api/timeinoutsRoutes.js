const express = require('express');
const router = express.Router();
const { TimeInOut, TimeCard } = require('../../models');

router.post("/add", async (req, res) => {
    try {
        const timecard = (await TimeCard.findByPk(req.body.timecard_id)).dataValues;
        if (req.session.user && (timecard.user_id === req.session.user.user_id)) {
            const timeinouts = (await TimeInOut.findAll({
                where: {
                    timecard_id: req.body.timecard_id,
                    week: req.body.week,
                }
            })).map((timeinout) => timeinout.dataValues);
            const newTimeinout = await TimeInOut.create({
                week: Number(req.body.week),
                order: (timeinouts.length + 1),
                timecard_id: Number(req.body.timecard_id),
            });
            res.json(newTimeinout);
        } else {
            res.status(401).json({ msg: "You cannot create this data.", msg_type: "UNAUTHORIZED_DATA_CREATE" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.delete("/remove", async (req, res) => {
    try {
        const timecard = (await TimeCard.findByPk(req.body.timecard_id)).dataValues;
        if (req.session.user && (timecard.user_id === req.session.user.user_id)) {
            const timeinouts = (await TimeInOut.findAll({
                where: {
                    timecard_id: req.body.timecard_id,
                    week: req.body.week,
                }
            })).map((timeinout) => timeinout.dataValues);
            const timeinoutDelete = await TimeInOut.destroy({
                where: {
                    timecard_id: req.body.timecard_id,
                    week: req.body.week,
                    order: timeinouts.length,
                }
            });
            res.json(timeinoutDelete);
        } else {
            res.status(401).json({ msg: "You cannot delete this data.", msg_type: "UNAUTHORIZED_DATA_DELETE" });
        }
    } catch (err) {

    }
})

module.exports = router;