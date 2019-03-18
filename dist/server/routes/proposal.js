"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var _require2 = require("../app/controllers/Proposal"),
    Proposals = _require2.Proposals;

module.exports = function (app) {
    app.route("/proposals").post(verifyToken, Proposals.submitProposal);

    app.route("/project/:id/proposals").get(verifyToken, Proposals.getprojectProposals);
    app.route("/proposal/:id").put(verifyToken, Proposals.acceptOrRejectProposal);
    app.route("/proposal/:id").get(verifyToken, Proposals.getProposalDetail);
    app.route("/proposal").put(verifyToken, Proposals.assignProposalToContractor);
};
//# sourceMappingURL=proposal.js.map