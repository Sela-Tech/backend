"use strict";
require("dotenv").config();
const mongoose = require("mongoose");
const User = mongoose.model("User"),
    Project = mongoose.model('Project'),
    Save = mongoose.model('Save');



class Dashboard {
    constructor() {
        this.savedProjects = {};
        this.createdProjects = {};
        this.joinedProjects = {};
        this.areaOfInterest = {};
        this.result = {};
        this.fundedProjects = {};


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
        try {
            if (all && typeof (all) === 'string' && all === 'true') {
                let projects = await Save.find({ user: req.userId });
                if (projects.length > 0) {
                    projects = projects.map((p) => {
                        return {
                            _id: p.project._id,
                            name: p.project.name,
                            avatar: p.project["project-avatar"],
                            owner: {
                                fullName: `${p.project.owner.firstName} ${p.project.owner.lastName}`,
                                _id: p.project.owner._id
                            }
                        }
                    });
                }

                this.savedProjects = {
                    docs: projects,
                };
                return this.savedProjects;
            }

            let projects = await Save.paginate({ user: req.userId }, { page: Number(page), limit: Number(limit) });
            let docs = projects.docs;
            if (docs.length > 0) {
                docs = docs.map((d) => {
                    return {
                        _id: d.project._id,
                        name: d.project.name,
                        avatar: d.project["project-avatar"],
                        owner: {
                            fullName: `${d.project.owner.firstName} ${d.project.owner.lastName}`,
                            _id: d.project.owner._id
                        }
                    }
                });
            }

            this.savedProjects = {
                docs,
                total: projects.total,
                limit: projects.limit,
                page: projects.page,
                pages: projects.pages
            };
            return this.savedProjects;

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

        try {

            if (req.roles.includes('isFunder') || req.roles.includes('isContractor')) {

                if (all && typeof (all) === 'string' && all === 'true') {
                    let projects = await Project.find({ owner: req.userId });
                    if (projects.length > 0) {
                        projects = projects.map((p) => {
                            return {
                                _id: p._id,
                                name: p.name,
                                avatar: p["project-avatar"],
                                owner: {
                                    fullName: `${p.owner.firstName} ${p.owner.lastName}`,
                                    _id: p.owner._id
                                }
                            }
                        });
                    }

                    this.createdProjects = {
                        docs: projects,
                    };
                    return this.createdProjects;
                }

                let projects = await Project.paginate({ owner: req.userId }, { page: Number(page), limit: Number(limit) });
                let docs = projects.docs;
                if (docs.length > 0) {
                    docs = docs.map((d) => {
                        return {
                            _id: d._id,
                            name: d.name,
                            avatar: d["project-avatar"],
                            owner: {
                                fullName: `${d.owner.firstName} ${d.owner.lastName}`,
                                _id: d.owner._id
                            }
                        }
                    });
                }

                this.createdProjects = {
                    docs,
                    total: projects.total,
                    limit: projects.limit,
                    page: projects.page,
                    pages: projects.pages
                };
                return this.createdProjects;
            }
            return this.createdProjects;
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

        let all = req.query.all;
        try {

            if (all && typeof (all) === 'string' && all === 'true') {

                let projects = await Project.find({
                    'stakeholders.user.information': req.userId,
                    'stakeholders.user.status': 'ACCEPTED', 'stakeholders.user.agreed': true
                });

                if (projects.length > 0) {
                    projects = projects.map((p) => {
                        return {
                            _id: p._id,
                            name: p.name,
                            avatar: p["project-avatar"],
                            owner: {
                                fullName: `${p.owner.firstName} ${p.owner.lastName}`,
                                _id: p.owner._id
                            }
                        }
                    });
                }


                if (req.roles.includes('isContractor') || req.roles.includes('isEvaluator')) {
                    this.joinedProjects = {
                        docs: projects,
                    };
                    return { joinedProjects: this.joinedProjects };;

                }
                else if (req.roles.includes('isFunder')) {
                    this.fundedProjects = {
                        docs: projects,

                    };
                    return { fundedProjects: this.fundedProjects };
                }
            }

            //fetch paginated projects here
            let projects = await Project.paginate({
                'stakeholders.user.information': req.userId,
                'stakeholders.user.status': 'ACCEPTED', 'stakeholders.user.agreed': true
            }, { page: Number(page), limit: Number(limit) });

            let docs = projects.docs;
            if (docs.length > 0) {
                docs = docs.map((d) => {
                    return {
                        _id: d._id,
                        name: d.name,
                        avatar: d["project-avatar"],
                        owner: {
                            fullName: `${d.owner.firstName} ${d.owner.lastName}`,
                            _id: d.owner._id
                        }
                    }
                });

            }



            if (req.roles.includes('isContractor') || req.roles.includes('isEvaluator')) {
                this.joinedProjects = {
                    docs,
                    total: projects.total,
                    limit: projects.limit,
                    page: projects.page,
                    pages: projects.pages
                };
                return { joinedProjects: this.joinedProjects };;

            }
            else if (req.roles.includes('isFunder')) {
                this.fundedProjects = {
                    docs,
                    total: projects.total,
                    limit: projects.limit,
                    page: projects.page,
                    pages: projects.pages
                };
                return { fundedProjects: this.fundedProjects };
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
        let interests = req.decodedTokenData.areasOfInterest;

        try {

            if (all && typeof (all) === 'string' && all === 'true') {
                let projects = await Project.find({ owner: { $ne: req.userId }, tags: { $in: [...interests] } });
                if (projects.length > 0) {
                    // projects= projects.filter(p=>p.owner._id.toString() !== req.userId);
                    projects = projects.map((p) => {
                        return {
                            _id: p._id,
                            name: p.name,
                            avatar: p["project-avatar"],
                            owner: {
                                fullName: `${p.owner.firstName} ${p.owner.lastName}`,
                                _id: p.owner._id
                            }
                        }
                    });
                }

                this.areaOfInterest = {
                    docs: projects,
                };
                return this.areaOfInterest;
            }

            let projects = await Project.paginate({ owner: { $ne: req.userId }, tags: { $in: [...interests] } }, { page: Number(page), limit: Number(limit) });
            let docs = projects.docs;
            if (docs.length > 0) {
                // docs= docs.filter(d=>d.owner._id.toString() !== req.userId);
                docs = docs.map((d) => {
                    return {
                        _id: d._id,
                        name: d.name,
                        avatar: d["project-avatar"],
                        owner: {
                            fullName: `${d.owner.firstName} ${d.owner.lastName}`,
                            _id: d.owner._id
                        }
                    }
                });
            }

            this.areaOfInterest = {
                docs,
                total: projects.total,
                limit: projects.limit,
                page: projects.page,
                pages: projects.pages
            };
            return this.areaOfInterest;

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

        let createdProjects = await this.fetchCreatedProjects(req, res);
        let savedProjects = await this.fetchSavedProject(req, res);

        let joinedProjects = await this.fetchJoinedProjects(req, res);
        let areasOfInterest = await this.fetchAreaOfInterestP(req, res);

        // if (req.roles.includes('isFunder')) {
        return this.result = { createdProjects, savedProjects, ...joinedProjects, areasOfInterest };

        // } else if (req.roles.includes('isContractor') || req.roles.includes('isEvaluator')) {
        // return this.result = { createdProjects, savedProjects, ...joinedProjects, areasOfInterest };

        // }

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
                let areaOfInterest = await new Dashboard().fetchAreaOfInterestP(req, res);
                return res.status(200).json({ result: { areaOfInterest: areaOfInterest } })

            default:
                break;
        }


    }

}

module.exports = new Dashboard();