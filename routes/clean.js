"use strict";

var { verifyToken } = require("../in-use/utils");
const Clean = require("../app/controllers/Clean");


module.exports = function (app) {
    app
        .route("/projects/clean")
        .delete(Clean.cleanProjects);

};
