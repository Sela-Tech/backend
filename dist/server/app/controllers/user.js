"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require("dotenv").config();
var jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Organization = mongoose.model("Organization");
var Project = mongoose.model("Project");
var Save = mongoose.model("Save");
var Transaction = mongoose.model("Transaction");
var Uploads = mongoose.model("Upload");
// var tokenValidityPeriod = 86400; // in seconds; 86400 seconds = 24 hours
var tokenValidityPeriod = 604800; // in seconds; 86400 seconds = 24 hours
var bcrypt = require("bcrypt");
var crypto = require('crypto');
var Helper = require('../helper/helper');
var Notifications = require('../helper/notifications');
var validator = require('validator');
var validate = require('../../middleware/validate');
var _ = require('lodash');
var async = require('async');

var options = {
  apiKey: process.env.AFRICAS_TALKING_API,
  username: process.env.AFRICAS_TALKING_APP_USERNAME
};

var AfricasTalking = require('africastalking')(options);

var sms = AfricasTalking.SMS;

var helper = new Helper();
var notify = new Notifications();

exports.find_stakeholder_info = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var userInfo, projects, transactions, uploads, json;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return User.findOne({ _id: req.body.id });

          case 2:
            userInfo = _context.sent;
            _context.next = 5;
            return Project.find({ owner: req.body.id });

          case 5:
            projects = _context.sent;
            _context.next = 8;
            return Transaction.find({ sender: req.body.id });

          case 8:
            transactions = _context.sent;
            _context.next = 11;
            return Uploads.find({ owner: req.body.id });

          case 11:
            uploads = _context.sent;


            userInfo = userInfo.toJSON();

            delete userInfo.password;
            delete userInfo.updateOn;
            delete userInfo.activation;
            delete userInfo.username;
            delete userInfo.email;

            json = {
              userInfo: userInfo,
              projects: projects,
              transactions: transactions.length,
              uploads: uploads.length
            };

            if (!(json !== null)) {
              _context.next = 23;
              break;
            }

            return _context.abrupt("return", res.status(200).json(json));

          case 23:
            return _context.abrupt("return", res.status(401).json({}));

          case 24:
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

