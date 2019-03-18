"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _ = require("underscore");
// var moment = require("moment");
var mongoose = require("mongoose");
var autoPopulate = require("mongoose-autopopulate");
var mongoosePaginate = require('mongoose-paginate');

//import related models
var Save = require('./save_project');
var Notifications = require('./notification');
var Proposal = require('./proposal');
var Documents = require("./document");
var Evidence = require("./evidence");
var Milestone = require("./milestone");
var Task = require("./task");
var Transaction = require("./transaction");

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var schemaOptions = {
  minimize: false,
  id: false,
  toJSON: {
    getters: true,
    virtuals: true,
    minimize: false,
    versionKey: false,
    retainKeyOrder: true
  },
  toObject: {
    getters: true,
    virtuals: true,
    minimize: false,
    versionKey: false,
    retainKeyOrder: true
  },
  usePushEach: true,
  autoIndex: process.env.NODE_ENV === "development",
  strict: process.env.NODE_ENV !== "development"
};

var projectStructure = {
  name: {
    type: String,
    required: true,
    max: 100
  },
  activated: {
    type: Boolean,
    default: true
  },
  tags: {
    type: Array,
    default: []
  },
  description: {
    type: String,
    required: true,
    max: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  "project-avatar": {
    type: String,
    default: "http://placehold.it/200"
  },
  avatarKey: {
    type: String
  },
  endDate: {
    type: Date,
    default: null
  },
  location: {
    type: ObjectId,
    ref: "Location",
    autopopulate: { select: "name lat lng _id" }
  },
  goal: {
    type: Number,
    default: 0
  },
  implementationBudget: {
    type: Number,
    default: 0
  },
  observationBudget: {
    type: Number,
    default: 0
  },
  raised: {
    type: Number,
    default: 0
  },
  documents: [{ type: ObjectId, ref: "Document", autopopulate: true }],
  transactions: [{ type: ObjectId, ref: "Transaction", autopopulate: true }],
  proposals: [{ type: ObjectId, ref: "Proposal", autopopulate: { select: "proposalName milestones proposedBy assignedTo status" } }],
  stakeholders: [{
    user: {
      information: {
        type: ObjectId,
        ref: "User",
        required: true,
        autopopulate: {
          select: "isFunder isContractor isEvaluator reputationScore firstName lastName email _id organization profilePhoto "
        }
      },
      agreed: {
        type: Boolean,
        default: false
      },
      status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
        default: "PENDING"
      }
    }
  }],
  owner: {
    type: ObjectId,
    ref: "User",
    autopopulate: {
      select: "organization firstName reputationScore lastName _id activated profilePhoto email socket isFunder isContractor isEvaluator"
    }
  },
  status: {
    type: String,
    enum: ["PROPOSED", "DORMANT", "STARTED", "TERMINATED", "COMPLETED"],
    default: "PROPOSED"
  },
  numOfevaluators: {
    type: Number,
    default: 20
  },
  createdOn: {
    type: Date,
    default: Date.now()
  },
  updatedOn: {
    type: Date,
    default: Date.now()
  }
};

if (process.env.NODE_ENV === "development") {
  projectStructure.test = {
    type: Boolean,
    default: true
  };
}

var projectSchemaOptions = _.extend({}, schemaOptions, {
  collection: "projects"
});

var ProjectSchema = new Schema(projectStructure, projectSchemaOptions);

ProjectSchema.pre("save", true, function (next, done) {
  next();

  this.updatedOn = new Date();

  done();
});

ProjectSchema.pre("update", true, function (next, done) {
  next();

  this.update({}, {
    $set: {
      updatedOn: new Date()
    }
  });

  done();
});

ProjectSchema.post('remove', function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(next) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return Save.remove({ project: this._id });

          case 3:
            _context.next = 5;
            return Proposal.remove({ project: this._id });

          case 5:
            _context.next = 7;
            return Notifications.remove({ project: this._id });

          case 7:
            _context.next = 9;
            return Documents.remove({ project: this._id });

          case 9:
            _context.next = 11;
            return Evidence.remove({ project: this._id });

          case 11:
            _context.next = 13;
            return Milestone.remove({ project: this._id });

          case 13:
            _context.next = 15;
            return Task.remove({ project: this._id });

          case 15:
            _context.next = 17;
            return Transaction.remove({ project: this._id });

          case 17:
            next();
            _context.next = 23;
            break;

          case 20:
            _context.prev = 20;
            _context.t0 = _context["catch"](0);

            // next(error);
            console.log(_context.t0);

          case 23:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 20]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

ProjectSchema.plugin(autoPopulate);
ProjectSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Project", ProjectSchema);
//# sourceMappingURL=project.js.map