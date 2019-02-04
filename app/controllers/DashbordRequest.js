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
        let { page } = req.query || 1;
        let { limit } = req.query || 20;
        try {
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
        let { page } = req.query || 1;
        let { limit } = req.query || 20;

        try {
            if (req.roles.includes('isFunder') || req.roles.includes('isContractor')) {
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
        let { page } = req.query || 1;
        let { limit } = req.query || 20;

        try {

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
        let { page } = req.query || 1;
        let { limit } = req.query || 20;
        try {
            let interests = req.decodedTokenData.areasOfInterest[0];
            // // interests = Object.assign({}, [...interests]);
            let projects = await Project.paginate({ tags: { $all: interests } }, { page: Number(page), limit: Number(limit) });
            // console.log(projects);
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

        return this.result = { createdProjects, savedProjects, joinedProjects, areasOfInterest };

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
                return res.status(200).json({ result:{areaOfInterest:areaOfInterest}  })

            default:
                break;
        }


    }

}

module.exports = new Dashboard();