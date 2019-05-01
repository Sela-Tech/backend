var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
var _ = require("underscore");
const mongoosePaginate = require('mongoose-paginate');



var schemaOptions = {
    minimize: false,
    id: false,
    toJSON: {
        getters: true,
        virtuals: true,
        minimize: false,
        versionKey: false,
        retainKeyOrder: true
    },
    toObject: {
        getters: true,
        virtuals: true,
        minimize: false,
        versionKey: false,
        retainKeyOrder: true
    },
    timestamps: true,
    usePushEach: true,
    autoIndex: process.env.NODE_ENV === "development",
    strict: process.env.NODE_ENV !== "development"
};

var taskUpdateStructure = {
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


var taskUpdateSchema = new Schema(taskUpdateStructure, schemaOptions);
taskUpdateSchema.plugin(autoPopulate);
taskUpdateSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("taskUpdate", taskUpdateSchema);
