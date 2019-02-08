"use strict";

var { verifyToken } = require("../in-use/utils");

module.exports = function(app) {
  //real routes
  app.route("/cred").get(verifyToken, function(req, res){
    return res.status(200).json({key: process.env.AWSaccessKeyId,
    secret: process.env.AWSsecretAccessKey})
  });
};
