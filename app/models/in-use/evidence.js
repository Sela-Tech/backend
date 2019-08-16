const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const autoPopulate = require("mongoose-autopopulate");
const _ = require("underscore");
const mongoosePaginate = require('mongoose-paginate');
const { schemaOptions } = require("./schemaOptions");


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
                "name _id description"
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
            submissionCount: {
                type: Number,
                default: 0
            },
            hasBeenPaid: {
                type: Boolean,
                default: false
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
    evidenceStructure.test = {
        type: Boolean,
        default: true
    };
}


const evidenceSchema = new Schema(evidenceStructure, schemaOptions);
evidenceSchema.plugin(autoPopulate);
evidenceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Evidence", evidenceSchema);
