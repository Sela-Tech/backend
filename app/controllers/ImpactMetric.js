const mongoose = require("mongoose");
const ImpactStandard = mongoose.model("ImpactStandard"), ImpactCatgeory = mongoose.model("ImpactCategory"), MetricDescriptor = mongoose.model('ImpactMetricDescriptor');

const grantsObject = require("../helper/access_control");
const { AccessControl } = require('accesscontrol');

const validate = require("../../middleware/validate");

const Helper = require('../helper/helper');

const csv = require('csv-parser')
const fs = require('fs');

// const file= require("../../iris.csv");


// const multer = require("multer");


// const uploaded = multer({ dest: 'uploads/' })

const getFieldName = Symbol();
const getMetrices = Symbol();
const getImpactCategories = Symbol();
const additionalInfo = Symbol();


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

                    for (let cat of categories) {

                        if (Object.keys(row).includes(cat.name) && (row[`${cat.name}`] == 'X' || row[`${cat.name}`] !== '')) {
                            impactCategories.push(cat.id);

                        }
                    }

                    metrices.push({
                        metric_standard_id: row['metric_standard_id'],
                        name: row["Metric Name"],
                        description: row['Definition'],
                        impactCategories: impactCategories,
                        standard,
                        additionalInfo: this[additionalInfo](row, columnsToIgnore)

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
                    subCategories:category.subCategories
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
        //     return res.status(400).send('No files were uploaded.');
        //   }

        // const { csv } = req.files

        const standard = req.query.standard_name || 'IRIS'

        const rows = [];
        let categories = await this[getImpactCategories]();

        if (categories.length == 0) {
            return res.status(404).json({ message: "There are no categories to map with metrices" });
        }

        try {
            // console.log(req.files)
            fs.createReadStream("iris.csv")
                .pipe(csv())
                .on('data', (data) => rows.push(data))
                .on('end', async () => {
                    // res.json(rows)
                    const metrices = await this[getMetrices](rows, categories, standard);

                    const metricLib = await MetricDescriptor.insertMany(metrices);
                    // console.log('met ' + metrices.length)

                    //    const withoutCat= metrices.filter(metric=>metric.impactCategories.length ==0).map(metric=>metric.metric_standard_id)
                    res.status(201).json({ data: { metricLib } });

                });

        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = {
    ImpactMetricLib
}