"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sgMail = require('@sendgrid/mail');
var mongoose = require("mongoose");
var Notification = mongoose.model("Notification"),
    User = mongoose.model("User");
var Helper = require('../helper/helper');
var EmailTemplates = require('../helper/emailTemplates');

var _require = require('../../in-use/utils'),
    getHost = _require.getHost;

var NotificationController = require('../controllers/Notification');
var helper = new Helper();

var options = {
    apiKey: process.env.AFRICAS_TALKING_API,
    username: process.env.AFRICAS_TALKING_APP_USERNAME
};

var AfricasTalking = require('africastalking')(options);

sgMail.setApiKey(process.env.SEND_GRID_API);

var sms = AfricasTalking.SMS;

var Notifications = function () {
    function Notifications() {
        _classCallCheck(this, Notifications);
    }

    _createClass(Notifications, [{
        key: "confirmEmail",


        /**
         *
         *
         * @param {*} req
         * @param {*} receiver
         * @memberof Notifications
         */

        value: function confirmEmail(req, receiver, token) {
            var msg = {
                to: "" + receiver.email,
                from: 'Sela Labs' + '<' + ("" + process.env.sela_email) + '>',
                subject: "Confirm Email",
                html: EmailTemplates.confirmEmail(getHost(req), token)
            };

            sgMail.send(msg, false, function (error, result) {
                if (error) return console.log(error);

                // console.log(result);
            });
        }

        /**
         *
         *
         * @param {*} receiver
         * @param {*} sender
         * @memberof Notifications
         */

    }, {
        key: "welcomeMail",
        value: function welcomeMail(req, receiver) {
            // const url = 'sela.now.sh';
            // const message = '<p>Welcome to Sela, ' + '<b>' + receiver.firstName + '</b>' + '! We\'re excited' +
            //     ' to have you join our community of Sela Citizens.</p>' +
            //     '<p><a href ="' + getHost(req) + '/signin' + '">Click here' + '</a> to visit your account.</p>' +
            //     '<p>Have questions? We\'re happy to help! Feel free to reply to this email</p>'
            var msg = {
                to: "" + receiver.email,
                from: 'Sela Labs' + '<' + ("" + process.env.sela_email) + '>',
                subject: "Welcome to Sela",
                html: EmailTemplates.welcomeEmail(getHost(req), receiver.firstName)
            };

            sgMail.send(msg, false, function (error, result) {
                if (error) return console.log(error);

                // console.log(result);
            });
        }

        /**
         *
         *
         * @static
         * @param {*} data
         * @memberof Notifications
         */

    }], [{
        key: "notifyAcceptance",
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, data) {
                var type, acceptInvite, rejectInvite, message, accepted, rejected, msgTemplate, msgTemplateAccepted, msgTemplateRejected, notifObj, action, notification, notifications, user, msg;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                type = '';
                                acceptInvite = "ACCEPT_INVITE_TO_JOIN_PROJECT";
                                rejectInvite = "REJECT_INVITE_TO_JOIN_PROJECT";
                                message = '';
                                accepted = data.stakeholderName + " has accepted your invite to join the \"" + data.project.name + "\" project";
                                rejected = data.stakeholderName + " declined your invite to join the \"" + data.project.name + "\" project";
                                msgTemplate = '';
                                msgTemplateAccepted = 'has accepted your invite to join the';
                                msgTemplateRejected = 'declined your invite to join the';


                                data.agreed === true ? message = accepted : message = rejected;

                                data.agreed === true ? type = acceptInvite : type = rejectInvite;

                                data.agreed === true ? msgTemplate = msgTemplateAccepted : msgTemplate = msgTemplateRejected;

                                notifObj = {
                                    project: data.project._id,
                                    user: data.project.owner._id,
                                    message: message,
                                    stakeholder: data.stakeholderId,
                                    type: type
                                };
                                _context.prev = 13;

                                if (!data.notificationId) {
                                    _context.next = 19;
                                    break;
                                }

                                action = void 0;

                                data.agreed === true ? action = "ACCEPTED" : action = "REJECTED";
                                _context.next = 19;
                                return Notification.updateOne({ _id: data.notificationId, user: req.userId }, { $set: { action: action } });

                            case 19:
                                _context.next = 21;
                                return new Notification(notifObj).save();

                            case 21:
                                notification = _context.sent;

                                if (!notification) {
                                    _context.next = 33;
                                    break;
                                }

                                if (!(data.project.owner.socket !== null)) {
                                    _context.next = 29;
                                    break;
                                }

                                if (!req.io.sockets.connected[data.project.owner.socket]) {
                                    _context.next = 29;
                                    break;
                                }

                                _context.next = 27;
                                return NotificationController.getUserNViaSocket({ userId: data.project.owner._id });

                            case 27:
                                notifications = _context.sent;

                                req.io.sockets.connected[data.project.owner.socket].emit('notifications', { notifications: notifications });

                            case 29:
                                user = {
                                    name: data.stakeholderName,
                                    photo: data.stakeHolderPhoto
                                };
                                msg = {
                                    to: "" + data.project.owner.email,
                                    from: 'Sela Labs' + '<' + ("" + process.env.sela_email) + '>',
                                    subject: "Project Invitation Status",
                                    html: EmailTemplates.stakeholderInvitationStatus(getHost(req), msgTemplate, data.project, user)
                                };
                                _context.next = 33;
                                return sgMail.send(msg);

                            case 33:
                                _context.next = 38;
                                break;

                            case 35:
                                _context.prev = 35;
                                _context.t0 = _context["catch"](13);

                                console.log(_context.t0);

                            case 38:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[13, 35]]);
            }));

            function notifyAcceptance(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return notifyAcceptance;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} project
         * @returns
         * @memberof Notifications
         */

    }, {
        key: "notifyRequestToJoinP",
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, project) {
                var role, userRole, type, message, message1, notifObj, notification, notifications, msg;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                role = req.roles[0];
                                userRole = void 0;
                                type = "REQUEST_TO_JOIN_PROJECT";

                                role == 'isFunder' ? userRole = 'a funder' : role == 'isContractor' ? userRole = 'a contractor' : userRole = 'an evaluator';

                                message = req.decodedTokenData.firstName + " " + req.decodedTokenData.lastName + " has requested to join your project \"" + project.name + "\" as " + userRole;
                                message1 = '<b>' + req.decodedTokenData.firstName + ' ' + req.decodedTokenData.lastName + '</b>' + ' has requested to join your project "' + project.name + '" as ' + userRole + '<br/>' + '<a href ="' + getHost(req) + '/project/stakeholder?id=' + req.userId + '">Confirm Acceptance' + '</a>';
                                notifObj = {
                                    project: project._id,
                                    user: project.owner._id,
                                    message: message,
                                    stakeholder: req.userId,
                                    type: type,
                                    action: "REQUIRED"
                                };
                                _context2.prev = 7;
                                _context2.next = 10;
                                return new Notification(notifObj).save();

                            case 10:
                                notification = _context2.sent;

                                if (!notification) {
                                    _context2.next = 22;
                                    break;
                                }

                                if (!(project.owner.socket !== null)) {
                                    _context2.next = 18;
                                    break;
                                }

                                if (!req.io.sockets.connected[project.owner.socket]) {
                                    _context2.next = 18;
                                    break;
                                }

                                _context2.next = 16;
                                return NotificationController.getUserNViaSocket({ userId: project.owner._id });

                            case 16:
                                notifications = _context2.sent;

                                req.io.sockets.connected[project.owner.socket].emit('notifications', { notifications: notifications });

                            case 18:
                                msg = {
                                    to: "" + project.owner.email,
                                    from: 'Sela Labs' + '<' + ("" + process.env.sela_email) + '>',
                                    subject: "Request To Join Project",
                                    html: message1
                                };
                                _context2.next = 21;
                                return sgMail.send(msg);

                            case 21:
                                return _context2.abrupt("return", { status: true, message: "Your request to join the \"" + project.name + "\" project has been sent" });

                            case 22:
                                return _context2.abrupt("return", { status: false, message: "Your request to join the\"" + project.name + "\" project was not successful" });

                            case 25:
                                _context2.prev = 25;
                                _context2.t0 = _context2["catch"](7);

                                console.log(_context2.t0);

                            case 28:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[7, 25]]);
            }));

            function notifyRequestToJoinP(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return notifyRequestToJoinP;
        }()

        /**
         *
         *
         * @static
         * @param {*} usersData
         * @param {*} project
         * @memberof Notifications
         */

    }, {
        key: "notifyAddedStakeholders",
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, usersData, project) {
                var _this = this;

                var users, notifObjs, notifyOwner, nots, notiOwner, notifications;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.prev = 0;
                                _context4.next = 3;
                                return User.find({ _id: [].concat(_toConsumableArray(usersData)) });

                            case 3:
                                users = _context4.sent;
                                notifObjs = users.map(function (u) {
                                    var message = project.owner.firstName + " " + project.owner.lastName + " added you to the project \"" + project.name + "\"";
                                    return {
                                        project: project._id,
                                        user: u._id,
                                        message: message,
                                        type: "INVITATION_TO_JOIN_PROJECT",
                                        stakeholder: project.owner._id,
                                        action: "REQUIRED"
                                    };
                                });
                                notifyOwner = users.map(function (u) {
                                    var message = "You sent a request to " + u.firstName + " " + u.lastName + " to join this project \"" + project.name + "\".";
                                    return {
                                        project: project._id,
                                        user: project.owner._id,
                                        message: message,
                                        stakeholder: u._id,
                                        type: "YOU_SENT_INVITATION_TO_JOIN"
                                    };
                                });

                                if (!(notifObjs.length > 0)) {
                                    _context4.next = 22;
                                    break;
                                }

                                _context4.next = 9;
                                return Notification.insertMany(notifObjs);

                            case 9:
                                nots = _context4.sent;

                                if (!nots) {
                                    _context4.next = 22;
                                    break;
                                }

                                users.forEach(function () {
                                    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(u) {
                                        var notifications;
                                        return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                            while (1) {
                                                switch (_context3.prev = _context3.next) {
                                                    case 0:
                                                        if (!(u.socket !== null)) {
                                                            _context3.next = 6;
                                                            break;
                                                        }

                                                        if (!req.io.sockets.connected[u.socket]) {
                                                            _context3.next = 6;
                                                            break;
                                                        }

                                                        _context3.next = 4;
                                                        return NotificationController.getUserNViaSocket({ userId: u._id });

                                                    case 4:
                                                        notifications = _context3.sent;

                                                        req.io.sockets.connected[u.socket].emit('notifications', { notifications: notifications });

                                                    case 6:
                                                    case "end":
                                                        return _context3.stop();
                                                }
                                            }
                                        }, _callee3, _this);
                                    }));

                                    return function (_x8) {
                                        return _ref4.apply(this, arguments);
                                    };
                                }());

                                _context4.next = 14;
                                return Notification.insertMany(notifyOwner);

                            case 14:
                                notiOwner = _context4.sent;

                                if (!notiOwner) {
                                    _context4.next = 21;
                                    break;
                                }

                                if (!req.io.sockets.connected[project.owner.socket]) {
                                    _context4.next = 21;
                                    break;
                                }

                                _context4.next = 19;
                                return NotificationController.getUserNViaSocket({ userId: project.owner._id });

                            case 19:
                                notifications = _context4.sent;

                                req.io.sockets.connected[project.owner.socket].emit('notifications', { notifications: notifications });

                            case 21:

                                users.forEach(function (user) {
                                    var msg = {
                                        to: "" + user.email,
                                        from: 'Sela Labs' + '<' + ("" + process.env.sela_email) + '>',
                                        subject: "Invitation to join project!",
                                        html: EmailTemplates.inviteToJoinProject(getHost(req), project, user)
                                    };
                                    sgMail.send(msg, false, function (error, result) {
                                        if (error) return console.log(error);

                                        // console.log(result);
                                    });
                                });

                            case 22:
                                _context4.next = 27;
                                break;

                            case 24:
                                _context4.prev = 24;
                                _context4.t0 = _context4["catch"](0);

                                console.log(_context4.t0);

                            case 27:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[0, 24]]);
            }));

            function notifyAddedStakeholders(_x5, _x6, _x7) {
                return _ref3.apply(this, arguments);
            }

            return notifyAddedStakeholders;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} project
         * @param {*} proposal
         * @memberof Notifications
         */

    }, {
        key: "notifyOnSubmitProposal",
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, project, proposal) {
                var message, type, notificationObj, msg, notification, notifications;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                message = req.decodedTokenData.firstName + " " + req.decodedTokenData.lastName + " submitted a proposal for your project, \"" + project.name + "\"";
                                type = "NEW_PROPOSAL";
                                notificationObj = {
                                    project: project._id,
                                    user: project.owner._id,
                                    message: message,
                                    stakeholder: req.userId,
                                    type: type,
                                    model: proposal._id,
                                    onModel: "Proposal"
                                };
                                msg = {
                                    to: "" + project.owner.email,
                                    from: 'Sela Labs' + '<' + ("" + process.env.sela_email) + '>',
                                    subject: "New Proposal",
                                    html: EmailTemplates.newProposal(getHost(req), project, req.decodedTokenData, proposal)
                                };
                                _context5.prev = 4;
                                _context5.next = 7;
                                return new Notification(notificationObj).save();

                            case 7:
                                notification = _context5.sent;

                                if (!notification) {
                                    _context5.next = 17;
                                    break;
                                }

                                if (!(project.owner.socket !== null)) {
                                    _context5.next = 15;
                                    break;
                                }

                                if (!req.io.sockets.connected[project.owner.socket]) {
                                    _context5.next = 15;
                                    break;
                                }

                                _context5.next = 13;
                                return NotificationController.getUserNViaSocket({ userId: project.owner._id });

                            case 13:
                                notifications = _context5.sent;

                                req.io.sockets.connected[project.owner.socket].emit('notifications', { notifications: notifications });

                            case 15:
                                _context5.next = 17;
                                return sgMail.send(msg);

                            case 17:
                                _context5.next = 22;
                                break;

                            case 19:
                                _context5.prev = 19;
                                _context5.t0 = _context5["catch"](4);

                                console.log(_context5.t0);

                            case 22:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this, [[4, 19]]);
            }));

            function notifyOnSubmitProposal(_x9, _x10, _x11) {
                return _ref5.apply(this, arguments);
            }

            return notifyOnSubmitProposal;
        }()
    }, {
        key: "acceptOrRejectProposal",
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, project, proposal, isApproved, option) {
                var type, approveProposal, revertProposal, message, approved, reverted, msgTemplate, msgTemplateApproved, msgTemplateReverted, notifObj, notification, notifications, msg;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                type = '';
                                approveProposal = "PROPOSAL_APPROVED";
                                revertProposal = "PROPOSAL_REVERTED";
                                message = '';
                                approved = project.owner.firstName + " " + project.owner.lastName + " approved your proposal for the \"" + project.name + "\" project";
                                reverted = project.owner.firstName + " " + project.owner.lastName + " reverted your proposal for the \"" + project.name + "\" project";
                                msgTemplate = '';
                                msgTemplateApproved = 'approved your proposal for the';
                                msgTemplateReverted = 'reverted your proposal for the';


                                isApproved === true ? message = approved : message = reverted;

                                isApproved === true ? type = approveProposal : type = revertProposal;

                                isApproved === true ? msgTemplate = msgTemplateApproved : msgTemplate = msgTemplateReverted;

                                notifObj = {
                                    project: project._id,
                                    user: proposal.proposedBy._id,
                                    message: message,
                                    stakeholder: project.owner._id,
                                    type: type,
                                    model: proposal._id,
                                    onModel: "Proposal"
                                };
                                _context6.prev = 13;

                                if (!(option !== null)) {
                                    _context6.next = 17;
                                    break;
                                }

                                _context6.next = 17;
                                return Notification.updateOne({ project: project._id, user: proposal.proposedBy._id, stakeholder: project.owner._id, type: "INVITATION_TO_JOIN_PROJECT" }, { $set: { action: "ACCEPTED" } });

                            case 17:
                                _context6.next = 19;
                                return new Notification(notifObj).save();

                            case 19:
                                notification = _context6.sent;

                                if (!notification) {
                                    _context6.next = 30;
                                    break;
                                }

                                if (!(proposal.proposedBy.socket !== null)) {
                                    _context6.next = 27;
                                    break;
                                }

                                if (!req.io.sockets.connected[proposal.proposedBy.socket]) {
                                    _context6.next = 27;
                                    break;
                                }

                                _context6.next = 25;
                                return NotificationController.getUserNViaSocket({ userId: proposal.proposedBy._id });

                            case 25:
                                notifications = _context6.sent;

                                req.io.sockets.connected[proposal.proposedBy.socket].emit('notifications', { notifications: notifications });

                            case 27:
                                msg = {
                                    to: "" + proposal.proposedBy.email,
                                    from: 'Sela Labs' + '<' + ("" + process.env.sela_email) + '>',
                                    subject: "Proposal Status",
                                    html: EmailTemplates.proposalStatus(getHost(req), msgTemplate, project, proposal.proposedBy, proposal)
                                };
                                _context6.next = 30;
                                return sgMail.send(msg);

                            case 30:
                                _context6.next = 35;
                                break;

                            case 32:
                                _context6.prev = 32;
                                _context6.t0 = _context6["catch"](13);

                                console.log(_context6.t0);

                            case 35:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[13, 32]]);
            }));

            function acceptOrRejectProposal(_x12, _x13, _x14, _x15, _x16) {
                return _ref6.apply(this, arguments);
            }

            return acceptOrRejectProposal;
        }()
    }, {
        key: "notifyOnAssignedToProposal",
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, project, proposal, contractorId) {
                var message, type, notificationObj, contractor, msg, notification, notifications;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                message = req.decodedTokenData.firstName + " " + req.decodedTokenData.lastName + " assigned you to a proposal for project, \"" + project.name + "\"";
                                type = "PROPOSAL_ASSIGNED";
                                notificationObj = {
                                    project: project._id,
                                    user: contractorId,
                                    message: message,
                                    stakeholder: project.owner._id,
                                    type: type,
                                    model: proposal._id,
                                    onModel: "Proposal"
                                };
                                _context7.prev = 3;
                                _context7.next = 6;
                                return User.findById(contractorId);

                            case 6:
                                contractor = _context7.sent;
                                msg = {
                                    to: "" + contractor.email,
                                    from: 'Sela Labs' + '<' + ("" + process.env.sela_email) + '>',
                                    subject: "You Have Been Assigned a Proposal",
                                    html: EmailTemplates.assignedproposal(getHost(req), project, contractor, proposal)
                                };
                                _context7.next = 10;
                                return new Notification(notificationObj).save();

                            case 10:
                                notification = _context7.sent;

                                if (!notification) {
                                    _context7.next = 20;
                                    break;
                                }

                                if (!(contractor.socket !== null)) {
                                    _context7.next = 18;
                                    break;
                                }

                                if (!req.io.sockets.connected[contractor.socket]) {
                                    _context7.next = 18;
                                    break;
                                }

                                _context7.next = 16;
                                return NotificationController.getUserNViaSocket({ userId: contractor._id });

                            case 16:
                                notifications = _context7.sent;

                                req.io.sockets.connected[contractor.socket].emit('notifications', { notifications: notifications });

                            case 18:
                                _context7.next = 20;
                                return sgMail.send(msg);

                            case 20:
                                _context7.next = 25;
                                break;

                            case 22:
                                _context7.prev = 22;
                                _context7.t0 = _context7["catch"](3);

                                console.log(_context7.t0);

                            case 25:
                            case "end":
                                return _context7.stop();
                        }
                    }
                }, _callee7, this, [[3, 22]]);
            }));

            function notifyOnAssignedToProposal(_x17, _x18, _x19, _x20) {
                return _ref7.apply(this, arguments);
            }

            return notifyOnAssignedToProposal;
        }()
    }]);

    return Notifications;
}();

module.exports = Notifications;
//# sourceMappingURL=notifications.js.map