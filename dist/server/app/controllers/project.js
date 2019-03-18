"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("dotenv").config();
var mongoose = require("mongoose"),
    Project = mongoose.model("Project"),
    User = mongoose.model("User"),
    Location = mongoose.model("Location"),
    Proposal = mongoose.model("Proposal");
var moment = require('moment');

var notify = require('../helper/notifications');
var Helper = require('../helper/helper');

var helper = new Helper();

/**
 *
 *
 * @class Projects
 */

var Projects = function () {
  function Projects() {
    _classCallCheck(this, Projects);
  }

  _createClass(Projects, null, [{
    key: "newProject",


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Projects
     */

    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
        var _this = this;

        var successRes, failRes, projectObj, SHs, newLocation, saveProject;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                successRes = { success: true };
                failRes = { success: false };
                projectObj = req.body;

                projectObj.owner = req.userId;
                SHs = [];
                newLocation = new Location(req.body.location);
                _context2.prev = 6;


                if (projectObj.stakeholders && projectObj.stakeholders.length > 0) {
                  // let shouldAddContractor = await helper.shouldAddContractor(projectObj.stakeholders, null)
                  // if(shouldAddContractor){
                  SHs = [].concat(_toConsumableArray(projectObj.stakeholders));
                  projectObj.stakeholders = projectObj.stakeholders.map(function (s) {
                    return {
                      user: {
                        information: s
                      }
                    };
                  });
                  // }else{
                  //   failRes.message ="You cannot add more than one Contractor to a project";
                  //   console.log(failRes)
                  //   return res.status(400).json(failRes);
                  // }
                } else {

                  projectObj.stakeholders = [];
                }

                saveProject = function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(projectObj) {
                    var newProject, newP, project;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:

                            if (typeof projectObj.tags === "string" || typeof projectObj.tags === "String") {
                              projectObj.tags = [projectObj.tags];
                            } else if (Boolean(projectObj.tags) === false) {
                              projectObj.tags = [];
                            }

                            newProject = new Project(projectObj);
                            // newProject.save((err, project)=>{
                            //   if (err) {
                            //     failRes.message = err.name + ": " + err.message;
                            //     return res.status(400).json(failRes);
                            //   }

                            //    notify.notifyAddedStakeholders(req, req.body.stakeholders, project)
                            //   return res.status(200).json(successRes);
                            // });

                            _context.next = 4;
                            return newProject.save();

                          case 4:
                            newP = _context.sent;

                            if (!newP) {
                              _context.next = 14;
                              break;
                            }

                            _context.next = 8;
                            return Project.findById(newP._id);

                          case 8:
                            project = _context.sent;

                            if (!(SHs.length > 0)) {
                              _context.next = 12;
                              break;
                            }

                            _context.next = 12;
                            return notify.notifyAddedStakeholders(req, SHs, project);

                          case 12:
                            successRes.project = project;
                            return _context.abrupt("return", res.status(200).json(successRes));

                          case 14:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee, _this);
                  }));

                  return function saveProject(_x3) {
                    return _ref2.apply(this, arguments);
                  };
                }();

                Location.findOne({
                  name: req.body.location.name,
                  lat: req.body.location.lat,
                  lng: req.body.location.lng
                }, function (err, single) {
                  if (single === null) {
                    newLocation.save(function (err, l) {
                      if (err) return res.status(500).json({ message: err.message });
                      projectObj.location = l._id;
                      saveProject(projectObj);
                    });
                  } else {
                    projectObj.location = single._id;
                    saveProject(projectObj);
                  }
                });
                _context2.next = 16;
                break;

              case 12:
                _context2.prev = 12;
                _context2.t0 = _context2["catch"](6);

                console.log(_context2.t0);
                return _context2.abrupt("return", res.status(500).json({ message: "internal server error" }));

              case 16:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[6, 12]]);
      }));

      function newProject(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return newProject;
    }()

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @memberof Projects
     */

  }, {
    key: "find",
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
        var successRes, failRes, checkQuery, limit, page, skip, otherQueryParams, locationName;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                successRes = { success: true };
                failRes = { success: false };
                checkQuery = {};
                // limit result else return all

                limit = parseInt(req.query.limit ? req.query.limit : 0, 10);
                // pagination logic

                page = req.query.page ? req.query.page : 1;
                // page hopping logic

                skip = parseInt(page * limit - limit, 10);
                // let the remaining queries stay in the variable

                otherQueryParams = req.query;
                // delete thes because they will affect the look up in the db

                delete otherQueryParams.limit;
                delete otherQueryParams.page;

                locationName = otherQueryParams.location;

                delete otherQueryParams.location;

                if (req.tokenExists) {
                  checkQuery = _extends({}, otherQueryParams, { owner: req.userId });
                } else {
                  checkQuery = otherQueryParams;
                }

                Project.find(checkQuery).skip(skip).limit(limit).exec(function (err, projects) {
                  if (!req.tokenExists) projects = projects.filter(function (p) {
                    return p.activated === true;
                  });

                  if (err) {
                    failRes.message = err.message;
                    return res.status(400).json(failRes);
                  }
                  if (!projects) return res.json({
                    message: "No Projects Found"
                  });

                  if (locationName) {
                    successRes.projects = projects.filter(function (p) {
                      return p.location.name === locationName.replace(/%20/g, " ");
                    });
                  } else {
                    if (Boolean(checkQuery.owner)) {
                      projects = projects.map(function (p) {
                        p.isOwner = true;
                        return p;
                      });
                    }
                    successRes.projects = projects;
                  }

                  return res.json(successRes);
                });

              case 13:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function find(_x4, _x5) {
        return _ref3.apply(this, arguments);
      }

      return find;
    }()

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Projects
     */

  }, {
    key: "delete",
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
        var findProjectResponse, project, projectAvatarKey, locations, proceed, location_delete, response, _project;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return Project.findOne({ _id: req.params.id });

              case 2:
                findProjectResponse = _context4.sent;

                if (!(req.userId == findProjectResponse.owner._id)) {
                  _context4.next = 55;
                  break;
                }

                if (!(req.headers["permanent-delete"] === "true")) {
                  _context4.next = 39;
                  break;
                }

                _context4.prev = 5;
                _context4.next = 8;
                return Project.findOne({ _id: req.params.id });

              case 8:
                project = _context4.sent;
                projectAvatarKey = project.avatarKey;

                // find if multiple projects share a location

                _context4.next = 12;
                return Project.find({ location: project.location });

              case 12:
                locations = _context4.sent;
                proceed = true;
                // if only one then delete

                if (!(locations.length < 2)) {
                  _context4.next = 19;
                  break;
                }

                _context4.next = 17;
                return Location.deleteOne({
                  _id: project.location._id
                });

              case 17:
                location_delete = _context4.sent;

                if (location_delete.result.n === 0) {
                  proceed = false;
                }

              case 19:
                if (!(proceed === true)) {
                  _context4.next = 31;
                  break;
                }

                _context4.next = 22;
                return Project.deleteOne({ _id: req.params.id });

              case 22:
                response = _context4.sent;

                if (!(response.result.n === 1)) {
                  _context4.next = 28;
                  break;
                }

                helper.removeImgFBucket(projectAvatarKey);
                return _context4.abrupt("return", res.status(200).json({
                  success: true
                }));

              case 28:
                return _context4.abrupt("return", res.status(400).json({
                  success: false
                }));

              case 29:
                _context4.next = 32;
                break;

              case 31:
                return _context4.abrupt("return", res.status(400).json({
                  success: false
                }));

              case 32:
                _context4.next = 37;
                break;

              case 34:
                _context4.prev = 34;
                _context4.t0 = _context4["catch"](5);
                return _context4.abrupt("return", res.status(400).json({
                  message: _context4.t0.message
                }));

              case 37:
                _context4.next = 53;
                break;

              case 39:
                _context4.prev = 39;
                _context4.next = 42;
                return Project.updateOne({ _id: req.params.id }, { activated: !findProjectResponse.activated });

              case 42:
                _project = _context4.sent;

                if (!(_project.n === 1)) {
                  _context4.next = 47;
                  break;
                }

                return _context4.abrupt("return", res.status(200).json({
                  success: true
                }));

              case 47:
                return _context4.abrupt("return", res.status(400).json({
                  success: false
                }));

              case 48:
                _context4.next = 53;
                break;

              case 50:
                _context4.prev = 50;
                _context4.t1 = _context4["catch"](39);
                return _context4.abrupt("return", res.status(400).json({
                  message: _context4.t1.message,
                  success: false
                }));

              case 53:
                _context4.next = 56;
                break;

              case 55:
                return _context4.abrupt("return", res.status(400).json({
                  success: false,
                  message: "You don't have the rights"
                }));

              case 56:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[5, 34], [39, 50]]);
      }));

      function _delete(_x6, _x7) {
        return _ref4.apply(this, arguments);
      }

      return _delete;
    }()

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @memberof Projects
     */

  }, {
    key: "find_one",
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
        var project, proposals;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                _context5.next = 3;
                return Project.findOne({ _id: req.params.id });

              case 3:
                project = _context5.sent;
                _context5.next = 6;
                return Proposal.find({ project: project._id });

              case 6:
                proposals = _context5.sent;


                if (project.activated === true || project.owner._id == req.userId) {
                  project = project.toJSON();

                  project.isOwner = project.owner._id == req.userId;
                  project.proposals = proposals;
                  res.status(200).json(project);
                } else {
                  res.status(400).json({
                    message: "This project has been de-activated"
                  });
                }
                _context5.next = 13;
                break;

              case 10:
                _context5.prev = 10;
                _context5.t0 = _context5["catch"](0);

                res.status(400).json({
                  message: _context5.t0.message
                });

              case 13:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[0, 10]]);
      }));

      function find_one(_x8, _x9) {
        return _ref5.apply(this, arguments);
      }

      return find_one;
    }()

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Projects
     */

  }, {
    key: "add_stakeholder",
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
        var _this2 = this;

        var _ret;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.prev = 0;
                return _context7.delegateYield( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
                  var stakeholders, project, old_stakeholders, breakCode, count, STinfoID, foundMatch, foundPerson, new_stakeholders, saveResponse;
                  return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                      switch (_context6.prev = _context6.next) {
                        case 0:
                          stakeholders = req.body.stakeholders.map(function (s) {
                            return {
                              user: {
                                information: s
                              }
                            };
                          });
                          _context6.next = 3;
                          return Project.findOne({ _id: req.body.id });

                        case 3:
                          project = _context6.sent;


                          // let shouldAddContractor = await helper.shouldAddContractor(req.body.stakeholders, project.stakeholders);

                          old_stakeholders = project.stakeholders.map(function (s) {
                            return {
                              user: {
                                information: "" + s.user.information._id,
                                name: s.user.information.lastName + " " + s.user.information.firstName
                              }
                            };
                          });
                          breakCode = false;
                          count = 0;
                          STinfoID = void 0;
                          foundMatch = false;
                          foundPerson = {};

                          if (!(req.body.stakeholders.length > 0)) {
                            _context6.next = 24;
                            break;
                          }

                          while (breakCode === false) {

                            foundMatch = old_stakeholders.some(function (e) {
                              STinfoID = stakeholders[count].user.information;
                              foundPerson = e.user.name;
                              return e.user.information === STinfoID;
                            });

                            if (foundMatch === true) breakCode = true;
                            count = count + 1;

                            if (count === req.body.stakeholders.length) breakCode = true;
                          }

                          if (!(breakCode === true && foundMatch === true)) {
                            _context6.next = 14;
                            break;
                          }

                          return _context6.abrupt("return", {
                            v: res.status(401).json({
                              message: "Cannot add stakeholders because: \"This project has a connection with " + foundPerson + "\" "
                            })
                          });

                        case 14:

                          // if (shouldAddContractor) {

                          new_stakeholders = [].concat(_toConsumableArray(old_stakeholders), _toConsumableArray(stakeholders));
                          _context6.next = 17;
                          return Project.updateOne({ _id: req.body.id }, { $set: { stakeholders: new_stakeholders } });

                        case 17:
                          saveResponse = _context6.sent;

                          if (!(saveResponse.n === 1)) {
                            _context6.next = 22;
                            break;
                          }

                          _context6.next = 21;
                          return notify.notifyAddedStakeholders(req, req.body.stakeholders, project);

                        case 21:
                          return _context6.abrupt("return", {
                            v: res.status(200).json({
                              message: "Stakeholder Added Sucessfully"
                            })
                          });

                        case 22:
                          _context6.next = 25;
                          break;

                        case 24:
                          res.status(200).json({
                            message: "No Stakeholder Information Provided"
                          });

                        case 25:
                        case "end":
                          return _context6.stop();
                      }
                    }
                  }, _callee6, _this2);
                })(), "t0", 2);

              case 2:
                _ret = _context7.t0;

                if (!((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object")) {
                  _context7.next = 5;
                  break;
                }

                return _context7.abrupt("return", _ret.v);

              case 5:
                _context7.next = 11;
                break;

              case 7:
                _context7.prev = 7;
                _context7.t1 = _context7["catch"](0);

                console.log(_context7.t1);
                res.status(401).json({
                  message: "Stakeholder could not be added"
                });

              case 11:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[0, 7]]);
      }));

      function add_stakeholder(_x10, _x11) {
        return _ref6.apply(this, arguments);
      }

      return add_stakeholder;
    }()

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @memberof Projects
     * @returns {object}
     * @description returns the details of a project as seen by a contractor viewing 
     *              a project initiated byothers
     */

  }, {
    key: "contractorViewProjectDetails",
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
        var project, isProjectStakeholder, hasSubmitted, proposal, info;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.prev = 0;
                _context8.next = 3;
                return Project.findById(req.params.id);

              case 3:
                project = _context8.sent;

                if (project) {
                  _context8.next = 6;
                  break;
                }

                return _context8.abrupt("return", res.status(404).json({ message: "Project does not exist" }));

              case 6:

                // check if he a stakeholder on the project
                isProjectStakeholder = project.stakeholders.some(function (c) {
                  return c.user.information._id.toString() === req.userId && c.user.status === 'ACCEPTED';
                });

                // check if contractor has submitted a proposal already

                hasSubmitted = void 0;
                _context8.next = 10;
                return Proposal.findOne({ proposedBy: req.userId, project: req.params.id });

              case 10:
                proposal = _context8.sent;

                proposal ? hasSubmitted = true : hasSubmitted = false;
                info = {
                  image: project["project-avatar"],
                  title: project.name,
                  documents: project.documents.map(function (doc) {
                    return {
                      name: doc.name,
                      _id: doc._id,
                      filesize: doc.filesize || null,
                      doc: doc.doc,
                      filetype: doc.filetype,
                      project: doc.project,
                      createdAt: doc.createdAt,
                      updatedAt: doc.updatedAt
                    };
                  }),
                  isProjectStakeholder: isProjectStakeholder,
                  hasSubmitted: hasSubmitted,
                  status: project.status,
                  description: project.description,
                  goal: "" + ("$" + project.goal),
                  location: project.location.name,
                  initiated_by: {
                    id: project.owner._id,
                    name: project.owner.firstName + " " + project.owner.lastName,
                    user_type: helper.getRole(project.owner),
                    avatar: project.owner.profilePhoto
                  },
                  expected_duration: moment(project.startDate).format("DD MMM YY") + " - " + moment(project.endDate).format("DD MMM YY"),
                  sdgs: project.tags
                };


                if (hasSubmitted) {
                  info.proposalId = proposal._id;
                } else {
                  info.proposalId = null;
                }

                return _context8.abrupt("return", res.status(200).json(info));

              case 17:
                _context8.prev = 17;
                _context8.t0 = _context8["catch"](0);

                console.log(_context8.t0);
                return _context8.abrupt("return", res.status(501).json({
                  message: _context8.t0.message
                }));

              case 21:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[0, 17]]);
      }));

      function contractorViewProjectDetails(_x12, _x13) {
        return _ref7.apply(this, arguments);
      }

      return contractorViewProjectDetails;
    }()
  }]);

  return Projects;
}();

module.exports = { Projects: Projects };
//# sourceMappingURL=project.js.map