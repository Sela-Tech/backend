var mongoose = require("mongoose");
var autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var saveProjectStructure = {

  project: {
    type: ObjectId,
    ref: "Project",
    required: true,
    autopopulate: {
      select:
        "name activated _id owner location goal status"
    }
  },
  user: {
    type: ObjectId,
    ref: "User",
    required: true,
    autoPopulate: true
  },

};

var schemaOptions = {
  collection: "saves",
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
  saveProjectStructure.test = {
    type: Boolean,
    default: true
  };
}


var SaveProjectSchema = new Schema(saveProjectStructure, schemaOptions);

SaveProjectSchema.plugin(autoPopulate);
SaveProjectSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Save", SaveProjectSchema);
