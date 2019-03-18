"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("dotenv").config();
var mongoose = require("mongoose"),
    Task = mongoose.model("Task"),
    Project = mongoose.model("Project"),
    Milestone = mongoose.model('Milestone');
var validate = require('../../middleware/validate');
var _ = require('lodash');

/**
 *
 *
 * @class Milestones
 */

var Milestones = function () {
    function Milestones() {
        _classCallCheck(this, Milestones);
    }

    _createClass(Milestones, null, [{
        key: "newMilestone",


        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Milestones
         */
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
                var successRes, failRes, errors, _req$body, title, tasks, projectId, uniqTasks, taskDetails, taskIds, milestoneObj, milestone;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                successRes = { success: true };
                                failRes = { success: false };


                                validate.validateAddMilestone(req, res);
                                errors = req.validationErrors();

                                if (!errors) {
                                    _context.next = 6;
                                    break;
                                }

                                return _context.abrupt("return", res.status(400).json({
                                    message: errors
                                }));

                            case 6:
                                _context.prev = 6;

                                if (req.roles.includes('isContractor')) {
                                    _context.next = 9;
                                    break;
                                }

                                return _context.abrupt("return", res.status(403).json({ message: "forbidden" }));

                            case 9:
                                _req$body = req.body, title = _req$body.title, tasks = _req$body.tasks, projectId = _req$body.projectId;
                                uniqTasks = _.uniq(tasks);
                                _context.next = 13;
                                return Task.find({ _id: [].concat(_toConsumableArray(uniqTasks)), project: projectId, createdBy: req.userId });

                            case 13:
                                taskDetails = _context.sent;

                                if (!(taskDetails.length < 1)) {
                                    _context.next = 16;
                                    break;
                                }

                                return _context.abrupt("return", res.status(404).json({ message: "Tasks not found" }));

                            case 16:

                                // let estimatedCost = taskDetails.map(t => t.estimatedCost).reduce((x, y) => { return x + y });
                                taskIds = taskDetails.map(function (t) {
                                    return t._id;
                                });
                                milestoneObj = {
                                    createdBy: req.userId,
                                    // estimatedCost,
                                    title: title,
                                    project: projectId,
                                    tasks: [].concat(_toConsumableArray(taskIds))
                                };
                                _context.next = 20;
                                return new Milestone(milestoneObj).save();

                            case 20:
                                milestone = _context.sent;
                                _context.next = 23;
                                return Task.updateMany({ _id: [].concat(_toConsumableArray(taskIds)) }, { $set: { isInMilestone: true } });

                            case 23:
                                if (!milestone) {
                                    _context.next = 25;
                                    break;
                                }

                                return _context.abrupt("return", res.status(201).json({ success: successRes.success, milestone: milestone }));

                            case 25:
                                _context.next = 31;
                                break;

                            case 27:
                                _context.prev = 27;
                                _context.t0 = _context["catch"](6);

                                console.log(_context.t0);
                                return _context.abrupt("return", res.status(501).json({
                                    message: _context.t0.message
                                }));

                            case 31:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[6, 27]]);
            }));

            function newMilestone(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return newMilestone;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Tasks
         */

    }, {
        key: "singleMileStone",
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
                var milestone;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.prev = 0;
                                _context2.next = 3;
                                return Milestone.findById(req.params.id);

                            case 3:
                                milestone = _context2.sent;

                                if (!milestone) {
                                    _context2.next = 7;
                                    break;
                                }

                                milestone = {
                                    _id: milestone._id,
                                    project: milestone.project,
                                    title: milestone.title,
                                    createdBy: {
                                        _id: milestone.createdBy._id,
                                        firstName: milestone.createdBy.firstName,
                                        lastName: milestone.createdBy.lastName
                                    },
                                    completed: milestone.completed,
                                    estimatedCost: milestone.tasks.map(function (t) {
                                        return t.estimatedCost;
                                    }).reduce(function (y, z) {
                                        return y + z;
                                    }),
                                    createdAt: milestone.createdAt,
                                    updatedAt: milestone.updatedAt,
                                    tasks: milestone.tasks.map(function (t) {
                                        return {
                                            _id: t._id,
                                            name: t.name,
                                            description: t.description,
                                            status: t.status,
                                            estimatedCost: t.estimatedCost,
                                            dueDate: t.dueDate,
                                            assignedTo: {
                                                _id: t.assignedTo._id,
                                                firstName: t.assignedTo.firstName,
                                                lastName: t.assignedTo.lastName
                                            },
                                            createdBy: {
                                                _id: t.createdBy._id,
                                                firstName: t.createdBy.firstName,
                                                lastName: t.createdBy.lastName
                                            },
                                            createdAt: t.createdAt,
                                            updatedAt: t.updatedAt
                                        };
                                    })

                                };
                                return _context2.abrupt("return", res.status(200).json({ milestone: milestone }));

                            case 7:
                                return _context2.abrupt("return", res.status(404).json({ message: "Milestone Not Found" }));

                            case 10:
                                _context2.prev = 10;
                                _context2.t0 = _context2["catch"](0);

                                console.log(_context2.t0);
                                return _context2.abrupt("return", res.status(501).json({
                                    message: _context2.t0.message
                                }));

                            case 14:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[0, 10]]);
            }));

            function singleMileStone(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return singleMileStone;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Milestones
         */

    }, {
        key: "allMilestones",
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
                var projectId, project, milestones;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                projectId = req.query.project;
                                _context3.prev = 1;
                                _context3.next = 4;
                                return Project.findById(projectId);

                            case 4:
                                project = _context3.sent;

                                if (!(!project || project === null)) {
                                    _context3.next = 7;
                                    break;
                                }

                                return _context3.abrupt("return", res.status(404).json({ message: 'Project Not found.' }));

                            case 7:
                                _context3.next = 9;
                                return Milestone.find({ project: projectId });

                            case 9:
                                milestones = _context3.sent;

                                if (!(Boolean(milestones) && Boolean(milestones.length > 0))) {
                                    _context3.next = 15;
                                    break;
                                }

                                milestones = milestones.map(function (m) {
                                    return {
                                        _id: m._id,
                                        project: m.project,
                                        title: m.title,
                                        createdBy: {
                                            _id: m.createdBy._id,
                                            firstName: m.createdBy.firstName,
                                            lastName: m.createdBy.lastName
                                        },
                                        completed: m.completed,
                                        estimatedCost: m.tasks.map(function (t) {
                                            return t.estimatedCost;
                                        }).reduce(function (y, z) {
                                            return y + z;
                                        }),
                                        createdAt: m.createdAt,
                                        updatedAt: m.updatedAt,
                                        tasks: m.tasks.map(function (t) {
                                            return {
                                                _id: t._id,
                                                name: t.name,
                                                description: t.description,
                                                status: t.status,
                                                estimatedCost: t.estimatedCost,
                                                dueDate: t.dueDate,
                                                assignedTo: {
                                                    _id: t.assignedTo._id,
                                                    firstName: t.assignedTo.firstName,
                                                    lastName: t.assignedTo.lastName
                                                },
                                                createdBy: {
                                                    _id: t.createdBy._id,
                                                    firstName: t.createdBy.firstName,
                                                    lastName: t.createdBy.lastName
                                                },
                                                createdAt: t.createdAt,
                                                updatedAt: t.updatedAt
                                            };
                                        })
                                    };
                                });
                                return _context3.abrupt("return", res.status(200).json(milestones));

                            case 15:
                                return _context3.abrupt("return", res.status(200).json({
                                    message: "No milestones for this project"
                                }));

                            case 16:
                                _context3.next = 21;
                                break;

                            case 18:
                                _context3.prev = 18;
                                _context3.t0 = _context3["catch"](1);
                                return _context3.abrupt("return", res.status(501).json({
                                    message: _context3.t0.message
                                }));

                            case 21:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[1, 18]]);
            }));

            function allMilestones(_x5, _x6) {
                return _ref3.apply(this, arguments);
            }

            return allMilestones;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @memberof Milestones
         */

    }, {
        key: "updateMilestone",
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function updateMilestone(_x7, _x8) {
                return _ref4.apply(this, arguments);
            }

            return updateMilestone;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @memberof Milestones
         */

    }, {
        key: "deleteMilestone",
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function deleteMilestone(_x9, _x10) {
                return _ref5.apply(this, arguments);
            }

            return deleteMilestone;
        }()
    }]);

    return Milestones;
}();

module.exports = { Milestones: Milestones };
//# sourceMappingURL=milestone.js.map