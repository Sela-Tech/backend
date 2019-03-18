"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
var mongoosePaginate = require('mongoose-paginate');

// import related models
var Project = require("./project");

var docStructure = {
  project: {
    type: ObjectId,
    ref: "Project"
  },
  name: {
    type: String,
    required: true
  },
  filetype: {
    type: String,
    required: true
  },
  doc: {
    type: String,
    required: true
  },
  filesize: {
    type: String
  }
};

var docSchema = new Schema(docStructure, { timestamps: true });

docSchema.post('remove', function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(next) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return Project.update({}, { $pull: { documents: { '_id': undefined.id } } });

          case 3:

            next();
            _context.next = 9;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context["catch"](0);

            next(_context.t0);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 6]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());
docSchema.plugin(autoPopulate);
docSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Document", docSchema);
//# sourceMappingURL=document.js.map