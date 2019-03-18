"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require("dotenv").config();
var mongoose = require("mongoose"),
    Upload = mongoose.model("Upload");

exports.new = function (req, res) {
  var successRes = { success: true };
  var failRes = { success: false };
  var uploadObj = req.body;

  var newProject = new Upload(uploadObj);
  newProject.save(function (projErr) {
    if (projErr) {
      failRes.message = projErr.name + ": " + projErr.message;
      return res.status(500).json(failRes);
    }
    return res.status(200).json(successRes);
  });
};

exports.find = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var successRes, failRes, checkQuery, limit, page, skip, otherQueryParams;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
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

            checkQuery = req.tokenExists ? { otherQueryParams: otherQueryParams, owner: req.userId } : otherQueryParams;

            Upload.find(checkQuery).skip(skip).limit(limit).exec(function (err, uploads) {
              if (err) {
                failRes.message = err.message;
                return res.status(400).json(failRes);
              }
              if (!uploads) return res.json({
                message: "No Uploads Found"
              });

              successRes.uploads = uploads;
              return res.json(successRes);
            });

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=uploads.js.map