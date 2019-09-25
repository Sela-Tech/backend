const mongoose = require("mongoose");
const autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');
const { schemaOptions } = require("./schemaOptions");


const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const saveProjectStructure = {

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


if (process.env.NODE_ENV === "development") {
  saveProjectStructure.test = {
    type: Boolean,
    default: true
  };
}


const SaveProjectSchema = new Schema(saveProjectStructure, schemaOptions);

SaveProjectSchema.plugin(autoPopulate);
SaveProjectSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Save", SaveProjectSchema);
