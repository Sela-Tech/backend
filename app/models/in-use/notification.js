var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
var _ = require("underscore");



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

var notificationStructure = {
  project: {
    type: ObjectId,
    ref: "Project",
    autopopulate: {
      select:
        "name activated _id "
    }
  },
  userId: {
    type: ObjectId,
    ref: "User",
    autopopulate: {
      select:
        "_id"
    }
  },
  stakeholder:{
    type: ObjectId,
    default:null,
    ref: "User",
    autopopulate: {
      select:
        "isFunder isContractor isEvaluator reputationScore firstName lastName email _id organization profilePhoto"
    }
  },
  message: {
    type: String,
    required:true
  },
  read:{
    type:Boolean,
    default:false
  },
  socket:{
    type:String,
    default:null
  }
};


if (process.env.NODE_ENV === "development") {
  projectStructure.test = {
    type: Boolean,
    default: true
  };
}

var notificationSchemaOptions = _.extend({}, schemaOptions, {
  collection: "notifications"
});
  
var notificationSchema = new Schema(notificationStructure,notificationSchemaOptions,{ timestamps: true });
notificationSchema.plugin(autoPopulate);

module.exports = mongoose.model("Notification", notificationSchema);
