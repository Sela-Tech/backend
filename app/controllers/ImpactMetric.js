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
const getRelatedSubCategories = Symbol();
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
    [getRelatedSubCategories](row, cat, subCategories) {
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


    [extractRelatedCategories](subCategories) {
        const relatedCategory = subCategories.relatedCat;
        const relatedSubCat = subCategories.subCat;

        return [relatedCategory, relatedSubCat];
    }


    [additionalInfo](row, unusedFields) {
        const additionalFields = { ...row }

        delete additionalFields.metric_standard_id;
        delete additionalFields['Metric Name'];
        delete additionalFields['Definition'];
        delete additionalFields['Impact Category & Impact Theme'];
        delete additionalFields['SDGs'];

        for (let field of unusedFields) {
            delete additionalFields[`${field.name}`]
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
                            const sub = this[getRelatedSubCategories](row, cat.id, cat.subCategories);
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

                        // cat:row[`${cat}`]
                    });

                })

                // const ignored = new Set(columnsToIgnore)

                // const ignored =[...new Set(columnsToIgnore)]


                resolve(metrices);
            } catch (error) {
                reject(new Error(error.message))
            }

        })
    }


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

        csvFile.mv(path.resolve('temp_upload/' + fileName), async(err) => {
            if (err) console.log(err);

            const rows = [];
            let categories = await this[getImpactCategories]();

            if (categories.length == 0) {
                return res.status(404).json({ message: "There are no categories to map with metrices" });
            }

            try {
                // console.log(req.files)
                fs.createReadStream(path.resolve('temp_upload/'+fileName))
                    .pipe(csv())
                    .on('data', (data) => rows.push(data))
                    .on('end', async () => {
                        // res.json(rows)
                        const metrices = await this[getMetrices](rows, categories, standard);

                        const metricLib = await MetricDescriptor.insertMany(metrices);

                        // //    const withoutCat= metrices.filter(metric=>metric.impactCategories.length ==0).map(metric=>metric.metric_standard_id)
                        res.status(201).json({ data: { metricLib } });

                    });

            } catch (error) {
                throw new Error(error)
                // if (error.includes('duplicate key error index')){
                // }
            }



        })

        // return res.status(200).json(req.file);



    }
}

module.exports = {
    ImpactMetricLib
}