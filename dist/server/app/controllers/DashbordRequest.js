"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("dotenv").config();
var mongoose = require("mongoose");
var User = mongoose.model("User"),
    Project = mongoose.model('Project'),
    Save = mongoose.model('Save');

var Dashboard = function () {
    function Dashboard() {
        _classCallCheck(this, Dashboard);

        this.savedProjects = {};
        this.createdProjects = {};
        this.joinedProjects = {};
        this.areaOfInterest = {};
        this.result = {};
        this.fundedProjects = {};

        this.fetchSavedProject = this.fetchSavedProject.bind(this);
        this.fetchCreatedProjects = this.fetchCreatedProjects.bind(this);
        this.getAll = this.getAll.bind(this);
        this.fetchJoinedProjects = this.fetchJoinedProjects.bind(this);
        this.fetchAreaOfInterestP = this.fetchAreaOfInterestP.bind(this);
    }

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Dashboard
     */


    _createClass(Dashboard, [{
        key: "fetchSavedProject",
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
                var page, limit, all, _projects, projects, docs;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                page = req.query.page || 1;
                                limit = req.query.limit || 20;
                                all = req.query.all;
                                _context.prev = 3;

                                if (!(all && typeof all === 'string' && all === 'true')) {
                                    _context.next = 11;
                                    break;
                                }

                                _context.next = 7;
                                return Save.find({ user: req.userId });

                            case 7:
                                _projects = _context.sent;

                                if (_projects.length > 0) {
                                    _projects = _projects.map(function (p) {
                                        return {
                                            _id: p.project._id,
                                            name: p.project.name,
                                            status: p.project.status,
                                            goal: p.project.goal,
                                            location: {
                                                name: p.project.location.name
                                            },
                                            avatar: p.project["project-avatar"],
                                            owner: {
                                                fullName: p.project.owner.firstName + " " + p.project.owner.lastName,
                                                _id: p.project.owner._id
                                            }
                                        };
                                    }).reverse();
                                }

                                this.savedProjects = {
                                    docs: _projects
                                };
                                return _context.abrupt("return", this.savedProjects);

                            case 11:
                                _context.next = 13;
                                return Save.paginate({ user: req.userId }, { page: Number(page), limit: Number(limit) });

                            case 13:
                                projects = _context.sent;
                                docs = projects.docs;

                                if (docs.length > 0) {
                                    docs = docs.map(function (d) {
                                        return {
                                            _id: d.project._id,
                                            name: d.project.name,
                                            status: d.project.status,
                                            goal: d.project.goal,
                                            location: {
                                                name: d.project.location.name
                                            },
                                            avatar: d.project["project-avatar"],
                                            owner: {
                                                fullName: d.project.owner.firstName + " " + d.project.owner.lastName,
                                                _id: d.project.owner._id
                                            }
                                        };
                                    }).reverse();
                                }

                                this.savedProjects = {
                                    docs: docs,
                                    total: projects.total,
                                    limit: projects.limit,
                                    page: projects.page,
                                    pages: projects.pages
                                };
                                return _context.abrupt("return", this.savedProjects);

                            case 20:
                                _context.prev = 20;
                                _context.t0 = _context["catch"](3);

                                console.log(_context.t0);
                                return _context.abrupt("return", res.status(500).json({ message: "internal server error" }));

                            case 24:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[3, 20]]);
            }));

            function fetchSavedProject(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return fetchSavedProject;
        }()

        /**
         *
         *
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Dashboard
         */

    }, {
        key: "fetchCreatedProjects",
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
                var page, limit, all, _projects2, projects, docs;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                page = req.query.page || 1;
                                limit = req.query.limit || 20;
                                all = req.query.all;
                                _context2.prev = 3;

                                if (!(req.roles.includes('isFunder') || req.roles.includes('isContractor'))) {
                                    _context2.next = 19;
                                    break;
                                }

                                if (!(all && typeof all === 'string' && all === 'true')) {
                                    _context2.next = 12;
                                    break;
                                }

                                _context2.next = 8;
                                return Project.find({ owner: req.userId });

                            case 8:
                                _projects2 = _context2.sent;

                                if (_projects2.length > 0) {
                                    _projects2 = _projects2.map(function (p) {
                                        return {
                                            _id: p._id,
                                            name: p.name,
                                            status: p.status,
                                            goal: p.goal,
                                            location: {
                                                name: p.location.name
                                            },
                                            avatar: p["project-avatar"],
                                            owner: {
                                                fullName: p.owner.firstName + " " + p.owner.lastName,
                                                _id: p.owner._id
                                            }
                                        };
                                    }).reverse();
                                }

                                this.createdProjects = {
                                    docs: _projects2
                                };
                                return _context2.abrupt("return", this.createdProjects);

                            case 12:
                                _context2.next = 14;
                                return Project.paginate({ owner: req.userId }, { page: Number(page), limit: Number(limit) });

                            case 14:
                                projects = _context2.sent;
                                docs = projects.docs;

                                if (docs.length > 0) {
                                    docs = docs.map(function (d) {
                                        return {
                                            _id: d._id,
                                            name: d.name,
                                            status: d.status,
                                            goal: d.goal,
                                            location: {
                                                name: d.location.name
                                            },
                                            avatar: d["project-avatar"],
                                            owner: {
                                                fullName: d.owner.firstName + " " + d.owner.lastName,
                                                _id: d.owner._id
                                            }
                                        };
                                    }).reverse();
                                }

                                this.createdProjects = {
                                    docs: docs,
                                    total: projects.total,
                                    limit: projects.limit,
                                    page: projects.page,
                                    pages: projects.pages
                                };
                                return _context2.abrupt("return", this.createdProjects);

                            case 19:
                                return _context2.abrupt("return", this.createdProjects);

                            case 22:
                                _context2.prev = 22;
                                _context2.t0 = _context2["catch"](3);

                                console.log(_context2.t0);
                                return _context2.abrupt("return", res.status(500).json({ message: "internal server error" }));

                            case 26:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[3, 22]]);
            }));

            function fetchCreatedProjects(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return fetchCreatedProjects;
        }()

        /**
         *
         *
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Dashboard
         */

    }, {
        key: "fetchJoinedProjects",
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
                var page, limit, all, _projects3, projects, docs;

                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                page = req.query.page || 1;
                                limit = req.query.limit || 20;
                                all = req.query.all;
                                _context3.prev = 3;

                                if (!(all && typeof all === 'string' && all === 'true')) {
                                    _context3.next = 18;
                                    break;
                                }

                                _context3.next = 7;
                                return Project.find({
                                    'stakeholders.user.information': req.userId,
                                    'stakeholders.user.status': 'ACCEPTED', 'stakeholders.user.agreed': true
                                });

                            case 7:
                                _projects3 = _context3.sent;


                                if (_projects3.length > 0) {
                                    _projects3 = _projects3.map(function (p) {
                                        return {
                                            _id: p._id,
                                            name: p.name,
                                            status: p.status,
                                            goal: p.goal,
                                            location: {
                                                name: p.location.name
                                            },
                                            avatar: p["project-avatar"],
                                            owner: {
                                                fullName: p.owner.firstName + " " + p.owner.lastName,
                                                _id: p.owner._id
                                            }
                                        };
                                    }).reverse();
                                }

                                if (!(req.roles.includes('isContractor') || req.roles.includes('isEvaluator'))) {
                                    _context3.next = 15;
                                    break;
                                }

                                this.joinedProjects = {
                                    docs: _projects3
                                };
                                return _context3.abrupt("return", { joinedProjects: this.joinedProjects });

                            case 15:
                                if (!req.roles.includes('isFunder')) {
                                    _context3.next = 18;
                                    break;
                                }

                                this.fundedProjects = {
                                    docs: _projects3

                                };
                                return _context3.abrupt("return", { fundedProjects: this.fundedProjects });

                            case 18:
                                _context3.next = 20;
                                return Project.paginate({
                                    'stakeholders.user.information': req.userId,
                                    'stakeholders.user.status': 'ACCEPTED', 'stakeholders.user.agreed': true
                                }, { page: Number(page), limit: Number(limit) });

                            case 20:
                                projects = _context3.sent;
                                docs = projects.docs;

                                if (docs.length > 0) {
                                    docs = docs.map(function (d) {
                                        return {
                                            _id: d._id,
                                            name: d.name,
                                            status: d.status,
                                            goal: d.goal,
                                            location: {
                                                name: d.location.name
                                            },
                                            avatar: d["project-avatar"],
                                            owner: {
                                                fullName: d.owner.firstName + " " + d.owner.lastName,
                                                _id: d.owner._id
                                            }
                                        };
                                    }).reverse();
                                }

                                if (!(req.roles.includes('isContractor') || req.roles.includes('isEvaluator'))) {
                                    _context3.next = 29;
                                    break;
                                }

                                this.joinedProjects = {
                                    docs: docs,
                                    total: projects.total,
                                    limit: projects.limit,
                                    page: projects.page,
                                    pages: projects.pages
                                };
                                return _context3.abrupt("return", { joinedProjects: this.joinedProjects });

                            case 29:
                                if (!req.roles.includes('isFunder')) {
                                    _context3.next = 32;
                                    break;
                                }

                                this.fundedProjects = {
                                    docs: docs,
                                    total: projects.total,
                                    limit: projects.limit,
                                    page: projects.page,
                                    pages: projects.pages
                                };
                                return _context3.abrupt("return", { fundedProjects: this.fundedProjects });

                            case 32:
                                _context3.next = 38;
                                break;

                            case 34:
                                _context3.prev = 34;
                                _context3.t0 = _context3["catch"](3);

                                console.log(_context3.t0);
                                return _context3.abrupt("return", res.status(500).json({ message: "internal server error" }));

                            case 38:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[3, 34]]);
            }));

            function fetchJoinedProjects(_x5, _x6) {
                return _ref3.apply(this, arguments);
            }

            return fetchJoinedProjects;
        }()

        /**
         *
         *
         * @param {*} req
         * @param {*} res
         * @memberof Dashboard
         */

    }, {
        key: "fetchAreaOfInterestP",
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
                var page, limit, all, user, interests, _projects4, projects, docs;

                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                page = req.query.page || 1;
                                limit = req.query.limit || 20;
                                all = req.query.all;
                                // let interests = req.decodedTokenData.areasOfInterest;

                                _context4.prev = 3;
                                _context4.next = 6;
                                return User.findById(req.userId);

                            case 6:
                                user = _context4.sent;
                                interests = user.areasOfInterest;

                                if (!(all && typeof all === 'string' && all === 'true')) {
                                    _context4.next = 15;
                                    break;
                                }

                                _context4.next = 11;
                                return Project.find({ owner: { $ne: req.userId }, tags: { $in: [].concat(_toConsumableArray(interests)) } });

                            case 11:
                                _projects4 = _context4.sent;

                                if (_projects4.length > 0) {
                                    // projects= projects.filter(p=>p.owner._id.toString() !== req.userId);
                                    _projects4 = _projects4.map(function (p) {
                                        return {
                                            _id: p._id,
                                            name: p.name,
                                            status: p.status,
                                            goal: p.goal,
                                            location: {
                                                name: p.location.name
                                            },
                                            avatar: p["project-avatar"],
                                            owner: {
                                                fullName: p.owner.firstName + " " + p.owner.lastName,
                                                _id: p.owner._id
                                            }
                                        };
                                    }).reverse();
                                }

                                this.areaOfInterest = {
                                    docs: _projects4
                                };
                                return _context4.abrupt("return", this.areaOfInterest);

                            case 15:
                                _context4.next = 17;
                                return Project.paginate({ owner: { $ne: req.userId }, tags: { $in: [].concat(_toConsumableArray(interests)) } }, { page: Number(page), limit: Number(limit) });

                            case 17:
                                projects = _context4.sent;
                                docs = projects.docs;

                                if (docs.length > 0) {
                                    // docs= docs.filter(d=>d.owner._id.toString() !== req.userId);
                                    docs = docs.map(function (d) {
                                        return {
                                            _id: d._id,
                                            name: d.name,
                                            status: d.status,
                                            goal: d.goal,
                                            location: {
                                                name: d.location.name
                                            },
                                            avatar: d["project-avatar"],
                                            owner: {
                                                fullName: d.owner.firstName + " " + d.owner.lastName,
                                                _id: d.owner._id
                                            }
                                        };
                                    }).reverse();
                                }

                                this.areaOfInterest = {
                                    docs: docs,
                                    total: projects.total,
                                    limit: projects.limit,
                                    page: projects.page,
                                    pages: projects.pages
                                };
                                return _context4.abrupt("return", this.areaOfInterest);

                            case 24:
                                _context4.prev = 24;
                                _context4.t0 = _context4["catch"](3);

                                console.log(_context4.t0);
                                return _context4.abrupt("return", res.status(500).json({ message: "internal server error" }));

                            case 28:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[3, 24]]);
            }));

            function fetchAreaOfInterestP(_x7, _x8) {
                return _ref4.apply(this, arguments);
            }

            return fetchAreaOfInterestP;
        }()

        /**
         *
         *
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Dashboard
         */

    }, {
        key: "getAll",
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
                var createdProjects, savedProjects, joinedProjects, areasOfInterest;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this.fetchCreatedProjects(req, res);

                            case 2:
                                createdProjects = _context5.sent;
                                _context5.next = 5;
                                return this.fetchSavedProject(req, res);

                            case 5:
                                savedProjects = _context5.sent;
                                _context5.next = 8;
                                return this.fetchJoinedProjects(req, res);

                            case 8:
                                joinedProjects = _context5.sent;
                                _context5.next = 11;
                                return this.fetchAreaOfInterestP(req, res);

                            case 11:
                                areasOfInterest = _context5.sent;
                                return _context5.abrupt("return", this.result = _extends({ createdProjects: createdProjects, savedProjects: savedProjects }, joinedProjects, { areasOfInterest: areasOfInterest }));

                            case 13:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function getAll(_x9, _x10) {
                return _ref5.apply(this, arguments);
            }

            return getAll;
        }()

        /**
         *
         *
         * @param {*} req
         * @param {*} res
         * @returns
         * @memberof Dashboard
         */

    }, {
        key: "handleRequest",
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
                var cat, result, savedProjects, createdProjects, joinedProjects, areasOfInterest;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                cat = req.query.cat;
                                _context6.t0 = cat;
                                _context6.next = _context6.t0 === 'a' ? 4 : _context6.t0 === 's' ? 8 : _context6.t0 === 'c' ? 12 : _context6.t0 === 'j' ? 16 : _context6.t0 === 'i' ? 20 : 24;
                                break;

                            case 4:
                                _context6.next = 6;
                                return new Dashboard().getAll(req, res);

                            case 6:
                                result = _context6.sent;
                                return _context6.abrupt("return", res.status(200).json({ result: result }));

                            case 8:
                                _context6.next = 10;
                                return new Dashboard().fetchSavedProject(req, res);

                            case 10:
                                savedProjects = _context6.sent;
                                return _context6.abrupt("return", res.status(200).json({ result: { savedProjects: savedProjects } }));

                            case 12:
                                _context6.next = 14;
                                return new Dashboard().fetchCreatedProjects(req, res);

                            case 14:
                                createdProjects = _context6.sent;
                                return _context6.abrupt("return", res.status(200).json({ result: { createdProjects: createdProjects } }));

                            case 16:
                                _context6.next = 18;
                                return new Dashboard().fetchJoinedProjects(req, res);

                            case 18:
                                joinedProjects = _context6.sent;
                                return _context6.abrupt("return", res.status(200).json({ result: joinedProjects }));

                            case 20:
                                _context6.next = 22;
                                return new Dashboard().fetchAreaOfInterestP(req, res);

                            case 22:
                                areasOfInterest = _context6.sent;
                                return _context6.abrupt("return", res.status(200).json({ result: { areasOfInterest: areasOfInterest } }));

                            case 24:
                                return _context6.abrupt("break", 25);

                            case 25:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function handleRequest(_x11, _x12) {
                return _ref6.apply(this, arguments);
            }

            return handleRequest;
        }()
    }]);

    return Dashboard;
}();

module.exports = new Dashboard();
//# sourceMappingURL=DashbordRequest.js.map