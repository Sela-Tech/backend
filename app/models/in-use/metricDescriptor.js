const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const autoPopulate = require("mongoose-autopopulate");
const { schemaOptions } = require("./schemaOptions");

const mongoosePaginate = require('mongoose-paginate');


const impactMetricDescriptorStructure = {
    name: {
        type: String,
        required: true
    },

    metric_standard_id: String,

    description: {
        type: String,
        default: null
    },

    impactCategories: [{
        type: ObjectId,
        ref: "ImpactCategory",
        autoPopulate: {
            select:
                "name _id"
        }
    }],

    standard: String,

    additionalInfo: Schema.Types.Mixed

};


if (process.env.NODE_ENV === "development") {
    impactMetricDescriptorStructure.test = {
        type: Boolean,
        default: true
    };
}


const impactMetricDescriptorSchema = new Schema(impactMetricDescriptorStructure, schemaOptions);


impactMetricDescriptorSchema.plugin(autoPopulate);
impactMetricDescriptorSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("ImpactMetricDescriptor", impactMetricDescriptorSchema);
