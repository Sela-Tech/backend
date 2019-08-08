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
     * @param {*} rows
     * @param {*} categories
     * @returns
     * @memberof ImpactMetricLib
     */
    [getMetrices](rows, categories, standard) {

        const metrices = [];
        return new Promise((resolve, reject) => {
            try {

                rows.forEach((row) => {
                    const impactCategories = [];


                    for (let cat of categories) {
                        // Object.keys.includes(cat)

                        // console.log(this[getFieldName](row, cat))
                        if (Object.keys(row).includes(cat.name) && (row[`${cat.name}`] == 'X' || row[`${cat.name}`] !== '')) {
                            impactCategories.push(cat.id);

                        }
                    }

                    metrices.push({
                        metric_standard_id: row['metric_standard_id'],
                        name: row["Metric Name"],
                        description: row['Definition'],
                        impactCategories: impactCategories,
                        standard

                        // cat:row[`${cat}`]
                    });

                })

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
                    orderNo: category.orderNo
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
            fs.createReadStream("iris_custom.csv")
                .pipe(csv())
                .on('data', (data) => rows.push(data))
                .on('end', async () => {
                    // res.json(rows)
                    const metrices = await this[getMetrices](rows, categories, standard);

                    const metricLib = await MetricDescriptor.insertMany(metrices);
                    res.json({ data: { metricLib } });

                });

        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = {
    ImpactMetricLib
}