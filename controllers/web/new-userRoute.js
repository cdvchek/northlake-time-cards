const express = require('express');
const router = express.Router();

// New User Registration - RESTR: ADMIN
router.get("/", (req, res) => {
    if (req.session.user && req.session.user.isAdmin) {
        res.render("signup");
    } else {
        req.session.destroy();
        res.render("signin");
    }
});

module.exports = router;