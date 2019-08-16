const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    taxId:{
      type:String,
      required:true
    }
  },
  { timestamps: true }
);

const Organization = mongoose.model("Organization", OrganizationSchema);

exports.OrganizationSchema = OrganizationSchema;
module.exports = Organization;
