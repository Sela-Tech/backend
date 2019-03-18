'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var chai = require('chai');
var chaiHttp = require('chai-http');
var supertest = require('supertest');
var app = require('../sela_app');

var _require = require('./helpers/mockData'),
    insertUserSeed = _require.insertUserSeed,
    validProject = _require.validProject,
    generateToken = _require.generateToken,
    insertProject = _require.insertProject,
    validTrnInfo = _require.validTrnInfo,
    invalidTrnInfo = _require.invalidTrnInfo;

var mongoose = require("mongoose");
var User = mongoose.model("User");
var Organization = mongoose.model('Organization');
var Project = mongoose.model("Project");
var Loc = mongoose.model("Location");
var Transaction = mongoose.model("Transaction");

var expect = chai.expect;
var request = supertest(app);
var token = '';
var user = '';
var project = '';
chai.use(chaiHttp);

describe('Transaction(crypto) controller', function () {
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

                        //    create project for the user
                        _context.next = 6;
                        return insertProject(user._id);

                    case 6:
                        project = _context.sent;


                        // set the validTransaction projectId to the just inserted projectId
                        validTrnInfo.projectId = project._id;

                    case 8:
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
                        return Loc.remove({});

                    case 8:
                        _context2.next = 10;
                        return Transaction.remove({});

                    case 10:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    })));

    describe('Confirm Transaction: /trn', function () {
        it('should successfully confirm a transaction', function (done) {
            request.post('/trn').set({ authorization: token }).send(validTrnInfo).expect(200).end(function (err, res) {
                if (err) return done(err);
                expect(res.body.message).to.equal("This Transaction Has Been Confirmed");
                done();
            });
        });

        it('should reject transaction with existing hash', function (done) {
            request.post('/trn').set({ authorization: token }).send(validTrnInfo).expect(409).end(function (err, res) {
                if (err) return done(err);
                expect(res.body.message).to.equal("This Transaction Has Already Been Recorded");
                done();
            });
        });

        it('should reject transaction with confirmation less than 30', function (done) {
            request.post('/trn').set({ authorization: token }).send(invalidTrnInfo) //update invalidTrnInfo hash to a recent block hash from 
            .expect(403) //ethersacn.io to obtain a transaction less than 3o confirmations
            .end(function (err, res) {
                //before running this script
                if (err) return done(err);
                expect(res.body.message).to.equal("This Transaction Has Not Obtained Adequate Block Confirmations.");
                done();
            });
        });
    });
});
//# sourceMappingURL=transaction.js.map