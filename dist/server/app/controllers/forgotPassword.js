'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var validate = require('../../middleware/validate');

var sgMail = require('@sendgrid/mail');

var mongoose = require('mongoose');

var User = mongoose.model('User');

var crypto = require('crypto');

var emailTemplates = require('../helper/emailTemplates');

var options = {
    apiKey: process.env.AFRICAS_TALKING_API,
    username: process.env.AFRICAS_TALKING_APP_USERNAME
};

var AfricasTalking = require('africastalking')(options);

var _require = require("../../in-use/utils"),
    getHost = _require.getHost;

sgMail.setApiKey(process.env.SEND_GRID_API);

var sms = AfricasTalking.SMS;

/**
 *
 *
 * @class ForgotPassword
 */

var ForgotPassword = function () {
    function ForgotPassword() {
        _classCallCheck(this, ForgotPassword);
    }

    _createClass(ForgotPassword, null, [{
        key: 'requestPasswordReset',


        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns {object} a confirmation or failure message.
         * @memberof ForgotPassword
         */

        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
                var _req$body, email, phone, queryObj, user, verificationCode, updatedUser, receiver, to, msg, result, token, _updatedUser, host, _msg;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _req$body = req.body, email = _req$body.email, phone = _req$body.phone;
                                queryObj = email ? { email: email.toLowerCase() } : { phone: phone };
                                _context.next = 4;
                                return User.findOne(queryObj);

                            case 4:
                                user = _context.sent;

                                if (!(user === null)) {
                                    _context.next = 7;
                                    break;
                                }

                                return _context.abrupt('return', res.status(404).json({ message: 'Sela does not have an account with those user credentials. Please try another email/phone number.' }));

                            case 7:
                                _context.prev = 7;

                                if (!(req.body.phone && req.body.phone !== "" && !req.body.email || req.body.email == "")) {
                                    _context.next = 25;
                                    break;
                                }

                                verificationCode = crypto.randomBytes(3).toString('hex');


                                user.resetPasswordToken = verificationCode;
                                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour


                                _context.next = 14;
                                return user.save();

                            case 14:
                                updatedUser = _context.sent;
                                receiver = '+234' + req.body.phone;
                                to = [receiver];

                                if (!updatedUser) {
                                    _context.next = 23;
                                    break;
                                }

                                msg = {
                                    to: to,
                                    message: 'You are receiving this message because you (or someone else) have requested the reset of the password for your account. ' + 'Please use this code to reset your password: ' + verificationCode + ' If you did not request this, please ignore this message and your password will remain unchanged.'
                                    // from: '75111'
                                };
                                _context.next = 21;
                                return sms.send(msg);

                            case 21:
                                result = _context.sent;
                                return _context.abrupt('return', res.status(200).json({ message: 'A message has been sent to ' + updatedUser.phone + ' with further instructions' }));

                            case 23:
                                _context.next = 33;
                                break;

                            case 25:
                                if (!(req.body.email && req.body.email !== "" && !req.body.phone || req.body.phone == "")) {
                                    _context.next = 33;
                                    break;
                                }

                                token = crypto.randomBytes(20).toString('hex');


                                user.resetPasswordToken = token;
                                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour


                                _context.next = 31;
                                return user.save();

                            case 31:
                                _updatedUser = _context.sent;


                                if (_updatedUser) {
                                    // const text='You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                                    // 'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                                    // getHost(req) + '/password/reset?token=' + token + '\n\n' +
                                    // 'If you did not request this, please ignore this email and your password will remain unchanged.\n'

                                    host = getHost(req);
                                    _msg = {
                                        to: '' + _updatedUser.email,
                                        from: 'Sela Labs' + '<' + 'support@sela-labs.co' + '>',
                                        subject: "Password Reset",
                                        html: emailTemplates.requestResetPassword(host, _updatedUser.firstName, token)
                                    };


                                    sgMail.send(_msg, false, function (error, result) {
                                        if (error) return console.log(error);
                                        res.status(200).json({ message: 'An e-mail has been sent to ' + _updatedUser.email + ' with further instructions' });
                                    });
                                }

                            case 33:
                                _context.next = 39;
                                break;

                            case 35:
                                _context.prev = 35;
                                _context.t0 = _context['catch'](7);

                                console.log(_context.t0);
                                res.status(500).json({ message: "internal server error" });

                            case 39:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[7, 35]]);
            }));

            function requestPasswordReset(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return requestPasswordReset;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns {Object} A confirmation message or a failure message
         * @memberof ForgotPassword
         */

    }, {
        key: 'resetPassword',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
                var errors, newPassword, token, user, updatedUser, receiver, msg, result, _msg2;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                validate.validateResetPassword(req, res);
                                errors = req.validationErrors();

                                if (!errors) {
                                    _context2.next = 4;
                                    break;
                                }

                                return _context2.abrupt('return', res.status(400).json({
                                    message: errors
                                }));

                            case 4:
                                newPassword = req.body.newPassword;
                                _context2.prev = 5;
                                token = req.query.token || req.body.verificationCode;
                                _context2.next = 9;
                                return User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

                            case 9:
                                user = _context2.sent;

                                if (user) {
                                    _context2.next = 12;
                                    break;
                                }

                                return _context2.abrupt('return', res.status(400).json({ message: "Password reset token is invalid or has expired" }));

                            case 12:

                                user.password = newPassword;
                                user.resetPasswordExpires = null;
                                user.resetPasswordToken = null;

                                _context2.next = 17;
                                return user.save();

                            case 17:
                                updatedUser = _context2.sent;

                                if (!updatedUser) {
                                    _context2.next = 29;
                                    break;
                                }

                                if (!req.body.verificationCode) {
                                    _context2.next = 28;
                                    break;
                                }

                                receiver = '+234' + updatedUser.phone;

                                // send sms

                                msg = {
                                    to: [receiver],
                                    message: 'This is a confirmation that the password for your account with sela has just been changed'
                                    // from: '75111'
                                };
                                _context2.next = 24;
                                return sms.send(msg);

                            case 24:
                                result = _context2.sent;
                                return _context2.abrupt('return', res.status(200).json({ message: 'Your Password has been changed' }));

                            case 28:
                                if (req.query.token) {
                                    // send email
                                    _msg2 = {
                                        to: '' + updatedUser.email,
                                        from: 'Sela Labs' + '<' + 'support@sela-labs.co' + '>',
                                        subject: "Your password has been changed",
                                        html: emailTemplates.resetPasswordSuccess(updatedUser.firstName)
                                    };


                                    sgMail.send(_msg2, false, function (error, result) {
                                        if (error) return console.log(error);
                                        return res.status(200).json({ message: 'Your Password has been changed' });
                                    });
                                }

                            case 29:
                                _context2.next = 35;
                                break;

                            case 31:
                                _context2.prev = 31;
                                _context2.t0 = _context2['catch'](5);

                                console.log(_context2.t0);
                                res.status(500).json({ message: "internal server error" });

                            case 35:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[5, 31]]);
            }));

            function resetPassword(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return resetPassword;
        }()
    }]);

    return ForgotPassword;
}();

module.exports = ForgotPassword;
//# sourceMappingURL=forgotPassword.js.map