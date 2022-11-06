const express = require('express');
const router = express.Router();

// Administrator Submit Time Cards - RESTR: ADMIN
router.get("/", (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {

            const hbsObj = {
                userName: req.session.user.name,
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
            }
            res.render("admin-submittimecard", hbsObj);
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