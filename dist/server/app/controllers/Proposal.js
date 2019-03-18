"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("dotenv").config();
var mongoose = require("mongoose"),
    Task = mongoose.model("Task"),
    Project = mongoose.model("Project"),
    Proposal = mongoose.model("Proposal"),
    User = mongoose.model("User"),
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

var Proposals = function () {
    function Proposals() {
        _classCallCheck(this, Proposals);
    }

    _createClass(Proposals, null, [{
        key: "populateUser",


        // constructor() {
        //     this.populateUser = this.populateUser.bind(this)
        // }

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

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Proposals
         */

    }, {
        key: "submitProposal",
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
                var _this = this;

                var _req$body, projectId, comments, milestones, contractor, proposal_name, role, permission, project, existingProposal, milestonesIds, proposalObj, proposal;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _req$body = req.body, projectId = _req$body.projectId, comments = _req$body.comments, milestones = _req$body.milestones, contractor = _req$body.contractor, proposal_name = _req$body.proposal_name;
                                role = helper.getRole(req.roles);
                                permission = ac.can(role).createOwn('proposal').granted;

                                if (!permission) {
                                    _context2.next = 61;
                                    break;
                                }

                                _context2.prev = 4;
                                _context2.next = 7;
                                return Project.findById(projectId);

                            case 7:
                                project = _context2.sent;

                                if (project) {
                                    _context2.next = 10;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(404).json({ message: 'Project Not Found.' }));

                            case 10:
                                _context2.next = 12;
                                return Proposal.findOne({ project: projectId, proposedBy: req.userId });

                            case 12:
                                existingProposal = _context2.sent;

                                if (!(existingProposal && project.owner._id.toString() !== req.userId)) {
                                    _context2.next = 15;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(403).json({ message: "You have already submitted a proposal for this project." }));

                            case 15:
                                if (!(milestones.length < 1)) {
                                    _context2.next = 17;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(403).json({ message: "You cannot submit an empty proposal.\n Start by creating tasks and milestones" }));

                            case 17:
                                if (!(req.userId === project.owner._id.toString() && contractor && contractor === req.userId)) {
                                    _context2.next = 19;
                                    break;
                                }

                                return _context2.abrupt("return", res.status(403).json({ message: "You cannot assign a proposal to Yourself" }));

                            case 19:

                                milestones = milestones.map(function () {
                                    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(milestone) {
                                        var tasks, taskIds;
                                        return regeneratorRuntime.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        tasks = milestone.tasks.map(function (task) {

                                                            if (req.userId === project.owner._id.toString()) {
                                                                task.createdBy = req.userId;
                                                                task.estimatedCost = task.amount;
                                                                task.project = projectId;
                                                                task.dueDate = task.deadline;
                                                                task.isInMilestone = true;
                                                                contractor && contractor.length !== "" ? task.assignedTo = contractor : task.assignedTo = null;
                                                                contractor && contractor.length !== "" ? task.status = "ASSIGNED" : task.status = "UNASSIGNED";
                                                            } else {
                                                                task.assignedTo = req.userId;
                                                                task.createdBy = req.userId;
                                                                task.estimatedCost = task.amount;
                                                                task.project = projectId;
                                                                task.dueDate = task.deadline;
                                                                task.status = 'ASSIGNED';
                                                                task.isInMilestone = true;
                                                            }

                                                            return task;
                                                        });
                                                        _context.next = 3;
                                                        return Task.insertMany(tasks);

                                                    case 3:
                                                        taskIds = _context.sent;


                                                        milestone.createdBy = req.userId;
                                                        milestone.title = milestone.name;
                                                        milestone.project = projectId;
                                                        milestone.tasks = [].concat(_toConsumableArray(taskIds));

                                                        _context.next = 10;
                                                        return new Milestone(milestone).save();

                                                    case 10:
                                                        milestone = _context.sent;
                                                        return _context.abrupt("return", milestone);

                                                    case 12:
                                                    case "end":
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this);
                                    }));

                                    return function (_x3) {
                                        return _ref2.apply(this, arguments);
                                    };
                                }());

                                _context2.next = 22;
                                return Promise.all(milestones);

                            case 22:
                                milestonesIds = _context2.sent;

                                milestonesIds = milestonesIds.map(function (milestone) {
                                    return milestone._id;
                                });

                                proposalObj = {
                                    proposalName: proposal_name,
                                    project: projectId,
                                    milestones: [].concat(_toConsumableArray(milestonesIds)),
                                    proposedBy: req.userId
                                };


                                if (comments && comments.length > 0) {
                                    proposalObj.comments = comments.map(function (comment) {
                                        return {
                                            actor: req.userId,
                                            comment: comment
                                        };
                                    });
                                } else {
                                    proposalObj.comments = [];
                                }

                                _context2.next = 28;
                                return new Proposal(proposalObj).save();

                            case 28:
                                proposal = _context2.sent;

                                if (!(req.userId !== project.owner._id.toString())) {
                                    _context2.next = 37;
                                    break;
                                }

                                proposal.assignedTo = req.userId;
                                _context2.next = 33;
                                return proposal.save();

                            case 33:
                                _context2.next = 35;
                                return noticate.notifyOnSubmitProposal(req, project, proposal);

                            case 35:
                                _context2.next = 52;
                                break;

                            case 37:
                                if (!(req.userId === project.owner._id.toString() && !contractor || contractor === "")) {
                                    _context2.next = 44;
                                    break;
                                }

                                proposal.approved = true;
                                proposal.status = "APPROVED";
                                _context2.next = 42;
                                return proposal.save();

                            case 42:
                                _context2.next = 52;
                                break;

                            case 44:
                                if (!(req.userId === project.owner._id.toString() && contractor && contractor !== "")) {
                                    _context2.next = 52;
                                    break;
                                }

                                proposal.assignedTo = contractor;
                                proposal.approved = true;
                                proposal.status = "APPROVED";
                                _context2.next = 50;
                                return proposal.save();

                            case 50:
                                _context2.next = 52;
                                return noticate.notifyOnAssignedToProposal(req, project, proposal, contractor);

                            case 52:
                                return _context2.abrupt("return", res.status(201).json({ proposal: proposal }));

                            case 55:
                                _context2.prev = 55;
                                _context2.t0 = _context2["catch"](4);

                                console.log(_context2.t0);
                                return _context2.abrupt("return", res.status(501).json({
                                    message: _context2.t0.message
                                }));

                            case 59:
                                _context2.next = 62;
                                break;

                            case 61:
                                return _context2.abrupt("return", res.status(403).json({ message: "Forbidden" }));

                            case 62:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[4, 55]]);
            }));

            function submitProposal(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return submitProposal;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns {object}
         * @memberof Proposals
         * @description returns an array of proposals submitted against a project
         */

    }, {
        key: "getprojectProposals",
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
                var project, proposals;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                project = req.params.id;
                                _context3.prev = 1;
                                _context3.next = 4;
                                return Proposal.find({ project: project }).sort({ createdAt: -1 });

                            case 4:
                                proposals = _context3.sent;

                                if (!(proposals.length < 1)) {
                                    _context3.next = 7;
                                    break;
                                }

                                return _context3.abrupt("return", res.status(200).json({ proposals: [] }));

                            case 7:

                                proposals = proposals.map(function (p) {
                                    return {
                                        _id: p._id,

                                        proposal_name: p.proposalName,
                                        totalMilestones: p.milestones.length,
                                        tasks: Array.prototype.concat.apply([], p.milestones.map(function (m) {
                                            return m.tasks;
                                        })),

                                        totalTasks: p.milestones.map(function (m) {
                                            return m.tasks.length;
                                        }).reduce(function (x, y) {
                                            return x + y;
                                        }),

                                        totalBudget: p.milestones.map(function (m) {
                                            return m.tasks.map(function (t) {
                                                return t.estimatedCost;
                                            }).reduce(function (x, y) {
                                                return x + y;
                                            });
                                        }).reduce(function (a, b) {
                                            return a + b;
                                        }),

                                        proposedBy: Proposals.populateUser(p.proposedBy),
                                        assignedTo: Proposals.populateUser(p.assignedTo),
                                        status: p.status,
                                        approved: p.approved
                                    };
                                });
                                return _context3.abrupt("return", res.status(200).json({ proposals: proposals }));

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

            function getprojectProposals(_x4, _x5) {
                return _ref3.apply(this, arguments);
            }

            return getprojectProposals;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Proposals
         */

    }, {
        key: "getProposalDetail",
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
                var id, proposal;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                id = req.params.id;
                                _context4.prev = 1;
                                _context4.next = 4;
                                return Proposal.findById(id);

                            case 4:
                                proposal = _context4.sent;

                                if (proposal) {
                                    _context4.next = 7;
                                    break;
                                }

                                return _context4.abrupt("return", res.status(404).json({ message: "Proposal Not Found" }));

                            case 7:

                                proposal = {
                                    id: proposal._id,
                                    proposal_name: proposal.proposalName,
                                    milestones: proposal.milestones.map(function (milestone) {
                                        return {
                                            id: milestone._id,
                                            title: milestone.title,
                                            completed: milestone.completed,
                                            totalBudget: milestone.tasks.map(function (task) {
                                                return task.estimatedCost;
                                            }).reduce(function (x, y) {
                                                return x + y;
                                            }),
                                            tasks: milestone.tasks.map(function (task) {
                                                return {
                                                    id: task._id,
                                                    name: task.name,
                                                    description: task.description,
                                                    estimatedCost: task.estimatedCost,
                                                    dueDate: task.dueDate
                                                };
                                            })
                                        };
                                    }),
                                    status: proposal.status,
                                    approved: proposal.approved,
                                    proposedBy: Proposals.populateUser(proposal.proposedBy),
                                    assignedTo: Proposals.populateUser(proposal.assignedTo),
                                    comments: proposal.comments.map(function (comment) {
                                        return {
                                            actor: {
                                                id: comment.actor._id,
                                                firstName: comment.actor.firstName,
                                                lastName: comment.actor.lastName,
                                                profilePhoto: comment.actor.profilePhoto
                                            },
                                            comment: comment.comment,
                                            createdAt: comment.createdAt
                                        };
                                    })

                                };

                                return _context4.abrupt("return", res.status(200).json({ proposal: proposal }));

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

            function getProposalDetail(_x6, _x7) {
                return _ref4.apply(this, arguments);
            }

            return getProposalDetail;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns {object}
         * @memberof Proposals
         */

    }, {
        key: "getContractorProposals",
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
                var project;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                project = req.params.id;

                                // try {
                                //     let proposals = await Proposal.find({ project, proposedBy: req.userId }).sort({ createdAt: -1 });
                                //     if (proposals.length < 1) {
                                //         return res.status(200).json({ proposals: [] })
                                //     }

                                //     proposals = proposals.map((p) => {
                                //         return {
                                //             id: 'p._id',

                                //             totalMilestones: p.milestones.length,

                                //             totalTasks: p.milestones.map((m) => {
                                //                 return m.tasks.length
                                //             }).reduce((x, y) => x + y),

                                //             totalBudget: p.milestones.map((m) => {
                                //                 return m.tasks.map((t) => {
                                //                     return t.estimatedCost
                                //                 }).reduce((x, y) => x + y);
                                //             }).reduce((a, b) => a + b),

                                //             proposedBy: {
                                //                 fullName: `${p.proposedBy.firstName} ${p.proposedBy.lastName}`,
                                //                 _id: p.proposedBy._id
                                //             },
                                //         }
                                //     })
                                //     return res.status(200).json({ proposals })
                                // } catch (error) {
                                //     console.log(error);
                                //     return res.status(501).json({
                                //         message: error.message
                                //     });
                                // }

                            case 1:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function getContractorProposals(_x8, _x9) {
                return _ref5.apply(this, arguments);
            }

            return getContractorProposals;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Proposals
         * @description accepts or rejects proposal submited against a project
         */

    }, {
        key: "acceptOrRejectProposal",
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
                var _req$body2, approved, projectId, project, proposal, projectStakeholders, projectStakeholder;

                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _req$body2 = req.body, approved = _req$body2.approved, projectId = _req$body2.projectId;
                                _context6.prev = 1;
                                _context6.next = 4;
                                return Project.findById(projectId);

                            case 4:
                                project = _context6.sent;

                                if (project) {
                                    _context6.next = 7;
                                    break;
                                }

                                return _context6.abrupt("return", res.status(404).json({ message: 'Project Not Found.' }));

                            case 7:
                                _context6.next = 9;
                                return Proposal.findOne({ _id: req.params.id, project: projectId });

                            case 9:
                                proposal = _context6.sent;

                                if (proposal) {
                                    _context6.next = 12;
                                    break;
                                }

                                return _context6.abrupt("return", res.status(404).json({ message: "Proposal Not Found" }));

                            case 12:
                                if (!(project.owner._id.toString() !== req.userId)) {
                                    _context6.next = 14;
                                    break;
                                }

                                return _context6.abrupt("return", res.status(403).json({ message: "You don't have the permission." }));

                            case 14:
                                projectStakeholders = project.stakeholders;

                                // check if proposal owner is a stakeholder

                                projectStakeholder = projectStakeholders.find(function (c) {
                                    return c.user.information._id.toString() === proposal.proposedBy._id.toString();
                                });

                                if (!(approved === true)) {
                                    _context6.next = 44;
                                    break;
                                }

                                if (!proposal.approved) {
                                    _context6.next = 19;
                                    break;
                                }

                                return _context6.abrupt("return", res.status(409).json({ message: "You have already approved this proposal." }));

                            case 19:

                                //approve the proposal

                                proposal.approved = approved;
                                proposal.status = "APPROVED";

                                _context6.next = 23;
                                return proposal.save();

                            case 23:
                                if (!(projectStakeholder === undefined || Object.getOwnPropertyNames(projectStakeholder).length === 0)) {
                                    _context6.next = 27;
                                    break;
                                }

                                _context6.next = 26;
                                return Project.updateOne({ _id: projectId }, {
                                    $push: {
                                        stakeholders: {
                                            'user.information': proposal.proposedBy._id, 'user.status': "ACCEPTED",
                                            'user.agreed': true
                                        }
                                        // proposals: { _id: proposal._id }

                                    }

                                });

                            case 26:
                                return _context6.abrupt("return", res.json({ messge: 'Proposal accepted. \n The contractor has been added to the project\'s stakeholders' }));

                            case 27:
                                _context6.t0 = projectStakeholder.user.status;
                                _context6.next = _context6.t0 === "ACCEPTED" ? 30 : _context6.t0 === "PENDING" ? 33 : _context6.t0 === "DECLINED" ? 38 : 43;
                                break;

                            case 30:
                                _context6.next = 32;
                                return noticate.acceptOrRejectProposal(req, project, proposal, approved, null);

                            case 32:
                                return _context6.abrupt("return", res.status(200).json({ message: proposal.proposedBy.firstName + " " + proposal.proposedBy.lastName + "'s proposal approved." }));

                            case 33:
                                _context6.next = 35;
                                return Project.updateOne({
                                    _id: projectId,
                                    'stakeholders.user.information': proposal.proposedBy._id
                                }, {
                                    $set: { 'stakeholders.$.user.status': "ACCEPTED", 'stakeholders.$.user.agreed': true }
                                    // $push: { proposals: { _id: proposal._id } }
                                });

                            case 35:
                                _context6.next = 37;
                                return noticate.acceptOrRejectProposal(req, project, proposal, approved, projectStakeholder.user.status);

                            case 37:
                                return _context6.abrupt("return", res.status(200).json({ message: proposal.proposedBy.firstName + " " + proposal.proposedBy.lastName + "'s proposal approved." }));

                            case 38:
                                _context6.next = 40;
                                return Project.updateOne({
                                    _id: projectId,
                                    'stakeholders.user.information': proposal.proposedBy._id
                                }, {
                                    $set: { 'stakeholders.$.user.status': "ACCEPTED", 'stakeholders.$.user.agreed': true }
                                    // $push: { proposals: { _id: proposal._id } }
                                });

                            case 40:
                                _context6.next = 42;
                                return noticate.acceptOrRejectProposal(req, project, proposal, approved, projectStakeholder.user.status);

                            case 42:
                                return _context6.abrupt("return", res.status(200).json({ message: proposal.proposedBy.firstName + " " + proposal.proposedBy.lastName + "'s proposal approved." }));

                            case 43:
                                return _context6.abrupt("break", 44);

                            case 44:

                                proposal.approved = approved;
                                proposal.status = "REVERTED"; //declined or revert

                                _context6.next = 48;
                                return proposal.save();

                            case 48:
                                _context6.next = 50;
                                return noticate.acceptOrRejectProposal(req, project, proposal, approved, null);

                            case 50:
                                return _context6.abrupt("return", res.status(200).json({ message: proposal.proposedBy.firstName + " " + proposal.proposedBy.lastName + "'s proposal reverted." }));

                            case 53:
                                _context6.prev = 53;
                                _context6.t1 = _context6["catch"](1);

                                console.log(_context6.t1);
                                return _context6.abrupt("return", res.status(501).json({
                                    message: _context6.t1.message
                                }));

                            case 57:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[1, 53]]);
            }));

            function acceptOrRejectProposal(_x10, _x11) {
                return _ref6.apply(this, arguments);
            }

            return acceptOrRejectProposal;
        }()

        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Proposals
         */

    }, {
        key: "assignProposalToContractor",
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
                var _req$body3, contractorId, proposalId, projectId, role, permission, project, proposal, assingedProposal;

                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _req$body3 = req.body, contractorId = _req$body3.contractorId, proposalId = _req$body3.proposalId, projectId = _req$body3.projectId;
                                role = helper.getRole(req.roles);
                                permission = ac.can(role).updateOwn('proposal').granted;

                                if (!permission) {
                                    _context7.next = 35;
                                    break;
                                }

                                _context7.prev = 4;
                                _context7.next = 7;
                                return Project.findById(projectId);

                            case 7:
                                project = _context7.sent;

                                if (!(project.owner._id.toString() !== req.userId)) {
                                    _context7.next = 10;
                                    break;
                                }

                                return _context7.abrupt("return", res.status(401).json({ message: "You are not authorized to perform this operation" }));

                            case 10:
                                _context7.next = 12;
                                return Proposal.findOne({ _id: proposalId, proposedBy: req.userId });

                            case 12:
                                proposal = _context7.sent;

                                if (proposal) {
                                    _context7.next = 15;
                                    break;
                                }

                                return _context7.abrupt("return", res.status(404).json({ message: "Proposal Not Found" }));

                            case 15:
                                if (!(proposal.assignedTo !== null && proposal.assignedTo._id.toString() === contractorId)) {
                                    _context7.next = 17;
                                    break;
                                }

                                return _context7.abrupt("return", res.status(409).json({ message: "You have already assigned this contractor to this proposal" }));

                            case 17:

                                proposal.assignedTo = contractorId;
                                _context7.next = 20;
                                return proposal.save();

                            case 20:
                                assingedProposal = _context7.sent;

                                if (!assingedProposal) {
                                    _context7.next = 27;
                                    break;
                                }

                                _context7.next = 24;
                                return Task.updateMany({ createdBy: req.userId, project: projectId }, { $set: { assignedTo: contractorId, status: "ASSIGNED" } });

                            case 24:
                                _context7.next = 26;
                                return noticate.notifyOnAssignedToProposal(req, project, proposal, contractorId);

                            case 26:
                                return _context7.abrupt("return", res.status(200).json({ message: "You successfully assigned a contractor to this proposal." }));

                            case 27:
                                _context7.next = 33;
                                break;

                            case 29:
                                _context7.prev = 29;
                                _context7.t0 = _context7["catch"](4);

                                console.log(_context7.t0);
                                return _context7.abrupt("return", res.status(501).json({
                                    message: _context7.t0.message
                                }));

                            case 33:
                                _context7.next = 36;
                                break;

                            case 35:
                                return _context7.abrupt("return", res.status(403).json({ message: "Forbidden" }));

                            case 36:
                            case "end":
                                return _context7.stop();
                        }
                    }
                }, _callee7, this, [[4, 29]]);
            }));

            function assignProposalToContractor(_x12, _x13) {
                return _ref7.apply(this, arguments);
            }

            return assignProposalToContractor;
        }()
    }]);

    return Proposals;
}();

module.exports = { Proposals: Proposals };
//# sourceMappingURL=Proposal.js.map