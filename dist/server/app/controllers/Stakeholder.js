"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("dotenv").config();
var mongoose = require("mongoose"),
    Project = mongoose.model("Project"),
    Notification = mongoose.model("Notification"),
    User = mongoose.model("User");

var Helper = require('../helper/helper');
var notify = require('../helper/notifications');

// const accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
// const authToken = 'your_auth_token';
// const client = require('twilio')(accountSid, authToken);


/**
 *
 *
 * @class Stakeholder
 */

var Stakeholder = function () {
    function Stakeholder() {
        _classCallCheck(this, Stakeholder);
    }

    _createClass(Stakeholder, [{
        key: "acceptRequestToJoinProject",
        value: function acceptRequestToJoinProject(req, res) {}
    }], [{
        key: "getStakeHolderJoinedProjects",


        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns {object}
         * @memberof Stakeholder
         */
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
                var userId, projects;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                userId = req.userId;
                                _context.prev = 1;
                                _context.next = 4;
                                return Project.find({
                                    'stakeholders.user.information': userId,
                                    'stakeholders.user.status': 'ACCEPTED', 'stakeholders.user.agreed': true
                                });

                            case 4:
                                projects = _context.sent;

                                if (!(projects.length > 0)) {
                                    _context.next = 9;
                                    break;
                                }

                                return _context.abrupt("return", res.status(200).json({ projects: projects }));

                            case 9:
                                return _context.abrupt("return", res.status(200).json({ projects: [] }));

                            case 10:
                                _context.next = 16;
                                break;

                            case 12:
                                _context.prev = 12;
                                _context.t0 = _context["catch"](1);

                                console.log(_context.t0);
                                return _context.abrupt("return", res.status(500).json({ message: "Internal server error" }));

                            case 16:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[1, 12]]);
            }));

            function getStakeHolderJoinedProjects(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return getStakeHolderJoinedProjects;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns {object}
         * @memberof Stakeholder
         */

    }, {
        key: "acceptOrRejectInvitationToJoinProject",
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
                var userId, projectId, notificationId, agreed, success, failure, project, user, status, updated, notificationData, message, accepted, rejected;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                userId = req.userId;
                                projectId = req.params.id;
                                notificationId = req.query.notification;
                                agreed = req.body.agreed;
                                success = true, failure = false;
                                _context2.next = 7;
                                return Project.findOne({
                                    _id: projectId,
                                    activated: true,
                                    'stakeholders.user.information': userId
                                });

                            case 7:
                                project = _context2.sent;

                                if (!(project === null)) {
                                    _context2.next = 12;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(404).json({
                                    message: "This project doesn't exists on sela platform\n" + "or you are not associated with it"
                                }));

                            case 12:
                                _context2.prev = 12;
                                user = project.stakeholders.find(function (u) {
                                    return u.user.information._id.toString() === userId;
                                });

                                user = user.user;

                                if (!(user.status === "ACCEPTED" && agreed === true)) {
                                    _context2.next = 19;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(409).json({ message: "You have already joined this Project." }));

                            case 19:
                                if (!(user.status === "ACCEPTED" && agreed === false)) {
                                    _context2.next = 23;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(403).json({ message: "Please contact project owner." }));

                            case 23:
                                if (!(user.status === "DECLINED" && agreed === true)) {
                                    _context2.next = 27;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(403).json({ message: "You previously declined this invitation. \n Please contact the project owner to invite you again" }));

                            case 27:
                                if (!(user.status === "DECLINED" && agreed === false)) {
                                    _context2.next = 29;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(403).json({ message: "You have previously declined this invitation." }));

                            case 29:
                                status = void 0;


                                agreed === true ? status = 'ACCEPTED' : status = 'DECLINED';

                                _context2.next = 33;
                                return Project.updateOne({
                                    _id: projectId,
                                    activated: true,
                                    'stakeholders.user.information': userId
                                }, {
                                    $set: { 'stakeholders.$.user.status': status, 'stakeholders.$.user.agreed': agreed }
                                });

                            case 33:
                                updated = _context2.sent;

                                if (!Boolean(updated.n)) {
                                    _context2.next = 43;
                                    break;
                                }

                                notificationData = {
                                    stakeholderName: req.decodedTokenData.firstName + ' ' + req.decodedTokenData.lastName,
                                    stakeHolderPhoto: req.decodedTokenData.profilePhoto,
                                    stakeholderId: userId,
                                    project: project,
                                    agreed: agreed,
                                    notificationId: notificationId
                                };
                                _context2.next = 38;
                                return notify.notifyAcceptance(req, notificationData);

                            case 38:
                                message = void 0;
                                accepted = "You have successfully joined " + project.name + " project";
                                rejected = "Your have successfully declined the invitation to join the project \"" + project.name + "\"";


                                agreed === true ? message = accepted : message = rejected;

                                return _context2.abrupt("return", res.status(200).json({
                                    success: success,
                                    message: message
                                }));

                            case 43:
                                return _context2.abrupt("return", res.status(400).json({ success: failure, message: "You were unable to join the project \"" + project.name + "\"" }));

                            case 46:
                                _context2.prev = 46;
                                _context2.t0 = _context2["catch"](12);

                                console.log(_context2.t0);
                                return _context2.abrupt("return", res.status(500).json({ message: "internal server error" }));

                            case 50:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[12, 46]]);
            }));

            function acceptOrRejectInvitationToJoinProject(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return acceptOrRejectInvitationToJoinProject;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns { object }
         * @memberof Stakeholder
         */

    }, {
        key: "requestToJoinP",
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
                var userId, _id, successRes, failRes, project, project_stakeholders, found_stakeholder, hasNotified;

                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                userId = req.userId;
                                _id = req.body.projectId;
                                successRes = { success: true };
                                failRes = { success: false };
                                _context3.prev = 4;
                                _context3.next = 7;
                                return Project.findOne({ _id: _id, activated: true });

                            case 7:
                                project = _context3.sent;

                                if (!(project === null)) {
                                    _context3.next = 10;
                                    break;
                                }

                                return _context3.abrupt("return", res.status(404).json({
                                    message: "Project Not Found"
                                }));

                            case 10:
                                project_stakeholders = project.stakeholders;
                                found_stakeholder = project_stakeholders.find(function (s) {
                                    return s.user.information._id == userId;
                                });

                                if (!found_stakeholder) {
                                    _context3.next = 14;
                                    break;
                                }

                                return _context3.abrupt("return", res.status(401).json({
                                    message: "You already have a connection with the project \"" + project.name + "\" "
                                }));

                            case 14:
                                _context3.next = 16;
                                return notify.notifyRequestToJoinP(req, project);

                            case 16:
                                hasNotified = _context3.sent;

                                if (!Boolean(hasNotified.status)) {
                                    _context3.next = 20;
                                    break;
                                }

                                successRes.message = hasNotified.message;
                                return _context3.abrupt("return", res.status(200).json(successRes));

                            case 20:

                                failRes.message = hasNotified.message;
                                return _context3.abrupt("return", res.status(400).json({ failRes: failRes }));

                            case 24:
                                _context3.prev = 24;
                                _context3.t0 = _context3["catch"](4);

                                console.log(_context3.t0);
                                return _context3.abrupt("return", res.status(500).json({ message: "internal server error" }));

                            case 28:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[4, 24]]);
            }));

            function requestToJoinP(_x5, _x6) {
                return _ref3.apply(this, arguments);
            }

            return requestToJoinP;
        }()
    }]);

    return Stakeholder;
}();

module.exports = Stakeholder;
//# sourceMappingURL=Stakeholder.js.map