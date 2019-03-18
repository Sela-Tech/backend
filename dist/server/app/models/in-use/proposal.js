"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
var _ = require("underscore");

var mongoosePaginate = require('mongoose-paginate');

var Project = require('./project');

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
    usePushEach: true,
    autoIndex: process.env.NODE_ENV === "development",
    strict: process.env.NODE_ENV !== "development"
};

var proposalStructure = {
    proposalName: {
        type: String,
        required: true
    },
    project: {
        type: ObjectId,
        ref: "Project"
        // autopopulate: {
        //     select:
        //         "name activated _id, owner stakeholders "
        // }
    },

    milestones: [{
        type: ObjectId,
        ref: "Milestone",
        autopopulate: {
            select: "title createdBy completed _id"
        }
    }],
    proposedBy: {
        type: ObjectId,
        ref: "User", autopopulate: {
            select: "firstName lastName _id socket email profilePhoto"
        }
    },
    assignedTo: {
        type: ObjectId,
        ref: "User", autopopulate: {
            select: "firstName lastName _id socket email profilePhoto"
        },
        default: null
    },
    approved: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["IN_REVIEW", "DECLINED", "APPROVED", "REVERTED"],
        default: "IN_REVIEW"
    },
    comments: [{
        actor: {
            type: ObjectId,
            ref: "User",
            required: true,
            autopopulate: {
                select: "isFunder isContractor isEvaluator firstName lastName  _id  profilePhoto "
            }
        },
        comment: {
            type: String,
            default: ""
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }]
};

if (process.env.NODE_ENV === "development") {
    projectStructure.test = {
        type: Boolean,
        default: true
    };
}

var proposalSchema = new Schema(proposalStructure, schemaOptions);

proposalSchema.post('remove', function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(next) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return Project.update({}, { $pull: { proposals: { _id: undefined._id } } });

                    case 3:
                        _context.next = 8;
                        break;

                    case 5:
                        _context.prev = 5;
                        _context.t0 = _context["catch"](0);

                        next(_context.t0);

                    case 8:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[0, 5]]);
    }));

    return function (_x) {
        return _ref.apply(this, arguments);
    };
}());

proposalSchema.plugin(autoPopulate);
proposalSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Proposal", proposalSchema);
//# sourceMappingURL=proposal.js.map