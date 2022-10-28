const router = require('express').Router();
const { User, TimeCard, TimeInOut, TimePeriod, Title } = require('../models');
const bcrypt = require('bcrypt');
const { DateTime } = require('luxon');

// Home / Sign In - OPEN
router.get("/", (req, res) => {
    res.render("signin");
});

// New Admin Registration - OPEN
router.get("/new-admin/", (req, res) => {
    res.render("new-admin");
});

// New User Registration - RESTR: ADMIN
router.get("/new-user/", (req, res) => {
    if (req.session.user && req.session.user.isAdmin) {
        res.render("signup");
    } else {
        req.session.destroy();
        res.render("signin");
    }
});

function compareTimeInOuts(a, b) {
    return a.order - b.order;
}

// User Current Time Card - RESTR
router.get("/user-timecard/", async (req, res) => {
    try {
        if (req.session.user) {
            // Check to see if its a new time period
            const timeperiod = await TimePeriod.findOne({
                where: {
                    isCurrent: true,
                }
            });
            const startDateObj = DateTime.fromISO(timeperiod.dataValues.date_start);
            const endDateObj = DateTime.fromISO(startDateObj.plus({ days: 14 }).toISODate());
            const newStartDate = endDateObj.plus({ days: 1 }).toISODate();
            const nowDateObj = DateTime.now();
            if (endDateObj.startOf("day") < nowDateObj.startOf("day")) {
                await TimePeriod.destroy({
                    where: {
                        isTwoPrevious: true,
                    }
                });
                await TimePeriod.update({
                    isPrevious: false,
                    isTwoPrevious: true,
                }, {
                    where: {
                        isPrevious: true,
                    }
                });
                await TimePeriod.update({
                    isCurrent: false,
                    isPrevious: true,
                }, {
                    where: {
                        isCurrent: true,
                    }
                });
                const newTimeperiod = await TimePeriod.create({
                    date_start: newStartDate,
                    isCurrent: true,
                    isPrevious: false,
                    isTwoPrevious: false,
                });

                const users = (await User.findAll()).map((user) => user.dataValues);
                users.forEach(async (user) => {
                    // Create a new time card associated with the new time period
                    const newTimeCard = await TimeCard.create({
                        timeperiod_id: newTimeperiod.timeperiod_id,
                        user_id: user.user_id,
                    });
                    for (let j = 0; j < 2; j++) { // Number of Weeks
                        for (let k = 0; k < 4; k++) { // Number of TimeInOuts per week
                            await TimeInOut.create({
                                timecard_id: newTimeCard.timecard_id,
                                week: j + 1,
                                order: k + 1,
                            });
                        }
                    }
                });
            }
            let hbsObj = {};
            const currentTimePeriod = (await TimePeriod.findOne({
                where: {
                    isCurrent: true,
                }
            })).dataValues;
            if (currentTimePeriod !== null) {
                const timecard = await TimeCard.findOne({
                    where: {
                        user_id: req.session.user.user_id,
                        timeperiod_id: currentTimePeriod.timeperiod_id,
                    },
                    include: TimeInOut,
                });
                if (timecard !== null) {
                    const timeInOuts = timecard.dataValues.TimeInOuts.map((timeinout) => {
                        const time = timeinout.dataValues;

                        return {
                            ...time,
                            sundayNameIn: `${timeinout.order}_sunday_in_${timeinout.week}`,
                            mondayNameIn: `${timeinout.order}_monday_in_${timeinout.week}`,
                            tuesdayNameIn: `${timeinout.order}_tuesday_in_${timeinout.week}`,
                            wednesdayNameIn: `${timeinout.order}_wednesday_in_${timeinout.week}`,
                            thursdayNameIn: `${timeinout.order}_thursday_in_${timeinout.week}`,
                            fridayNameIn: `${timeinout.order}_friday_in_${timeinout.week}`,
                            saturdayNameIn: `${timeinout.order}_saturday_in_${timeinout.week}`,
                            sundayNameOut: `${timeinout.order}_sunday_out_${timeinout.week}`,
                            mondayNameOut: `${timeinout.order}_monday_out_${timeinout.week}`,
                            tuesdayNameOut: `${timeinout.order}_tuesday_out_${timeinout.week}`,
                            wednesdayNameOut: `${timeinout.order}_wednesday_out_${timeinout.week}`,
                            thursdayNameOut: `${timeinout.order}_thursday_out_${timeinout.week}`,
                            fridayNameOut: `${timeinout.order}_friday_out_${timeinout.week}`,
                            saturdayNameOut: `${timeinout.order}_saturday_out_${timeinout.week}`,
                        }
                    });
                    const timeInOuts1 = timeInOuts.filter((timeinout) => (timeinout.week === 1));
                    timeInOuts1.sort(compareTimeInOuts);
                    const timeInOuts2 = timeInOuts.filter((timeinout) => (timeinout.week === 2));
                    timeInOuts2.sort(compareTimeInOuts);
                    hbsObj = {
                        hasTimeCard: true,
                        isAdmin: req.session.user.isAdmin,
                        isSuper: req.session.user.isSuper,
                        timeInOuts1: timeInOuts1,
                        timeInOuts2: timeInOuts2,
                    }
                } else {
                    hbsObj = {
                        hasTimeCard: false,
                        isAdmin: req.session.user.isAdmin,
                        isSuper: req.session.user.isSuper,
                    }
                }
            } else {
                hbsObj = {
                    hasTimeCard: false,
                    isAdmin: req.session.user.isAdmin,
                    isSuper: req.session.user.isSuper,
                }
            }
            res.render("user-timecard", hbsObj);
        } else {
            res.render("signin")
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// User Previous Time Cards - RESTR
router.get("/user-history/", (req, res) => {
    try {
        if (req.session.user) {
            const hbsObj = {
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
            }
            res.render("user-history", hbsObj);
        } else {
            res.render("signin")
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// Supervisor Approve - RESTR: SUPER
router.get("/super-approve/", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isSuper) {
            const user = (await User.findByPk(req.session.user.user_id)).dataValues;
            let superviseesIds = user.supervisees.split(",");
            superviseesIds.splice(0, 1);
            let supervisees = [];
            for (let i = 0; i < superviseesIds.length; i++) {
                const superviseeId = superviseesIds[i];
                const supervisee = (await User.findByPk(superviseeId)).dataValues;
                supervisees.push(supervisee);
            }
            const hbsObj = {
                supervisees: supervisees,
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
            }
            res.render("super-approve", hbsObj);
        } else {
            req.session.destroy();
            res.render("signin");
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// Administrator Manage Supervisors - RESTR: ADMIN
router.get("/admin-managesupers", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            let users = (await User.findAll()).map((user) => user.dataValues);
            users = users.map((user) => {
                return {
                    ...user,
                    nameHyphen: user.name.replaceAll(" ", "@"),
                }
            });

            const hbsObj = {
                supers: users,
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
            }
            res.render("admin-managesupers", hbsObj);
        } else {
            req.session.destroy();
            res.render("signin");
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// Administrator Manage Users - RESTR: ADMIN
router.get("/admin-manageusers", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {

            const users = (await User.findAll()).map((user) => user.dataValues);

            const hbsObj = {
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
                users: users,
            }
            res.render("admin-manageusers", hbsObj);
        } else {
            req.session.destroy();
            res.render("signin");
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// Administrator Manage Time Periods - RESTR: ADMIN
router.get("/admin-timeperiods", (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const hbsObj = {
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

// Administrator Submit Time Cards - RESTR: ADMIN
router.get("/admin-submittimecard", (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {

            const hbsObj = {
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

// Help Page - RESTR
router.get("/help/", (req, res) => {
    if (req.session.user) {
        const hbsObj = {
            isAdmin: req.session.user.isAdmin,
            isSuper: req.session.user.isSuper,
        }
        res.render("help", hbsObj);
    } else {
        res.render("signin")
    }
});

// API Sign Up Admin Route
router.post("/api/admin-signup", async (req, res) => {
    try {
        const sitePassword = process.env.SUPERSECUREPHRASE;
        if (req.body.sitePassword === sitePassword) {
            // Create an admin user
            const newAdmin = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                isAdmin: true,
                isSuper: true,
            });

            res.status(200).json({ newAdmin });

        } else {
            res.status(401).json({ msg: "You entered the wrong passphrase for this website.", msg_type: "SITE_PASSPHRASE_INCORRECT" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Sign Up Route
router.post("/api/signup", async (req, res) => {
    try {
        if (req.session.user.isAdmin) {
            const newUser = (await User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                isSuper: false,
                isAdmin: false,
            })).dataValues;

            console.log(newUser);

            const timePeriodCurrent = (await TimePeriod.findOne({
                where: {
                    isCurrent: true,
                }
            })).dataValues;
            const timePeriodPrevious = (await TimePeriod.findOne({
                where: {
                    isPrevious: true,
                }
            })).dataValues;
            const timePeriodTwoPrevious = (await TimePeriod.findOne({
                where: {
                    isTwoPrevious: true,
                }
            })).dataValues;
            const timePeriods = [timePeriodCurrent, timePeriodPrevious, timePeriodTwoPrevious];

            for (let i = 0; i < timePeriods.length; i++) {
                const timeCard = await TimeCard.create({
                    timeperiod_id: timePeriods[i].timeperiod_id,
                    user_id: newUser.user_id,
                });
                for (let j = 0; j < 2; j++) { // Number of Weeks
                    for (let k = 0; k < 4; k++) { // Number of TimeInOuts per week
                        await TimeInOut.create({
                            timecard_id: timeCard.timecard_id,
                            week: j + 1,
                            order: k + 1,
                        });
                    }
                }
            }

            res.json(newUser);
        } else {
            res.status(401).json({ msg: "You do not have the authority to create a user.", msg_type: "CANNOT_CREATE_USER" })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Sign In Route
router.post("/api/signin", (req, res) => {
    User.findOne({
        where: {
            email: req.body.email,
        }
    }).then((rawFoundUser) => {
        if (!rawFoundUser) {
            req.session.destroy()
            res.status(401).json({ message: "Incorrect email or password" })
        } else {
            const foundUser = rawFoundUser.get({ plain: true });
            if (bcrypt.compareSync(req.body.password, foundUser.password)) {
                req.session.user = {
                    name: foundUser.name,
                    user_id: foundUser.user_id,
                    email: foundUser.email,
                    isAdmin: foundUser.isAdmin,
                    isSuper: foundUser.isSuper,
                }
                res.status(200).json({ foundUser })
            } else {
                req.session.destroy()
                res.status(401).json({ message: "Incorrect Key or password" })
            }
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// API Logout Route
router.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ msg: "Session destroyed" })
    });
});

// API Initialize Time Periods Route
router.post("/api/init-timeperiods", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const startDate = req.body.startDate;

            const startDateObj = DateTime.fromISO(startDate);
            const secondDate = startDateObj.minus({ days: 14 }).toISODate();
            const thirdDate = startDateObj.minus({ days: 28 }).toISODate();

            await TimePeriod.destroy({
                where: {
                    isCurrent: true,
                }
            });
            await TimePeriod.destroy({
                where: {
                    isPrevious: true,
                }
            });
            await TimePeriod.destroy({
                where: {
                    isTwoPrevious: true,
                }
            });
            const timePeriodCurrent = await TimePeriod.create({
                date_start: startDate,
                isCurrent: true,
                isPrevious: false,
                isTwoPrevious: false,
            });
            const timePeriodPrevious = await TimePeriod.create({
                date_start: secondDate,
                isCurrent: false,
                isPrevious: true,
                isTwoPrevious: false,
            });
            const timePeriodTwoPrevious = await TimePeriod.create({
                date_start: thirdDate,
                isCurrent: false,
                isPrevious: false,
                isTwoPrevious: true,
            });
            const timePeriods = [timePeriodCurrent, timePeriodPrevious, timePeriodTwoPrevious];

            const usersRaw = await User.findAll();
            const users = usersRaw.map((user) => user.dataValues);
            users.forEach(async (user) => {
                for (let i = 0; i < timePeriods.length; i++) {
                    const timeCard = await TimeCard.create({
                        timeperiod_id: timePeriods[i].timeperiod_id,
                        user_id: user.user_id,
                    });
                    for (let j = 0; j < 2; j++) { // Number of Weeks
                        for (let k = 0; k < 4; k++) { // Number of TimeInOuts per week
                            await TimeInOut.create({
                                timecard_id: timeCard.timecard_id,
                                week: j + 1,
                                order: k + 1,
                            });
                        }
                    }
                }
            });

            res.status(200).json({ msg: "Everything went fine" });
        } else {
            res.status(401).json({ msg: "You do not have the authority to initialize time periods", msg_type: "CANNOT_INIT_TIMEPERIODS" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Get Current Time Card by ID
router.get("/api/timecard-current/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isSuper) {
            const currentTimePeriodId = (await TimePeriod.findOne({
                where: {
                    isCurrent: true,
                }
            })).dataValues.timeperiod_id;
            const timecard = (await TimeCard.findOne({
                where: {
                    user_id: req.params.id,
                    timeperiod_id: currentTimePeriodId,
                },
                include: TimeInOut,
            })).dataValues;
            res.json(timecard);
        } else {
            res.status(401).json({ msg: "You cannot access this data", msg_type: "UNAUTHORIZED_DATA_ACCESS" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Get Previous Time Card by ID
router.get("/api/timecard-previous/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isSuper) {
            const previousTimePeriodId = (await TimePeriod.findOne({
                where: {
                    isPrevious: true,
                }
            })).dataValues.timeperiod_id;
            const timecard = (await TimeCard.findOne({
                where: {
                    user_id: req.params.id,
                    timeperiod_id: previousTimePeriodId,
                },
                include: TimeInOut,
            })).dataValues;
            res.json(timecard);
        } else {
            res.status(401).json({ msg: "You cannot access this data", msg_type: "UNAUTHORIZED_DATA_ACCESS" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Get Two Previous Time Card by ID
router.get("/api/timecard-twoprevious/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isSuper) {
            const twoPreviousTimePeriodId = (await TimePeriod.findOne({
                where: {
                    isTwoPrevious: true,
                }
            })).dataValues.timeperiod_id;
            const timecard = (await TimeCard.findOne({
                where: {
                    user_id: req.params.id,
                    timeperiod_id: twoPreviousTimePeriodId,
                },
                include: TimeInOut,
            })).dataValues;
            res.json(timecard);
        } else {
            res.status(401).json({ msg: "You cannot access this data", msg_type: "UNAUTHORIZED_DATA_ACCESS" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Update Time Card Route
router.put("/api/timecard", async (req, res) => {
    try {
        const timecardRaw = await TimeCard.findOne({
            where: {
                user_id: req.session.user.user_id,
            },
            include: TimeInOut,
        });
        const timecard = timecardRaw.dataValues;
        let timeInOutId = 0;
        for (let i = 0; i < timecard.TimeInOuts.length; i++) {
            const timeInOut = timecard.TimeInOuts[i].dataValues;
            if ((timeInOut.week === Number(req.body.week)) && (timeInOut.order === Number(req.body.order))) {
                timeInOutId = Number(timeInOut.timeinout_id);
                break;
            }
        }
        const updateObj = {};
        updateObj[req.body.key] = req.body.value;
        await TimeInOut.update(updateObj, {
            where: {
                timeinout_id: timeInOutId,
            }
        });
        res.status(200).json({ msg: "You have updated your time card" });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Update Time Card approved
router.put("/api/timecard-status/:id", async (req, res) => {
    try {
        if (req.session.user) {
            let canApprove = false
            const timeCardsUserId = (await TimeCard.findOne({
                where: {
                    timecard_id: req.params.id,
                },
                include: User,
            })).dataValues.User.dataValues.user_id;
            const usersSupervisees = (await User.findByPk(req.session.user.user_id)).dataValues.supervisees.split(",");
            for (let i = 0; i < usersSupervisees.length; i++) {
                const superviseeId = usersSupervisees[i];
                if (timeCardsUserId == superviseeId) {
                    canApprove = true;
                    break;
                }
            }
            if ((canApprove)) {
                const updateTimeCardObj = req.body.updateTimeCardObj;
                const updatedTimeCard = await TimeCard.update(updateTimeCardObj, {
                    where: {
                        timecard_id: req.params.id,
                    }
                });
                res.json(updatedTimeCard)
            } else {
                res.status(200).json({ msg: "You cannot manipulate this data", msg_type: "UNAUTHORIZED_DATA_MANIPULATE" });
            }
        } else {
            res.status(200).json({ msg: "You cannot manipulate this data", msg_type: "UNAUTHORIZED_DATA_MANIPULATE" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Get User by ID
router.get("/api/user-id/:id", async (req, res) => {
    try {
        if (req.session.user && ((req.session.user.user_id === Number(req.params.id)) || (req.session.user.isAdmin))) {
            const user = await User.findByPk(req.params.id, { include: [TimeCard, Title] });
            console.log(user);
            res.json(user);
        } else {
            res.status(401).json({ msg: "You cannot access this data", msg_type: "UNAUTHORIZED_DATA_ACCESS" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Put User by ID
router.put("/api/user-id/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const updateUserObj = req.body.updateUser;
            let useHooks = false;
            if (updateUserObj.password) {
                useHooks = true;
            }
            const updatedUser = await User.update(updateUserObj, {
                where: {
                    user_id: req.params.id
                },
                individualHooks: useHooks,
            });
            console.log(updatedUser);
            res.json(updatedUser);
        } else {
            res.status(401).json({ msg: "You cannot manipulate this data", msg_type: "UNAUTHORIZED_DATA_MANIPULATE" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Delete User by ID
router.delete("/api/user-id/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const deletedUser = await User.destroy({
                where: {
                    user_id: req.params.id,
                }
            });
            res.json({
                deletedUser,
                hasDeletedSelf: (req.session.user.user_id === Number(req.params.id))
            });
        } else {
            res.status(401).json({ msg: "You cannot delete this data", msg_type: "UNAUTHORIZED_DATA_DELETE" })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Get All Users
router.get("/api/users", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const users = await User.findAll();
            res.json(users);
        } else {
            res.status(401).json({ msg: "You cannot access this data", msg_type: "UNAUTHORIZED_DATA_ACCESS" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Get All Users
router.get("/api/supervisees/:id", async (req, res) => {
    try {
        if ((req.session.user && (req.session.user.user_id === Number(req.params.id))) || (req.session.user && req.session.user.isAdmin)) {
            const user = (await User.findByPk(req.params.id)).dataValues;
            const supervisees = user.supervisees;
            res.json({ supervisees, });
        } else {
            res.status(401).json({ msg: "You cannot access this data", msg_type: "UNAUTHORIZED_DATA_ACCESS" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Set/Remove Supervisee
router.put("/api/edit-supervisees/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const supervisorId = Number(req.params.id);
            const superviseeId = req.body.superviseeId;

            const supervisor = (await User.findByPk(supervisorId)).dataValues;
            const superviseesString = supervisor.supervisees;
            let superviseesArray = superviseesString.split(",");
            if (req.body.editType === "set") {
                superviseesArray.push(superviseeId);
            } else if (req.body.editType === "remove") {
                const superviseeIndex = superviseesArray.indexOf(superviseeId);
                if (superviseeIndex > -1) {
                    superviseesArray.splice(superviseeIndex, 1);
                }
            }
            const newSuperviseesString = superviseesArray.join(",");
            const updatedSupervisor = await User.update({
                supervisees: newSuperviseesString,
            }, {
                where: {
                    user_id: supervisorId,
                }
            });

            res.json(updatedSupervisor);
        } else {
            res.status(401).json({ msg: "You cannot manipulate this data", msg_type: "UNAUTHORIZED_DATA_MANIPULATE" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Create Title
router.post("/api/title/", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const title = await Title.create({
                name: req.body.titleName,
                user_id: req.body.userId,
            });
            res.json(title)
        } else {
            res.status(401).json({ msg: "You cannot create data", msg_type: "UNAUTHORIZED_DATA_CREATE" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;