var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

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
    required:true
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
    ref: "User"
  },
  assignedTo: [{
    type: ObjectId,
    ref: "User",
    default: null
  }],
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
  contractorAgreed: {
    type: Boolean,
    default: false
  },
  ownerAgreed: {
    type: Boolean,
    default: false
  },
  agentEvaluations: [
    {
      type: ObjectId,
      ref: "Evaluations",
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
  budget: {
    type: Number,
    default: 0
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
  autoIndex: process.env.NODE_ENV === "development",
  strict: process.env.NODE_ENV !== "development"
};

if (process.env.NODE_ENV === "development") {
  taskStructure.test = {
    type: Boolean,
    default: true
  };
}

var locationStructure = {
  name: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  long: {
    type: Number,
    required: true
  }
};

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

var LocationSchema = new Schema(locationStructure, schemaOptions);

var TaskSchema = new Schema(taskStructure, schemaOptions);

TaskSchema.pre("save", true, function (next, done) {
  next();

  this.updatedOn = new Date();

  done();
});

TaskSchema.pre("update", true, function (next, done) {
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

module.exports = mongoose.model("Task", TaskSchema);
