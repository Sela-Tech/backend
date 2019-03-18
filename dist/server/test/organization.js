'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var chai = require('chai');
var chaiHttp = require('chai-http');
var supertest = require('supertest');
var app = require('../sela_app');

var _require = require('./helpers/mockData'),
    insertUserSeed = _require.insertUserSeed,
    valideOrganization = _require.valideOrganization,
    generateToken = _require.generateToken;

var mongoose = require("mongoose");
var User = mongoose.model("User");
var Organization = mongoose.model('Organization');

var expect = chai.expect;
var request = supertest(app);
var token = '';
var user = '';
chai.use(chaiHttp);

describe('organization controller', function () {
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

          case 4:
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
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));

  describe('Add Organization: /organizations', function () {
    it('should successfully add a new organization by the authenticated user', function (done) {
      request.post('/organizations').set({ authorization: token }).send(valideOrganization).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.message).to.equal("Organization Created Successfully");
        done();
      });
    });
    it('should not add a new organization if the user is not authenticated', function (done) {
      request.post('/organizations').set({ authorization: "" }).send(valideOrganization).expect(400).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.message).to.equal("jwt must be provided");
        done();
      });
    });
  });

  describe('Stakeholder: /organizations', function () {
    it('should successfully get organizations', function (done) {
      request.get('/organizations').set({ authorization: token }).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.length).to.equal(2);
        done();
      });
    });
  });
});
//# sourceMappingURL=organization.js.map