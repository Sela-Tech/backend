"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var mongoose = require("mongoose");
var autoPopulate = require("mongoose-autopopulate");
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

// import related models

var Project = require("./project");
var Milestone = require("./milestone");
var Evidence = require("./evidence");

var taskStructure = {
  name: {
    type: String,
    required: true,
    max: 100
  },
  description: {
    type: String,
    required: true,
    max: 100
  },
  // TODO: Should the due date be required when creating a task?
  project: {
    type: ObjectId,
    ref: "Project",
    required: true
  }, // reference to associated project
  dueDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ["UNASSIGNED", "ASSIGNED", "STARTED", "TERMINATED", "COMPLETED"],
    default: "UNASSIGNED"
  },
  createdBy: {
    type: ObjectId,
    ref: "User",
    autopopulate: {
      select: "isFunder isContractor isEvaluator  firstName lastName email"
    }
  },
  assignedTo: {
    type: ObjectId,
    ref: "User",
    default: null,
    autopopulate: {
      select: "isFunder isContractor isEvaluator  firstName lastName email _id"
    }
  },
  // evaluators: [{
  //   type: ObjectId,
  //   ref: "User",
  //   default: null
  // }],
  // completedBy: {
  //   type: ObjectId,
  //   ref: "User",
  //   default: null
  // },

  // agentEvaluations: [
  //   {
  //     type: ObjectId,
  //     ref: "Evaluation",
  //     default: null
  //   }
  // ],
  // contractorEvaluations: [
  //   {
  //     text: {
  //       type: String,
  //       default: null
  //     },
  //     isCompleted: {
  //       type: Boolean,
  //       default: false
  //     },
  //     proof: {
  //       type: String,
  //       default: ''
  //     }
  //   }
  // ],
  estimatedCost: {
    type: Number,
    default: 0
  },
  isInMilestone: {
    type: Boolean,
    default: false
  }

};

var schemaOptions = {
  collection: "tasks",
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
  timestamps: true,
  autoIndex: process.env.NODE_ENV === "development",
  strict: process.env.NODE_ENV !== "development"
};

if (process.env.NODE_ENV === "development") {
  taskStructure.test = {
    type: Boolean,
    default: true
  };
}

var TaskSchema = new Schema(taskStructure, schemaOptions);

TaskSchema.post('remove', function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return Evidence.remove({ task: undefined._id });

          case 3:
            _context.next = 5;
            return Milestone.update({}, { $pull: { tasks: { _id: undefined._id } } });

          case 5:
            _context.next = 10;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);

            next(_context.t0);

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 7]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

// TaskSchema.pre("save", true, function (next, done) {
//   next();

//   this.updatedOn = new Date();

//   done();
// });

// TaskSchema.pre("update", true, function (next, done) {
//   next();

//   this.update(
//     {},
//     {
//       $set: {
//         updatedOn: new Date()
//       }
//     }
//   );

//   done();
// });
TaskSchema.plugin(mongoosePaginate);
TaskSchema.plugin(autoPopulate);
module.exports = mongoose.model("Task", TaskSchema);
//# sourceMappingURL=task.js.map