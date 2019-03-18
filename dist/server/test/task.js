'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var chai = require('chai');
var chaiHttp = require('chai-http');
var supertest = require('supertest');
var app = require('../sela_app');

var _require = require('./helpers/mockData'),
    insertUserSeed = _require.insertUserSeed,
    validProject = _require.validProject,
    validTask = _require.validTask,
    insertProject = _require.insertProject,
    generateToken = _require.generateToken,
    invalidTask = _require.invalidTask,
    insertProjectSeed = _require.insertProjectSeed;

var mongoose = require("mongoose");
var User = mongoose.model("User");
var Organization = mongoose.model('Organization');
var Project = mongoose.model("Project");
var Task = mongoose.model("Task");

var expect = chai.expect;
var request = supertest(app);
var token = '';
var user = void 0;
var projects = void 0;
var project = void 0;
// let userProjectId;// get the authenticated test user project id
var taskId = void 0;
chai.use(chaiHttp);

describe('Task controller', function () {
  before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return insertUserSeed();

          case 2:
            user = _context.sent;


            //  generatee token for the seeded user
            token = generateToken(user);

            //  seed projects into the db collection
            _context.next = 6;
            return insertProjectSeed();

          case 6:
            projects = _context.sent;
            _context.next = 9;
            return insertProject(user._id);

          case 9:
            project = _context.sent;


            //    set the  projectId for the document to be inserted to the current inserted project._id
            validTask.projectId = project._id;

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  after(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return User.remove({});

          case 2:
            _context2.next = 4;
            return Organization.remove({});

          case 4:
            _context2.next = 6;
            return Project.remove({});

          case 6:
            _context2.next = 8;
            return Task.remove({});

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));

  describe('Add valid Task: /task', function () {
    it('should successfully add a new task to a project by the authenticated user', function (done) {
      request.post('/tasks').set({ authorization: token }).send(validTask).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.message).to.equal("Task Saved Successfully");
        done();
      });
    });
  });

  describe('Add invalid Task: /task', function () {
    it('should not be able to add a new task to a project by the authenticated user', function (done) {
      request.post('/tasks').set({ authorization: token }).send(invalidTask).expect(401).end(function (err, res) {
        if (err) return done(err);
        done();
      });
    });
  });

  describe('Get Tasks GET: /tasks ', function () {
    it('should get all tasks', function (done) {
      request.get('/tasks').set({ authorization: token }).send({ projectId: project._id }).expect(200).end(function (err, res) {
        if (err) return done(err);
        done();
      });
    });
  });
});
//# sourceMappingURL=task.js.map