const express = require('express');
const router = express.Router();
const { TimeCard, TimePeriod, User, Title } = require("../../models");

const editTimecard = async (timecard) => {
    const user = (await User.findByPk(timecard.user_id)).dataValues;
    const username = user.name;
    const title = (await Title.findByPk(timecard.title_id)).dataValues;
    const titlename = title.name;
    let supervisorname = "null"
    if (title.supervisor_id) {
        const supervisor = (await User.findByPk(title.supervisor_id)).dataValues;
        supervisorname = supervisor.name;
    }

    const returnObj = {
        ...timecard,
        username,
        supervisorname,
        titlename,
    }

    return returnObj;
}

// Administrator Submit Time Cards - RESTR: ADMIN
router.get("/", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {
            const currentTimePeriod = (await TimePeriod.findOne({ where: { isCurrent: true } }));
            const previousTimePeriod = (await TimePeriod.findOne({ where: { isPrevious: true } }));
            const twoPreviousTimePeriod = (await TimePeriod.findOne({ where: { isTwoPrevious: true } }));

            const allTimeCardsUnedited = (await TimeCard.findAll()).map((timecard) => timecard.dataValues);
            const allTimeCards = [];

            for (let i = 0; i < allTimeCardsUnedited.length; i++) {
                const timecard = allTimeCardsUnedited[i];
                const newTimecard = await editTimecard(timecard);
                allTimeCards.push(newTimecard);
            }

            const currentApprovedTimeCards = allTimeCards.filter((timecard) => ((timecard.timeperiod_id === currentTimePeriod.timeperiod_id) && (timecard.isApproved)));
            const currentNotApprovedTimeCards = allTimeCards.filter((timecard) => ((timecard.timeperiod_id === currentTimePeriod.timeperiod_id) && (!timecard.isApproved)));
            const previousApprovedTimeCards = allTimeCards.filter((timecard) => ((timecard.timeperiod_id === previousTimePeriod.timeperiod_id) && (timecard.isApproved)));
            const previousNotApprovedTimeCards = allTimeCards.filter((timecard) => ((timecard.timeperiod_id === previousTimePeriod.timeperiod_id) && (!timecard.isApproved)))
            const twoPreviousApprovedTimeCards = allTimeCards.filter((timecard) => ((timecard.timeperiod_id === twoPreviousTimePeriod.timeperiod_id) && (timecard.isApproved)));
            const twoPreviousNotApprovedTimeCards = allTimeCards.filter((timecard) => ((timecard.timeperiod_id === twoPreviousTimePeriod.timeperiod_id) && (!timecard.isApproved)));

            const timeperiods = [
                { timeperiodname: "Current", sectionId: "current-timecards", approvedGroups: [{ sectionIdApproved: "current-approved-timecards", sectionApproved: "Approved", timecards: currentApprovedTimeCards }, { sectionIdApproved: "current-notapproved-timecards", sectionApproved: "Not Approved", timecards: currentNotApprovedTimeCards }] },
                { timeperiodname: "Previous", sectionId: "previous-timecards", approvedGroups: [{ sectionIdApproved: "previous-approved-timecards", sectionApproved: "Approved", timecards: previousApprovedTimeCards }, { sectionIdApproved: "previous-notapproved-timecards", sectionApproved: "Not Approved", timecards: previousNotApprovedTimeCards }] },
                { timeperiodname: "Two Previous", sectionId: "twoprevious-timecards", approvedGroups: [{ sectionIdApproved: "twoprevious-approved-timecards", sectionApproved: "Approved", timecards: twoPreviousApprovedTimeCards }, { sectionIdApproved: "twoprevious-notapproved-timecards", sectionApproved: "Not Approved", timecards: twoPreviousNotApprovedTimeCards }] }
            ];

            const hbsObj = {
                timeperiods,
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