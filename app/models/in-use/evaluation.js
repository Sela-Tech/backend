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
    autoIndex: process.env.NODE_ENV === "development",
    strict: process.env.NODE_ENV !== "development"
};

var evaluationStructure = {
    name: {
        type: String,
        required: true
    },
    project: {
        type: ObjectId,
        ref: "Project",
        // autopopulate: {
        //     select:
        //         "name activated _id, owner "
        // }
    },

    level: {
        type: String,
        enum: ["project", "task"],
        default: "task"
    },
    // TODO: uncomment when needed
    task: {                 // can be null or not null depending on the level(project or task)
        type: ObjectId,
        ref: "Task",
        // autopopulate: {
        //     select:
        //         "name description _id assignedTo status"
        // },
        default: null
    },

    description: {
        type: String,
        default: ""
    },

    quote: {
        type: Number,
        default: 0
    },

    stakeholder: {
        type: ObjectId,
        ref: "User",
        default: null
    },
    // if graphical data, the field below is useful
    fieldNames: [
        {
            fieldName: {
                type: String
            }
        }
    ],
    // if graphical data, the field above is useful

    submissions:{
        type:[mongoose.Schema.Types.Mixed] //an array of mixed data types
    } // anything can be thrown here regardless of data type e.g string, Number, object


};


if (process.env.NODE_ENV === "development") {
    projectStructure.test = {
        type: Boolean,
        default: true
    };
}


var evaluationSchema = new Schema(evaluationStructure, { timestamps: true });
evaluationSchema.plugin(autoPopulate);
evaluationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Evaluation", evaluationSchema);