exports.register = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var successRes, failRes, _req$body, email, phone, query, user, type, userObj, org, signThis, fetchOrg, obj, medium, newUser, receiver, to, msg, result, emailData, _emailData;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            successRes = { success: true };
            failRes = { success: false };
            _req$body = req.body, email = _req$body.email, phone = _req$body.phone, query = email ? { email: email } : { phone: phone };
            user = void 0;
            _context2.prev = 4;
            _context2.next = 7;
            return User.findOne(query);

          case 7:
            user = _context2.sent;

            if (!user) {
              _context2.next = 12;
              break;
            }

            if (user.phone == req.body.phone) {
              failRes.message = "Sela already has an account for a user with phone number: " + req.body.phone + ". Please try another phone number";
            }
            if (user.email == req.body.email) {
              failRes.message = "Sela already has an account for a user with e-mail address: " + req.body.email + ". Please try another e-mail address";
            }
            return _context2.abrupt("return", res.status(401).json(failRes));

          case 12:
            _context2.next = 17;
            break;

          case 14:
            _context2.prev = 14;
            _context2.t0 = _context2["catch"](4);
            return _context2.abrupt("return", res.status(401).json({
              message: _context2.t0.message
            }));

          case 17:
            type = function type(user) {
              if (Boolean(user.isContractor) === true && Boolean(user.isFunder) === false && Boolean(user.isEvaluator) === false) return { isContractor: true };
              if (Boolean(user.isContractor) === false && Boolean(user.isFunder) === true && Boolean(user.isEvaluator) === false) return { isFunder: true };
              if (Boolean(user.isContractor) === false && Boolean(user.isFunder) === false && Boolean(user.isEvaluator) === true) return { isEvaluator: true };
            };

            userObj = _extends({}, type(req.body), {
              email: req.body.email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              password: req.body.password,
              phone: req.body.phone,
              profilePhoto: req.body.profilePhoto
            });
            _context2.prev = 19;
            org = req.body.organization, signThis = {};

            if (!(org.id !== "" && org.id !== undefined)) {
              _context2.next = 28;
              break;
            }

            _context2.next = 24;
            return Organization.findOne({
              _id: req.body.organization.id
            });

          case 24:
            fetchOrg = _context2.sent;

            userObj.organization = fetchOrg.id;
            _context2.next = 33;
            break;

          case 28:
            if (!(Boolean(org.id) == false && org.name !== "")) {
              _context2.next = 33;
              break;
            }

            _context2.next = 31;
            return new Organization({ name: org.name }).save();

          case 31:
            obj = _context2.sent;

            userObj.organization = obj._id;

          case 33:
            medium = void 0;

            if (!(req.body.phone && req.body.phone !== "" && !req.body.email || req.body.email == "")) {
              _context2.next = 49;
              break;
            }

            userObj.verificationToken = crypto.randomBytes(3).toString('hex');
            medium = 'Phone Number';

            _context2.next = 39;
            return new User(userObj).save();

          case 39:
            newUser = _context2.sent;
            receiver = '+234' + req.body.phone;
            to = [receiver];
            msg = {
              to: to,
              message: 'Please verify your phone number with this code: ' + userObj.verificationToken
            };
            _context2.next = 45;
            return sms.send(msg);

          case 45:
            result = _context2.sent;
            return _context2.abrupt("return", res.status(200).json(_extends({}, successRes, {
              // ...signThis,
              // token
              message: "Registration successful. Please verify your " + medium
            })));

          case 49:
            if (!(req.body.email && req.body.email !== "" && !req.body.phone || req.body.phone == "")) {
              _context2.next = 60;
              break;
            }

            medium = 'Email';
            userObj.verificationToken = crypto.randomBytes(20).toString('hex');

            _context2.next = 54;
            return new User(userObj).save();

          case 54:
            newUser = _context2.sent;
            emailData = {
              firstName: newUser.firstName,
              email: email.toLowerCase()
            };


            notify.confirmEmail(req, emailData, userObj.verificationToken);
            return _context2.abrupt("return", res.status(200).json(_extends({}, successRes, {
              // ...signThis,
              // token
              message: "Registration successful. Please verify your " + medium
            })));

          case 60:
            if (!(req.body.email && req.body.email !== "" && req.body.phone && req.body.phone !== "")) {
              _context2.next = 69;
              break;
            }

            medium = 'Email';
            userObj.verificationToken = crypto.randomBytes(20).toString('hex');

            _context2.next = 65;
            return new User(userObj).save();

          case 65:
            newUser = _context2.sent;
            _emailData = {
              firstName: newUser.firstName,
              email: email.toLowerCase()
            };


            notify.confirmEmail(req, _emailData, userObj.verificationToken);
            return _context2.abrupt("return", res.status(200).json(_extends({}, successRes, {
              // ...signThis,
              // token
              message: "Registration successful. Please verify your " + medium
            })));

          case 69:
            _context2.next = 76;
            break;

          case 71:
            _context2.prev = 71;
            _context2.t1 = _context2["catch"](19);

            console.log(_context2.t1);
            failRes.message = _context2.t1.name + ": " + _context2.t1.message;
            return _context2.abrupt("return", res.status(500).json(failRes));

          case 76:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[4, 14], [19, 71]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

exports.verify = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var user, signThis, isFunder, isEvaluator, isContractor, token;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return User.findById(req.userId);

          case 2:
            user = _context3.sent;
            signThis = {};
            isFunder = user.isFunder, isEvaluator = user.isEvaluator, isContractor = user.isContractor;

            if (Boolean(user.organization)) {
              signThis.organization = {
                name: user.organization.name,
                id: user.organization._id
              };
            } else {
              signThis.organization = {
                name: "No Organization",
                id: ""
              };
            }

            signThis = _extends({}, signThis, {
              profilePhoto: user.profilePhoto,
              id: user._id,
              isFunder: isFunder,
              isEvaluator: isEvaluator,
              isContractor: isContractor,
              firstName: user.firstName,
              phone: user.phone,
              email: user.email,
              lastName: user.lastName,
              areasOfInterest: user.areasOfInterest

            });

            token = jwt.sign(signThis, process.env.SECRET, {
              expiresIn: tokenValidityPeriod
            });
            return _context3.abrupt("return", res.status(200).json(_extends({}, signThis, {
              firstName: user.firstName,
              lastName: user.lastName,
              organization: user.organization,
              token: token
            })));

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

