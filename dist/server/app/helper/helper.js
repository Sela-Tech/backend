"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sgMail = require('@sendgrid/mail');
"use strict";
require("dotenv").config();
var mongoose = require("mongoose"),
    User = mongoose.model("User");
var AWS = require('aws-sdk');

AWS.config = {
    accessKeyId: process.env.AWSaccessKeyId,
    secretAccessKey: process.env.AWSsecretAccessKey,
    region: "us-east-2"
};

var s3 = new AWS.S3({});

sgMail.setApiKey(process.env.SEND_GRID_API);

/**
 *
 *
 * @class Helper
 */

var Helper = function () {
    function Helper() {
        _classCallCheck(this, Helper);
    }

    _createClass(Helper, [{
        key: "getRole",


        /**
         *
         *
         * @param {*} data
         * @returns {String}
         * @memberof Helper
         * @description accepts an array of roles or an object whose properties are roles and 
         * returns a role of type string. e.g 'Funder'
         */
        value: function getRole(data) {
            var roles = ['Funder', 'Contractor', 'Evaluator'];
            var userRole = void 0;

            if (!(data instanceof Array)) {
                var user = {
                    isFunder: data.isFunder,
                    isContractor: data.isContractor,
                    isEvaluator: data.isEvaluator
                };

                var role = Object.keys(user).filter(function (k) {
                    return user[k] === true;
                });

                userRole = roles.find(function (r) {
                    return r = role[0].includes(r);
                });

                return userRole;
            } else {
                userRole = roles.find(function (r) {
                    return r = data[0].includes(r);
                });
                return userRole;
            }

            // return userRole;
        }
    }, {
        key: "updateUserSocket",
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                _context.next = 3;
                                return User.findByIdAndUpdate(data.userId, { socket: data.socketId });

                            case 3:
                                _context.next = 8;
                                break;

                            case 5:
                                _context.prev = 5;
                                _context.t0 = _context["catch"](0);

                                console.log(_context.t0);

                            case 8:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 5]]);
            }));

            function updateUserSocket(_x) {
                return _ref.apply(this, arguments);
            }

            return updateUserSocket;
        }()
    }, {
        key: "removeImgFBucket",
        value: function removeImgFBucket(object) {
            var params = {
                Bucket: 'selamvp',
                Delete: {
                    Objects: [{ Key: object }]
                }
            };

            s3.deleteObjects(params, function (err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else console.log(data); // successful response
            });
        }

        /**
         *
         *
         * @param {*} stakeHolders
         * @param {*} pStakeholder
         * @returns
         * @memberof Helpers
         */

    }, {
        key: "shouldAddContractor",
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(stakeHolders, pStakeholder) {
                var MAX_CONTRACTOR_ALLOWED, users, newContractorsCount, _users, _newContractorsCount, pContractorCount;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                MAX_CONTRACTOR_ALLOWED = 1;

                                if (!(pStakeholder === null)) {
                                    _context2.next = 12;
                                    break;
                                }

                                _context2.next = 4;
                                return User.find({ _id: [].concat(_toConsumableArray(stakeHolders)) });

                            case 4:
                                users = _context2.sent;
                                newContractorsCount = users.filter(function (u) {
                                    return u.isContractor === true;
                                });

                                if (!(newContractorsCount.length > MAX_CONTRACTOR_ALLOWED)) {
                                    _context2.next = 8;
                                    break;
                                }

                                return _context2.abrupt("return", false);

                            case 8:
                                ;

                                return _context2.abrupt("return", true);

                            case 12:
                                _context2.next = 14;
                                return User.find({ _id: [].concat(_toConsumableArray(stakeHolders)) });

                            case 14:
                                _users = _context2.sent;
                                _newContractorsCount = _users.filter(function (u) {
                                    return u.isContractor === true;
                                });
                                pContractorCount = pStakeholder.filter(function (s) {
                                    return s.user.information.isContractor === true;
                                });

                                if (!(pContractorCount.length > 0 && _newContractorsCount.length > 0)) {
                                    _context2.next = 19;
                                    break;
                                }

                                return _context2.abrupt("return", false);

                            case 19:
                                if (!(_newContractorsCount.length > MAX_CONTRACTOR_ALLOWED)) {
                                    _context2.next = 21;
                                    break;
                                }

                                return _context2.abrupt("return", false);

                            case 21:
                                ;

                                return _context2.abrupt("return", true);

                            case 23:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function shouldAddContractor(_x2, _x3) {
                return _ref2.apply(this, arguments);
            }

            return shouldAddContractor;
        }()
    }]);

    return Helper;
}();

module.exports = Helper;
//# sourceMappingURL=helper.js.map