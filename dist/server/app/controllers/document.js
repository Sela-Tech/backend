"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require("dotenv").config();
var mongoose = require("mongoose"),
    Document = mongoose.model("Document"),
    Project = mongoose.model("Project");

var _require = require('accesscontrol'),
    AccessControl = _require.AccessControl;

var grantsObject = require('../helper/access_control');

var Helper = require('../helper/helper');

var helper = new Helper();

var ac = new AccessControl(grantsObject);

exports.new = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var docObj, saveDocument, project, collectionOfDocIds, updateRequest;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            docObj = {
              name: req.body.name,
              filetype: req.body.filetype,
              doc: req.body.doc,
              project: req.body.projectId,
              filesize: req.body.filesize

            };
            _context.next = 4;
            return new Document(docObj).save();

          case 4:
            saveDocument = _context.sent;

            if (!Boolean(saveDocument)) {
              _context.next = 29;
              break;
            }

            _context.next = 8;
            return Project.findOne({
              _id: req.body.projectId,
              owner: req.userId
            });

          case 8:
            project = _context.sent;

            if (!(project !== null)) {
              _context.next = 26;
              break;
            }

            console.log(project);

            console.log("fetched project we want document to belong to");

            project = project.toJSON();
            collectionOfDocIds = project.documents;


            if (collectionOfDocIds.length > 0) {
              collectionOfDocIds = collectionOfDocIds.map(function (t) {
                return t._id;
              });
            }

            // console.log(" document belonging to project", collectionOfDocIds);

            // let check = collectionOfDocIds.find(elem => {
            //   return elem == saveDocument._id;
            // });

            // console.log("check if document id exists already", { check });

            // if (Boolean(check) === false) {
            _context.next = 17;
            return Project.update({ _id: req.body.projectId, owner: req.userId }, {
              $set: {
                documents: [].concat(_toConsumableArray(collectionOfDocIds), [saveDocument._id])
              }
            });

          case 17:
            updateRequest = _context.sent;


            console.log("what i expect to update", {
              documents: [].concat(_toConsumableArray(collectionOfDocIds), [saveDocument._id])
            });

            if (!Boolean(updateRequest.n)) {
              _context.next = 23;
              break;
            }

            return _context.abrupt("return", res.status(200).json({ message: "Document Saved Successfully" }));

          case 23:
            return _context.abrupt("return", res.status(401).json({
              message: "Could Not Add New Document"
            }));

          case 24:
            _context.next = 27;
            break;

          case 26:
            return _context.abrupt("return", res.status(401).json({ message: "This Project doesn't exist" }));

          case 27:
            _context.next = 30;
            break;

          case 29:
            return _context.abrupt("return", res.status(200).json({
              message: "Failed to save Document"
            }));

          case 30:
            _context.next = 35;
            break;

          case 32:
            _context.prev = 32;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", res.status(401).json({
              message: _context.t0.message
            }));

          case 35:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 32]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.findAll = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var projectId, documents;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            projectId = req.body.projectId;

            // const role = helper.getRole(req, res);
            // const permission = ac.can(role).readAny('document');

            // if (permission.granted) {

            _context2.prev = 1;
            _context2.next = 4;
            return Document.find({ project: projectId });

          case 4:
            documents = _context2.sent;

            if (!(Boolean(documents) && Boolean(documents.length > 0))) {
              _context2.next = 9;
              break;
            }

            return _context2.abrupt("return", res.status(200).json(documents));

          case 9:
            return _context2.abrupt("return", res.status(404).json({
              message: "No Documents Found"
            }));

          case 10:
            _context2.next = 15;
            break;

          case 12:
            _context2.prev = 12;
            _context2.t0 = _context2["catch"](1);
            return _context2.abrupt("return", res.status(401).json({
              message: _context2.t0.message
            }));

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[1, 12]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

exports.find = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var findReq;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return Document.findOne({ _id: req.params.id });

          case 3:
            findReq = _context3.sent;

            findReq = findReq.toJSON();

            if (!Boolean(findReq)) {
              _context3.next = 9;
              break;
            }

            return _context3.abrupt("return", res.status(200).json({
              success: true,
              info: findReq
            }));

          case 9:
            return _context3.abrupt("return", res.status(404).json({
              message: "No Document Found",
              success: false
            }));

          case 10:
            _context3.next = 15;
            break;

          case 12:
            _context3.prev = 12;
            _context3.t0 = _context3["catch"](0);

            res.status(401).json({
              message: _context3.t0.message
            });

          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, undefined, [[0, 12]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
//# sourceMappingURL=document.js.map