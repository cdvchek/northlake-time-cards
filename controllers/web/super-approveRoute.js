const express = require('express');
const router = express.Router();
const { User, Title } = require('../../models');

// Supervisor Approve - RESTR: SUPER
router.get("/", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isSuper) {
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
                userName: req.session.user.name,
                supervisees: supervisees,
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
            }
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