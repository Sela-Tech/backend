'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var chai = require('chai');
var chaiHttp = require('chai-http');
var supertest = require('supertest');
var app = require('../sela_app');

var _require = require('./helpers/mockData'),
    insertUserSeed = _require.insertUserSeed,
    userWithExistingEmail = _require.userWithExistingEmail,
    validUser = _require.validUser,
    validUserUpdateInfo = _require.validUserUpdateInfo,
    userWithWrongEmail = _require.userWithWrongEmail,
    invalidUserUpdateInfo = _require.invalidUserUpdateInfo,
    userWithWrongPhone = _require.userWithWrongPhone,
    invalidUserUpdateInfo2 = _require.invalidUserUpdateInfo2,
    userWithWrongPassword = _require.userWithWrongPassword,
    userWithExistingPhone = _require.userWithExistingPhone,
    validUser2 = _require.validUser2,
    generateToken = _require.generateToken;

var mongoose = require("mongoose");
var User = mongoose.model("User");
var Organization = mongoose.model('Organization');

var expect = chai.expect;
var request = supertest(app);
var token = '';
var user = '';
chai.use(chaiHttp);

describe('user Controller', function () {
  before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return insertUserSeed();

          case 2:
            user = _context.sent;

            validUserUpdateInfo.email = user.email;
            token = generateToken(user);

          case 5:
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

  describe('Create User POST: /register', function () {
    it('should successfully create a new user', function (done) {
      request.post('/register').send(validUser).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.firstName).to.equal(validUser.firstName);
        done();
      });
    });

    it('should successfully create a new user', function (done) {
      request.post('/register').send(validUser2).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.firstName).to.equal(validUser2.firstName);
        done();
      });
    });
  });

  describe('Create User Validation POST: /register', function () {
    it('should return 401 on duplicate email', function (done) {
      request.post('/register').send(userWithExistingEmail).expect(401).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.message).to.equal('Sela already has an account for a user with e-mail address: ' + userWithExistingEmail.email + '. Please try another e-mail address');
        done();
      });
    });
    it('should return 401 if phone number already exist', function (done) {
      request.post('/register').send(userWithExistingPhone).expect(401).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.message).to.equal('Sela already has an account for a user with phone number: ' + validUser.phone + '. Please try another phone number');
        done();
      });
    });
  });

  describe('Signin user POST: /login', function () {
    it('should successfully log in a registered user', function (done) {
      request.post('/login').send(validUser).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.email).to.equal(validUser.email);
        done();
      });
    });
    it('should return a 401 error if wrong email', function (done) {
      request.post('/login').send(userWithWrongEmail).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.message).to.equal('Sela does not have an account with those user credentials. Please try another email/phone number.');
        expect(res.status).to.equal(401);
        done();
      });
    });
    it('should return a 401 error if wrong phone', function (done) {
      request.post('/login').send(userWithWrongPhone).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.message).to.equal('Sela does not have an account with those user credentials. Please try another email/phone number.');
        expect(res.status).to.equal(401);
        done();
      });
    });
    it('should return a 401 error if wrong password', function (done) {
      request.post('/login').send(userWithWrongPassword).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.message).to.equal('That is the wrong password for this account. Please try again');
        expect(res.status).to.equal(401);
        done();
      });
    });
    // it('should return a 401 for an account that is not approved', (done) => {
    //   request
    //     .post('/login')
    //     .send(validUser2)
    //     .end((err, res) => {
    //       if (err) return done(err);
    //       // expect(res.body.message)
    //       //   .to
    //       //   .equal('Your account has not been activated.');
    //       expect(res.status).to.equal(401);
    //       done();
    //     });
    // });
  });

  describe('GET USERS GET:/users', function () {
    it('should be able to list all users excluding the authenticated user', function (done) {
      request.get('/users').set({ authorization: token }).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.length).to.equal(2);
        done();
      });
    });
  });

  describe('UPDATE USER INFO:/update', function () {
    it('should update the information of the authenticated user', function (done) {
      request.post('/update').set({ authorization: token }).send(validUserUpdateInfo).expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.firstName).to.equal(validUserUpdateInfo.firstName);
        done();
      });
    });

    it('should fail with status code 401 if current password is incorrect', function (done) {
      request.post('/update').set({ authorization: token }).send(invalidUserUpdateInfo).expect(401).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.message).to.equal("That is the wrong password for this account. Please try again");
        done();
      });
    });

    it('should fail with status code 401 with invalid change password details', function (done) {
      request.post('/update').set({ authorization: token }).send(invalidUserUpdateInfo2).expect(401).end(function (err, res) {
        if (err) return done(err);
        expect(res.body.message).to.equal("Passwords don't match");
        done();
      });
    });
  });

  // describe('GET STAKEHOLDER INFO:/users/i', ()=>{
  //   it('should retrieve the information of the stakeholder', (done)=>{
  //     request
  //     .get('/users/i')
  //     .set({authorization:token})
  //     .send({id:user._id})
  //     .expect(200)
  //     .end((err, res) => {
  //       if (err) return done(err);
  //       // expect(res.body.length).to.equal(2);
  //       done();
  //     });
  //   });

  // });
});
//# sourceMappingURL=user.js.map