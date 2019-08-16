const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');

// import related models
const Project = require("./project");

const docStructure = {
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

const docSchema = new Schema(docStructure, { timestamps: true });

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
