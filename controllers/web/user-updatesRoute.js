const express = require('express');
const router = express.Router();

// User View Updates - RESTR: NONE
router.get("/", (req, res) => {
    try {
        if (req.session.user) {
            const hbsObj = {
                userName: req.session.user.name,
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
            }
            res.render("user-updates", hbsObj);
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