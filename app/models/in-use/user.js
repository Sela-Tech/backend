var _ = require("underscore");
var bcrypt = require("bcrypt");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");

var userStructure = {
  organization: {
    type: ObjectId,
    ref: "Organization",
    autopopulate: { select: "name _id" }
  },
  profilePhoto: {
    type: String
  },
  profilePhotoKey: {
    type: String
  },
  reputationScore: {
    type: Number,
    default: 0
  },
  firstName: {
    type: String,
    required: true,
    min: 1,
    max: 100
  },
  lastName: {
    type: String,
    required: true,
    min: 1,
    max: 100
  },
  username: {
    type: String,
    unique: true,
    lowercase: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    default: null
  },
  phone: {
    type: String,
    unique: true,
    lowercase: true,
    default: null
  },
  publicKey: {
    type: String,
    unique: true
  },
  isEvaluator: {
    type: Boolean,
    required: true,
    default: false
  },
  isContractor: {
    type: Boolean,
    required: true,
    default: false
  },
  isFunder: {
    type: Boolean,
    required: true,
    default: false
  },
  activation: {
    type: String,
    enum:["pending", "approved"],
    default: "approved"
  },
  verificationToken: {
    type: String,
  },
  isVerified:{
    type:Boolean,
    default:false
  },
  createdOn: {
    type: Date,
    default: Date.now()
  },
  updatedOn: {
    type: Date,
    default: Date.now()
  },
  password: {
    type: String,
    min: [8, "Password must me longer than 8 characters"],
    set: function(value) {
      if (value.length < 8) {
        return null;
      }
      return bcrypt.hashSync(value, bcrypt.genSaltSync());
    },
    validate: [
      function() {
        return !!this.password;
      },
      "Password is incorrect"
    ]
  },
  resetPasswordToken:{
    type:String,
    default:null
  },
  resetPasswordExpires:{
    type:Date,
    default:null
  },

  socket:{
    type:String,
    default:null
  }
};

if (process.env.NODE_ENV === "development") {
  userStructure.test = {
    type: Boolean,
    default: true
  };
}

var transformer = function(doc, ret) {};

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
  autoIndex: false,
  safe: true,
  strict: process.env.NODE_ENV !== "development" // Only use strict in production
};

var userSchemaOptions = _.extend({}, schemaOptions, {
  collection: "users",
  toJSON: {
    transform: transformer // Add a Transformer to remove hide private fields
  }
});

var UserSchema = new Schema(userStructure, userSchemaOptions);

UserSchema.pre("save", true, function(next, done) {
  next();

  this.updatedOn = new Date();

  done();
});

UserSchema.pre("update", true, function(next, done) {
  next();

  this.update(
    {},
    {
      $set: {
        updatedOn: new Date()
      }
    }
  );

  done();
});

UserSchema.methods.comparePassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) {
      return cb(err, false);
    }
    return cb(null, isMatch);
  });
};

UserSchema.plugin(autoPopulate);
//Export model
module.exports = mongoose.model("User", UserSchema);
