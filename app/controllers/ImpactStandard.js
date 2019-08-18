const mongoose = require("mongoose");
const ImpactStandard = mongoose.model("ImpactStandard"), ImpactCatgeory = mongoose.model("ImpactCategory");

const grantsObject = require("../helper/access_control");
const { AccessControl } = require('accesscontrol');

const validate = require("../../middleware/validate");

const Helper = require('../helper/helper');


// const file= require("../../iris.csv");


// const multer = require("multer");


// const uploaded = multer({ dest: 'uploads/' })

const doesExist = Symbol();

class ImpactStandardLIb {

    constructor() {
        this.helper = new Helper();
        this.ac = new AccessControl(grantsObject);
    }


    async [doesExist](model, value) {

        let exists = false;

        try {
            let existingRecord = await model.findOne({ "name": { $regex: new RegExp('^' + value, 'i') } });

            if (existingRecord !== null) {
                exists = true
            }

        } catch (error) {
            throw new Error(error.message)
        }
        return exists;
    }

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof ImpactStandardLIb
     */
    async createStandard(req, res) {

        try {
            // validate req body

            validate.validateAddImpactStandard(req, res)
            const errors = req.validationErrors();

            if (errors) {
                return res.status(400).json({
                    message: errors
                });
            }

            const { name, description } = req.body;

            // validate role

            // const role = this.helper.getRole(req.roles);

            // const permission = this.ac.can(role).createAny('impactLibrary').granted;


            // if (!permissiion) {
            //     return res.status().json({ message: "Unauthorized" });
            // }


            // prevent impact standard from being created twice
            //  let existingStandardByName = await ImpactStandard.findOne({ 'name': { $regex: new RegExp('^' + name, 'i') } });


            let existingStandardByName = await this[doesExist](ImpactStandard, name);

            if (existingStandardByName) {
                return res.status(409).json({ message: "You already have an impact standard with thesame name!" });
            }

            // create record
            let standard = await new ImpactStandard({ name, description }).save();

            // return record to user
            return res.status(201).json(standard);

        } catch (error) {
            return res.status(500).json({ message: "internal server error" });
        }

    }



    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof ImpactStandardLIb
     */
    async createImpactCategory(req, res) {

        // validate req body
        try {
            validate.validateAddImpactCategory(req, res)
            const errors = req.validationErrors();

            if (errors) {
                return res.status(400).json({
                    message: errors
                });
            }

            const { name, logo, description, impactStandardId, orderNo, subCategories } = req.body;
            // validate role

            // const role = this.helper.getRole(req.roles);

            // const permission = this.ac.can(role).createAny('impactLibrary').granted;


            // if (!permissiion) {
            //     return res.status().json({ message: "Unauthorized" });
            // }

            // verify impactStandardId against record in db;

            // prevent impact category from being created twice
            let existingCategoryByName = await this[doesExist](ImpactCatgeory, name);

            if (existingCategoryByName) {
                return res.status(409).json({ message: "You already have an impact category with thesame name!" });
            }

            const impactCategory = await new ImpactCatgeory({
                name,
                logo,
                description,
                impactStandardId,
                subCategories,
                orderNo
            }).save();

            return res.status(201).json(impactCategory);
        } catch (error) {
            return res.status(500).json({ message: "internal server error" });

        }



    }


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof ImpactStandardLIb
     */
    async getImpactStandard(req, res) {
        const { id } = req.query;

        let data;

        try {
            if (id && (id !== null || id !== "")) {
                let standard = await ImpactStandard.findById(id);
                data = {
                    impact_standard: standard
                }
            } else {
                let standards = await ImpactStandard.find({});
                data = { impact_standards: standards };
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "internal server error" });
        }


        if (data.hasOwnProperty('impact_standard') && data['impact_standard'] == null) {
            return res.status(404).json({ data: { ...data, message: "impact standard not found" } });
        }

        return res.status(200).json({ data });

    }


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @memberof ImpactStandardLIb
     */
    async getImpactCategory(req, res) {
        const { id } = req.query;

        let data;

        try {
            if (id && (id !== null || id !== "")) {
                let category = await ImpactCatgeory.findById(id).populate({ path: 'impactStandardId', select: 'name' });
                console.log(category)
                data = {
                    impact_category: category
                }
            } else {
                let categories = await ImpactCatgeory.find({}).populate({ path: 'impactStandardId', select: 'name' });
                data = { impact_categories: categories };
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "internal server error" });
        }

        if (data.hasOwnProperty('impact_category') && data['impact_category'] == null) {
            return res.status(404).json({ data: { ...data, message: "impact category not found" } });
        }

        return res.status(200).json({ data });
    }

}



module.exports = {
    ImpactStandardLIb
}