exports.login = function (req, res) {
  var successRes = { success: true };
  var failRes = { success: false };
  var inactiveAccountMsg = "Your account has not been activated.\n",
      unverifiedAccount = "Your email/phone Number has not been verified.\n";

  var signThis = {};

  var _req$body2 = req.body,
      email = _req$body2.email,
      phone = _req$body2.phone,
      query = email ? { email: email } : { phone: phone };


  User.findOne(query).exec(function (checkErr, user) {
    if (checkErr) {
      failRes.message = checkErr.name + ": " + checkErr.message;
      return res.status(500).json(failRes);
    }
    if (!user) {
      failRes.message = "Sela does not have an account with those user credentials. Please try another email/phone number.";
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

      if (user.activation === "approved" && user.isVerified === true) {
        var isFunder = user.isFunder,
            isEvaluator = user.isEvaluator,
            isContractor = user.isContractor;


        if (Boolean(user.organization)) {
          signThis.organization = {
            name: user.organization.name,
            id: user.organization._id
          };
        } else {
          signThis.organization = {
            name: "No Organization",
            id: ""
          };
        }

        signThis = _extends({}, signThis, {
          profilePhoto: user.profilePhoto,
          id: user._id,
          isFunder: isFunder,
          isEvaluator: isEvaluator,
          isContractor: isContractor,
          firstName: user.firstName,
          phone: user.phone,
          email: user.email,
          lastName: user.lastName,
          areasOfInterest: user.areasOfInterest

        });

        var token = jwt.sign(signThis, process.env.SECRET, {
          expiresIn: tokenValidityPeriod
        });

        return res.status(200).json(_extends({}, successRes, signThis, {
          firstName: user.firstName,
          lastName: user.lastName,
          organization: user.organization,
          token: token
        }));
      } else if (user.activation === "pending" && user.isVerified === true) {

        failRes.message = inactiveAccountMsg;
        return res.status(401).json(failRes);
      } else if (user.activation === "approved" && user.isVerified === false) {

        failRes.message = unverifiedAccount;
        return res.status(401).json(failRes);
      } else if (user.activation === "pending" && user.isVerified === false) {

        failRes.message = [unverifiedAccount, inactiveAccountMsg];
        return res.status(401).json(failRes);
      }
    });
  });
};

