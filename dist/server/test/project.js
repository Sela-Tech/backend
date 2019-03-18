'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var chai = require('chai');
var chaiHttp = require('chai-http');
var supertest = require('supertest');
var app = require('../sela_app');

var _require = require('./helpers/mockData'),
    insertUserSeed = _require.insertUserSeed,
    validProject = _require.validProject,
    validStakeholders = _require.validStakeholders,
    validUser = _require.validUser,
    generateToken = _require.generateToken,
    insertProjectSeed = _require.insertProjectSeed,
    invalidStakeholders = _require.invalidStakeholders;

var mongoose = require("mongoose");
var User = mongoose.model("User");
var Organization = mongoose.model('Organization');
var Project = mongoose.model("Project");

var expect = chai.expect;
var request = supertest(app);
var token = '';
var user = '';
var stakeholder = '';
var projects = '';
var userProjectId = ''; // get the authenticated test user project id
chai.use(chaiHttp);

describe('project controller', function () {
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


            stakeholder = validStakeholders;
            stakeholder.id = projects[0]._id;
            stakeholder.stakeholders[0] = user._id;

          case 10:
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
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));

  describe('Add Project: /project', function () {
    it('should successfully add a new project by the authenticated user', function (done) {
      request.post('/project').set({ authorization: token }).send(validProject).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.success).to.equal(true);
        done();
      });
    });
  });

  describe('Stakeholder: /project/stakeholder', function () {
    it('should successfully add stakeholder(s) to a project', function (done) {
      request.post('/project/stakeholder').set({ authorization: token }).send(stakeholder).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.message).to.equal("Stakeholder Added Sucessfully");
        done();
      });
    });

    it('should reject adding duplicate stakeholder to a project', function (done) {
      request.post('/project/stakeholder').set({ authorization: token }).send(stakeholder).expect(401).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.message).to.equal('Cannot add stakeholders because: "This project has a connection with ' + user.lastName + ' ' + user.firstName + '" ');
        done();
      });
    });

    it('should reject adding stakeholders with no stakeholder information', function (done) {
      request.post('/project/stakeholder').set({ authorization: token }).send(invalidStakeholders).expect(401).end(function (err, res) {
        if (err) return done(err);
        // expect(res.body.message).to.equal(`No Stakeholder Information Provided`);
        done();
      });
    });
  });

  describe('Get Project(s) GET: /projects ', function () {
    it('should get all projects', function (done) {
      request.get('/projects').set({ authorization: token }).expect(200).end(function (err, res) {
        if (err) return done(err);
        userProjectId = res.body.projects[0]._id;
        expect(res.body.projects.length).to.equal(1);
        done();
      });
    });

    it('should get a single project', function (done) {
      request.get('/project/' + userProjectId).set({ authorization: token }).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body._id).to.equal(userProjectId);
        done();
      });
    });
  });

  describe('Delete project DELETE: /project/:id', function () {
    it('it should toggle project activated if req.header["permanent-delete"] !== true', function (done) {
      request.delete('/project/' + userProjectId).set({ authorization: token }).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.success).to.equal(true);
        done();
      });
    });

    it('it should delete project if req.header["permanent-delete"] === true', function (done) {
      request.delete('/project/' + userProjectId).set({ authorization: token, 'permanent-delete': 'true' }).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.success).to.equal(true);
        done();
      });
    });
  });
});
//# sourceMappingURL=project.js.map