const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const autoPopulate = require("mongoose-autopopulate");
const { schemaOptions } = require("./schemaOptions");

const mongoosePaginate=require('mongoose-paginate'); 


const impactStandardStructure = {
    name:{
        type:String,
        required:true
    },
  
    description:{
        type:String,
        required:true
    }
   
};


if (process.env.NODE_ENV === "development") {
    impactStandardStructure.test = {
        type: Boolean,
        default: true
    };
}


const impactStandardSchema = new Schema(impactStandardStructure,schemaOptions);


impactStandardSchema.plugin(autoPopulate);
impactStandardSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("ImpactStandard", impactStandardSchema);
