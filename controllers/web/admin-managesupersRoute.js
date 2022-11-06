const express = require('express');
const router = express.Router();
const { User } = require('../../models');

// Administrator Manage Supervisors - RESTR: ADMIN
router.get("/", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            let users = (await User.findAll()).map((user) => user.dataValues);
            users = users.map((user) => {
                return {
                    ...user,
                    nameHyphen: user.name.replaceAll(" ", "@"),
                }
            });

            const hbsObj = {
                supers: users,
                userName: req.session.user.name,
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
            }
            res.render("admin-managesupers", hbsObj);
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