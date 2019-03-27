"use strict";

var { verifyToken } = require("../in-use/utils");
let Crypto = require("../app/controllers/Crypto");

module.exports = function(app) {
  // //real routes
  // app.route("/trn").post(verifyToken, trn.confirmTransaction);
  // //   app.route("/trn/:projectId").get(trn.fetchTransactions);

  app.route("/balances").get(verifyToken, Crypto.getBalances.bind(Crypto));
};
