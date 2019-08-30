"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    Project = mongoose.model("Project"),
    User = mongoose.model("User"),
    Location = mongoose.model("Location"),
    Transaction = mongoose.model("Transaction"),
    Proposal = mongoose.model("Proposal"),
    ProjectGoal = mongoose.model("ProjectGoal"),
    Donation = mongoose.model("Donation");
const moment = require('moment');

const notify = require('../helper/notifications');
const Helper = require('../helper/helper');
const validator = require('validator');
const _ = require('lodash');

let helper = new Helper();


/**
 *
 *
 * @class Projects
 */
class Projects {


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Projects
     */

    // static async newProject(req, res) {
    //   var successRes = { success: true };
    //   var failRes = { success: false };
    //   var projectObj = req.body;
    //   projectObj.owner = req.userId;
    //   let SHs = [];
    //   var newLocation = new Location(req.body.location);
    //   const mimimumBalanceToCreateProject = 10;

    //   try {
    //     // let user = await User.findById(req.userId);                                                      //uncomment to restore blockchain

    //     // check user balance before creating a project

    //     // const userWalletBalance = await helper.getWalletBalance(req.token, user.publicKey);              //uncomment to restore blockchain

    //     // if (userWalletBalance.balances.success == true) {                                                //uncomment to restore blockchain

    //     //   const balances = userWalletBalance.balances.balances                                           //uncomment to restore blockchain
    //     //   // get lumen balance
    //     //   let lumenBalance = balances.find(balance => balance.type === 'native');                        //uncomment to restore blockchain

    //     //   if (Number(lumenBalance.balance) < mimimumBalanceToCreateProject) {                            //uncomment to restore blockchain
    //     //     return res.json({ message: "You do not have enough XLM balance to create a project" })       //uncomment to restore blockchain
    //     //   }                                                                                              //uncomment to restore blockchain

    //     // } else {                                                                                         //uncomment to restore blockchain
    //     //   return res.status(404).json({ message: userWalletBalance.message })                            //uncomment to restore blockchain
    //     // }                                                                                                //uncomment to restore blockchain

    //     if (projectObj.stakeholders && projectObj.stakeholders.length > 0) {
    //       // let shouldAddContractor = await helper.shouldAddContractor(projectObj.stakeholders, null)
    //       // if(shouldAddContractor){
    //       SHs = [...projectObj.stakeholders];
    //       projectObj.stakeholders = projectObj.stakeholders.map(s => {
    //         return {
    //           user: {
    //             information: s
    //           }
    //         }
    //       });
    //       // }else{
    //       //   failRes.message ="You cannot add more than one Contractor to a project";
    //       //   console.log(failRes)
    //       //   return res.status(400).json(failRes);
    //       // }

    //     } else {

    //       projectObj.stakeholders = [];

    //     }

    //     const saveProject = async projectObj => {

    //       if (typeof (projectObj.tags) === "string" || typeof (projectObj.tags) === "String") {
    //         projectObj.tags = [projectObj.tags]
    //       } else if (Boolean(projectObj.tags) === false) {
    //         projectObj.tags = []
    //       }

    //       var newProject = new Project(projectObj);


    //       // return res.json(newProject)

    //       let newP = await newProject.save();

    //       if (newP) {

    //         // const assetName = helper.generateAssetName();                                                    //uncomment to restore blockchaine
    //         // let projectToken = {                                                                             //uncomment to restore blockchaine
    //         //   assetName,                                                                                     //uncomment to restore blockchaine
    //         //   project: newProject._id,                                                                       //uncomment to restore blockchaine
    //         //   implementationBudget: newProject.implementationBudget,                                         //uncomment to restore blockchaine
    //         //   observationBudget: newProject.observationBudget,                                               //uncomment to restore blockchaine
    //         //   publicKey: user.publicKey                                                                      //uncomment to restore blockchaine
    //         // }                                                                                                //uncomment to restore blockchaine

    //         // let createdAsset = await helper.createAsset(projectToken, req.token);                            //uncomment to restore blockchaine

    //         // if (createdAsset.success == true) {                                                              //uncomment to restore blockchaine
    //         //   newP.pst = assetName;                                                                           //uncomment to restore blockchaine
    //         //   newP.issuingAccount = createdAsset.newProject.issuingAccount.pk                                  //uncomment to restore blockchaine
    //         //   newP.distributionAccount = createdAsset.newProject.distributionAccount.pk                        //uncomment to restore blockchaine
    //         //   await newP.save();                                                                               //uncomment to restore blockchaine
    //         // }                                                                                                  //uncomment to restore blockchaine

