// Requiring Utilities
// =============================================================
const express = require('express')
const session = require('express-session');
const exphbs = require('express-handlebars');
const sequelize = require("./config/connection.js");
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const routes = require("./controllers");

// Sets up the Express app to handle data parsing
// =============================================================
const app = express()
const port = process.env.PORT || 3001;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Declaring Sessions
// =============================================================
const sess = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: {
        maxAge:1000*60*60*2
    },
    saveUninitialized: true,
    store: new SequelizeStore({
        db: sequelize
    })
};
app.use(session(sess));

// Static directory and Custom Routes
// =============================================================
app.use(express.static('public'));
app.use("/", routes);

// Initializing handlebars
// =============================================================
const hbs = exphbs.create({});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Running Server
// =============================================================
sequelize.sync({ force: false }).then(function () {
    app.listen(port, function () {
        console.log('App listening on PORT: ' + port);
    });
});