"use strict";

var visibilityHeaderField = "public";
var tokenHeaderField = "x-access-token";

var jwt = require("jsonwebtoken");

exports.verifyToken = function (req, res, next) {
  var whitelisted = ["/projects", "/projects/:id"];

  var token = req.headers[tokenHeaderField] || req.headers['authorization'],
      publicView = req.headers[visibilityHeaderField];

  if (typeof token === "undefined" && publicView) {
    // check if the route is whitelisted

    var isWhitelisted = Boolean(whitelisted.filter(function (url) {
      return req.path === url;
    }).length);

    req.tokenExists = false;

    if (whitelisted[1].split("/").length === req.path.split("/").length) {
      isWhitelisted = true;
    }

    if (isWhitelisted) {
      next();
    } else {
      res.status(400).json({
        message: "No Token Provided"
      });
    }
  } else if (typeof token !== "undefined") {
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
      if (err) {
        return res.status(400).json({
          message: err.message
        });
      } else {

        var userRoles = {
          isFunder: decoded.isFunder,
          isEvaluator: decoded.isEvaluator,
          isContractor: decoded.isContractor,
          isAdmin: decoded.isAdmin || false
        };

        req.roles = Object.keys(userRoles).filter(function (k) {
          return userRoles[k] === true;
        });

        // if (req.roles.length > 1) {
        //   req.roles;
        // }

        req.tokenExists = true;
        req.userId = decoded.id;
        req.decodedTokenData = decoded;
        next();
      }
    });
  } else {
    res.status(400).json({
      message: "No Token Provided"
    });
  }
};

exports.generalError = function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
};

exports.pageNotFound = function (req, res, next) {
  res.status(404);
  res.send({
    message: "Route Not Found"
  });
};

exports.getHost = function (req) {
  var origin = req.get('origin') || req.get('host');
  return origin;
};
//# sourceMappingURL=utils.js.map