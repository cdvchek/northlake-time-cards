const express = require('express');
const router = express.Router();
const { User, Title, TimeCard} = require('../../models');
const { weekArrLower, periodIdentifiers, findPeriodNames, findAllDates, findPeriodsInOrder } = require('../../utils/index');

// Supervisor Approve - RESTR: SUPER
router.get("/", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isSuper) {

            // Getting dates
            const week = weekArrLower;
            const datesObj = await findAllDates();
            const { periodNames, periodNamesLong } = await findPeriodNames();
            const [currentPeriod, previousPeriod, twoPreviousPeriod] = periodNames;
            const [currentPeriodLong, previousPeriodLong, twoPreviousPeriodLong] = periodNamesLong;

            // Getting the user and their supervisees' ids
            const user = (await User.findByPk(req.session.user.user_id)).dataValues;

            // Cleaning the supervisees string
            user.supervisees = await cleanSuperviseesString(user);

            // Gettings the sueprvisees ids
            const superviseesIds = user.supervisees.split(",");

            // Finding the supervisees and the filtered versions
            const supervisees = await findSupervisees(superviseesIds);
            const readysupervisees = await findReadySupervisees(supervisees);
            const { superviseesCurrentCheck, superviseesPreviousCheck, superviseesTwoPreviousCheck } = await findChecklistStatus(supervisees);
        
            const hbsObj = {
                currentPeriod,
                currentPeriodLong,
                previousPeriod,
                previousPeriodLong,
                twoPreviousPeriod,
                twoPreviousPeriodLong,
                userName: req.session.user.name,
                readysupervisees: readysupervisees,
                supervisees: supervisees,
                superviseesCurrentCheck,
                superviseesPreviousCheck,
                superviseesTwoPreviousCheck,
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
            }

            for (let k = 0; k < periodIdentifiers.length; k++) {
                const periodIdentifier = periodIdentifiers[k];
                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < week.length; j++) {
                        const day = week[j];
                        hbsObj[`${periodIdentifier.toLowerCase()}_${day}_${i + 1}`] = datesObj[periodIdentifier][`${day}_${i + 1}`];
                    }                
                }
            }
            res.render("super-approve", hbsObj);
        } else {
            req.session.destroy();
            res.render("signin");
        }
    } catch (err) {
        console.log(err);
        const hbsObj = {
            errorMessage: err,
        }
        res.render("error", hbsObj);
    }
});

module.exports = router;

const findSupervisees = async ( superviseeIds ) => {

    // Initialize for returning
    const supervisees = [];

    for (let i = 0; i < superviseeIds.length; i++) { 
        // Get the supervisee id and the supervised title id
        const [superviseeId, titleId] = superviseeIds[i].split("-");

        // Get the supervisee from the supervisee id
        const supervisee = (await User.findByPk(superviseeId, { include: Title })).dataValues;

        if (supervisee.Titles.length > 1) {// if the supervisee has more than one title then we need to find the correct title
            for (let j = 0; j < supervisee.Titles.length; j++) {
                const title = supervisee.Titles[j].dataValues;

                //Check to see if its the correct title
                if (title.title_id === Number(titleId)) { // if true then we found the correct title
                    
                    // Change the name so the user knows they are looking at a specific title
                    supervisee.titleName = supervisee.name + " - " + title.name;

                    // Add the title id to the supervisee for easy access on the handlebar template
                    supervisee.title_id = title.title_id;

                    // Push onto supervisees
                    supervisees.push(supervisee);
                }
            }
        } else { // the supervisee only has one title

            // The supervisee only has one title so we don't have to specify the title name
            supervisee.titleName = supervisee.name;

            // Add the title id to the supervisee for easy access on the handlebar template
            supervisee.title_id = supervisee.Titles[0].dataValues.title_id;

            // Push onto supervisees
            supervisees.push(supervisee);
        }
    }

    return supervisees;
}

const findReadySupervisees = async ( supervisees ) => {

    // Initialize for returning
    const readySupervisees = [];

    // For each supervisee we need to check each timecard they have and if they have a ready timecard, then push them onto readySupervisees
    for (let i = 0; i < supervisees.length; i++) {
        const supervisee = supervisees[i];
        
        // Get the supervisees timecards
        const timecards = (await TimeCard.findAll({ where: { user_id: supervisee.user_id, title_id: supervisee.title_id } })).map(( timecard ) => timecard.dataValues );
        
        // Check each timecard if they are ready
        for (let j = 0; j < timecards.length; j++) {
            const timecard = timecards[j];

            // If timecard is ready and hasn't been approved then push the supervisee onto readySupervisees
            if (timecard.isReadyToBeApproved && !timecard.isApproved) {
                readySupervisees.push(supervisee);
            }
        }
    }

    return readySupervisees;
}

const findChecklistStatus = async (supervisees) => {

    // Initialized for returning
    const superviseesCurrentCheck = [];
    const superviseesPreviousCheck = [];
    const superviseesTwoPreviousCheck = [];

    // Find all the periods
    const periods = await findPeriodsInOrder();

    // For each supervisee, we need to check each period's timecard's approved status and log it with the arrays above
    
    // Looping through the supervisees
    for (let i = 0; i < supervisees.length; i++) {
        const supervisee = supervisees[i];
        
        // Looping through the periods
        for (let j = 0; j < periods.length; j++) {
            const period = periods[j];
            
            // Getting the supervisee's timecard for each period
            const timecard = (await TimeCard.findOne({ where: { user_id: supervisee.user_id, title_id: supervisee.title_id, timeperiod_id: period.timeperiod_id } })).dataValues;

            // Setting up the data to be returned
            const superviseeObj = {
                name: supervisee.titleName,
                isApproved: timecard.isApproved,
            }

            // Pushing to the correct array
            if (period.isCurrent) {
                superviseesCurrentCheck.push(superviseeObj);
            } else if (period.isPrevious) {
                superviseesPreviousCheck.push(superviseeObj);
            } else {
                superviseesTwoPreviousCheck.push(superviseeObj);
            }
        }
    }

    return {
        superviseesCurrentCheck,
        superviseesPreviousCheck,
        superviseesTwoPreviousCheck,
    }
}

const cleanSuperviseesString = async (user) => {
    let superviseesString = user.supervisees;

    // Cleaning the "dirty" string
    while (superviseesString[0] === ",") {
        superviseesString = superviseesString.substring(1, superviseesString.length);
    }

    // The "clean" string now needs to be saved
    await User.update({
        supervisees: superviseesString
    }, {
        where: {
            user_id: user.user_id
        }
    });

    return superviseesString;
}