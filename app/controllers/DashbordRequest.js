"use strict";
require("dotenv").config();
const mongoose = require("mongoose");
const User = mongoose.model("User"),
    Project = mongoose.model('Project'),
    Save = mongoose.model('Save');



function formatData(data) {
    return {
        _id: data._id,
        name: data.name,
        description:data.description,
        status: data.status,
        goal: data.goal,
        location: {
            name: data.location.name,
            lat:data.location.lat,
            lng:data.location.lng
        },
        avatar: data["project-avatar"],
        owner: {
            fullName: `${data.owner.firstName} ${data.owner.lastName}`,
            _id: data.owner._id,
            organization:data.owner.organization
        },
        tags: data.tags,
        stakeholders:data.stakeholders,
        observationBudget: data.observationBudget,
        implementationBudget: data.implementationBudget
    }
}


class Dashboard {
    constructor() {
        // this.savedProjects = {};
        // createdProjects = {};
        // joinedProjects = {};
        // areaOfInterest = {};
        // result = {};
        // fundedProjects = {};


        this.fetchSavedProject = this.fetchSavedProject.bind(this);
        this.fetchCreatedProjects = this.fetchCreatedProjects.bind(this);
        this.getAll = this.getAll.bind(this);
        this.fetchJoinedProjects = this.fetchJoinedProjects.bind(this);
        this.fetchAreaOfInterestP = this.fetchAreaOfInterestP.bind(this);

    }



    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Dashboard
     */
    async fetchSavedProject(req, res) {
        let page = req.query.page || 1;
        let limit = req.query.limit || 20;
        let all = req.query.all;
        let savedProjects;
        try {
            if (all && typeof (all) === 'string' && all === 'true') {
                let projects = await Save.find({ user: req.userId });
                if (projects.length > 0) {
                    projects = projects.map((p) => {
                        return formatData(p.project)
                    }).reverse();
                }

                savedProjects = {
                    docs: projects,
                };
                return savedProjects;
            }

            let projects = await Save.paginate({ user: req.userId }, { page: Number(page), limit: Number(limit) });
            let docs = projects.docs;
            if (docs.length > 0) {
                docs = docs.map((d) => {
                    return formatData(d.project)

                }).reverse();
            }

            savedProjects = {
                docs,
                total: projects.total,
                limit: projects.limit,
                page: projects.page,
                pages: projects.pages
            };
            return savedProjects;

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "internal server error" })
        }
    }

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Dashboard
     */
    async fetchCreatedProjects(req, res) {
        let page = req.query.page || 1;
        let limit = req.query.limit || 20;
        let all = req.query.all;

        let createdProjects;

        try {

            if (req.roles.includes('isFunder') || req.roles.includes('isContractor')) {

                if (all && typeof (all) === 'string' && all === 'true') {
                    let projects = await Project.find({ owner: req.userId });
                    if (projects.length > 0) {
                        projects = projects.map((p) => {
                            return formatData(p)
                        }).reverse();
                    }

                    createdProjects = {
                        docs: projects,
                    };
                    return createdProjects;
                }

                let projects = await Project.paginate({ owner: req.userId }, { page: Number(page), limit: Number(limit) });
                let docs = projects.docs;
                if (docs.length > 0) {
                    docs = docs.map((d) => {
                        return formatData(d)
                    }).reverse();
                }

                createdProjects = {
                    docs,
                    total: projects.total,
                    limit: projects.limit,
                    page: projects.page,
                    pages: projects.pages
                };
                return createdProjects;
            }
            return createdProjects;
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "internal server error" })
        }
    }

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Dashboard
     */
    async fetchJoinedProjects(req, res) {
        let page = req.query.page || 1;
        let limit = req.query.limit || 20;

        let fundedProjects;
        let joinedProjects;
        let all = req.query.all;
        try {

            if (all && typeof (all) === 'string' && all === 'true') {

                // let projects = await Project.find({
                //     'stakeholders.user.information': req.userId,
                //     'stakeholders.user.status': 'ACCEPTED', 'stakeholders.user.agreed': true
                // });

                let projects = await Project.find(
                    {
                        stakeholders: {
                            $elemMatch: {
                                'user.information': req.userId, 'user.status': 'ACCEPTED',
                                'user.agreed': true
                            }
                        }
                    }
                );

                if (projects.length > 0) {
                    projects = projects.map((p) => {
                        return formatData(p)
                    }).reverse();
                }


                if (req.roles.includes('isContractor') || req.roles.includes('isEvaluator')) {
                    joinedProjects = {
                        docs: projects,
                    };
                    return { joinedProjects: joinedProjects };;

                }
                else if (req.roles.includes('isFunder')) {
                    fundedProjects = {
                        docs: projects,

                    };
                    return { fundedProjects: fundedProjects };
                }
            }

            //fetch paginated projects here
            let projects = await Project.paginate({
                stakeholders: {
                    $elemMatch: {
                        'user.information': req.userId,
                        'user.status': 'ACCEPTED', 'user.agreed': true
                    }
                }
            },
                { page: Number(page), limit: Number(limit) });

            let docs = projects.docs;
            if (docs.length > 0) {
                docs = docs.map((d) => {
                    return formatData(d)
                }).reverse();

            }



            if (req.roles.includes('isContractor') || req.roles.includes('isEvaluator')) {
                joinedProjects = {
                    docs,
                    total: projects.total,
                    limit: projects.limit,
                    page: projects.page,
                    pages: projects.pages
                };
                return { joinedProjects: joinedProjects };;

            }
            else if (req.roles.includes('isFunder')) {
                fundedProjects = {
                    docs,
                    total: projects.total,
                    limit: projects.limit,
                    page: projects.page,
                    pages: projects.pages
                };
                return { fundedProjects: fundedProjects };
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "internal server error" })
        }
    }


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @memberof Dashboard
     */
    async fetchAreaOfInterestP(req, res) {
        let page = req.query.page || 1;
        let limit = req.query.limit || 20;
        let all = req.query.all;
        // let interests = req.decodedTokenData.areasOfInterest;
        let areaOfInterest
        try {

            let user = await User.findById(req.userId);
            let interests = user.areasOfInterest;

            if (all && typeof (all) === 'string' && all === 'true') {
                let projects = await Project.find({ owner: { $ne: req.userId }, tags: { $in: [...interests] } });
                // let projects = await Project.find({ tags: { $in: [...interests] }, $or:[{owner: { $ne: req.userId } }, {'stakeholders.user.information':req.userId, 'stakeholders.user.status':{$ne:'ACCEPTED'}}] });
                // let projects = await Project.find({owner: { $ne: req.userId }, tags: { $in: [...interests] }, $or:[{'stakeholders.user.information':req.userId, 'stakeholders.user.status':{$ne:'ACCEPTED'}},{'stakeholders.user.information':{$ne:req.userId} }] });


                // filter out projects user may have joined or funded
                // projects= projects.map((project)=>{
                //     project= project.stakeholders.filter((stakeholder)=>{
                //         return stakeholder.user.information._id.toString()!==req.userId && stakeholder.user.status !=='ACCEPTED'
                //     });
                //     return project;
                // });



                if (projects.length > 0) {
                    // projects= projects.filter(p=>p.owner._id.toString() !== req.userId);



                    projects = projects.map((p) => {
                        return formatData(p)

                    }).reverse();
                }

                areaOfInterest = {
                    docs: projects,
                };
                return areaOfInterest;
            }

            let projects = await Project.paginate({ owner: { $ne: req.userId }, tags: { $in: [...interests] } }, { page: Number(page), limit: Number(limit) });
            let docs = projects.docs;
            if (docs.length > 0) {
                // docs= docs.filter(d=>d.owner._id.toString() !== req.userId);
                docs = docs.map((d) => {
                    return formatData(d)
                }).reverse();
            }

            areaOfInterest = {
                docs,
                total: projects.total,
                limit: projects.limit,
                page: projects.page,
                pages: projects.pages
            };
            return areaOfInterest;

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "internal server error" })
        }
    }


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Dashboard
     */
    async getAll(req, res) {
        let result;
        let createdProjects = await this.fetchCreatedProjects(req, res);
        let savedProjects = await this.fetchSavedProject(req, res);

        let joinedProjects = await this.fetchJoinedProjects(req, res);
        let areasOfInterest = await this.fetchAreaOfInterestP(req, res);

        result = { createdProjects, savedProjects, ...joinedProjects, areasOfInterest };

        return result;
    }


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Dashboard
     */
    async handleRequest(req, res) {
        let cat = req.query.cat;
        switch (cat) {
            case 'a':
                let result = await new Dashboard().getAll(req, res)
                return res.status(200).json({ result });
            case 's':
                let savedProjects = await new Dashboard().fetchSavedProject(req, res);
                return res.status(200).json({ result: { savedProjects: savedProjects } });

            case 'c':
                let createdProjects = await new Dashboard().fetchCreatedProjects(req, res);
                return res.status(200).json({ result: { createdProjects: createdProjects } });

            case 'j':
                let joinedProjects = await new Dashboard().fetchJoinedProjects(req, res);
                return res.status(200).json({ result: joinedProjects });

            case 'i':
                let areasOfInterest = await new Dashboard().fetchAreaOfInterestP(req, res);
                return res.status(200).json({ result: { areasOfInterest: areasOfInterest } })

            default:
                break;
        }


    }

}

module.exports = new Dashboard();