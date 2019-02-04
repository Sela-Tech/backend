var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate=require('mongoose-paginate'); 

var docStructure = {
  project: {
    type: ObjectId,
    ref: "Project"
  },
  name: {
    type: String,
    required: true
  },
  filetype: {
    type: String,
    required: true
  },
  doc: {
    type: String,
    required: true
  },
  docKey:{
    type: String
  }
};

var docSchema = new Schema(docStructure, { timestamps: true });
docSchema.plugin(autoPopulate);
docSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Document", docSchema);
