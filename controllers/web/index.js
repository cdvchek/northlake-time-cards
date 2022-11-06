const express = require('express');
const router = express.Router();

const signinRoute = require("./signinRoute");
router.use("/", signinRoute);

const newAdminRoute = require("./new-adminRoute");
router.use("/new-admin", newAdminRoute);

const newUserRoute = require("./new-userRoute");
router.use("/new-user", newUserRoute);

const userTimecardRoute = require("./user-timecardRoute");
router.use("/user-timecard", userTimecardRoute);

const superApproveRoute = require("./super-approveRoute");
router.use("/super-approve", superApproveRoute);

const adminManageSupersRoute = require("./admin-managesupersRoute");
router.use("/admin-managesupers", adminManageSupersRoute);

const adminManageUsersRoute = require("./admin-manageusersRoute");
router.use("/admin-manageusers", adminManageUsersRoute);

const adminTimePeriodsRoute = require("./admin-timeperiodsRoute");
router.use("/admin-timeperiods", adminTimePeriodsRoute);

const adminSubmitTimecardRoute = require("./admin-submittimecardRoute");
router.use("/admin-submittimecard", adminSubmitTimecardRoute);

const helpRoute = require("./helpRoute");
router.use("/help", helpRoute);


module.exports = router;