"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("dotenv").config();
var mongoose = require("mongoose"),
    Task = mongoose.model("Task"),
    Project = mongoose.model("Project"),
    Proposal = mongoose.model("Proposal"),
    User = mongoose.model("User"),
    Evidence = mongoose.model("Evidence"),
    Submission = mongoose.model("Submission"),
    Milestone = mongoose.model('Milestone');
var validate = require('../../middleware/validate');
var _ = require('lodash');
var noticate = require('../helper/notifications');

var _require = require('accesscontrol'),
    AccessControl = _require.AccessControl;

var grantsObject = require('../helper/access_control');
var Helper = require('../helper/helper');

var helper = new Helper();
var ac = new AccessControl(grantsObject);

var Evidences = function () {
    function Evidences() {
        _classCallCheck(this, Evidences);
    }

    _createClass(Evidences, [{
        key: "specifyKPI",


        // KPI - Key Performance Indicator

        /**
         *
         *
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Evidences
         */
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
                var datatypes, errors, _req$body, title, project, level, task, instruction, quote, stakeholders, datatype, fields, dueDate, totalPrice, foundProject, userAddedHimself, KPIObj, fieldObj, evidenceRequest;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                datatypes = ["table", "survey", "audio", "image", "video"];


                                validate.validateAddEvidenceRequest(req, res);
                                errors = req.validationErrors();

                                if (!errors) {
                                    _context.next = 5;
                                    break;
                                }

                                return _context.abrupt("return", res.status(400).json({
                                    message: errors
                                }));

                            case 5:
                                _req$body = req.body, title = _req$body.title, project = _req$body.project, level = _req$body.level, task = _req$body.task, instruction = _req$body.instruction, quote = _req$body.quote, stakeholders = _req$body.stakeholders, datatype = _req$body.datatype, fields = _req$body.fields, dueDate = _req$body.dueDate, totalPrice = _req$body.totalPrice;
                                _context.prev = 6;
                                _context.next = 9;
                                return Project.findById(project);

                            case 9:
                                foundProject = _context.sent;

                                if (!(!foundProject || foundProject == null)) {
                                    _context.next = 12;
                                    break;
                                }

                                return _context.abrupt("return", res.status(404).json({ message: "Project Not Found" }));

                            case 12:
                                userAddedHimself = stakeholders.some(function (stakeholder) {
                                    return stakeholder === req.userId;
                                });

                                if (!userAddedHimself) {
                                    _context.next = 15;
                                    break;
                                }

                                return _context.abrupt("return", res.status(403).json({ message: "You cannot assign evidence request to yourself." }));

                            case 15:
                                KPIObj = {
                                    title: title,
                                    project: project,
                                    level: level,
                                    instruction: instruction,
                                    stakeholders: _.uniqBy(stakeholders.map(function (stakeholder) {
                                        return { user: stakeholder, quote: Number(quote) };
                                    }), 'user'),
                                    totalPrice: totalPrice || quote * stakeholders.length,
                                    datatype: datatype,
                                    task: task,
                                    requestedBy: req.userId,
                                    dueDate: dueDate
                                };

                                if (!(level === "project")) {
                                    _context.next = 20;
                                    break;
                                }

                                delete KPIObj.task;
                                _context.next = 22;
                                break;

                            case 20:
                                if (!(level === "task" && (!task || task.length < 1))) {
                                    _context.next = 22;
                                    break;
                                }

                                return _context.abrupt("return", res.status(404).json({ message: "Please Specify task" }));

                            case 22:
                                fieldObj = void 0;
                                evidenceRequest = void 0;
                                _context.t0 = datatype;
                                _context.next = _context.t0 === datatypes[0] ? 27 : _context.t0 === datatypes[1] ? 36 : 44;
                                break;

                            case 27:
                                if (!(!fields || !(fields instanceof Array) || fields instanceof Array && fields.length < 1)) {
                                    _context.next = 29;
                                    break;
                                }

                                return _context.abrupt("return", res.status(404).json({ message: "Expects an array of objects for the table fields" }));

                            case 29:

                                fieldObj = fields.map(function (field) {
                                    return {
                                        title: field.title.replace(/^\w/, function (c) {
                                            return c.toUpperCase();
                                        }),
                                        responseType: field.responseType.replace(/^\w/, function (c) {
                                            return c.toUpperCase();
                                        })
                                    };
                                });

                                fieldObj.push({ title: 'Date' });

                                KPIObj.fields = fieldObj;

                                _context.next = 34;
                                return new Evidence(KPIObj).save();

                            case 34:
                                evidenceRequest = _context.sent;
                                return _context.abrupt("return", res.status(201).json({
                                    message: "Key Performance Indicator successfully set",
                                    evidenceRequest: evidenceRequest
                                }));

                            case 36:
                                if (!(!fields || !(fields instanceof Array) || fields instanceof Array && fields.length < 1)) {
                                    _context.next = 38;
                                    break;
                                }

                                return _context.abrupt("return", res.status(400).json({ message: "Specify questions for the survey" }));

                            case 38:

                                fieldObj = fields.map(function (field) {
                                    return {
                                        title: field.replace(/^\w/, function (c) {
                                            return c.toUpperCase();
                                        })
                                    };
                                });

                                KPIObj.fields = fieldObj;
                                _context.next = 42;
                                return new Evidence(KPIObj).save();

                            case 42:
                                evidenceRequest = _context.sent;
                                return _context.abrupt("return", res.status(201).json({
                                    message: "Key Performance Indicator successfully set",
                                    evidenceRequest: evidenceRequest
                                }));

                            case 44:

                                delete KPIObj.fields;
                                _context.next = 47;
                                return new Evidence(KPIObj).save();

                            case 47:
                                evidenceRequest = _context.sent;
                                return _context.abrupt("return", res.status(201).json({
                                    message: "Key Performance Indicator successfully set",
                                    evidenceRequest: evidenceRequest
                                }));

                            case 49:
                                _context.next = 55;
                                break;

                            case 51:
                                _context.prev = 51;
                                _context.t1 = _context["catch"](6);

                                console.log(_context.t1);
                                return _context.abrupt("return", res.status(501).json({
                                    message: _context.t1.message
                                }));

                            case 55:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[6, 51]]);
            }));

            function specifyKPI(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return specifyKPI;
        }()

        /**
         *
         *
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Evidences
         */

    }, {
        key: "submitEvidenceForEvidenceRequest",
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
                var _req$body2, evidenceRequestId, file, fields, datatypes, evidenceObj, errors, evidenceRequest, extractedStakeholder, evidencefields, fieldsTitle, evidencefieldsTitle, fieldsNotInRequest, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, data, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _field, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _data, field;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _req$body2 = req.body, evidenceRequestId = _req$body2.evidenceRequestId, file = _req$body2.file, fields = _req$body2.fields;
                                datatypes = ["table", "survey", "audio", "image", "video"];
                                evidenceObj = {};
                                errors = [];
                                _context2.prev = 4;
                                _context2.next = 7;
                                return Evidence.findOne({ _id: evidenceRequestId, 'stakeholders.user': req.userId });

                            case 7:
                                evidenceRequest = _context2.sent;

                                if (evidenceRequest) {
                                    _context2.next = 10;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(404).json({ message: "Request Not Found" }));

                            case 10:

                                // check if the stakeholder has submitted before

                                extractedStakeholder = evidenceRequest.stakeholders.find(function (stakeholder) {
                                    return stakeholder.user._id.toString() === req.userId;
                                });

                                // return res.json({extractedStakeholder});

                                if (!(extractedStakeholder === undefined || Object.getOwnPropertyNames(extractedStakeholder).length === 0)) {
                                    _context2.next = 15;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(403).json({ message: "You were not assigned to this request" }));

                            case 15:
                                if (!(Object.getOwnPropertyNames(extractedStakeholder).length > 0 && extractedStakeholder.hasSubmitted === true)) {
                                    _context2.next = 17;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(403).json({ message: "You cannot submit more than one evidence for this request" }));

                            case 17:
                                _context2.t0 = evidenceRequest.datatype;
                                _context2.next = _context2.t0 === datatypes[0] ? 20 : _context2.t0 === datatypes[1] ? 127 : 128;
                                break;

                            case 20:
                                evidencefields = evidenceRequest.fields;
                                // .filter(f=>f.title !='Date');

                                if (!(!fields || !(fields instanceof Array) || fields instanceof Array && fields.length < 1)) {
                                    _context2.next = 23;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(400).json({ message: "Expects an array of objects with data related to the request" }));

                            case 23:
                                fieldsTitle = fields.map(function (f) {
                                    return f.title;
                                });
                                evidencefieldsTitle = evidencefields.map(function (f) {
                                    return f.title;
                                }).filter(function (f) {
                                    return f !== 'Date';
                                });
                                fieldsNotInRequest = evidencefieldsTitle.filter(function (f) {
                                    return !fieldsTitle.includes(f);
                                });

                                // make sure all fields are present.

                                if (fieldsNotInRequest.length > 0) {
                                    fieldsNotInRequest.map(function (f) {
                                        errors.push(f + " cannot be empty");
                                    });
                                }

                                // make sure all values are filled
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context2.prev = 30;
                                _iterator = fields[Symbol.iterator]();

                            case 32:
                                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context2.next = 40;
                                    break;
                                }

                                data = _step.value;

                                if (!(!data.value || data.value.length == "")) {
                                    _context2.next = 37;
                                    break;
                                }

                                errors.push(data.title + " cannot be empty");
                                return _context2.abrupt("continue", 37);

                            case 37:
                                _iteratorNormalCompletion = true;
                                _context2.next = 32;
                                break;

                            case 40:
                                _context2.next = 46;
                                break;

                            case 42:
                                _context2.prev = 42;
                                _context2.t1 = _context2["catch"](30);
                                _didIteratorError = true;
                                _iteratorError = _context2.t1;

                            case 46:
                                _context2.prev = 46;
                                _context2.prev = 47;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 49:
                                _context2.prev = 49;

                                if (!_didIteratorError) {
                                    _context2.next = 52;
                                    break;
                                }

                                throw _iteratorError;

                            case 52:
                                return _context2.finish(49);

                            case 53:
                                return _context2.finish(46);

                            case 54:
                                if (!(errors.length > 0)) {
                                    _context2.next = 56;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(400).json({ message: [].concat(errors) }));

                            case 56:

                                // sort both fields and evidence in ASC order

                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context2.prev = 59;
                                _iterator2 = evidencefields[Symbol.iterator]();

                            case 61:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                    _context2.next = 102;
                                    break;
                                }

                                _field = _step2.value;
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context2.prev = 66;
                                _iterator3 = fields[Symbol.iterator]();

                            case 68:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                    _context2.next = 85;
                                    break;
                                }

                                _data = _step3.value;

                                if (!(_field._id == _data._id)) {
                                    _context2.next = 82;
                                    break;
                                }

                                if (!(_field.responseType == 'Number')) {
                                    _context2.next = 81;
                                    break;
                                }

                                if (!isNaN(_data.value)) {
                                    _context2.next = 77;
                                    break;
                                }

                                errors.push("Please provide a valid Number for " + _data.title);
                                return _context2.abrupt("continue", 82);

                            case 77:
                                _data.value = Number(_data.value);
                                evidenceObj["" + _field.title] = _data.value;
                                // evidenceObj.push({ title: data.title, value: data.value })

                            case 79:
                                _context2.next = 82;
                                break;

                            case 81:
                                // evidenceObj.push({ title: data.title, value: data.value })
                                evidenceObj["" + _field.title] = _data.value;

                            case 82:
                                _iteratorNormalCompletion3 = true;
                                _context2.next = 68;
                                break;

                            case 85:
                                _context2.next = 91;
                                break;

                            case 87:
                                _context2.prev = 87;
                                _context2.t2 = _context2["catch"](66);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context2.t2;

                            case 91:
                                _context2.prev = 91;
                                _context2.prev = 92;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 94:
                                _context2.prev = 94;

                                if (!_didIteratorError3) {
                                    _context2.next = 97;
                                    break;
                                }

                                throw _iteratorError3;

                            case 97:
                                return _context2.finish(94);

                            case 98:
                                return _context2.finish(91);

                            case 99:
                                _iteratorNormalCompletion2 = true;
                                _context2.next = 61;
                                break;

                            case 102:
                                _context2.next = 108;
                                break;

                            case 104:
                                _context2.prev = 104;
                                _context2.t3 = _context2["catch"](59);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context2.t3;

                            case 108:
                                _context2.prev = 108;
                                _context2.prev = 109;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 111:
                                _context2.prev = 111;

                                if (!_didIteratorError2) {
                                    _context2.next = 114;
                                    break;
                                }

                                throw _iteratorError2;

                            case 114:
                                return _context2.finish(111);

                            case 115:
                                return _context2.finish(108);

                            case 116:
                                if (!(errors.length > 0)) {
                                    _context2.next = 118;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(400).json({ message: [].concat(errors) }));

                            case 118:

                                // evidenceObj.push({ title: "Date", value: new Date() })
                                evidenceObj['Date'] = new Date();
                                evidenceObj['user'] = req.userId;
                                // evidenceRequest.submissions = [{evidence:evidenceObj}];
                                evidenceRequest.submissions.push(evidenceObj);

                                evidenceRequest.stakeholders.length === evidenceRequest.submissions.length ? evidenceRequest.status = "Completed" : evidenceRequest.status = "In Progess";
                                // evidenceRequest.status = "Submitted"

                                // return res.json(evidenceRequest);
                                _context2.next = 124;
                                return evidenceRequest.save();

                            case 124:
                                _context2.next = 126;
                                return Evidence.updateOne({ _id: evidenceRequestId, 'stakeholders.user': req.userId }, { $set: { 'stakeholders.$.hasSubmitted': true } });

                            case 126:
                                return _context2.abrupt("return", res.status(200).json({ message: "Your Evidence has been submitted" }));

                            case 127:
                                return _context2.abrupt("return", res.status(200).json({ message: "This feature is not available yet for survey format" }));

                            case 128:
                                if (!(!file || file.length < 1)) {
                                    _context2.next = 130;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(400).json({ message: "Please submit evidence" }));

                            case 130:
                                field = {};


                                field["" + evidenceRequest.datatype] = file;
                                field["evidence"] = file;

                                evidenceRequest.submissions.push(field);
                                evidenceRequest.status = "Submitted";

                                // return res.json(evidenceRequest);
                                _context2.next = 137;
                                return evidenceRequest.save();

                            case 137:
                                return _context2.abrupt("return", res.status(200).json({ message: "Your Evidence has been submitted" }));

                            case 138:
                                _context2.next = 144;
                                break;

                            case 140:
                                _context2.prev = 140;
                                _context2.t4 = _context2["catch"](4);

                                console.log(_context2.t4);
                                return _context2.abrupt("return", res.status(501).json({
                                    message: _context2.t4.message
                                }));

                            case 144:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[4, 140], [30, 42, 46, 54], [47,, 49, 53], [59, 104, 108, 116], [66, 87, 91, 99], [92,, 94, 98], [109,, 111, 115]]);
            }));

            function submitEvidenceForEvidenceRequest(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return submitEvidenceForEvidenceRequest;
        }()

        /**
         *
         *
         * @param {*} req
         * @param {*} res
         * @memberof Evidences
         */

    }, {
        key: "getProjectEvidenceRequests",
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
                var id, evidenceRequests;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                id = req.params.id;
                                _context3.prev = 1;
                                _context3.next = 4;
                                return Evidence.find({ project: id, $or: [{ requestedBy: req.userId }, { 'stakeholders.user': req.userId }] }).sort({ createdAt: -1 });

                            case 4:
                                evidenceRequests = _context3.sent;

                                if (!(evidenceRequests.length < 1)) {
                                    _context3.next = 7;
                                    break;
                                }

                                return _context3.abrupt("return", res.status(200).json({ evidenceRequests: [] }));

                            case 7:

                                evidenceRequests = evidenceRequests.map(function (evidenceRequest) {
                                    return {
                                        _id: evidenceRequest._id,
                                        title: evidenceRequest.title,
                                        project: evidenceRequest.project,
                                        level: evidenceRequest.level,
                                        instruction: evidenceRequest.instruction,
                                        stakeholders: evidenceRequest.stakeholders.map(function (stakeholder) {
                                            return {
                                                hasSubmitted: stakeholder.hasSubmitted,
                                                quote: stakeholder.quote,
                                                user: Evidences.populateUser(stakeholder.user)
                                            };
                                        }),
                                        // quote: evidenceRequest.quote,
                                        datatype: evidenceRequest.datatype,
                                        task: Evidences.populateTask(evidenceRequest.task),
                                        requestedBy: Evidences.populateUser(evidenceRequest.requestedBy),
                                        dueDate: evidenceRequest.dueDate,
                                        status: evidenceRequest.status,
                                        fields: evidenceRequest.fields,
                                        submissions: Evidences.filterSubmissions(req.userId, evidenceRequest.submissions, evidenceRequest.stakeholders, evidenceRequest.requestedBy),
                                        totalPrice: evidenceRequest.totalPrice
                                    };
                                });
                                return _context3.abrupt("return", res.status(200).json({ evidenceRequests: evidenceRequests }));

                            case 11:
                                _context3.prev = 11;
                                _context3.t0 = _context3["catch"](1);


                                console.log(_context3.t0);
                                return _context3.abrupt("return", res.status(501).json({
                                    message: _context3.t0.message
                                }));

                            case 15:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[1, 11]]);
            }));

            function getProjectEvidenceRequests(_x5, _x6) {
                return _ref3.apply(this, arguments);
            }

            return getProjectEvidenceRequests;
        }()

        /**
         *
         *
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Evidences
         */

    }, {
        key: "getSingleEvidenceRequest",
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
                var id, evidenceRequest;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                id = req.params.id;
                                _context4.prev = 1;
                                _context4.next = 4;
                                return Evidence.findOne({ _id: id });

                            case 4:
                                evidenceRequest = _context4.sent;

                                if (evidenceRequest) {
                                    _context4.next = 7;
                                    break;
                                }

                                return _context4.abrupt("return", res.status(404).json({ message: "Request Not Found" }));

                            case 7:

                                evidenceRequest = {
                                    title: evidenceRequest.title,
                                    project: evidenceRequest.project,
                                    level: evidenceRequest.level,
                                    instruction: evidenceRequest.instruction,
                                    stakeholders: evidenceRequest.stakeholders.map(function (stakeholder) {
                                        return {
                                            hasSubmitted: stakeholder.hasSubmitted,
                                            quote: stakeholder.quote,
                                            user: Evidences.populateUser(stakeholder.user)
                                        };
                                    }),
                                    quote: evidenceRequest.quote,
                                    datatype: evidenceRequest.datatype,
                                    task: Evidences.populateTask(evidenceRequest.task),
                                    requestedBy: Evidences.populateUser(evidenceRequest.requestedBy),
                                    dueDate: evidenceRequest.dueDate,
                                    status: evidenceRequest.status,
                                    fields: evidenceRequest.fields,
                                    submissions: Evidences.filterSubmissions(req.userId, evidenceRequest.submissions, evidenceRequest.stakeholders, evidenceRequest.requestedBy),
                                    totalPrice: evidenceRequest.totalPrice

                                };

                                return _context4.abrupt("return", res.status(200).json({ evidenceRequest: evidenceRequest }));

                            case 11:
                                _context4.prev = 11;
                                _context4.t0 = _context4["catch"](1);

                                console.log(_context4.t0);
                                return _context4.abrupt("return", res.status(501).json({
                                    message: _context4.t0.message
                                }));

                            case 15:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[1, 11]]);
            }));

            function getSingleEvidenceRequest(_x7, _x8) {
                return _ref4.apply(this, arguments);
            }

            return getSingleEvidenceRequest;
        }()
    }, {
        key: "submitEvidenceGeneral",
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
                var _req$body3, project, level, task, note, evidence, errors, submissionObj, foundProject, projectStakeholders, isProjectStakeholder, foundTask, submission;

                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _req$body3 = req.body, project = _req$body3.project, level = _req$body3.level, task = _req$body3.task, note = _req$body3.note, evidence = _req$body3.evidence;
                                errors = [];
                                submissionObj = {
                                    project: project, level: level, task: task, stakeholder: req.userId, evidence: evidence
                                };
                                _context5.prev = 3;
                                _context5.next = 6;
                                return Project.findById(project);

                            case 6:
                                foundProject = _context5.sent;

                                if (!(!foundProject || foundProject == null)) {
                                    _context5.next = 9;
                                    break;
                                }

                                return _context5.abrupt("return", res.status(404).json({ message: "Project Not Found" }));

                            case 9:

                                // ................features....................
                                // 1. check if he is assigned to the proposal (for a contractor)
                                // 2. check role


                                projectStakeholders = foundProject.stakeholders;
                                isProjectStakeholder = projectStakeholders.some(function (s) {
                                    return s.user.information._id.toString() === req.userId && s.user.status === 'ACCEPTED';
                                });

                                if (isProjectStakeholder) {
                                    _context5.next = 13;
                                    break;
                                }

                                return _context5.abrupt("return", res.status(403).json({ message: "You are not a stakeholder on this project." }));

                            case 13:
                                if (!(level === "project")) {
                                    _context5.next = 17;
                                    break;
                                }

                                delete submissionObj.task;
                                _context5.next = 27;
                                break;

                            case 17:
                                if (!(level === "task" && (!task || task.length < 1))) {
                                    _context5.next = 21;
                                    break;
                                }

                                return _context5.abrupt("return", res.status(400).json({ message: "Please Specify task" }));

                            case 21:
                                if (!(level === "task" && (task || task.length > 0))) {
                                    _context5.next = 27;
                                    break;
                                }

                                _context5.next = 24;
                                return Task.findById(task);

                            case 24:
                                foundTask = _context5.sent;

                                if (!(!foundTask || foundTask == null)) {
                                    _context5.next = 27;
                                    break;
                                }

                                return _context5.abrupt("return", res.status(404).json({ message: "Task Not Found." }));

                            case 27:

                                if (note && note.length > 0) {
                                    submissionObj.note = note;
                                }

                                // return res.json({submissionObj});

                                _context5.next = 30;
                                return new Submission(submissionObj).save();

                            case 30:
                                submission = _context5.sent;

                                if (!submission) {
                                    _context5.next = 33;
                                    break;
                                }

                                return _context5.abrupt("return", res.status(201).json({ message: "Your evidence has been uploaded" }));

                            case 33:
                                _context5.next = 39;
                                break;

                            case 35:
                                _context5.prev = 35;
                                _context5.t0 = _context5["catch"](3);

                                console.log(_context5.t0);
                                return _context5.abrupt("return", res.status(501).json({
                                    message: _context5.t0.message
                                }));

                            case 39:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this, [[3, 35]]);
            }));

            function submitEvidenceGeneral(_x9, _x10) {
                return _ref5.apply(this, arguments);
            }

            return submitEvidenceGeneral;
        }()
    }, {
        key: "getSubmissions",
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
                var id, proposalId, generalSubmissions, project, evidenceRequestSubmissions, proposal, projectLevelSubmissions, submissions;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                id = req.params.id;
                                proposalId = req.query.proposalId;
                                generalSubmissions = void 0;
                                _context6.prev = 3;
                                _context6.next = 6;
                                return Project.findById(id);

                            case 6:
                                project = _context6.sent;

                                if (project) {
                                    _context6.next = 9;
                                    break;
                                }

                                return _context6.abrupt("return", res.status(404).json({ message: "Project Not Found" }));

                            case 9:
                                if (!(project.owner._id.toString() === req.userId)) {
                                    _context6.next = 15;
                                    break;
                                }

                                _context6.next = 12;
                                return Submission.find({ project: id });

                            case 12:
                                generalSubmissions = _context6.sent;
                                _context6.next = 18;
                                break;

                            case 15:
                                _context6.next = 17;
                                return Submission.find({ project: id, stakeholder: req.userId });

                            case 17:
                                generalSubmissions = _context6.sent;

                            case 18:
                                _context6.next = 20;
                                return Evidence.find({ project: project, $or: [{ requestedBy: req.userId }, { 'stakeholders.user': req.userId }], submissions: { $exists: true }, $where: 'this.submissions.length>0' });

                            case 20:
                                evidenceRequestSubmissions = _context6.sent;


                                // get proposal related to the project

                                proposal = void 0;

                                if (!(proposalId && proposalId.length > 0)) {
                                    _context6.next = 26;
                                    break;
                                }

                                _context6.next = 25;
                                return Proposal.findOne({ _id: proposalId, $or: [{ proposedBy: req.userId }, { assignedTo: req.userId }] }, { "comments": 0, "proposalName": 0, "approved": 0, "status": 0 });

                            case 25:
                                proposal = _context6.sent;

                            case 26:
                                if (proposal) {
                                    _context6.next = 28;
                                    break;
                                }

                                return _context6.abrupt("return", res.status(404).json({ message: "Proposal Not Found" }));

                            case 28:
                                projectLevelSubmissions = Evidences.filterProjectLevelSubmission(generalSubmissions, evidenceRequestSubmissions);
                                // let taskSubmissions = Evidences.filterTaskLevelSubmission(generalSubmissions, evidenceRequestSubmissions)

                                submissions = {
                                    projectLevelSubmissions: projectLevelSubmissions,
                                    taskLevelSubmissions: proposal.milestones.map(function (milestone) {
                                        return {
                                            title: milestone.title,
                                            tasks: milestone.tasks.map(function (task) {
                                                return Evidences.filterTaskLevelSubmission(req.userId, task, generalSubmissions, evidenceRequestSubmissions);
                                            })
                                        };
                                    })

                                    // let allTaskSubmissions = Array.prototype.concat.call([], generalSubmissions, evidenceRequestSubmissions).filter(submission => submission.level === 'task');

                                    // let submissions= {}
                                };
                                return _context6.abrupt("return", res.json(submissions));

                            case 33:
                                _context6.prev = 33;
                                _context6.t0 = _context6["catch"](3);

                                console.log(_context6.t0);
                                return _context6.abrupt("return", res.status(501).json({
                                    message: _context6.t0.message
                                }));

                            case 37:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[3, 33]]);
            }));

            function getSubmissions(_x11, _x12) {
                return _ref6.apply(this, arguments);
            }

            return getSubmissions;
        }()
    }], [{
        key: "populateUser",


        // constructor(){
        //     this.populateUser=this.populateUser.bind(this)
        // }

        /**
         *
         *
         * @static
         * @param {*} user
         * @returns
         * @memberof Evidences
         */
        value: function populateUser(user) {
            if (user == null) {
                return null;
            }
            return {
                fullName: user.firstName + " " + user.lastName,
                _id: user._id,
                profilePhoto: user.profilePhoto
            };
        }
    }, {
        key: "populateTask",
        value: function populateTask(task) {
            if (task == null) {
                return null;
            }
            return {
                _id: task._id,
                name: task.name
            };
        }
    }, {
        key: "filterProjectLevelSubmission",
        value: function filterProjectLevelSubmission(generalSub, evidenceRequestSub) {
            var requested = evidenceRequestSub.filter(function (submission) {
                return submission.level === 'project';
            });
            var others = generalSub.filter(function (submission) {
                return submission.level === 'project';
            });

            // const totalRequest= requested.length, totalOther= other.length;

            return { requested: requested, others: others };
        }
    }, {
        key: "filterTaskLevelSubmission",
        value: function filterTaskLevelSubmission(user, task, generalSub, evidenceRequestSub) {
            // let allTaskSubmissions = Array.prototype.concat.call([], generalSub, evidenceRequestSub).filter(submission => submission.level === 'task');
            var requested = evidenceRequestSub.filter(function (submission) {
                return submission.level === 'task' && submission.task._id.toString() === task._id.toString();
            }).map(function (requested) {
                return {
                    _id: requested._id,
                    title: requested.title,
                    datatype: requested.datatype,
                    updatedAt: requested.updatedAt,
                    task: {
                        _id: requested.task._id
                    },
                    stakeholders: requested.stakeholders.map(function (stakeholder) {
                        return {
                            hasSubmitted: stakeholder.hasSubmitted,
                            quote: stakeholder.quote,
                            user: Evidences.populateUser(stakeholder.user)
                        };
                    }),
                    fields: requested.fields,
                    submissions: Evidences.filterSubmissions(user, requested.submissions, requested.stakeholders, requested.requestedBy)
                    // submissions:requested.submissions

                };
            });
            var others = generalSub.filter(function (submission) {
                return submission.level === 'task' && submission.task._id.toString() === task._id.toString();
            }).map(function (other) {
                return _defineProperty({
                    _id: other._id,
                    title: other.title,
                    datatype: other.datatype,
                    updatedAt: other.updatedAt,
                    task: {
                        _id: other.task._id
                    },
                    stakeholder: Evidences.populateUser(other.stakeholder),
                    evidence: other.evidence
                }, "updatedAt", other.updatedAt);
            });

            task = task.toJSON();
            delete task.assignedTo;
            delete task.createdBy;
            delete task.status;
            delete task.description;
            delete task.estimatedCost;

            task.totalSubmissions = requested.length + others.length;
            task.requested = requested;
            task.others = others;
            return task;
            // return { requested, others };
        }
    }, {
        key: "filterSubmissions",
        value: function filterSubmissions(user, submissions, stakeholders, requestedBy) {
            var isStakeholder = stakeholders.some(function (stakeholder) {
                return stakeholder.user._id.toString() === user;
            });
            if (isStakeholder) {
                return submissions = submissions.filter(function (submission) {
                    return submission.user === user;
                });
            } else if (!isStakeholder && requestedBy._id.toString() === user) {
                //he who sent the request
                return submissions;
            } else {
                return [];
            }
        }
    }, {
        key: "filterStakeholders",
        value: function filterStakeholders(user, stakeholders, requestedBy) {
            var isStakeholder = stakeholders.some(function (stakeholder) {
                return stakeholder.user._id.toString() === user;
            });
            if (isStakeholder) {
                return stakeholders = stakeholders.filter(function (stakeholder) {
                    return stakeholder.user._id.toString() === user;
                });
            } else if (!isStakeholder && requestedBy._id.toString() === user) {
                //he who sent the request
                return stakeholders;
            } else {
                return [];
            }
        }
    }]);

    return Evidences;
}();

module.exports = { Evidences: Evidences };
//# sourceMappingURL=EvidenceRequest.js.map