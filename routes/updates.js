"use strict";

var { verifyToken } = require("../in-use/utils");
let update = require("../app/controllers/Update");

module.exports = function (app) {
    //real routes
    app
        .route("/updates")
        .get(update.updates);

};