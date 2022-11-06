const express = require('express');
const router = express.Router();

// New Admin Registration - OPEN
router.get("/", (req, res) => {
    req.session.destroy();
    res.render("new-admin");
});

module.exports = router;