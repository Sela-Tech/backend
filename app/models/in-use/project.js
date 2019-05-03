var _ = require("underscore");
// var moment = require("moment");
var mongoose = require("mongoose");
var autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');

//import related models
const Save = require('./save_project');
const Notifications = require('./notification');
const Proposal = require('./proposal');
const Documents = require("./document");
const Evidence = require("./evidence");
const Milestone = require("./milestone");
const Task = require("./task");
const Transaction = require("./transaction");

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
  'project-avatar': {
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
  implementationBalance: {
    type: Number,
    default: null
  },
  observationBalance: {
    type: Number,
    default: null
  },
  issuingAccount: {
    type: String,
    default: null
  },
  distributionAccount: {
    type: String,
    default: null
  },
  pst: {
    type: String,
    default: null
  },
  raised: {
    type: Number,
    default: 0
  },
  percentFunded: {
    type: Number,
    default: 0
  },
  documents: [{ type: ObjectId, ref: "Document", autopopulate: true }],
  transactions: [{ type: ObjectId, ref: "Transaction", autopopulate: true }],
  proposals: [{ type: ObjectId, ref: "Proposal", autopopulate: { select: "proposalName milestones proposedBy assignedTo status" } }],
  stakeholders: [
    {
      user: {
        information: {
          type: ObjectId,
          ref: "User",
          required: true,
          autopopulate: {
            select:
              "isFunder isContractor isEvaluator reputationScore firstName lastName email _id organization profilePhoto "
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
    }
  ],
  owner: {
    type: ObjectId,
    ref: "User",
    autopopulate: {
      select:
        "organization firstName reputationScore lastName _id activated profilePhoto email socket isFunder isContractor isEvaluator"
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
  extra: [Schema.Types.Mixed],
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

  this.update(
    {},
    {
      $set: {
        updatedOn: new Date()
      }
    }
  );

  done();
});

ProjectSchema.post('remove', async function (next) {

  try {
    // all methods below are for development purpose, project never really gets deleted from the platform
    // comment all methods below before pushing to production
    await Save.remove({ project: this._id });
    await Proposal.remove({ project: this._id });
    await Notifications.remove({ project: this._id });
    await Documents.remove({ project: this._id });
    await Evidence.remove({ project: this._id });
    await Milestone.remove({ project: this._id });
    await Task.remove({ project: this._id });
    await Transaction.remove({ project: this._id });
    next();
  } catch (error) {
    // next(error);
    console.log(error)
  }
})

ProjectSchema.plugin(autoPopulate)
ProjectSchema.plugin(mongoosePaginate)
module.exports = mongoose.model("Project", ProjectSchema)
