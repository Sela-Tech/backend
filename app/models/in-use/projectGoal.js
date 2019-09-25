const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const autoPopulate = require("mongoose-autopopulate");
const { schemaOptions } = require("./schemaOptions");

const mongoosePaginate = require("mongoose-paginate");
const ObjectId = Schema.Types.ObjectId;

const projectGoalStructure = {
    name: String,

    project: {
        type: ObjectId,
        ref: "Project"
            // required:true
    },

    metrics: [{
        metricId: {
            type: ObjectId,
            ref: "ImpactMetricDescriptor"
        },
        baseline: {
            value: String,
            unit: String,
        },
        target: {
            value: String,
            unit: String,
        },
    }]
};

if (process.env.NODE_ENV === "development") {
    projectGoalStructure.test = {
        type: Boolean,
        default: true
    };
}

const projectGoalSchema = new Schema(projectGoalStructure, schemaOptions);

projectGoalSchema.plugin(autoPopulate);
projectGoalSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("ProjectGoal", projectGoalSchema);