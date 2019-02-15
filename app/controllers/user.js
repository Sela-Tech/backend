"use strict";
require("dotenv").config();
var jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Organization = mongoose.model("Organization");
var Project = mongoose.model("Project");
var Save = mongoose.model("Save");
var Transaction = mongoose.model("Transaction");
var Uploads = mongoose.model("Upload");
// var tokenValidityPeriod = 86400; // in seconds; 86400 seconds = 24 hours
var tokenValidityPeriod = 604800; // in seconds; 86400 seconds = 24 hours
var bcrypt = require("bcrypt");
const crypto = require('crypto');
const Helper = require('../helper/helper');
const Notifications = require('../helper/notifications');
const validator = require('validator');
const validate = require('../../middleware/validate');
const _ = require('lodash');
const async = require('async');

const options = {
  apiKey: process.env.AFRICAS_TALKING_API,
  username: process.env.AFRICAS_TALKING_APP_USERNAME
};

const AfricasTalking = require('africastalking')(options);


let sms = AfricasTalking.SMS;

const helper = new Helper();
const notify = new Notifications();


exports.find_stakeholder_info = async (req, res) => {
  let userInfo = await User.findOne({ _id: req.body.id });
  let projects = await Project.find({ owner: req.body.id });
  let transactions = await Transaction.find({ sender: req.body.id });
  let uploads = await Uploads.find({ owner: req.body.id });

  userInfo = userInfo.toJSON();

  delete userInfo.password;
  delete userInfo.updateOn;
  delete userInfo.activation;
  delete userInfo.username;
  delete userInfo.email;

  let json = {
    userInfo,
    projects,
    transactions: transactions.length,
    uploads: uploads.length
  };

  if (json !== null) {
    return res.status(200).json(json);
  } else {
    return res.status(401).json({});
  }
};

