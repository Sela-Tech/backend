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

const evidenceStructure = {
    title: {
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
    task: {                 // can be null or not null depending on the level(project or task)
        type: ObjectId,
        ref: "Task",
        autopopulate: {
            select:
                "name _id"
        },
        default: null
    },

    instruction: {
        type: String,
        default: ""
    },

    totalPrice: {
        type: Number,
        default: 0
    },

    stakeholders: [
        {
            user: {
                type: ObjectId,
                ref: "User",
                default: null,
                autopopulate: {
                    select:
                        "firstName lastName _id profilePhoto"
                }
            },
            quote: {
                type: Number,
                default: 0
            },
            hasSubmitted: {
                type: Boolean,
                default: false
            },
            submissionCount:{
                type:Number,
                default:0
            },
            hasBeenPaid:{
                type:Boolean,
                default:false
            }
        }
    ],
    datatype: {
        type: String,
        enum: ["video", "audio", "image", "table", "survey"]
    },
    // if graphical data, the field below is useful
    fields: [
        {
            title: {
                type: String
            },
            responseType: {
                type: String
            }
        }

    ],
    // if graphical data, the field above is useful

    submissions: {
        type: [mongoose.Schema.Types.Mixed] //an array of mixed data types
    }, // anything can be thrown here regardless of data type e.g string, Number, object

    status: {
        type: String,
        enum: ["Pending", "Submitted", "In Progess", "Completed"],
        default: "Pending"
    },

    requestedBy: {
        type: ObjectId,
        ref: "User",
        default: null,
        autopopulate: {
            select:
                "firstName lastName _id profilePhoto"
        }
    },

    dueDate: {
        type: Date,
        default: null
    }


};


if (process.env.NODE_ENV === "development") {
    projectStructure.test = {
        type: Boolean,
        default: true
    };
}


var evidenceSchema = new Schema(evidenceStructure, schemaOptions);
evidenceSchema.plugin(autoPopulate);
evidenceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Evidence", evidenceSchema);
