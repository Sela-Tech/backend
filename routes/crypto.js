"use strict";

var { verifyToken } = require("../in-use/utils");
let Crypto = require("../app/controllers/Crypto");

module.exports = function (app) {
  // //real routes
  // app.route("/trn").post(verifyToken, trn.confirmTransaction);
  // //   app.route("/trn/:projectId").get(trn.fetchTransactions);

  app.route("/balances").get(verifyToken, Crypto.getBalances.bind(Crypto));

  app.route("/project/:id/transaction-history")
    .get(verifyToken, Crypto.getTransactions.bind(Crypto));

  app.route("/fund/transfer")
    .post(verifyToken, Crypto.transferFund.bind(Crypto));

  app.route("/projects/:id/transaction-history/public")
    .get(Crypto.getTransactionsPublicView.bind(Crypto));
};