exports.update = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var successRes, failRes, oldPassword, user, finalUserObj;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            successRes = { success: true };
            failRes = { success: false };
            _context5.prev = 2;
            oldPassword = req.body.oldPassword;
            _context5.next = 6;
            return User.findById(req.userId).exec();

          case 6:
            user = _context5.sent;
            finalUserObj = {};


            user.comparePassword(oldPassword, function () {
              var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(passErr, isMatch) {
                var objSearch, password, hash, check, _finalUserObj, isFunder, isEvaluator, isContractor, signThis, token;

                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        if (!passErr) {
                          _context4.next = 3;
                          break;
                        }

                        failRes.message = passErr.name + ": " + passErr.message;
                        return _context4.abrupt("return", res.status(500).json(failRes));

                      case 3:
                        if (isMatch) {
                          _context4.next = 6;
                          break;
                        }

                        failRes.message = "That is the wrong password for this account. Please try again";
                        return _context4.abrupt("return", res.status(401).json(failRes));

                      case 6:
                        objSearch = {};

                        if (!(req.body.newPassword && req.body.verifyPassword && req.body.oldPassword)) {
                          _context4.next = 20;
                          break;
                        }

                        if (!(req.body.newPassword === req.body.verifyPassword)) {
                          _context4.next = 17;
                          break;
                        }

                        password = req.body.newPassword;
                        hash = bcrypt.hashSync(password, bcrypt.genSaltSync());

                        objSearch = { password: hash };

                        _context4.next = 14;
                        return User.findOneAndUpdate({ _id: req.userId }, { $set: objSearch }, { new: true });

                      case 14:
                        finalUserObj = _context4.sent;
                        _context4.next = 18;
                        break;

                      case 17:
                        res.status(401).json({
                          message: "Passwords don't match"
                        });

                      case 18:
                        _context4.next = 25;
                        break;

                      case 20:

                        objSearch = req.body;
                        delete objSearch.newPassword;
                        delete objSearch.verifyPassword;
                        delete objSearch.oldPassword;
                        delete objSearch.password;

                      case 25:
                        _context4.next = 27;
                        return User.findOne({
                          email: objSearch.email
                        });

                      case 27:
                        check = _context4.sent;


                        // if(check){
                        check = check.toJSON();
                        // }

                        console.log(check, req.userId);

                        if (!(Boolean(check) === true && check._id.toString() === req.userId.toString())) {
                          _context4.next = 39;
                          break;
                        }

                        _context4.next = 33;
                        return User.findOneAndUpdate({ _id: req.userId }, { $set: objSearch }, { new: true });

                      case 33:
                        finalUserObj = _context4.sent;
                        _finalUserObj = finalUserObj, isFunder = _finalUserObj.isFunder, isEvaluator = _finalUserObj.isEvaluator, isContractor = _finalUserObj.isContractor, signThis = {
                          profilePhoto: finalUserObj.profilePhoto,
                          id: finalUserObj._id,
                          isFunder: isFunder,
                          isEvaluator: isEvaluator,
                          email: finalUserObj.email,
                          isContractor: isContractor,
                          phone: finalUserObj.phone,
                          firstName: finalUserObj.firstName,
                          areasOfInterest: finalUserObj.areasOfInterest,
                          organization: {
                            name: finalUserObj.organization.name,
                            id: finalUserObj.organization._id
                          },
                          lastName: finalUserObj.lastName
                        };
                        token = jwt.sign(signThis, process.env.SECRET, {
                          expiresIn: tokenValidityPeriod
                        });
                        return _context4.abrupt("return", res.status(200).json(_extends({}, successRes, signThis, {
                          firstName: finalUserObj.firstName,
                          lastName: finalUserObj.lastName,
                          organization: finalUserObj.organization,
                          token: token
                        })));

                      case 39:
                        return _context4.abrupt("return", res.status(400).json({
                          message: "Email is in use."
                        }));

                      case 40:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4, undefined);
              }));

              return function (_x9, _x10) {
                return _ref5.apply(this, arguments);
              };
            }());
            _context5.next = 14;
            break;

          case 11:
            _context5.prev = 11;
            _context5.t0 = _context5["catch"](2);
            return _context5.abrupt("return", res.status(401).json({
              message: _context5.t0.message
            }));

          case 14:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, undefined, [[2, 11]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

exports.find = function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var users;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return User.find({});

          case 2:
            users = _context6.sent;


            users = users.filter(function (u) {
              u = u.toJSON();
              return u._id != req.userId && (u.isAdmin == false || u.isAdmin == undefined);
            });
            users = users.map(function (u) {
              var temp = {
                firstName: u.firstName,
                lastName: u.lastName,
                isFunder: u.isFunder,
                isContractor: u.isContractor,
                isEvaluator: u.isEvaluator,
                organization: u.organization,
                profilePhoto: u.profilePhoto,
                _id: u._id
              };
              return temp;
            });
            return _context6.abrupt("return", res.status(200).json(users));

          case 6:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();

exports.findPStakeholders = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var project, stakeholdersForProject, users, final;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.next = 3;
            return Project.findOne({ _id: req.body.projectId });

          case 3:
            project = _context7.sent;
            stakeholdersForProject = project.stakeholders;
            _context7.next = 7;
            return User.find({});

          case 7:
            users = _context7.sent;


            users = users.filter(function (u) {
              u = u.toJSON();
              return u._id != req.userId && (u.isAdmin == false || u.isAdmin == undefined);
            });

            users = users.map(function (u) {
              var temp = {
                firstName: u.firstName,
                lastName: u.lastName,
                isFunder: u.isFunder,
                isContractor: u.isContractor,
                isEvaluator: u.isEvaluator,
                organization: u.organization,
                _id: u._id
              };
              return temp;
            });

            final = users.map(function (u) {
              var innerCount = 0;
              stakeholdersForProject.map(function (s) {
                if (s._id !== u._id) {
                  innerCount = innerCount + 1;
                }
              });

              return innerCount === users.length;
            });
            return _context7.abrupt("return", res.status(200).json(final));

          case 14:
            _context7.prev = 14;
            _context7.t0 = _context7["catch"](0);
            return _context7.abrupt("return", res.status(400).json({ message: _context7.t0.message }));

          case 17:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, undefined, [[0, 14]]);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}();

