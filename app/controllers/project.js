"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
  Project = mongoose.model("Project"),
  User = mongoose.model("User"),
  Location = mongoose.model("Location");

const notify = require('../helper/notifications');
const Helper = require('../helper/helper');

let helper = new Helper();


exports.new = async (req, res) => {
  var successRes = { success: true };
  var failRes = { success: false };
  var projectObj = req.body;
  projectObj.owner = req.userId;
  let SHs=[];
  var newLocation = new Location(req.body.location);
  try {

    if(projectObj.stakeholders && projectObj.stakeholders.length >0){
      let tooManyContractors = await helper.tooManyContractors(projectObj.stakeholders)
        if(!tooManyContractors){
          SHs=[...projectObj.stakeholders];
          projectObj.stakeholders = projectObj.stakeholders.map(s=>{
            return {
              user: {
                information: s
              }
            }
          });
        }else{
          failRes.message ="You cannot add more than one Contractor to a project";
          console.log(failRes)
          return res.status(400).json(failRes);
        }
       
      }else{
      
        projectObj.stakeholders = [];
      
      }
      
        const saveProject = async projectObj => {
          
          if(typeof(projectObj.tags) === "string" || typeof(projectObj.tags ) === "String"){
            projectObj.tags = [projectObj.tags]
          }else if(Boolean(projectObj.tags) === false){
            projectObj.tags = []
          }
      
          var newProject = new Project(projectObj);
          // newProject.save((err, project)=>{
          //   if (err) {
          //     failRes.message = err.name + ": " + err.message;
          //     return res.status(400).json(failRes);
          //   }
            
          //    notify.notifyAddedStakeholders(req, req.body.stakeholders, project)
          //   return res.status(200).json(successRes);
          // });

          let newP = await newProject.save();

          if(newP){
            let project = await Project.findById(newP._id);
            if(SHs.length>0){
              await notify.notifyAddedStakeholders(req, SHs, project)
            }
              return res.status(200).json(successRes);
          }
        };
      
        Location.findOne(
          {
            name: req.body.location.name,
            lat: req.body.location.lat,
            lng: req.body.location.lng
          },
          (err, single) => {
            if (single === null) {
              newLocation.save((err, l) => {
                if (err) return res.status(500).json({ message: err.message });
                projectObj.location = l._id;
                saveProject(projectObj);
              });
            } else {
              projectObj.location = single._id;
              saveProject(projectObj);
             
            }
          }
        );
  } catch (error) {
    console.log(error);
    return res.status(500).json({message:`internal server error`});
  }
};

exports.find = async (req, res) => {
  var successRes = { success: true };
  var failRes = { success: false };
  var checkQuery = {};
  // limit result else return all
  let limit = parseInt(req.query.limit ? req.query.limit : 0, 10);
  // pagination logic
  let page = req.query.page ? req.query.page : 1;
  // page hopping logic
  let skip = parseInt(page * limit - limit, 10);
  // let the remaining queries stay in the variable
  let otherQueryParams = req.query;
  // delete thes because they will affect the look up in the db
  delete otherQueryParams.limit;
  delete otherQueryParams.page;

  const locationName = otherQueryParams.location;
  delete otherQueryParams.location;

  if (req.tokenExists) {
    checkQuery = { ...otherQueryParams, owner: req.userId };
  } else {
    checkQuery = otherQueryParams;
  }

  Project.find(checkQuery)
    .skip(skip)
    .limit(limit)
    .exec(function (err, projects) {
      if (!req.tokenExists)
        projects = projects.filter(p => {
          return p.activated === true;
        });

      if (err) {
        failRes.message = err.message;
        return res.status(400).json(failRes);
      }
      if (!projects)
        return res.json({
          message: "No Projects Found"
        });

      if (locationName) {
        successRes.projects = projects.filter(p => {
          return p.location.name === locationName.replace(/%20/g, " ");
        });
      } else {
        if (Boolean(checkQuery.owner)) {
          projects = projects.map(p => {
            p.isOwner = true;
            return p;
          });
        }
        successRes.projects = projects;
      }


      return res.json(successRes);
    });
};

