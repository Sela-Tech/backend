const mongoose = require("mongoose");
const ImpactStandard = mongoose.model("ImpactStandard"), ImpactCatgeory = mongoose.model("ImpactCategory"), MetricDescriptor = mongoose.model('ImpactMetricDescriptor');

const grantsObject = require("../helper/access_control");
const { AccessControl } = require('accesscontrol');

const validate = require("../../middleware/validate");

const Helper = require('../helper/helper');

const csv = require('csv-parser')
const fs = require('fs');
const path = require('path');

// const file= require("../../iris.csv");


// const multer = require("multer");


// const uploaded = multer({ dest: 'uploads/' })

const getFieldName = Symbol();
const getMetrices = Symbol();
const getImpactCategories = Symbol();
const additionalInfo = Symbol();
const getRelatedCategories = Symbol();
const extractRelatedCategories = Symbol()


class ImpactMetricLib {
    /**
     *Creates an instance of ImpactMetricLib.
     * @memberof ImpactMetricLib
     */
    constructor() {
        this.helper = new Helper();
        this.ac = new AccessControl(grantsObject);
    }

    /**
     *
     *
     * @param {*} row
     * @param {*} cat
     * @returns
     * @memberof ImpactMetricLib
     */
    [getFieldName](row, cat) {
        let columns = Object.keys(row);

        return columns.filter(column => column.includes(cat));
    }


    /**
     *
     *
     * @param {*} row
     * @param {*} subCategories
     * @returns
     * @memberof ImpactMetricLib
     */
    [getRelatedCategories](row, cat, subCategories) {
        const subCat = [];
        const relatedCat = [];
        if (Array.isArray(subCategories)) {

            for (let sub of subCategories) {
                if (row[`${sub.name}`] !== '' || row[`${sub.name}`] == 'X') {
                    subCat.push(sub.name)
                    relatedCat.push(cat)
                }

            }

        }
        return { relatedCat: Array.prototype.concat.apply([], [...new Set(relatedCat)]), subCat };


    }

    /**
     *
     *
     * @param {*} subCategories
     * @returns
     * @memberof ImpactMetricLib
     */
    [extractRelatedCategories](subCategories) {
        const relatedCategory = subCategories.relatedCat;
        const relatedSubCat = subCategories.subCat;

        return [relatedCategory, relatedSubCat];
    }

    /**
     *
     *
     * @param {*} row
     * @param {*} fieldsNotNeeded
     * @returns
     * @memberof ImpactMetricLib
     */
    [additionalInfo](row, fieldsNotNeeded) {
        const additionalFields = { ...row }


        let categories = fieldsNotNeeded.map(cat => cat.name);
        let subCategories = Array.prototype.concat.apply([], fieldsNotNeeded.map(subCat => subCat.subCategories)).map(subCat => subCat.name);

        fieldsNotNeeded = [...categories, ...subCategories];

        delete additionalFields.metric_standard_id;
        delete additionalFields['Metric Name'];
        delete additionalFields['Definition'];
        delete additionalFields['Impact Category & Impact Theme'];
        delete additionalFields['SDGs'];

        for (let field of fieldsNotNeeded) {
            delete additionalFields[`${field}`]
        }

        return additionalFields

    }

    /**
     *
     *
     * @param {*} rows
     * @param {*} categories
     * @returns
     * @memberof ImpactMetricLib
     */
    [getMetrices](rows, categories, standard) {

        const metrices = [];
        let columnsToIgnore = [...new Set(categories)];

        return new Promise((resolve, reject) => {
            try {

                rows.forEach((row) => {
                    const impactCategories = [];
                    const relatedSubCategories = [];

                    for (let cat of categories) {

                        const hasKey = Object.keys(row).includes(cat.name);
                        if (hasKey && (row[`${cat.name}`] == 'X' || row[`${cat.name}`] !== '')) {
                            impactCategories.push(cat.id);

                        }

                        if (hasKey && cat.subCategories.length > 0) {
                            const sub = this[getRelatedCategories](row, cat.id, cat.subCategories);
                            const [relatedCategory, relatedSubCat] = this[extractRelatedCategories](sub);
                            impactCategories.push(...relatedCategory);
                            relatedSubCategories.push(...relatedSubCat);
                        }



                    }


                    metrices.push({
                        metric_standard_id: row['metric_standard_id'],
                        name: row["Metric Name"],
                        description: row['Definition'],
                        impactCategories: [...new Set(impactCategories)],
                        standard,
                        additionalInfo: this[additionalInfo](row, columnsToIgnore),
                        relatedSubImpactCategory: relatedSubCategories

                    });

                })

                resolve(metrices);
            } catch (error) {
                reject(new Error(error.message))
            }

        })
    }

    /**
     *
     *
     * @returns
     * @memberof ImpactMetricLib
     */
    async [getImpactCategories]() {
        let categories;

        try {
            categories = await ImpactCatgeory.find({});
            categories = categories.map((category) => {
                return {
                    name: category.name,
                    id: category._id,
                    orderNo: category.orderNo,
                    subCategories: category.subCategories
                }
            })
        } catch (error) {
            throw new Error(error.message)
        }

        return categories;

    }


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @memberof ImpactMetricLib
     */
    async uploadmetricCSV(req, res) {
        // if (Object.keys(req.files).length == 0) {
        //     return res.status(400).json({message:'No files were uploaded.'});
        //   }

        const standard = req.query.standard_name || 'IRIS'

        const { csvFile } = req.files;

        const fileName = Date.now() + '-' + csvFile.name;

        csvFile.mv(path.resolve('temp_upload/' + fileName), async (err) => {
            if (err) console.log(err);

            const rows = [];
            let categories = await this[getImpactCategories]();

            if (categories.length == 0) {
                return res.status(404).json({ message: "There are no categories to map with metrices" });
            }

            try {
                // console.log(req.files)
                fs.createReadStream(path.resolve('temp_upload/' + fileName))
                    .pipe(csv())
                    .on('data', (data) => rows.push(data))
                    .on('end', async () => {
                        // res.json(rows)
                        const metrices = await this[getMetrices](rows, categories, standard);

                        const metricLib = await MetricDescriptor.insertMany(metrices);

                        if (err) {
                            return res.status(409).json({ message: "impact metrices already exists" });

                        }

                        fs.unlinkSync(path.resolve('temp_upload/' + fileName));
                        // //    const withoutCat= metrices.filter(metric=>metric.impactCategories.length ==0).map(metric=>metric.metric_standard_id)
                        return res.status(201).json({ data: { metricLib } });

                    });

            } catch (error) {
                // throw new Error(error)

                return res.json({ message: "internal server error" })
                // if (error.includes('duplicate key error index')){
                // }
            }



        })

    }


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof ImpactMetricLib
     */
    async getImpactMetrices(req, res) {
        const { id } = req.query;

        let data;

        try {
            if (id && (id !== null || id !== "")) {
                let metric = await MetricDescriptor.findById(id)
                    .populate({
                        path: "impactCategories",
                        select: "name",
                        populate: {
                            path: "impactStandardId",
                            select: "name"
                        }
                    });

                data = { impact_metric: metric }

            } else {
                let metrices = await MetricDescriptor.find({})
                    .populate({
                        path: "impactCategories",
                        select: "name"
                    });

                data = { impact_metrices: metrices };
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "internal server error" });
        }


        if (data.hasOwnProperty('impact_metric') && data['impact_metric'] == null) {
            return res.status(404).json({ data: { ...data, message: "impact metric not found" } });
        }

        return res.status(200).json({ data });

    }

}

module.exports = {
    ImpactMetricLib
}