exports.verifyAccountToken = function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var signThis, successRes, failRes, verificationToken, user, verifiedUser, isFunder, isEvaluator, isContractor, token, receiver, msg, result, emailData;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            signThis = {};
            successRes = { success: true };
            failRes = { success: false };
            _context8.prev = 3;
            verificationToken = req.query.token;

            if (!(!verificationToken || verificationToken == undefined)) {
              _context8.next = 7;
              break;
            }

            return _context8.abrupt("return", res.status(400).json(_extends({}, failRes, { message: "Invalid verification token" })));

          case 7:
            _context8.next = 9;
            return User.findOne({ verificationToken: verificationToken });

          case 9:
            user = _context8.sent;

            if (user) {
              _context8.next = 12;
              break;
            }

            return _context8.abrupt("return", res.status(400).json(_extends({}, failRes, { message: "Invalid verification token" })));

          case 12:

            user.verificationToken = null;
            user.isVerified = true;

            _context8.next = 16;
            return user.save();

          case 16:
            verifiedUser = _context8.sent;

            if (!verifiedUser) {
              _context8.next = 33;
              break;
            }

            isFunder = verifiedUser.isFunder, isEvaluator = verifiedUser.isEvaluator, isContractor = verifiedUser.isContractor;


            if (Boolean(verifiedUser.organization)) {
              signThis.organization = {
                name: verifiedUser.organization.name,
                id: verifiedUser.organization._id
              };
            } else {
              signThis.organization = {
                name: "No Organization",
                id: ""
              };
            }

            signThis = _extends({}, signThis, {
              profilePhoto: verifiedUser.profilePhoto,
              id: verifiedUser._id,
              isFunder: isFunder,
              isEvaluator: isEvaluator,
              isContractor: isContractor,
              firstName: verifiedUser.firstName,
              phone: verifiedUser.phone,
              email: verifiedUser.email,
              lastName: verifiedUser.lastName,
              areasOfInterest: user.areasOfInterest

            });

            token = jwt.sign(signThis, process.env.SECRET, {
              expiresIn: tokenValidityPeriod
            });

            if (!(verificationToken.length < 10)) {
              _context8.next = 30;
              break;
            }

            receiver = '+234' + verifiedUser.phone;

            // send sms

            msg = {
              to: [receiver],
              message: 'Thank you for verifying your Phone Number'
              // from: '75111'
            };
            _context8.next = 27;
            return sms.send(msg);

          case 27:
            result = _context8.sent;
            _context8.next = 32;
            break;

          case 30:
            emailData = {
              firstName: verifiedUser.firstName,
              email: verifiedUser.email.toLowerCase()
            };


            notify.welcomeMail(req, emailData);

          case 32:
            return _context8.abrupt("return", res.status(200).json(_extends({}, successRes, signThis, {
              firstName: verifiedUser.firstName,
              lastName: verifiedUser.lastName,
              organization: verifiedUser.organization,
              token: token
            })));

          case 33:
            _context8.next = 39;
            break;

          case 35:
            _context8.prev = 35;
            _context8.t0 = _context8["catch"](3);

            console.log(_context8.t0);
            res.status(500).json(_extends({}, failRes, { message: "internal server error" }));

          case 39:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, undefined, [[3, 35]]);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}();

