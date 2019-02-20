// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const ObjectId = Schema.Types.ObjectId;
// const autoPopulate = require("mongoose-autopopulate");
// const _ = require("underscore");

// const mongoosePaginate=require('mongoose-paginate'); 

// const Project = require('./project');


// const schemaOptions = {
//     minimize: false,
//     id: false,
//     toJSON: {
//         getters: true,
//         virtuals: true,
//         minimize: false,
//         versionKey: false,
//         retainKeyOrder: true
//     },
//     toObject: {
//         getters: true,
//         virtuals: true,
//         minimize: false,
//         versionKey: false,
//         retainKeyOrder: true
//     },
//     timestamps:true,
//     autoIndex: process.env.NODE_ENV === "development",
//     strict: process.env.NODE_ENV !== "development"
// };

// const commentStructure = {
//     project: {
//         type: ObjectId,
//         ref: "Project",
//         autopopulate: {
//             select:
//                 "name activated _id, owner stakeholders"
//         }
//     },

//     actor: {
//         type: ObjectId,
//         ref: "User", autopopulate: {
//             select:
//                 "firstName lastName _id socket email "
//         }
//     },
   
// };


// if (process.env.NODE_ENV === "development") {
//     commentStructure.test = {
//         type: Boolean,
//         default: true
//     };
// }


// const commentSchema = new Schema(commentStructure,schemaOptions);

// // commentSchema.post('remove', async (next) => {
// //     try {
// //         await Project.update({}, { $pull: { proposals: { _id: this._id } } })
// //     } catch (error) {
// //         next(error)
// //     }
// // });

// commentSchema.plugin(autoPopulate);
// commentSchema.plugin(mongoosePaginate);

// module.exports = mongoose.model("Comment", commentSchema);
