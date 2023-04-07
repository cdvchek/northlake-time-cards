const express = require('express');
const router = express.Router();
const { User, Title } = require('../../models');

// Adding a supervisee
router.put("/add-supervisee", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {

            // Grabbing variables from the req.body
            const superviseeId = req.body.superviseeId;
            const titleId = req.body.titleId;
            const supervisorId = req.body.supervisorId;

            // Adding the supervisor id from the title
            await Title.update({
                supervisor_id: supervisorId
            }, {
                where: {
                    title_id: titleId
                }
            });

            // Finding the existing supervisees list and splitting it into an array
            const superviseesList = (await User.findByPk(supervisorId)).supervisees;
            const superviseesArr = superviseesList.split(",");

            // Assigning the new idCombo to be added
            const newIdCombo = `${superviseeId} - ${titleId}`;

            // Adding the new combo to the list
            superviseesArr.push(newIdCombo);

            // Joining the arr to make a new string
            let newSuperviseesList = `,${superviseesArr.join(",")}`;

            // Clean the new supervisees string
            while (newSuperviseesList[0] === ",") {
                newSuperviseesList = newSuperviseesList.substring(1, newSuperviseesList.length);
            }

            // Update the supervisor's supervisee list
            await User.update({
                supervisees: newSuperviseesList
            }, {
                where: {
                    user_id: supervisorId
                }
            });

            res.status(200).json({ msg: "Success!" });

        } else {
            res.status(401).json({ msg: "You cannot edit data", msg_type: "UNAUTHORIZED_DATA_EDIT" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// Removing a supervisee
router.put("/remove-supervisee", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {

            // Grabbing variables from the req.body
            const superviseeId = req.body.superviseeId;
            const titleId = req.body.titleId;
            const supervisorId = req.body.supervisorId;

            // Removing the supervisor id from the title
            await Title.update({
                supervisor_id: null
            }, {
                where: {
                    title_id: titleId
                }
            });

            // Finding the existing supervisees list and splitting it into an array
            let superviseesList = (await User.findByPk(supervisorId)).supervisees;

            // Clean the supervisees string
            while (superviseesList[0] === ",") {
                superviseesList = superviseesList.substring(1, superviseesList.length);
            }
            
            // Removing the supervisee from the supervisees list
            let newSuperviseesList = superviseesList.replaceAll(`,${superviseeId} - ${titleId}`, "");

            // If the supervisee that is wanted to be removed is the first on the supervisees string, there wont be a comma at the front
            if (superviseesList === newSuperviseesList) {
                newSuperviseesList = superviseesList.replaceAll(`${superviseeId} - ${titleId}`, "");
            }
            
            // Update the supervisor's supervisee list
            await User.update({
                supervisees: newSuperviseesList
            }, {
                where: {
                    user_id: supervisorId
                }
            });

            res.status(200).json({ msg: "Success!" });

        } else {
            res.status(401).json({ msg: "You cannot edit data", msg_type: "UNAUTHORIZED_DATA_EDIT" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.put("/add-remove-supervisor", async (req, res) => {
    try {
        if (req.session.user && req.session.user.isAdmin) {

            // Update the user to either remove supervisor status or give supervisor status
            await User.update({
                isSuper: req.body.isSuper,
            }, {
                where: {
                    user_id: req.body.userId
                }
            });

            res.status(200).json({ msg: "Success!" });

        } else {
            res.status(401).json({ msg: "You cannot edit data", msg_type: "UNAUTHORIZED_DATA_EDIT" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;