exports.resendVerificationToken = function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var successRes, failRes, field, user, updatedUser, emailData, _user, _updatedUser, receiver, to, msg, result;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            successRes = { success: true };
            failRes = { success: false };
            _context9.prev = 2;
            field = req.body.field;

            if (!(!field || field === "" || field === undefined)) {
              _context9.next = 6;
              break;
            }

            return _context9.abrupt("return", res.status(400).json(_extends({}, failRes, { message: "invalid information" })));

          case 6:
            if (!validator.isEmail(field)) {
              _context9.next = 23;
              break;
            }

            _context9.next = 9;
            return User.findOne({ email: field, isVerified: false });

          case 9:
            user = _context9.sent;

            if (user) {
              _context9.next = 12;
              break;
            }

            return _context9.abrupt("return", res.status(400).json(_extends({}, failRes, { message: "Sela does not have an account with the email " + field + ". Please try another email." })));

          case 12:

            user.verificationToken = crypto.randomBytes(20).toString('hex');
            user.isVerified = false;

            _context9.next = 16;
            return user.save();

          case 16:
            updatedUser = _context9.sent;

            if (!updatedUser) {
              _context9.next = 21;
              break;
            }

            emailData = {
              firstName: updatedUser.firstName,
              email: updatedUser.email
            };


            notify.confirmEmail(req, emailData, updatedUser.verificationToken);

            return _context9.abrupt("return", res.status(200).json(_extends({}, successRes, {
              message: "An email has been sent to " + field + ". Please confirm your email"
            })));

          case 21:
            _context9.next = 42;
            break;

          case 23:
            if (!validator.isMobilePhone(field, "any")) {
              _context9.next = 42;
              break;
            }

            _context9.next = 26;
            return User.findOne({ phone: field, isVerified: false });

          case 26:
            _user = _context9.sent;

            if (_user) {
              _context9.next = 29;
              break;
            }

            return _context9.abrupt("return", res.status(400).json(_extends({}, failRes, { message: "Sela does not have an account with the phone Number " + field + ". Please try another Phone Number." })));

          case 29:

            _user.verificationToken = crypto.randomBytes(3).toString('hex');
            _user.isVerified = false;

            _context9.next = 33;
            return _user.save();

          case 33:
            _updatedUser = _context9.sent;

            if (!_updatedUser) {
              _context9.next = 42;
              break;
            }

            receiver = '+234' + field;
            to = [receiver];
            msg = {
              to: to,
              message: 'Please verify your phone number with this code: ' + _updatedUser.verificationToken
            };
            _context9.next = 40;
            return sms.send(msg);

          case 40:
            result = _context9.sent;
            return _context9.abrupt("return", res.status(200).json(_extends({}, successRes, {
              message: "An verification code has been sent to " + field + "."
            })));

          case 42:
            _context9.next = 48;
            break;

          case 44:
            _context9.prev = 44;
            _context9.t0 = _context9["catch"](2);

            console.log(_context9.t0);
            res.status(500).json(_extends({}, failRes, { message: "internal server error" }));

          case 48:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, undefined, [[2, 44]]);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}();

exports.updateAreaOfInterest = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(req, res) {
    var areasOfInterest, user, newInterests, updateInterest;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            areasOfInterest = req.body.areasOfInterest;
            _context10.next = 4;
            return User.findById(req.userId);

          case 4:
            user = _context10.sent;

            if (!(user == null || user == undefined)) {
              _context10.next = 7;
              break;
            }

            return _context10.abrupt("return", res.status(404).json({ message: "Bad Data" }));

          case 7:

            // let existingInterests = user.areasOfInterest;

            newInterests = [].concat(_toConsumableArray(areasOfInterest));

            newInterests = _.uniq(newInterests);

            _context10.next = 11;
            return User.update({ _id: req.userId }, { $set: { areasOfInterest: newInterests } });

          case 11:
            updateInterest = _context10.sent;

            if (!Boolean(updateInterest)) {
              _context10.next = 14;
              break;
            }

            return _context10.abrupt("return", res.status(200).json({ message: "Areas of interest updated successfully" }));

          case 14:
            _context10.next = 20;
            break;

          case 16:
            _context10.prev = 16;
            _context10.t0 = _context10["catch"](0);

            console.log(_context10.t0);
            res.status(500).json({ message: "internal server error" });

          case 20:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, undefined, [[0, 16]]);
  }));

  return function (_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}();

exports.saveProject = function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(req, res) {
    var projectId, project, saveObj, savedProject;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            projectId = req.params.id;
            _context11.prev = 1;
            _context11.next = 4;
            return Save.findOne({ project: projectId, user: req.userId });

          case 4:
            project = _context11.sent;

            if (!project) {
              _context11.next = 9;
              break;
            }

            _context11.next = 8;
            return project.remove();

          case 8:
            return _context11.abrupt("return", res.status(200).json({ message: "Project removed from saved projects" }));

          case 9:
            saveObj = {
              project: projectId,
              user: req.userId
            };
            _context11.next = 12;
            return new Save(saveObj).save();

          case 12:
            savedProject = _context11.sent;

            if (!savedProject) {
              _context11.next = 15;
              break;
            }

            return _context11.abrupt("return", res.status(201).json({ message: "Project has been saved", savedProject: savedProject }));

          case 15:
            _context11.next = 21;
            break;

          case 17:
            _context11.prev = 17;
            _context11.t0 = _context11["catch"](1);

            console.log(_context11.t0);
            res.status(500).json({ message: "internal server error" });

          case 21:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, undefined, [[1, 17]]);
  }));

  return function (_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}();
//# sourceMappingURL=user.js.map