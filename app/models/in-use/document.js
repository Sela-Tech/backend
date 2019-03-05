var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');

// import related models
const Project = require("./project");

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
  filesize:{
    type:String
  }
};

var docSchema = new Schema(docStructure, { timestamps: true });

docSchema.post('remove', async (next) => {
  try {
    await Project.update({}, { $pull: { documents: { '_id': this.id } } });
    
    next();
  } catch (error) {
    next(error)
  }
})
docSchema.plugin(autoPopulate);
docSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Document", docSchema);
