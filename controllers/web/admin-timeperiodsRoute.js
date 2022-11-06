const express = require('express');
const router = express.Router();

// Administrator Manage Time Periods - RESTR: ADMIN
router.get("/", (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const hbsObj = {
                userName: req.session.user.name,
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
            }
            res.render("admin-timeperiods", hbsObj);
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