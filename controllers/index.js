const router = require('express').Router();

const webRoutes = require("./web");
router.use("/", webRoutes);

const apiRoutes = require("./api");
router.use("/api", apiRoutes);

module.exports = router;