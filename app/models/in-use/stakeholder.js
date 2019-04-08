var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate=require('mongoose-paginate'); 

var stakeholderStructure = {
  project: {
    type: ObjectId,
    ref: "Project"
  },
  userId: {
    type: ObjectId,
    ref: "User",
    autopopulate: true
  },
  agreed: {
    type: Boolean,
    default: true
  }
};

var stakeholderSchema = new Schema(stakeholderStructure);
stakeholderSchema.plugin(autoPopulate);
stakeholderSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Stakeholder", stakeholderSchema);
