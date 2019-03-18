"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require("dotenv").config();
var mongoose = require("mongoose");
var Transaction = mongoose.model("Transaction");
var Project = mongoose.model("Project");

var Web3 = require("web3");

var rinkebynet = process.env.REACT_APP_RINKEBYNET,
    ropstentest = process.env.REACT_APP_ROPSTENNET,
    kovannet = process.env.REACT_APP_KOVANNET,
    mainnet = process.env.REACT_APP_MAINNET;

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(mainnet));

exports.confirmTransaction = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var transaction;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            res.header("Access-Control-Allow-Origin", "*");

            _context2.prev = 1;
            _context2.next = 4;
            return web3.eth.getTransaction(req.body.hash);

          case 4:
            transaction = _context2.sent;

            // Get current block number
            web3.eth.getBlockNumber(function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err, num) {
                var confirmations, objToSave, check, saveRequest, project, projectTransactions, saveToProjectRequest;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.prev = 0;

                        if (!(num && transaction)) {
                          _context.next = 32;
                          break;
                        }

                        confirmations = num - transaction.blockNumber;

                        if (!(Number(confirmations) > 30)) {
                          _context.next = 30;
                          break;
                        }

                        objToSave = {
                          value: transaction.value / 1.0e18,
                          receiver: transaction.to,
                          sender: transaction.from,
                          hash: req.body.hash,
                          currency: "Ether",
                          blockNumber: transaction.blockNumber,
                          project: req.body.projectId,
                          memo: transaction.memo,
                          status: "CONFIRMED"
                        };
                        _context.next = 7;
                        return Transaction.findOne({
                          hash: req.body.hash,
                          project: req.body.projectId
                        });

                      case 7:
                        check = _context.sent;

                        if (!(Boolean(check) === false)) {
                          _context.next = 29;
                          break;
                        }

                        console.log("made it here");
                        _context.next = 12;
                        return new Transaction(objToSave).save();

                      case 12:
                        saveRequest = _context.sent;
                        _context.next = 15;
                        return Project.findOne({
                          _id: req.body.projectId
                        });

                      case 15:
                        project = _context.sent;
                        projectTransactions = project.toJSON();

                        projectTransactions = projectTransactions.transactions;

                        if (projectTransactions.length > 0) {
                          projectTransactions = projectTransactions.map(function (t) {
                            return t._id;
                          });
                        }
                        _context.next = 21;
                        return Project.updateOne({
                          _id: req.body.projectId
                        }, {
                          $set: {
                            transactions: [].concat(_toConsumableArray(projectTransactions), [saveRequest._id])
                          }
                        });

                      case 21:
                        saveToProjectRequest = _context.sent;

                        if (!Boolean(saveToProjectRequest.n)) {
                          _context.next = 26;
                          break;
                        }

                        return _context.abrupt("return", res.status(200).json({
                          success: true,
                          message: "This Transaction Has Been Confirmed"
                        }));

                      case 26:
                        return _context.abrupt("return", res.status(424).json({
                          success: false,
                          message: "This Transaction Has Not Been Confirmed"
                        }));

                      case 27:
                        _context.next = 30;
                        break;

                      case 29:
                        return _context.abrupt("return", res.status(409).json({
                          success: false,
                          message: "This Transaction Has Already Been Recorded"
                        }));

                      case 30:
                        _context.next = 33;
                        break;

                      case 32:
                        return _context.abrupt("return", res.status(403).json({
                          success: false,
                          message: "This Transaction Has Not Obtained Adequate Block Confirmations."
                        }));

                      case 33:
                        _context.next = 38;
                        break;

                      case 35:
                        _context.prev = 35;
                        _context.t0 = _context["catch"](0);
                        return _context.abrupt("return", res.json({
                          success: false,
                          message: _context.t0.message
                        }));

                      case 38:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee, undefined, [[0, 35]]);
              }));

              return function (_x3, _x4) {
                return _ref2.apply(this, arguments);
              };
            }());
            _context2.next = 11;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](1);
            return _context2.abrupt("return", res.json({
              success: false,
              message: _context2.t0.message
            }));

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[1, 8]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=crypto.js.map