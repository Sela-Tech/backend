const { ImpactStandardLIb } = require("../app/controllers/ImpactStandard");
const { ImpactMetricLib, } = require("../app/controllers/ImpactMetric");
var { verifyToken } = require("../in-use/utils");
const multer = require("multer");
const path = require('path');


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.resolve(__dirname + '/tmp/my-uploads'))
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now())
//   }
// })

// const storage = multer.memoryStorage()
// const uploaded = multer({ storage: storage });



const ImpactMetric = new ImpactMetricLib();
const ImpactStandard = new ImpactStandardLIb();


module.exports = (app) => {

  // impact standard
  app
    .route("/impact-standard/create").post(verifyToken, ImpactStandard.createStandard.bind(ImpactStandard));

  app
    .route("/impact-standards").get(ImpactStandard.getImpactStandard.bind(ImpactStandard));


  // impact category
  app
    .route("/impact-category/create").post(verifyToken, ImpactStandard.createImpactCategory.bind(ImpactStandard));

  app
    .route("/impact-categories").get(ImpactStandard.getImpactCategory.bind(ImpactStandard));



  // // impact library
  // app
  //   .route("/upload-metric-csv").post(uploaded.single('csvFile'), ImpactMetric.uploadmetricCSV.bind(ImpactMetric));

  app
    .route("/upload-metric-csv").post(ImpactMetric.uploadmetricCSV.bind(ImpactMetric));
}