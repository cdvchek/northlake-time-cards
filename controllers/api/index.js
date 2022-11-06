const express = require('express');
const router = express.Router();

const usersRoutes = require("./usersRoutes");
router.use("/users", usersRoutes);

const timePeriodRoutes = require("./timeperiodsRoutes");
router.use("/timeperiods", timePeriodRoutes);

const timeCardRoutes = require("./timecardsRoutes");
router.use("/timecards", timeCardRoutes);

const titleRoutes = require("./titlesRoutes");
router.use("/titles", titleRoutes);

const timeInOutRoutes = require("./timeinoutsRoutes");
router.use("/timeinouts", timeInOutRoutes);

module.exports = router;