"use strict";

var { verifyToken } = require("../in-use/utils");
let { Comment } = require("../app/controllers/Comments");

module.exports = function (app) {
    //real routes
    app.route("/proposal/comments").post(verifyToken, Comment.commentOnProposal)
};
