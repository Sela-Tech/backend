const mongoose = require("mongoose");
const ImpactStandard = mongoose.model("ImpactStandard"), ImpactCatgeory = mongoose.model("ImpactCategory");

const grantsObject = require("../helper/access_control")
const { AccessControl } = require('accesscontrol');




export class ImpactStandardLIb {

    async createStandard(req, res) {
        const { name, description } = req.body;

        // validate role

        const role = helper.getRole(req.roles);

        const permission = ac.can(role).createOwn('proposal').granted;

        if (!permissiion) {
            return res.status().json({ message: "Unauthorized" });
        }

        let standard = await new ImpactStandard({ name, description }).save();

        return res.status(201).json(standard);


        // validate input
        // create record
    }

}

class ImpactLibraryLib {

}