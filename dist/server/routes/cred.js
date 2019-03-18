"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

module.exports = function (app) {
  //real routes
  app.route("/cred").get(verifyToken, function (req, res) {
    return res.status(200).json({ key: process.env.AWSaccessKeyId,
      secret: process.env.AWSsecretAccessKey });
  });
};
//# sourceMappingURL=cred.js.map