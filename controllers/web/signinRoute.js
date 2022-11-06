const express = require('express');
const router = express.Router();

// Home / Sign In - OPEN
router.get("/", (req, res) => {
    req.session.destroy();
    res.render("signin");
});

module.exports = router;