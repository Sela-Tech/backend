"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var trn = require("../app/controllers/crypto");

module.exports = function (app) {
  //real routes
  app.route("/trn").post(verifyToken, trn.confirmTransaction);
  //   app.route("/trn/:projectId").get(trn.fetchTransactions);
};
//# sourceMappingURL=transaction.js.map