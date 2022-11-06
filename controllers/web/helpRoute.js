const express = require('express');
const router = express.Router();

// Help Page - RESTR
router.get("/", (req, res) => {
    if (req.session.user) {
        const hbsObj = {
            userName: req.session.user.name,
            isAdmin: req.session.user.isAdmin,
            isSuper: req.session.user.isSuper,
        }
        res.render("help", hbsObj);
    } else {
        res.render("signin")
    }
});

module.exports = router;