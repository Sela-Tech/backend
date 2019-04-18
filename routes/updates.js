"use strict";

let update = require("../app/controllers/Update");

module.exports = function (app) {
    //real routes
    app
        .route("/project/:id/updates")
        .get(update.updates);

    app
        .route("/project/:id/updates/submissions")
        .get(update.getSubmissionsPublic);

};
