"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("dotenv").config();
var mongoose = require("mongoose"),
    Notificate = mongoose.model("Notification");
var User = mongoose.model("User");

/**
 *
 *
 * @class Stakeholder
 */

var Notifications = function () {
    function Notifications() {
        _classCallCheck(this, Notifications);
    }

    _createClass(Notifications, null, [{
        key: "getUserNotifications",


        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Notifications
         */
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
                var user, notifications, unreadNIds;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                user = req.userId;
                                _context.prev = 1;
                                _context.next = 4;
                                return Notificate.find({ user: user }).sort({ createdAt: -1 });

                            case 4:
                                notifications = _context.sent;

                                if (!(notifications.length > 0)) {
                                    _context.next = 11;
                                    break;
                                }

                                notifications = notifications.map(function (n) {
                                    return {
                                        _id: n._id,
                                        read: n.read,
                                        stakeholder: n.stakeholder,
                                        message: n.message,
                                        user: n.user,
                                        project: {
                                            name: n.project.name,
                                            id: n.project._id
                                        },
                                        model: n.model,
                                        onModel: n.onModel,
                                        type: n.type,
                                        action: n.action,
                                        createdOn: n.createdAt,
                                        updatedOn: n.updatedAt

                                    };
                                });

                                //extract unread notitifications
                                unreadNIds = notifications.filter(function (n) {
                                    return n.read === false;
                                }).map(function (n) {
                                    return n._id;
                                });
                                return _context.abrupt("return", res.status(200).json({ notifications: notifications, unreadNIds: unreadNIds }));

                            case 11:
                                return _context.abrupt("return", res.status(404).json({ message: "You currently have no new notifications" }));

                            case 12:
                                _context.next = 18;
                                break;

                            case 14:
                                _context.prev = 14;
                                _context.t0 = _context["catch"](1);

                                console.log(_context.t0);
                                return _context.abrupt("return", res.status(500).json({ message: "Internal server error" }));

                            case 18:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[1, 14]]);
            }));

            function getUserNotifications(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return getUserNotifications;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Notifications
         */

    }, {
        key: "markNotificationAsRead",
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
                var ids, successRes, failRes, notifications;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                ids = req.body.unreadNIds;
                                successRes = { success: true };
                                failRes = { success: false };
                                _context2.prev = 3;

                                if (!(ids && ids.length > 0)) {
                                    _context2.next = 12;
                                    break;
                                }

                                _context2.next = 7;
                                return Notificate.updateMany({ _id: [].concat(_toConsumableArray(ids)) }, { $set: { read: true } });

                            case 7:
                                notifications = _context2.sent;

                                if (!Boolean(notifications.n)) {
                                    _context2.next = 10;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(200).json({ successRes: successRes }));

                            case 10:
                                _context2.next = 13;
                                break;

                            case 12:
                                return _context2.abrupt("return", res.status(404).json({ message: "You have no unread notifications" }));

                            case 13:
                                _context2.next = 20;
                                break;

                            case 15:
                                _context2.prev = 15;
                                _context2.t0 = _context2["catch"](3);

                                console.log(_context2.t0);
                                failRes.message = "Internal server error";
                                return _context2.abrupt("return", res.status(500).json({ failRes: failRes }));

                            case 20:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[3, 15]]);
            }));

            function markNotificationAsRead(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return markNotificationAsRead;
        }()

        /**
         *
         *
         * @static
         * @param {*} data
         * @returns
         * @memberof Notifications
         */

    }, {
        key: "getUserNViaSocket",
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(data) {
                var user, notifications, unreadNIds;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                user = data.userId;
                                _context3.prev = 1;
                                _context3.next = 4;
                                return Notificate.find({ user: user, read: false });

                            case 4:
                                notifications = _context3.sent;

                                if (!(notifications.length > 0)) {
                                    _context3.next = 11;
                                    break;
                                }

                                notifications = notifications.map(function (n) {
                                    return {
                                        _id: n._id,
                                        read: n.read,
                                        stakeholder: n.stakeholder,
                                        message: n.message,
                                        user: n.user,
                                        project: {
                                            name: n.project.name,
                                            id: n.project._id
                                        },
                                        type: n.type,
                                        action: n.action,
                                        model: n.model,
                                        onModel: n.onModel,
                                        createdOn: n.createdAt,
                                        updatedOn: n.updatedAt

                                    };
                                });

                                //extract unread notitifications
                                unreadNIds = notifications.filter(function (n) {
                                    return n.read === false;
                                }).map(function (n) {
                                    return n._id;
                                });
                                return _context3.abrupt("return", { notifications: notifications, unreadNIds: unreadNIds });

                            case 11:
                                return _context3.abrupt("return", { message: "You currently have no new notifications" });

                            case 12:
                                _context3.next = 18;
                                break;

                            case 14:
                                _context3.prev = 14;
                                _context3.t0 = _context3["catch"](1);

                                console.log(_context3.t0);
                                return _context3.abrupt("return", { message: "Internal server error" });

                            case 18:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[1, 14]]);
            }));

            function getUserNViaSocket(_x5) {
                return _ref3.apply(this, arguments);
            }

            return getUserNViaSocket;
        }()
    }]);

    return Notifications;
}();

module.exports = Notifications;
//# sourceMappingURL=Notification.js.map