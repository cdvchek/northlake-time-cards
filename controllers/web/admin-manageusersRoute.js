const express = require('express');
const router = express.Router();
const { User } = require('../../models');

// Administrator Manage Users - RESTR: ADMIN
router.get("/", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {

            const users = (await User.findAll()).map((user) => user.dataValues);

            const hbsObj = {
                userName: req.session.user.name,
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
                users: users,
            }
            res.render("admin-manageusers", hbsObj);
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