"use strict";

var { verifyToken } = require("../in-use/utils");
const { Evidences } = require("../app/controllers/EvidenceRequest");

const evidence = new Evidences();

module.exports = function (app) {
    app
        .route("/specify-kpi")
        .post(verifyToken, evidence.specifyKPI);

    app
        .route("/evidence-request-submission")
        .put(verifyToken, evidence.submitEvidence);
        

};
