"use strict";

var { verifyToken } = require("../in-use/utils");
const { Proposals } = require("../app/controllers/Proposal");

module.exports = function (app) {
    app
        .route("/proposals")
        .post(verifyToken, Proposals.sendProposal);

};
