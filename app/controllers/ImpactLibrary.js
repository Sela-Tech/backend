const mongoose = require("mongoose");
const ImpactStandard = mongoose.model("ImpactStandard"), ImpactCatgeory = mongoose.model("ImpactCategory");

const grantsObject = require("../helper/access_control");
const { AccessControl } = require('accesscontrol');

const validate = require("../../middleware/validate");

const Helper = require('../helper/helper');


class ImpactStandardLIb {

    constructor() {
        this.helper = new Helper();
        this.ac = new AccessControl(grantsObject);
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

            const { name, logo, description, impactStandardId } = req.body;
            // validate role

            // const role = this.helper.getRole(req.roles);

            // const permission = this.ac.can(role).createAny('impactLibrary').granted;


            // if (!permissiion) {
            //     return res.status().json({ message: "Unauthorized" });
            // }

            // verify impactStandardId against record in db;

            const impactCategory = await new ImpactCatgeory({
                name,
                logo,
                description,
                impactStandardId
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

}

class ImpactLibraryLib {

}

module.exports = {
    ImpactLibraryLib,
    ImpactStandardLIb
}