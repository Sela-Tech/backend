"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var _require2 = require("../app/controllers/EvidenceRequest"),
    Evidences = _require2.Evidences;

var evidence = new Evidences();

module.exports = function (app) {
    app.route("/specify-kpi").post(verifyToken, evidence.specifyKPI);
    app.route("/evidence-request-submission").put(verifyToken, evidence.submitEvidenceForEvidenceRequest);
    app.route("/project/:id/evidence-requests").get(verifyToken, evidence.getProjectEvidenceRequests);
    app.route("/evidence-request/:id").get(verifyToken, evidence.getSingleEvidenceRequest);
    app.route("/evidence-submit").post(verifyToken, evidence.submitEvidenceGeneral);
    app.route("/project/:id/submissions").get(verifyToken, evidence.getSubmissions);
};
//# sourceMappingURL=evidence.js.map