exports.register = async (req, res) => {
  var successRes = { success: true };
  var failRes = { success: false };

  const { email, phone } = req.body,
    query = email ? { email } : { phone };

  let user;


  try {
    user = await User.findOne(query);
    if (user) {
      if (user.phone == req.body.phone) {
        failRes.message =
          "Sela already has an account for a user with phone number: " +
          req.body.phone +
          ". Please try another phone number";
      }
      if (user.email == req.body.email) {
        failRes.message =
          "Sela already has an account for a user with e-mail address: " +
          req.body.email +
          ". Please try another e-mail address";
      }
      return res.status(401).json(failRes);
    }
  } catch (error) {
    return res.status(401).json({
      message: error.message
    });
  }

  const type = (user) => {
    if (Boolean(user.isContractor) === true && Boolean(user.isFunder) === false && Boolean(user.isEvaluator) === false) return { isContractor: true };
    if (Boolean(user.isContractor) === false && Boolean(user.isFunder) === true && Boolean(user.isEvaluator) === false) return { isFunder: true };
    if (Boolean(user.isContractor) === false && Boolean(user.isFunder) === false && Boolean(user.isEvaluator) === true) return { isEvaluator: true };
  }

  var userObj = {
    ...type(req.body),
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
    phone: req.body.phone,
    profilePhoto: req.body.profilePhoto
  };

  try {
    let org = req.body.organization, signThis = {};

    if (org.id !== "" && org.id !== undefined) {
      let fetchOrg = await Organization.findOne({
        _id: req.body.organization.id
      });
      userObj.organization = fetchOrg.id;
    } else if (Boolean(org.id) == false && org.name !== "") {
      let obj = await new Organization({ name: org.name }).save();
      userObj.organization = obj._id;
    }

    let medium;

    if (req.body.phone && req.body.phone !== "" && !req.body.email || req.body.email == "") {
      userObj.verificationToken = crypto.randomBytes(3).toString('hex');
      medium = 'Phone Number';

      var newUser = await new User(userObj).save();

      const receiver = '+234' + req.body.phone;
      const to = [receiver];

      const msg = {
        to: to,
        message: 'Please verify your phone number with this code: ' +
          userObj.verificationToken
      }


      let result = await sms.send(msg);

      return res.status(200).json({
        ...successRes,
        // ...signThis,
        // token
        message: `Registration successful. Please verify your ${medium}`
      });


    } else if (req.body.email && req.body.email !== "" && !req.body.phone || req.body.phone == "") {
      medium = 'Email';
      userObj.verificationToken = crypto.randomBytes(20).toString('hex');

      var newUser = await new User(userObj).save();

      let emailData = {
        firstName: newUser.firstName,
        email: email.toLowerCase()
      }

      notify.confirmEmail(req, emailData, userObj.verificationToken);
      return res.status(200).json({
        ...successRes,
        // ...signThis,
        // token
        message: `Registration successful. Please verify your ${medium}`
      });

    } else if (req.body.email && req.body.email !== "" && req.body.phone && req.body.phone !== "") {
      medium = 'Email';
      userObj.verificationToken = crypto.randomBytes(20).toString('hex');

      var newUser = await new User(userObj).save();

      let emailData = {
        firstName: newUser.firstName,
        email: email.toLowerCase()
      }

      notify.confirmEmail(req, emailData, userObj.verificationToken);
      return res.status(200).json({
        ...successRes,
        // ...signThis,
        // token
        message: `Registration successful. Please verify your ${medium}`
      });
    }


    // if(Boolean(newUser.organization)){
    //   signThis.organization =  {
    //     name: newUser.organization.name,
    //     id: newUser.organization._id
    //   }
    // }else{
    //   signThis.organization = {
    //     name: "No Organization",
    //     id:""
    //   }
    // }

    // let { isFunder, isEvaluator, isContractor } = newUser;

    // signThis = {
    //   ...signThis,
    //   id: newUser._id,
    //   isFunder,
    //   isEvaluator,
    //   isContractor,
    //   firstName: newUser.firstName,
    //   phone: newUser.phone,
    //   email: newUser.email,
    //   lastName: newUser.lastName
    // };

    // var token = jwt.sign(signThis, process.env.SECRET, {
    //   expiresIn: tokenValidityPeriod
    // });


  } catch (regErr) {
    console.log(regErr)
    failRes.message = regErr.name + ": " + regErr.message;
    return res.status(500).json(failRes);
  }
};

exports.verify = async (req, res) => {
  let user = await User.findById(req.userId);
  let signThis = {};

  const { isFunder, isEvaluator, isContractor } = user;
        if (Boolean(user.organization)) {
          signThis.organization = {
            name: user.organization.name,
            id: user.organization._id
          }
        } else {
          signThis.organization = {
            name: "No Organization",
            id: ""
          }
        }

        signThis = {
          ...signThis,
          profilePhoto: user.profilePhoto,
          id: user._id,
          isFunder,
          isEvaluator,
          isContractor,
          firstName: user.firstName,
          phone: user.phone,
          email: user.email,
          lastName: user.lastName,
          areasOfInterest: user.areasOfInterest,

        };

        var token = jwt.sign(signThis, process.env.SECRET, {
          expiresIn: tokenValidityPeriod
        });


        return res.status(200).json({
          ...signThis,
          firstName: user.firstName,
          lastName: user.lastName,
          organization: user.organization,
          token
        });

};

