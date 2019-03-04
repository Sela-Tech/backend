"use strict";

var { verifyToken } = require("../in-use/utils");
const { Proposals } = require("../app/controllers/Proposal");

module.exports = function (app) {
    app
        .route("/proposals")
        .post(verifyToken, Proposals.submitProposal);

        app.route("/project/:id/proposals").get(verifyToken, Proposals.getprojectProposals);
        app.route("/proposal/:id").put(verifyToken, Proposals.acceptOrRejectProposal);
        app.route("/proposal/:id").get(verifyToken, Proposals.getProposalDetail);
        app.route("/proposal").put(verifyToken, Proposals.assignProposalToContractor);

};
