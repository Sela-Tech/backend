const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const autoPopulate = require("mongoose-autopopulate");
const { schemaOptions } = require("./schemaOptions");

const mongoosePaginate = require('mongoose-paginate');


const impactTagStructure = {
    name: {
        type: String,
        required: true
    },

    logo: {
        type: String,
        default: null
    },

    description: {
        type: String,
        default: null
    },

    impactStandardId: {
        type: ObjectId,
        ref: "ImpactStandard",
        autoPopulate: {
            select:
                "name _id"
        }
    }

};


if (process.env.NODE_ENV === "development") {
    impactTagStructure.test = {
        type: Boolean,
        default: true
    };
}


const impactTagSchema = new Schema(impactTagStructure, schemaOptions);


impactTagSchema.plugin(autoPopulate);
impactTagSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("ImpactTag", impactTagSchema);
