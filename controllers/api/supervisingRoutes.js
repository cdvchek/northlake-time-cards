const express = require('express');
const router = express.Router();
const { User, TimeCard, TimeInOut, TimePeriod, Title } = require('../../models');

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
            const superviseesArr = superviseesList.replace(",", "").split(",");

            // Assigning the new idCombo to be added
            const newIdCombo = `${superviseeId} - ${titleId}`;

            // Adding the new combo to the list
            superviseesArr.push(newIdCombo);

            // Joining the arr to make a new string
            const newSuperviseesList = `,${superviseesArr.join(",")}`;

            // Update the supervisor's supervisee list
            await User.update({
                supervisees: newSuperviseesList
            }, {
                where: {
                    user_id: supervisorId
                }
            });

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
            const superviseesList = (await User.findByPk(supervisorId)).supervisees;
            const superviseesArr = superviseesList.replace(",", "").split(",");
            
            // Initializing the new array for the supervisees list
            const newSuperviseesArr = [];

            // Adding all the correct supervisees to the new array
            for (let i = 0; i < superviseesArr.length; i++) {
                const idCombo = superviseesArr[i];
                if (idCombo !== `${superviseeId}-${titleId}`) {
                    newSuperviseesArr.push(idCombo);
                }
            }

            // Not sure what happened but the system needs a comma at the front
            const newSuperviseesList = `,${newSuperviseesArr.join(",")}`;

            // Update the supervisor's supervisee list
            await User.update({
                supervisees: newSuperviseesList
            }, {
                where: {
                    user_id: supervisorId
                }
            });

        } else {
            res.status(401).json({ msg: "You cannot edit data", msg_type: "UNAUTHORIZED_DATA_EDIT" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;