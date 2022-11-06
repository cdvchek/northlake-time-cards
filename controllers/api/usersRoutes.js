const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User, TimeCard, TimeInOut, TimePeriod, Title } = require('../../models');


// API Get User by ID
router.get("/user-id/:id", async (req, res) => {
    try {
        if (req.session.user && ((req.session.user.user_id === Number(req.params.id)) || (req.session.user.isAdmin))) {
            const user = await User.findByPk(req.params.id, { include: [TimeCard, Title] });
            res.json(user);
        } else {
            res.status(401).json({ msg: "You cannot access this data", msg_type: "UNAUTHORIZED_DATA_ACCESS" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Get All Users
router.get("/users-titles/", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const users = (await User.findAll({ include: Title })).map((user) => user.dataValues);
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                users[i].Titles = user.Titles.map((title) => title.dataValues);
            }

            let deployUsers = [];
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const multTitle = (user.Titles.length > 1);
                for (let j = 0; j < user.Titles.length; j++) {
                    const title = user.Titles[j];
                    const titleUser = {
                        ...user,
                    }
                    titleUser.name = user.name;
                    titleUser.multTitle = multTitle;
                    titleUser.titleId = title.title_id;
                    titleUser.titleName = title.name;
                    deployUsers.push(titleUser);
                }
            }
            res.json(deployUsers);
        } else {
            res.status(401).json({ msg: "You cannot access this data", msg_type: "UNAUTHORIZED_DATA_ACCESS" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Get a User's Supervisees
router.get("/supervisees/:id", async (req, res) => {
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

// API Sign Up Admin Route
router.post("/admin-signup", async (req, res) => {
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

            const bodyTitles = req.body.titles;
            const titles = [];

            bodyTitles.forEach(async (title) => {
                const newTitle = await Title.create({
                    name: title.name,
                    user_id: newAdmin.user_id,
                });

                titles.push(newTitle);
            });

            const currentTimePeriodRaw = await TimePeriod.findOne({
                where: {
                    isCurrent: true,
                }
            });

            if (currentTimePeriodRaw) {
                const currentTimePeriodId = currentTimePeriodRaw.dataValues.timeperiod_id;
                const previousTimePeriodId = (await TimePeriod.findOne({
                    where: {
                        isPrevious: true,
                    }
                })).dataValues.timeperiod_id;
                const twoPreviousTimePeriodId = (await TimePeriod.findOne({
                    where: {
                        isTwoPrevious: true,
                    }
                })).dataValues.timeperiod_id;

                const timeperiodIds = [currentTimePeriodId, previousTimePeriodId, twoPreviousTimePeriodId];
                timeperiodIds.forEach((timeperiod_id) => {
                    titles.forEach(async (title) => {
                        const timeCard = await TimeCard.create({
                            timeperiod_id,
                            user_id: newAdmin.user_id,
                            title_id: title.title_id,
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
                    });
                });
            }


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
router.post("/user-signup", async (req, res) => {
    try {
        if (req.session.user.isAdmin) {
            const newUser = (await User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                isSuper: false,
                isAdmin: false,
            })).dataValues;

            const bodyTitles = req.body.titles;
            const titles = [];
            bodyTitles.forEach(async (title) => {
                const newTitle = await Title.create({
                    name: title.name,
                    user_id: newUser.user_id,
                });
                titles.push(newTitle);
            });

            const timePeriodCurrent = (await TimePeriod.findOne({
                where: {
                    isCurrent: true,
                }
            })).dataValues;

            if (timePeriodCurrent) {

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
                    titles.forEach(async (title) => {
                        const timeCard = await TimeCard.create({
                            timeperiod_id: timePeriods[i].timeperiod_id,
                            user_id: newUser.user_id,
                            title_id: title.title_id,
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
                    });
                }
                res.json(newUser);
            } else {
                res.status(401).json({ msg: "You must initialize time periods before you can create users.", msg_type: "CANNOT_CREATE_USER" });
            }
        } else {
            res.status(401).json({ msg: "You do not have the authority to create a user.", msg_type: "CANNOT_CREATE_USER" })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Sign In Route
router.post("/signin", (req, res) => {
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
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ msg: "Session destroyed" })
    });
});

// API Update User
router.put("/user-id/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            let hooks = false;
            if (req.body.updateUser.password) {
                hooks = true;
            }
            const updatedUser = await User.update(req.body.updateUser, {
                where: {
                    user_id: req.params.id,
                },
                individualHooks: hooks,
            });
            res.json(updatedUser);
        } else {
            res.status(401).json({ msg: "You cannot manipulate this data", msg_type: "UNAUTHORIZED_DATA_MANIPULATE" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Set/Remove Supervisee
router.put("/edit-supervisees/:id", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const supervisorId = Number(req.params.id);
            const superviseeId = req.body.superviseeId;

            const supervisor = (await User.findByPk(supervisorId)).dataValues;
            const superviseesString = supervisor.supervisees;
            let superviseesArray = superviseesString.split(",");
            let superviseeString = superviseeId + "-" + req.body.titleId;
            let supervisorForTitle;
            if (req.body.editType === "set") {
                superviseesArray.push(superviseeString);
                supervisorForTitle = supervisorId;
            } else if (req.body.editType === "remove") {
                const superviseeIndex = superviseesArray.indexOf(superviseeString);
                if (superviseeIndex > -1) {
                    superviseesArray.splice(superviseeIndex, 1);
                }
                supervisorForTitle = null;
            }
            const newSuperviseesString = superviseesArray.join(",");
            const updatedSupervisor = await User.update({
                supervisees: newSuperviseesString,
            }, {
                where: {
                    user_id: supervisorId,
                }
            });

            const updatedTitle = await Title.update({
                supervisor_id: supervisorForTitle,
            }, {
                where: {
                    title_id: Number(req.body.titleId),
                }
            });

            res.json({ supervisor: updatedSupervisor, title: updatedTitle, });
        } else {
            res.status(401).json({ msg: "You cannot manipulate this data", msg_type: "UNAUTHORIZED_DATA_MANIPULATE" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// API Delete User by ID
router.delete("/user-id/:id", async (req, res) => {
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

module.exports = router;