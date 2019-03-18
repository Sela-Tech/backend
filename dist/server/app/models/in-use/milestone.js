"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
var _ = require("underscore");
var mongoosePaginate = require('mongoose-paginate');

//import related models
var Project = require('./project');
var Proposal = require('./proposal');

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
    timestamps: true,
    autoIndex: process.env.NODE_ENV === "development",
    strict: process.env.NODE_ENV !== "development"
};

var milestoneStructure = {
    project: {
        type: ObjectId,
        ref: "Project"
        // autopopulate: {
        //     select:
        //         "name activated _id owner"
        // }
    },

    tasks: [{
        type: ObjectId,
        ref: "Task",
        autopopulate: {
            select: " name description assignedTo status estimatedCost _id createdOn updatedOn dueDate"
        }
    }],
    title: {
        type: String,
        required: true,
        unique: true
    },

    createdBy: {
        type: ObjectId,
        ref: "User",
        default: null,
        autopopulate: {
            select: "isFunder isContractor isEvaluator firstName lastName email _id"
        }
    },
    completed: {
        type: Boolean,
        default: false
    },
    estimatedCost: {
        type: Number,
        default: 0
    }
};

if (process.env.NODE_ENV === "development") {
    projectStructure.test = {
        type: Boolean,
        default: true
    };
}

var milestoneSchema = new Schema(milestoneStructure, schemaOptions);

milestoneSchema.post('remove', function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(next) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return Project.update({}, { $pull: { milestones: { _id: undefined._id } } });

                    case 3:
                        _context.next = 5;
                        return Proposal.update({}, { $pull: { milestones: { _id: undefined._id } } });

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

    return function (_x) {
        return _ref.apply(this, arguments);
    };
}());
milestoneSchema.plugin(autoPopulate);
milestoneSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Milestone", milestoneSchema);
//# sourceMappingURL=milestone.js.map