    //         if (SHs.length > 0) {
    //           let project = await Project.findById(newP._id);
    //           await notify.notifyAddedStakeholders(req, SHs, project)
    //         }

    //         successRes.project = newP;
    //         return res.status(200).json(successRes);
    //       }
    //     };

    //     Location.findOne(
    //       {
    //         name: req.body.location.name,
    //         lat: req.body.location.lat,
    //         lng: req.body.location.lng
    //       },
    //       (err, single) => {
    //         if (single === null) {
    //           newLocation.save((err, l) => {
    //             if (err) return res.status(500).json({ message: err.message });
    //             projectObj.location = l._id;
    //             saveProject(projectObj);
    //           });
    //         } else {
    //           projectObj.location = single._id;
    //           saveProject(projectObj);

    //         }
    //       }
    //     );
    //   } catch (error) {
    //     console.log(error);
    //     return res.status(500).json({ message: `internal server error` });
    //   }
    // }


    static async newProject(req, res) {
        // import project-avatar

        let successRes = { success: true };
        let failRes = { success: false };

        console.log(req.body)
        const { name, description, impactStandardId, impactCategoryId, goals, startDate, endDate, location, implementationBudget } = req.body;

        const avatar = req.body["project-avatar"];

        let projectLocation;
        // const {name, lat, lng} = location;
        // verify location

        try {
            const existionLocation = await Location.findOne({
                name: location.name,
                lat: location.lat,
                lng: location.lng
            });

            if (existionLocation !== null) {
                projectLocation = existionLocation._id;
            } else {

                const newLocation = await new Location({
                    name: location.name,
                    lat: location.lat,
                    lng: location.lng
                }).save();
                projectLocation = newLocation._id
            }

            const projectInfo = {
                name,
                description,
                impactCategoryId,
                impactStandardId,
                startDate,
                endDate,
                implementationBudget,
                location: projectLocation,
                "project-avatar": avatar,
                owner: req.userId
            }

            const project = new Project(projectInfo);

            const projectGoals = goals.map((goal) => {
                return {
                    project: project._id,
                    name: goal.name,
                    metrics: goal.metrics
                }
            });

            const newGoals = ProjectGoal.insertMany(projectGoals);

            const [newProject, newGoalProjectGoals] = await Promise.all([project.save(), newGoals])

            if (newProject) {
                // return res.status(201).json({ newProject })

                successRes.project = newProject;
                return res.status(201).json(successRes);
            }
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: `internal server error` });
        }


    }

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @memberof Projects
     */
    static async find(req, res) {
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
            checkQuery = {...otherQueryParams, owner: req.userId };
        } else {
            checkQuery = otherQueryParams;
        }



        Project.find(checkQuery).sort({ createdOn: -1 })
            .skip(skip)
            .limit(limit)
            .exec(async function(err, projects) {
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


                // get donations for project 

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


                let projectIds = projects.map((project) => project._id)

                let donations = await Donation.find({
                    project: [...projectIds],
                    $or: [
                        { status: "succeeded" },
                        { status: "charge:confirmed" },
                        { status: "COMPLETED" },
                        { status: "charge_confirmed" }
                    ]
                });

                let p = successRes.projects

                successRes.projects = p.map((project) => {
                    project = project.toJSON();
                    delete project.raised;
                    project.raised = Projects.extractProjectDonations(project._id, donations)
                    return project
                })

                return res.json(successRes);
            });
    }



    /**
     *
     *
     * @static
     * @param {*} projectId
     * @param {*} donations
     * @returns
     * @memberof Projects
     * @description, extracts and sum the donations for a particular project
     */
    static extractProjectDonations(projectId, donations) {
        let projectDonations = donations.filter(donation => donation.project.toString() === projectId.toString())
            .map(amount => amount.amountDonated)
        if (projectDonations.length == 0) return 0;

        return projectDonations.reduce((current, next) => current + next);
    }

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Projects
     */
    static async delete(req, res) {
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
                    let project = await Project.updateOne({ _id: req.params.id }, { activated: !findProjectResponse.activated });
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
    }


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @memberof Projects
     */
    static async find_one(req, res) {
        try {
            let project = await Project.findOne({ _id: req.params.id });

            // lazy load proposals related to project

            let proposals = await Proposal.find({ project: project._id });


            // temporary code to update implementation and observationBudget,
            // do not use in production
            // if(project.observationBalance == null && implementationBalance==null){
            //    project = await helper.createOrUpdateBalances(project._id,null,null,true);
            // }

            if (project.activated === true || project.owner._id == req.userId) {
                project = project.toJSON();

                if (project.raised) {
                    delete project.raised;
                }

                // get success full donations related to project

                // let donations = await Donation.aggregate([{
                //   $match: { project: project._id }
                // },
                //   {
                //     $group:
                //       { _id: '$project', raised: { $sum: '$amount' } }
                //   }])

                let donations = await Donation.find({
                    project: project._id,
                    $or: [
                        { status: "succeeded" },
                        { status: "charge:confirmed" },
                        { status: "COMPLETED" },
                        { status: "charge_confirmed" }
                    ]
                });
                if (donations.length > 0) {
                    donations = donations.map((donation) => { return donation.amountDonated }).reduce((current, next) => current + next);
                } else {
                    donations = 0
                }


                project.isOwner = project.owner._id == req.userId;
                project.proposals = proposals;
                project.raised = donations
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
    }


    static async updateProject(req, res) {
        const { id } = req.params
        try {
            let project = await Project.findById(id);
            if (project == null) {
                return res.status(404).json({ message: "Project Not Found." })
            }

            if (project.owner._id.toString() !== req.userId) {
                return res.status(401).json({ message: "You are not authorized to perform this action." })
            }

            const updateObj = req.body;

            // return res.json(updateObj);
            let updatedProject = await Project.findByIdAndUpdate(id, updateObj);

            if (updatedProject) {
                return res.status(200).json({ message: "Project has been updated" });

            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "internal server error" })
        }
    }

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Projects
     */
    static async add_stakeholder(req, res) {

        try {


            let stakeholderArray = req.body.stakeholders;

            // separate emails from the list of stakeholders
            let extractEmail = stakeholderArray.filter((data) => {
                return data && validator.isEmail(data)
            });

            // remove extracted email from stakeholderArray
            for (let item of extractEmail) {
                let index = stakeholderArray.indexOf(item);
                stakeholderArray.splice(index, 1);
            }

            // get the users via the email
            // let usersIdFromEmail= await Projects.getUserFromEmail(extractEmail)

            // merge back the retrieved ids from email into the stakeholderArray
            // stakeholderArray= [...new Set([...stakeholderArray,...usersIdFromEmail])];


            let stakeholders = stakeholderArray.map(s => {
                return {
                    user: {
                        information: s
                    }
                }
            });



            let project = await Project.findOne({ _id: req.body.id });



            // let shouldAddContractor = await helper.shouldAddContractor(stakeholderArray, project.stakeholders);

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

            if (stakeholderArray.length > 0) {
                while (breakCode === false) {

                    foundMatch = old_stakeholders.some(e => {
                        STinfoID = stakeholders[count].user.information;
                        foundPerson = e.user.name;
                        return e.user.information === STinfoID;
                    });

                    if (foundMatch === true) breakCode = true;
                    count = count + 1;

                    if (count === stakeholderArray.length) breakCode = true;
                }

                if (breakCode === true && foundMatch === true) {
                    return res.status(401).json({
                        message: `Cannot add stakeholders because: "This project has a connection with ${foundPerson}" `
                    });
                }


                // if (shouldAddContractor) {

                // let new_stakeholders = [...old_stakeholders, ...stakeholders];

                stakeholders.forEach(stakeholder => {
                    project.stakeholders.push(stakeholder)
                });


                // return res.json({project})
                // let saveResponse = await Project.updateOne(
                //   { _id: req.body.id },
                //   { $push: { stakeholders: ...stakeholders } }
                // );

                let saveResponse = await project.save();

                if (saveResponse) {
                    await notify.notifyAddedStakeholders(req, stakeholderArray, project);
                    return res.status(200).json({
                        message: "Stakeholder Added Sucessfully"
                    });
                }

                // } else {
                //   return res.status(401).json({
                //     message: "You cannot add more than one Contractor to a project"
                //   });
                // }
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
    }


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @memberof Projects
     * @returns {object}
     * @description returns the details of a project as seen by a contractor viewing 
     *              a project initiated byothers
     */
    static async contractorViewProjectDetails(req, res) {

            try {
                // check if project exists
                let project = await Project.findById(req.params.id)

                if (!project) {
                    return res.status(404).json({ message: "Project does not exist" });
                }

                // check if he a stakeholder on the project
                let isProjectStakeholder = project.stakeholders.some(c => c.user.information._id.toString() === req.userId && c.user.status === 'ACCEPTED')

                // check if contractor has submitted a proposal already

                let hasSubmitted;

                let proposal = await Proposal.findOne({ proposedBy: req.userId, project: req.params.id });
                proposal ? hasSubmitted = true : hasSubmitted = false;
                const info = {
                        image: project["project-avatar"],
                        title: project.name,
                        documents: project.documents.map((doc) => {
                            return {
                                name: doc.name,
                                _id: doc._id,
                                filesize: doc.filesize || null,
                                doc: doc.doc,
                                filetype: doc.filetype,
                                project: doc.project,
                                createdAt: doc.createdAt,
                                updatedAt: doc.updatedAt
                            }
                        }),
                        isProjectStakeholder,
                        hasSubmitted,
                        status: project.status,
                        description: project.description,
                        goal: `${`$${project.goal}`}`,
        location: project.location.name,
        initiated_by: {
          id: project.owner._id,
          name: `${project.owner.firstName} ${project.owner.lastName}`,
          user_type: helper.getRole(project.owner),
          avatar: project.owner.profilePhoto
        },
        expected_duration: `${moment(project.startDate).format("DD MMM YY")} - ${moment(project.endDate).format("DD MMM YY")}`,
        sdgs: project.tags
      }

      if (hasSubmitted) {
        info.proposalId = proposal._id;
      } else {
        info.proposalId = null;
      }

      return res.status(200).json(info);
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        message: error.message
      });
    }

  }



  /**
   *
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @returns
   * @memberof Projects
   */
  static async getProjectBalances(req, res) {
    try {
      const { id } = req.params;

      let project = await Project.findOne({ _id: id, owner: req.userId });

      if (project == null || project == undefined) {
        return res.status(404).json({ message: "Project not found" })
      }

      let token = req.headers['authorization'];
      let balances = await helper.getProjectBalancesOrhistory(project._id, token);

      if (balances.success == true) {
        return res.status(200).json(balances)
      } else {
        return res.status(400).json({ message: "Could not project asset balances" })
        // return res.status(400).json({message:balances.message})
      }
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "internal server error" })
    }
  }


  /**
   *
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @returns
   * @memberof Projects
   */

  static async getProjectTransactionHistory(req, res) {
    try {
      const { id } = req.params;
      let page = req.query.page || 1;
      let limit = req.query.limit || 20;


      // let project = await Project.findOne({ _id: id, owner: req.userId });
      let project = await Project.findOne({ _id: id });

      if (project == null || project == undefined) {
        return res.status(404).json({ message: "Project not found" })
      }

      let projectOwner = project.owner._id.toString();

      const isProjectOwner = projectOwner === req.userId.toString();

      let transactions;

      switch (isProjectOwner) {
        case true:
          transactions = await Transaction.find({ project: project._id },
            { page: Number(page), limit: Number(limit) }).populate('');
          return res.status(200).json({ transactions });

        case false:
          transactions = await Transaction.find({ project: project._id, receiver: req.userId },
            { page: Number(page), limit: Number(limit) });
          return res.status(200).json({ transactions });
        default:
          break;
      }





      // let token = req.token;
      // let transactions = await helper.getProjectBalancesOrhistory(project._id, token, true);

      // if (transactions.status == 200) {
      //   return res.status(200).json(transactions)
      // } else {
      //   return res.status(400).json({ message: "Could not retrieve project transactions" })
      //   // return res.status(400).json({message:balances.message})
      // }
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "internal server error" })
    }
  }


  // extract user id from email(s)
  static async getUserFromEmail(emails) {
    let users = await User.find({ email: [...emails] });
    // extract user ids
    if (users.length < 1) {
      return [];
    }
    let ids = users.map(user => user._id.toString());
    return ids;
  }
}



module.exports = { Projects }