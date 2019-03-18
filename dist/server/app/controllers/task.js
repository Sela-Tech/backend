"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("dotenv").config();
var mongoose = require("mongoose"),
    Task = mongoose.model("Task"),
    Project = mongoose.model("Project");
var validate = require('../../middleware/validate');

var Tasks = function () {
  function Tasks() {
    _classCallCheck(this, Tasks);
  }

  _createClass(Tasks, null, [{
    key: "newTask",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
        var userRole, successRes, failRes, errors, taskObj, project, assignedTo, task;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                userRole = req.roles;
                successRes = { success: true };
                failRes = { success: false };


                validate.validateAddTask(req, res);
                errors = req.validationErrors();

                if (!errors) {
                  _context.next = 7;
                  break;
                }

                return _context.abrupt("return", res.status(400).json({
                  message: errors
                }));

              case 7:
                _context.prev = 7;
                taskObj = {
                  name: req.body.name,
                  description: req.body.description,
                  dueDate: req.body.dueDate,
                  project: req.body.projectId,
                  estimatedCost: req.body.estimatedCost,
                  createdBy: req.userId
                };

                // check of project exist

                _context.next = 11;
                return Project.findById(taskObj.project);

              case 11:
                project = _context.sent;

                if (project) {
                  _context.next = 14;
                  break;
                }

                return _context.abrupt("return", res.status(404).json({ message: 'Project Not Found.' }));

              case 14:

                // let available_contractor;
                assignedTo = void 0;

                // check available contractor
                // if(project.stakeholders.length<1){
                //   return res.status(403).json({ message: "Become a stakeholder by joining the project" })
                // }

                // available_contractor= project.stakeholders.filter(s=>s.user.information.isContractor===true);


                // if(available_contractor.length<1){
                //     return res.status(404).json({message:'No contractor has been added to this project'});
                // }

                // check if who is adding the task is a contractor
                // check if he is part of the project
                // let isProjectContractor = available_contractor.some(c=>c.user.information._id.toString() === req.userId && c.user.status==='ACCEPTED' );
                // if(userRole.includes('isContractor') && !isProjectContractor){
                //   return res.status(401).json({message:'Sorry, You are not a contractor on this project'})
                // }else 

                if (!userRole.includes('isContractor')) {
                  _context.next = 19;
                  break;
                }

                assignedTo = req.userId;
                _context.next = 20;
                break;

              case 19:
                return _context.abrupt("return", res.status(403).json({ message: 'You are not allowed to perform this operation' }));

              case 20:

                taskObj.assignedTo = assignedTo;
                taskObj.status = 'ASSIGNED';

                _context.next = 24;
                return new Task(taskObj).save();

              case 24:
                task = _context.sent;

                if (!task) {
                  _context.next = 29;
                  break;
                }

                successRes.message = "Task has been added";
                successRes.task = task;
                return _context.abrupt("return", res.status(201).json(successRes));

              case 29:
                _context.next = 35;
                break;

              case 31:
                _context.prev = 31;
                _context.t0 = _context["catch"](7);

                console.log(_context.t0);
                return _context.abrupt("return", res.status(501).json({
                  message: _context.t0.message
                }));

              case 35:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[7, 31]]);
      }));

      function newTask(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return newTask;
    }()

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns {object} returns an array objects(tasks)
     * @memberof Tasks
     */

  }, {
    key: "singleTask",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
        var task;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return Task.findById(req.params.id);

              case 3:
                task = _context2.sent;

                if (!task) {
                  _context2.next = 6;
                  break;
                }

                return _context2.abrupt("return", res.status(200).json({ task: task }));

              case 6:
                return _context2.abrupt("return", res.status(404).json({ message: "Task Not Found" }));

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](0);

                console.log(_context2.t0);
                return _context2.abrupt("return", res.status(501).json({
                  message: _context2.t0.message
                }));

              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 9]]);
      }));

      function singleTask(_x3, _x4) {
        return _ref2.apply(this, arguments);
      }

      return singleTask;
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
    key: "allTasks",
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
        var projectId, tasks;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                projectId = req.query.project;
                _context3.prev = 1;
                _context3.next = 4;
                return Task.find({ project: projectId });

              case 4:
                tasks = _context3.sent;

                if (!(Boolean(tasks) && Boolean(tasks.length > 0))) {
                  _context3.next = 9;
                  break;
                }

                return _context3.abrupt("return", res.status(200).json(tasks));

              case 9:
                return _context3.abrupt("return", res.status(200).json({
                  tasks: []
                }));

              case 10:
                _context3.next = 15;
                break;

              case 12:
                _context3.prev = 12;
                _context3.t0 = _context3["catch"](1);
                return _context3.abrupt("return", res.status(401).json({
                  message: _context3.t0.message
                }));

              case 15:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[1, 12]]);
      }));

      function allTasks(_x5, _x6) {
        return _ref3.apply(this, arguments);
      }

      return allTasks;
    }()

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns {object} a message confirming task succussfully updated
     * @memberof Tasks
     * @description a method for updating a task created by the contractor.
     */

  }, {
    key: "updateTask",
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
        var id, errors, task, updateObj, updatedTask;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                id = req.params.id;

                validate.validateAddTask(req, res);
                errors = req.validationErrors();

                if (!errors) {
                  _context4.next = 5;
                  break;
                }

                return _context4.abrupt("return", res.status(400).json({
                  message: errors
                }));

              case 5:
                _context4.prev = 5;
                _context4.next = 8;
                return Task.findOne({ _id: id, createdBy: req.userId });

              case 8:
                task = _context4.sent;

                if (task) {
                  _context4.next = 11;
                  break;
                }

                return _context4.abrupt("return", res.status(404).json({ message: "Task Not Found" }));

              case 11:
                updateObj = req.body;
                _context4.next = 14;
                return Task.update({ _id: id }, { $set: updateObj });

              case 14:
                updatedTask = _context4.sent;

                if (!updatedTask) {
                  _context4.next = 17;
                  break;
                }

                return _context4.abrupt("return", res.status(200).json({ message: 'Task has been updated.' }));

              case 17:
                _context4.next = 22;
                break;

              case 19:
                _context4.prev = 19;
                _context4.t0 = _context4["catch"](5);
                return _context4.abrupt("return", res.status(401).json({
                  message: _context4.t0.message
                }));

              case 22:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[5, 19]]);
      }));

      function updateTask(_x7, _x8) {
        return _ref4.apply(this, arguments);
      }

      return updateTask;
    }()
  }, {
    key: "deleteTask",
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

      function deleteTask(_x9, _x10) {
        return _ref5.apply(this, arguments);
      }

      return deleteTask;
    }()
  }]);

  return Tasks;
}();

module.exports = { Tasks: Tasks };
//# sourceMappingURL=task.js.map