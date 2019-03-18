"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require("dotenv").config();
var jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Project = mongoose.model("Project");
var tokenValidityPeriod = 86400; // in seconds; 86400 seconds = 24 hours

exports.login = function (req, res) {
  var successRes = { success: true };
  var failRes = { success: false };

  var _req$body = req.body,
      email = _req$body.email,
      phone = _req$body.phone,
      query = email ? { email: email } : { phone: phone };


  User.findOne(query).exec(function (checkErr, user) {
    if (checkErr) {
      failRes.message = checkErr.name + ": " + checkErr.message;
      return res.status(500).json(failRes);
    }
    if (!user) {
      failRes.message = "Sela does not have an account with those user credentials. Please try another email/phone number or follow the link below to register";
      return res.status(401).json(failRes);
    }

    user.comparePassword(req.body.password, function (passErr, isMatch) {
      if (passErr) {
        failRes.message = passErr.name + ": " + passErr.message;
        return res.status(500).json(failRes);
      }
      if (!isMatch) {
        failRes.message = "That is the wrong password for this account. Please try again";
        return res.status(401).json(failRes);
      }

      user = user.toJSON();

      if (user.isAdmin == true) {
        var signThis = {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePhoto: user.profilePhoto,
          isAdmin: user.isAdmin
        };

        var token = jwt.sign(signThis, process.env.SECRET, {
          expiresIn: tokenValidityPeriod
        });

        return res.status(200).json(_extends({}, successRes, {
          token: token
        }));
      } else {
        failRes.message = "Your are not an admin.";
        return res.status(401).json(failRes);
      }
    });
  });
};

exports.activate_user = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.find = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var users;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return User.find({}, "activation firstName lastName isFunder isContractor isEvaluator createdOn organization email phone profilePhoto");

          case 2:
            users = _context2.sent;


            users = users.filter(function (u) {
              return u._id != req.userId;
            });
            return _context2.abrupt("return", res.status(200).json(users));

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

exports.approve = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var approveRequest;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;

            if (!req.decodedTokenData.isAdmin) {
              _context3.next = 7;
              break;
            }

            _context3.next = 4;
            return User.updateOne({ _id: req.body.id }, {
              $set: { activation: "approved" }
            });

          case 4:
            approveRequest = _context3.sent;

            if (!Boolean(approveRequest.n)) {
              _context3.next = 7;
              break;
            }

            return _context3.abrupt("return", res.status(200).json({
              activation: "approved"
            }));

          case 7:
            _context3.next = 12;
            break;

          case 9:
            _context3.prev = 9;
            _context3.t0 = _context3["catch"](0);

            res.status(401).json({
              message: _context3.t0.message
            });

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, undefined, [[0, 9]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

exports.revoke = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var approveRequest;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;

            if (!req.decodedTokenData.isAdmin) {
              _context4.next = 7;
              break;
            }

            _context4.next = 4;
            return User.updateOne({ _id: req.body.id }, {
              $set: { activation: "revoked" }
            });

          case 4:
            approveRequest = _context4.sent;

            if (!Boolean(approveRequest.n)) {
              _context4.next = 7;
              break;
            }

            return _context4.abrupt("return", res.status(200).json({
              activation: "revoked"
            }));

          case 7:
            _context4.next = 12;
            break;

          case 9:
            _context4.prev = 9;
            _context4.t0 = _context4["catch"](0);

            res.status(401).json({
              message: _context4.t0.message
            });

          case 12:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, undefined, [[0, 9]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

exports.deleteProject = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var projectId, project;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            projectId = req.query.id;
            _context5.prev = 1;

            if (!(projectId && projectId !== null)) {
              _context5.next = 13;
              break;
            }

            _context5.next = 5;
            return Project.findById(projectId);

          case 5:
            project = _context5.sent;

            if (project) {
              _context5.next = 8;
              break;
            }

            return _context5.abrupt("return", res.status(404).json({ message: "Project doesn't exist" }));

          case 8:
            _context5.next = 10;
            return project.remove();

          case 10:
            return _context5.abrupt("return", res.status(200).json({ message: "Project deleted successfully" }));

          case 13:
            _context5.next = 15;
            return Project.remove({});

          case 15:
            return _context5.abrupt("return", res.status(200).json({ message: "Projects deleted successfully" }));

          case 16:
            _context5.next = 22;
            break;

          case 18:
            _context5.prev = 18;
            _context5.t0 = _context5["catch"](1);

            console.log(_context5.t0);
            return _context5.abrupt("return", res.status(500).json({ message: "internal server error" }));

          case 22:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, undefined, [[1, 18]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();

exports.deleteUser = function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var userId, _user;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            userId = req.query.id;
            _context6.prev = 1;

            if (!(userId && userId !== null)) {
              _context6.next = 13;
              break;
            }

            _context6.next = 5;
            return User.findById(userId);

          case 5:
            _user = _context6.sent;

            if (_user) {
              _context6.next = 8;
              break;
            }

            return _context6.abrupt("return", res.status(404).json({ message: "User doesn't exist" }));

          case 8:
            _context6.next = 10;
            return _user.remove();

          case 10:
            return _context6.abrupt("return", res.status(200).json({ message: "User deleted successfully" }));

          case 13:
            _context6.next = 15;
            return user.remove({});

          case 15:
            return _context6.abrupt("return", res.status(200).json({ message: "Users deleted successfully" }));

          case 16:
            _context6.next = 22;
            break;

          case 18:
            _context6.prev = 18;
            _context6.t0 = _context6["catch"](1);

            console.log(_context6.t0);
            return _context6.abrupt("return", res.status(500).json({ message: "internal server error" }));

          case 22:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, undefined, [[1, 18]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();
//# sourceMappingURL=admin.js.map