exports.login = (req, res) => {
  let successRes = { success: true };
  let failRes = { success: false };
  const inactiveAccountMsg = "Your account has not been activated.\n",
    unverifiedAccount = "Your email/phone Number has not been verified.\n";

  let signThis = {};

  const { email, phone } = req.body,
    query = email ? { email } : { phone };

  User.findOne(query).exec((checkErr, user) => {
    if (checkErr) {
      failRes.message = checkErr.name + ": " + checkErr.message;
      return res.status(500).json(failRes);
    }
    if (!user) {
      failRes.message =
        "Sela does not have an account with those user credentials. Please try another email/phone number.";
      return res.status(401).json(failRes);
    }

    user.comparePassword(req.body.password, (passErr, isMatch) => {
      if (passErr) {
        failRes.message = passErr.name + ": " + passErr.message;
        return res.status(500).json(failRes);
      }
      if (!isMatch) {
        failRes.message =
          "That is the wrong password for this account. Please try again";
        return res.status(401).json(failRes);
      }

      if (user.activation === "approved" && user.isVerified === true) {
        const { isFunder, isEvaluator, isContractor } = user;

        if (Boolean(user.organization)) {
          signThis.organization = {
            name: user.organization.name,
            id: user.organization._id
          }
        } else {
          signThis.organization = {
            name: "No Organization",
            id: ""
          }
        }

        signThis = {
          ...signThis,
          profilePhoto: user.profilePhoto,
          id: user._id,
          isFunder,
          isEvaluator,
          isContractor,
          firstName: user.firstName,
          phone: user.phone,
          email: user.email,
          lastName: user.lastName,
          areasOfInterest: user.areasOfInterest,

        };

        var token = jwt.sign(signThis, process.env.SECRET, {
          expiresIn: tokenValidityPeriod
        });


        return res.status(200).json({
          ...successRes,
          ...signThis,
          firstName: user.firstName,
          lastName: user.lastName,
          organization: user.organization,
          token
        });
      } else if (user.activation === "pending" && user.isVerified === true) {

        failRes.message = inactiveAccountMsg;
        return res.status(401).json(failRes);

      } else if (user.activation === "approved" && user.isVerified === false) {

        failRes.message = unverifiedAccount;
        return res.status(401).json(failRes);

      } else if (user.activation === "pending" && user.isVerified === false) {

        failRes.message = [unverifiedAccount, inactiveAccountMsg]
        return res.status(401).json(failRes);
      }


    });
  });

};

exports.update = async (req, res) => {
  var successRes = { success: true };
  var failRes = { success: false };

  try {
    let oldPassword = req.body.oldPassword;
    let user = await User.findById(req.userId).exec();

    let finalUserObj = {};

    user.comparePassword(oldPassword, async (passErr, isMatch) => {
      if (passErr) {
        failRes.message = passErr.name + ": " + passErr.message;
        return res.status(500).json(failRes);
      }

      if (!isMatch) {
        failRes.message =
          "That is the wrong password for this account. Please try again";
        return res.status(401).json(failRes);
      }

      let objSearch = {};

      if (
        req.body.newPassword &&
        req.body.verifyPassword &&
        req.body.oldPassword
      ) {
        if (req.body.newPassword === req.body.verifyPassword) {
          let password = req.body.newPassword;
          let hash = bcrypt.hashSync(password, bcrypt.genSaltSync());
          objSearch = { password: hash };

          finalUserObj = await User.findOneAndUpdate(
            { _id: req.userId },
            { $set: objSearch },
            { new: true }
          );
        } else {
          res.status(401).json({
            message: "Passwords don't match"
          });
        }
      } else {

        objSearch = req.body;
        delete objSearch.newPassword;
        delete objSearch.verifyPassword;
        delete objSearch.oldPassword;
        delete objSearch.password;
      }

      let check = await User.findOne({
        email: objSearch.email
      });

      // if(check){
      check = check.toJSON();
      // }

      console.log(check, req.userId)
      if (Boolean(check) === true && check._id.toString() === req.userId.toString()) {

        finalUserObj = await User.findOneAndUpdate(
          { _id: req.userId },
          { $set: objSearch },
          { new: true }
        );


        const { isFunder, isEvaluator, isContractor } = finalUserObj,
          signThis = {
            profilePhoto: finalUserObj.profilePhoto,
            id: finalUserObj._id,
            isFunder,
            isEvaluator,
            email: finalUserObj.email,
            isContractor,
            phone: finalUserObj.phone,
            firstName: finalUserObj.firstName,
            areasOfInterest:finalUserObj.areasOfInterest,
            organization: {
              name: finalUserObj.organization.name,
              id: finalUserObj.organization._id
            },
            lastName: finalUserObj.lastName
          };

        var token = jwt.sign(signThis, process.env.SECRET, {
          expiresIn: tokenValidityPeriod
        });

        return res.status(200).json({
          ...successRes,
          ...signThis,
          firstName: finalUserObj.firstName,
          lastName: finalUserObj.lastName,
          organization: finalUserObj.organization,
          token
        });
      } else {
        return res.status(400).json({
          message: "Email is in use."
        })
      }
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message
    });
  }
};

