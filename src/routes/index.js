const approuter = require("./app.route");
const { Router } = require("express");
const mainRouter = new Router();
const versionRouter = new Router();
mainRouter.use(`/api/v1`, versionRouter);

versionRouter.use("/", approuter);
module.exports = { mainRouter };
