var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
var _ = require("underscore");
const mongoosePaginate=require('mongoose-paginate'); 



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
    autoIndex: process.env.NODE_ENV === "development",
    strict: process.env.NODE_ENV !== "development"
};

var milestoneStructure = {
    project: {
        type: ObjectId,
        ref: "Project",
        // autopopulate: {
        //     select:
        //         "name activated _id owner"
        // }
    },

    tasks: [
        {
            type: ObjectId,
            ref: "Task",
            autopopulate: {
                select:
                    " name description assignedTo status estimatedCost _id createdOn updatedOn dueDate"
            }
        }
    ],
    title: {
        type: String,
        required: true,
        unique: true
    },

    createdBy: {
        type: ObjectId,
        ref: "User",
        default: null,
        autopopulate: {
            select:
                "isFunder isContractor isEvaluator firstName lastName email _id"
        }
    },
    completed: {
        type: Boolean,
        default: false
    },
    estimatedCost: {
        type: Number,
        default: 0
    },
};


if (process.env.NODE_ENV === "development") {
    projectStructure.test = {
        type: Boolean,
        default: true
    };
}


var milestoneSchema = new Schema(milestoneStructure, schemaOptions);
milestoneSchema.plugin(autoPopulate);
milestoneSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Milestone", milestoneSchema);
