const express = require('express');
const router = express.Router();
const { User } = require('../../models');

// Administrator Manage Supervisors - RESTR: ADMIN
router.get("/", async (req, res) => {
    try {

        // The user must be registered and an admin to access this route
        if (req.session.user && req.session.user.isAdmin) {

            // All of the users have to be found to list them as potential supervisors
            let users = (await User.findAll()).map((user) => user.dataValues);

            // Preparing the handlebars object
            const hbsObj = {
                users,
                userName: req.session.user.name,
                isAdmin: req.session.user.isAdmin,
                isSuper: req.session.user.isSuper,
            }

            // Rendering the template
            res.render("admin-managesupers", hbsObj);
            
        // The user was trying to access a route they don't have permission to access
        } else {

            // Destroying the session and sending the user to sign in
            req.session.destroy();
            res.render("signin");
        }
    
    // Basic error handling
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;