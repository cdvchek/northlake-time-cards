const router = require('express').Router();

// Home / Sign In
router.get("/", (req, res) => {
    res.render("signin");
});

// New User Registration
router.get("/new-user", (req, res) => {
    res.render("signup");
});

// Confirmation page telling them to check the admin email.
router.get("/new-user-confirmation-email", (req, res) => {
    res.render("confirm-email")
});

// User Current Time Card
router.get("/user-timecard/", (req, res) => {
    res.render("user-timecard");
});

// User Previous Time Cards
router.get("/user-history/", (req, res) => {
    res.render("user-history");
});

module.exports = router;