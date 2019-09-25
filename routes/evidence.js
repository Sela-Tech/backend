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
        .put(verifyToken, evidence.submitEvidenceForEvidenceRequest);
    app
        .route("/project/:id/evidence-requests")
        .get(verifyToken, evidence.getProjectEvidenceRequests);
    app
        .route("/evidence-request/:id")
        .get(verifyToken, evidence.getSingleEvidenceRequest);
    app
        .route("/evidence-submit")
        .post(verifyToken, evidence.submitEvidenceGeneral);
    app
        .route("/project/:id/submissions")
        .get(verifyToken, evidence.getSubmissions);


};
