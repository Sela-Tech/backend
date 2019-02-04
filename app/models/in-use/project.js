var _ = require("underscore");
// var moment = require("moment");
var mongoose = require("mongoose");
var autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate=require('mongoose-paginate'); 

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
    default:"http://placehold.it/50"
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
  raised: {
    type: Number,
    default: 0
  },
  tasks: [{ type: ObjectId, ref: "Task", autopopulate: true }],
  documents: [{ type: ObjectId, ref: "Document", autopopulate: true }],
  transactions: [{ type: ObjectId, ref: "Transaction", autopopulate: true }],
  milestones: [{ type: ObjectId, ref: "Milestone", autopopulate: true }],
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
        "organization firstName reputationScore lastName _id activated profilePhoto email, socket"
    }
  },
  status: {
    type: String,
    enum: ["DORMANT", "ACCEPTED", "STARTED", "TERMINATED", "COMPLETED"],
    default: "DORMANT"
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

ProjectSchema.post('remove', function(next){
  this.model('Save').remove({ project: this._id }, next);
  this.model('Notification').remove({project:this._id}, next);
  next();
})

ProjectSchema.plugin(autoPopulate);
ProjectSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Project", ProjectSchema);