exports.find = async (req, res) => {
  let users = await User.find({});

  users = users.filter(u => {
    u = u.toJSON();
    return (
      u._id != req.userId && (u.isAdmin == false || u.isAdmin == undefined)
    );
  });
  users = users.map(u => {
    let temp = {
      firstName: u.firstName,
      lastName: u.lastName,
      isFunder: u.isFunder,
      isContractor: u.isContractor,
      isEvaluator: u.isEvaluator,
      organization: u.organization,
      profilePhoto: u.profilePhoto,
      _id: u._id
    };
    return temp;
  });
  return res.status(200).json(users);
};

exports.findPStakeholders = async (req, res) => {
  try {
    let project = await Project.findOne({ _id: req.body.projectId });

    let stakeholdersForProject = project.stakeholders;

    let users = await User.find({});

    users = users.filter(u => {
      u = u.toJSON();
      return (
        u._id != req.userId && (u.isAdmin == false || u.isAdmin == undefined)
      );
    });

    users = users.map(u => {
      let temp = {
        firstName: u.firstName,
        lastName: u.lastName,
        isFunder: u.isFunder,
        isContractor: u.isContractor,
        isEvaluator: u.isEvaluator,
        organization: u.organization,
        _id: u._id
      };
      return temp;
    });

    let final = users.map(u => {
      let innerCount = 0;
      stakeholdersForProject.map(s => {
        if (s._id !== u._id) {
          innerCount = innerCount + 1;
        }
      });

      return innerCount === users.length;
    });

    return res.status(200).json(final);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.verifyAccountToken = async (req, res) => {
  let signThis = {};
  let successRes = { success: true };
  let failRes = { success: false };
  try {
    const verificationToken = req.query.token

    if (!verificationToken || verificationToken == undefined) {
      return res.status(400).json({ ...failRes, message: "Invalid verification token" })
    }

    let user = await User.findOne({ verificationToken: verificationToken });

    if (!user) {
      return res.status(400).json({ ...failRes, message: "Invalid verification token" })
    }


    user.verificationToken = null;
    user.isVerified = true;

    let verifiedUser = await user.save();

    if (verifiedUser) {
      const { isFunder, isEvaluator, isContractor } = verifiedUser;

      if (Boolean(verifiedUser.organization)) {
        signThis.organization = {
          name: verifiedUser.organization.name,
          id: verifiedUser.organization._id
        }
      } else {
        signThis.organization = {
          name: "No Organization",
          id: ""
        }
      }

      signThis = {
        ...signThis,
        profilePhoto: verifiedUser.profilePhoto,
        id: verifiedUser._id,
        isFunder,
        isEvaluator,
        isContractor,
        firstName: verifiedUser.firstName,
        phone: verifiedUser.phone,
        email: verifiedUser.email,
        lastName: verifiedUser.lastName,
        areasOfInterest: user.areasOfInterest,

      };

      var token = jwt.sign(signThis, process.env.SECRET, {
        expiresIn: tokenValidityPeriod
      });


      if (verificationToken.length < 10) {
        const receiver = '+234' + verifiedUser.phone;

        // send sms
        const msg = {
          to: [receiver],
          message: 'Thank you for verifying your Phone Number'
          // from: '75111'
        }


        let result = await sms.send(msg);

      } else {
        let emailData = {
          firstName: verifiedUser.firstName,
          email: verifiedUser.email.toLowerCase()
        }

        notify.welcomeMail(req, emailData);
      }


      return res.status(200).json({
        ...successRes,
        ...signThis,
        firstName: verifiedUser.firstName,
        lastName: verifiedUser.lastName,
        organization: verifiedUser.organization,
        token
      });
    }


  } catch (error) {
    console.log(error)
    res.status(500).json({ ...failRes, message: "internal server error" })
  }
}


exports.resendVerificationToken = async (req, res) => {
  let successRes = { success: true };
  let failRes = { success: false };

  try {
    const { body: { field } } = req;

    if (!field || field === "" || field === undefined) {
      return res.status(400).json({ ...failRes, message: "invalid information" })
    }

    if (validator.isEmail(field)) {
      let user = await User.findOne({ email: field, isVerified: false });

      if (!user) {
        return res.status(400).json({ ...failRes, message: `Sela does not have an account with the email ${field}. Please try another email.` })
      }

      user.verificationToken = crypto.randomBytes(20).toString('hex');
      user.isVerified = false;

      let updatedUser = await user.save();

      if (updatedUser) {
        let emailData = {
          firstName: updatedUser.firstName,
          email: updatedUser.email
        }

        notify.confirmEmail(req, emailData, updatedUser.verificationToken);

        return res.status(200).json({
          ...successRes,
          message: `An email has been sent to ${field}. Please confirm your email`
        });
      }

    } else if (validator.isMobilePhone(field, "any")) {

      let user = await User.findOne({ phone: field, isVerified: false });

      if (!user) {
        return res.status(400).json({ ...failRes, message: `Sela does not have an account with the phone Number ${field}. Please try another Phone Number.` })
      }

      user.verificationToken = crypto.randomBytes(3).toString('hex');
      user.isVerified = false;

      let updatedUser = await user.save();

      if (updatedUser) {

        const receiver = '+234' + field;
        const to = [receiver];

        const msg = {
          to: to,
          message: 'Please verify your phone number with this code: ' +
            updatedUser.verificationToken
        }

        let result = await sms.send(msg);

        return res.status(200).json({
          ...successRes,
          message: `An verification code has been sent to ${field}.`
        });
      }

    }

  } catch (error) {
    console.log(error)
    res.status(500).json({ ...failRes, message: "internal server error" })
  }
}

exports.updateAreaOfInterest = async (req, res) => {
  // validate.validateAddAreaOfInterest(req, res)
  // const errors = req.validationErrors();

  // if (errors) {
  //   return res.status(400).json({
  //     message: errors
  //   });
  // }
  try {
    const { body: { areasOfInterest } } = req;

    let user = await User.findById(req.userId);

    if (user == null || user == undefined) {
      return res.status(404).json({ message: "Bad Data" })
    }

    // let existingInterests = user.areasOfInterest;

    let newInterests = [...areasOfInterest];
    newInterests = _.uniq(newInterests);

    let updateInterest = await User.update({ _id: req.userId }, { $set: { areasOfInterest: newInterests } })
    if (Boolean(updateInterest)) return res.status(200).json({ message: "Areas of interest updated successfully" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "internal server error" })
  }
}

exports.savePrject=async(req, res)=>{
  const projectId = req.params.id;
  try {
    const project = await Save.findOne({project:projectId, user:req.userId});
    if(project){
      await project.remove();
      return res.status(200).json({message:"Project removed from saved projects"})
    }

    let saveObj={
      project:projectId,
      user:req.userId
    }

    let savedProject = await new Save(saveObj).save();
    if(savedProject){
      return res.status(201).json({message:"Project has been saved", savedProject})
    }

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "internal server error" })
  }
}