exports.delete = async (req, res) => {
  // find the project
  let findProjectResponse = await Project.findOne({ _id: req.params.id });

  //  make sure the person trying to perform this action, is the owner of the project
  if (req.userId == findProjectResponse.owner._id) {
    // if the authorization to delete is provided i.e. true delete the project
    // in the future, it may become send delete request to admin or something
    if (req.headers["permanent-delete"] === "true") {
      try {
        let project = await Project.findOne({ _id: req.params.id });
        let projectAvatarKey = project.avatarKey;

        // find if multiple projects share a location
        let locations = await Project.find({ location: project.location });

        let proceed = true;
        // if only one then delete
        if (locations.length < 2) {
          let location_delete = await Location.deleteOne({
            _id: project.location._id
          });
          if (location_delete.result.n === 0) {
            proceed = false;
          }
        }

        if (proceed === true) {
          // delete project
          let response = await Project.deleteOne({ _id: req.params.id });


          if (response.result.n === 1) {
            helper.removeImgFBucket(projectAvatarKey);
            return res.status(200).json({
              success: true
            });
          } else {
            return res.status(400).json({
              success: false
            });
          }
        } else {
          return res.status(400).json({
            success: false
          });
        }
      } catch (error) {
        return res.status(400).json({
          message: error.message
        });
      }
    } else {
      // just toggle the project's activation status so it's shown or not shown to the public
      try {
        let project = await Project.updateOne(
          { _id: req.params.id },
          { activated: !findProjectResponse.activated }
        );
        if (project.n === 1) {
          return res.status(200).json({
            success: true
          });
        } else {
          return res.status(400).json({
            success: false
          });
        }
      } catch (error) {
        return res.status(400).json({
          message: error.message,
          success: false
        });
      }
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "You don't have the rights"
    });
  }
};

exports.find_one = async (req, res) => {
  try {
    let project = await Project.findOne({ _id: req.params.id });

    if (project.activated === true || project.owner._id == req.userId) {
      project = project.toJSON();

      project.isOwner = project.owner._id == req.userId;
      res.status(200).json(project);
    } else {
      res.status(400).json({
        message: "This project has been de-activated"
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

exports.add_stakeholder = async (req, res) => {
  try {

    let stakeholders = req.body.stakeholders.map(s => {
      return {
        user: {
          information: s
        }
      }
    });
    let project = await Project.findOne({ _id: req.body.id });

    let shouldAddContractor = await helper.shouldAddContractor(req.body.stakeholders, project.stakeholders);

    const old_stakeholders = project.stakeholders.map(s => ({
      user: {
        information: `${s.user.information._id}`,
        name: `${s.user.information.lastName} ${s.user.information.firstName}`
      }
    }));

    let breakCode = false;
    let count = 0;
    let STinfoID;
    let foundMatch = false;
    let foundPerson = {};

    if (req.body.stakeholders.length > 0) {
      while (breakCode === false) {

        foundMatch = old_stakeholders.some(e => {
          STinfoID = stakeholders[count].user.information;
          foundPerson = e.user.name;
          return e.user.information === STinfoID;
        });

        if (foundMatch === true) breakCode = true;
        count = count + 1;

        if (count === req.body.stakeholders.length) breakCode = true;
      }

      if (breakCode === true && foundMatch === true) {
        return res.status(401).json({
          message: `Cannot add stakeholders because: "This project has a connection with ${foundPerson}" `
        });
      }


      if (shouldAddContractor) {

        let new_stakeholders = [...old_stakeholders, ...stakeholders];

        let saveResponse = await Project.updateOne(
          { _id: req.body.id },
          { $set: { stakeholders: new_stakeholders } }
        );

        if (saveResponse.n === 1) {
          await notify.notifyAddedStakeholders(req, req.body.stakeholders, project);
          return res.status(200).json({
            message: "Stakeholder Added Sucessfully"
          });
        }

      } else {
        return res.status(401).json({
          message: "You cannot add more than one Contractor to a project"
        });
      }
    } else {
      res.status(200).json({
        message: "No Stakeholder Information Provided"
      });
    }
  } catch (error) {
    console.log(error)
    res.status(401).json({
      message: "Stakeholder could not be added"
    });
  }
};
