const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');
const { schemaOptions } = require("./schemaOptions");

const taskUpdateStructure = {
    project: {
        type: ObjectId,
        ref: "Project",
        // autopopulate: {
        //     select:
        //         "name activated _id, owner "
        // }
    },

    reportNumber: {
        type:Number,
    },

    task: {
        type: ObjectId,
        ref: "Task",
        autopopulate: {
            select:
                "name _id createdAt updateAt"
        },
        required: true
    },

    stakeholder: {
        type: ObjectId,
        ref: "User",
        default: null,
        autopopulate: {
            select:
                "firstName lastName _id profilePhoto"
        }
    },

    supportingEvidence: [
        {
            mediaType: {
                type: String
            },
            path: {
                type: String,
            }
        }
    ],
    comment: {
        type: String,
        default: null
    }

};


if (process.env.NODE_ENV === "development") {
    taskUpdateStructure.test = {
        type: Boolean,
        default: true
    };
}


const taskUpdateSchema = new Schema(taskUpdateStructure, schemaOptions);
taskUpdateSchema.plugin(autoPopulate);
taskUpdateSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("taskUpdate", taskUpdateSchema);
