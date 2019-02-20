var mongoose = require("mongoose");
var autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

// import related models

const Project = require("./project")
const Milestone = require("./milestone")
const Evaluation = require("./evaluation")

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
      select:
        "isFunder isContractor isEvaluator  firstName lastName email"
    }
  },
  assignedTo: {
    type: ObjectId,
    ref: "User",
    default: null,
    autopopulate: {
      select:
        "isFunder isContractor isEvaluator  firstName lastName email _id"
    }
  },
  evaluators: [{
    type: ObjectId,
    ref: "User",
    default: null
  }],
  completedBy: {
    type: ObjectId,
    ref: "User",
    default: null
  },
  approvedByContractor: {
    type: Boolean,
    default: false
  },
  approvedByOwner: {
    type: Boolean,
    default: false
  },
  agentEvaluations: [
    {
      type: ObjectId,
      ref: "Evaluation",
      default: null
    }
  ],
  contractorEvaluations: [
    {
      text: {
        type: String,
        default: null
      },
      isCompleted: {
        type: Boolean,
        default: false
      },
      proof: {
        type: String,
        default: ''
      }
    }
  ],
  estimatedCost: {
    type: Number,
    default: 0
  },
  isInMilestone:{
    type:Boolean,
    default:false
  }
  // createdOn: {
  //   type: Date,
  //   default: Date.now()
  // },
  // updatedOn: {
  //   type: Date,
  //   default: Date.now()
  // }
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

TaskSchema.post('remove', async (req, res) => {
  try {
    // await Project.update({}, { $pull: {} })
    await Evaluation.remove({ task: this._id });
    await Milestone.update({}, { $pull: { tasks: { _id: this._id } } });
  } catch (error) {
    next(error)
  }
})

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
