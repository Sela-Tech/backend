"use strict";

var { verifyToken } = require("../in-use/utils");
const  {Evidence}  = require("../app/controllers/EvidenceRequest");

const evidence = new Evidence();

module.exports = function (app) {
    app
        .route("/specify-kpi")
        .post(verifyToken, evidence.specifyKPI);
        

};
